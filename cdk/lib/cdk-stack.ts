import { Stack, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  AllowedMethods,
  ViewerProtocolPolicy,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Source, BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";

export interface Props {
  env: object,
  domainName: string;
}

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName,
    });
    const cloudfrontOAI = new OriginAccessIdentity(this, "CloudFront-OAI", {});

    new CfnOutput(this, "Site", { value: "https://" + props.domainName });

    const bucket = new Bucket(this, "SiteBucket", {
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const certificate = new DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: props.domainName,
      hostedZone: zone,
      region: "us-east-1",
    });

    const distribution = new Distribution(this, "Distribution", {
      certificate,
      defaultRootObject: "index.html",
      domainNames: [props.domainName],
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity: cloudfrontOAI }),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new ARecord(this, "ARecord", {
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    });

    new BucketDeployment(this, "DeploymentWithInvalidation", {
      sources: [Source.asset("../output")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new CodePipeline(this, "Pipeline", {
      synth: new CodeBuildStep("Synth", {
        input: CodePipelineSource.connection("mattmurr/thick.rocks", "master", {
          connectionArn: `arn:aws:codestar-connections:eu-west-2:${this.account}:connection/a94c4c50-f461-4d32-bdbb-e33329b79fc3`,
        }),
        commands: ["npm ci", "npm run build", "npm run synth"],
      }),
    });
  }
}
