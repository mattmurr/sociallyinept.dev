import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";

export class ComptiMeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "compti.me",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      // Delete the bucket when running cdk destroy
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("./site/output")],
      destinationBucket: bucket,
      // Don't retain objects in the bucket
      retainOnDelete: false,
    });

    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
  }
}
