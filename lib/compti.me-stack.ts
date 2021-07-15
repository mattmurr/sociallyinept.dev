import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53targets from "@aws-cdk/aws-route53-targets";

export interface ComptiMeProps extends cdk.StackProps {
  domainName: string;
}

export class ComptiMeStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props: ComptiMeProps) {
    super(parent, id, props);

    const domainName = props.domainName;

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: props.domainName,
      // Delete the bucket when running cdk destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      publicReadAccess: false,

      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });

    // Find a reference to my domain's hosted zone
    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName });

    new cdk.CfnOutput(this, "SiteURL", { value: "https://" + domainName });

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

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      defaultRootObject: "index.html",
      domainNames: [domainName],
      certificate: certificate,
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.domainName,
    });

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("./site/output")],
      destinationBucket: bucket,

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
