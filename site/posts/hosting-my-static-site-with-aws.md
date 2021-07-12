---
title: Hosting my static site with AWS
date: 2021-07-10
---

## Part 1 - Setting up CDK and hosting with S3

The CDK stack is based on [aws-cdk-examples/static-site](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts)

Set up the project directory with CDK

```shell
mkdir compti.me
cd compti.me
cdk init --language=typescript
```

`cdk init` has created the compti.me-stack.ts file in `lib/` and is used to
define the infrastructure.

These modules have the constructors we need for using S3

```shell
npm i --save-dev @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment
```

Imported at the top of compti.me-stack.ts:

```ts
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
```

Define the bucket and deployment within the constructor block, along with the path
to my static site assets

```ts
export class ComptiMeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      // Bucket name must be globally unique
      bucketName: "compti.me",
      websiteIndexDocument: "index.html",

      publicReadAccess: true,

      // Delete the bucket when running `cdk destroy`
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, "BucketDeploy", {
      // Source our site files from `./site/output` dir
      sources: [s3deploy.Source.asset("./site/output")],

      // References the bucket defined above
      destinationBucket: bucket,

      // Don't retain objects in the bucket
      retainOnDelete: false,
    });

    // Print the publicly accessible bucket URL
    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
  }
}
```

Create the directory for the static site assets as referenced in `s3deploy.BucketDeployment`:

I've created a basic `index.html` in that directory:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello from S3!</h1>
  </body>
</html>
```

`cdk bootstrap` is necessary as we are placing assets in an S3 bucket: [Bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)

```shell
cdk synth
cdk bootstrap
cdk deploy
```

`cdk deploy` will deploy our CloudFormation stack and provision the infrastructure
in AWS.

The Public URL is printed out in the terminal

{% image "./site/img/bucket-url.png", "BucketURL" %}

I can access this in my browser

{% image "./site/img/hello-from-s3.png", "Hello From S3!" %}

## Part 2 - Setting up CloudFront

Serving the site via a CloudFront distribution promises a variety of benefits

Install the following modules:

```shell
npm i --save-dev @aws-cdk/aws-certificatemanager @aws-cdk/aws-cloudfront @aws-cdk/aws-route53 @aws-cdk/aws-route53-targets @aws-cdk/aws-iam
```

Additional imports for compti.me-stack.ts:

```ts
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
```

Modify the bucket to block read access:

```ts
const bucket = new s3.Bucket(this, "Bucket", {
  bucketName: "compti.me",
  websiteIndexDocument: "index.html",

  // Block access
  publicReadAccess: false,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

  // Delete the bucket when running cdk destroy
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
```

Configure [CloudFront OAI (Origin Access Identity)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html):

```ts
const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
  this,
  "cloudfront-OAI",
  {
    comment: `OAI for ${id}`,
  }
);
```

Allow `s3:GetObject` for all objects in the S3 bucket for the CloudFrontOAI user:

```ts
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
```

Create the CloudFront distribution with the OAI and bucket references:

```ts
const distribution = new cloudfront.CloudFrontWebDistribution(
  this,
  "SiteDistribution",
  {
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
          },
        ],
      },
    ],
  }
);
```

BucketDeployment distribution config, this should be moved underneath the distribution
definition since we must reference it:

```ts
new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
  sources: [s3deploy.Source.asset("./site/output")],

  // References the bucket defined above
  destinationBucket: bucket,

  // Don't retain objects in the bucket
  retainOnDelete: false,

  // References the CloudFront distrubution defined above
  distribution,

  // And all the paths in the bucket that should be distributed
  distributionPaths: ["/*"],
});
```

Print out the domain name for the distribution to the terminal:

```ts
new cdk.CfnOutput(this, "DistributionDomainName", {
  value: distribution.domainName,
});
```

Running `cdk deploy` again will deploy the CloudFront distribution and modify the
permissions for the bucket. The distribution domain name should print out in the
terminal, we can navigate to that domain in a browser.

{% image "./site/img/hello-from-s3-cloudfront.png", "Hello from CloudFront!" %}

See: [Link my domain with CloudFront using Route53](/posts/cloudfront-route53/)
