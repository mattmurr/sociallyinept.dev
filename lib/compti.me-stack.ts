import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53targets from "@aws-cdk/aws-route53-targets";
import * as iam from "@aws-cdk/aws-iam";

export interface ComptiMeProps extends cdk.StackProps {
  domainName: string;
}

export class ComptiMeStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props: ComptiMeProps) {
    super(parent, id, props);

    const domainName = props.domainName;

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "compti.me",
      websiteIndexDocument: "index.html",
      //publicReadAccess: true,

      // Delete the bucket when running cdk destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });

    // Find a reference to my domain's hosted zone
    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName });

    // Restrict access to the S3 content
    // See: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      "cloudfront-OAI",
      {
        comment: `OAI for ${id}`,
      }
    );

    new cdk.CfnOutput(this, "SiteURL", { value: "https://" + domainName });

    // Explicitly Allow cloudfront to access the S3 bucket
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const certificate = new acm.DnsValidatedCertificate(
      this,
      "SiteCertificate",
      {
        domainName,
        hostedZone: zone,
        // ACM certs in us-east-1 are distributed to all geographic locations
        // See: https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html
        region: "us-east-1",
      }
    );

    const certificateArn = certificate.certificateArn;

    new cdk.CfnOutput(this, "Certificate", {
      value: certificateArn,
    });

    const urlRewriteFunction = new cloudfront.Function(
      this,
      "UrlRewriteIndexHtmlFunction",
      {
        functionName: "UrlRewriteHtmlFunction",
        comment: "Rewrites request uris to include index.html",
        code: cloudfront.FunctionCode.fromFile({
          filePath: "./functions/url-rewrite-index-html.js",
        }),
      }
    );

    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: [domainName],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: cloudfrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods:
                  cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                functionAssociations: [
                  {
                    function: urlRewriteFunction,
                    eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                  },
                ],
              },
            ],
          },
        ],
      }
    );

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName,
    });

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("./site/output")],
      destinationBucket: bucket,
      // Don't retain objects in the bucket
      retainOnDelete: false,

      distribution,
      distributionPaths: ["/*"],
    });

    // Create the A record pointing to cloudfront
    new route53.ARecord(this, "SiteARecord", {
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution)
      ),
      zone,
    });
  }
}
