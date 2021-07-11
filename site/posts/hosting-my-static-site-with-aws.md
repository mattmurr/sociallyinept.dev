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

      // References the bucket we defined above
      destinationBucket: bucket,

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

Now I want to have my site served with HTTPS, this is possible by adding a CloudFront
distribution and ACM certificate

Install the following modules:

```shell
npm i --save-dev @aws-cdk/aws-certificatemanager @aws-cdk/aws-cloudfront @aws-cdk/aws-route53 @aws-cdk/aws-route53-targets @aws-cdk/aws-iam
```

Note: I have already transferred my compti.me domain to Route53

Add the following imports to compti.me-stack.ts:

```ts
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53targets from "@aws-cdk/aws-route53-targets";
import * as iam from "@aws-cdk/aws-iam";
```
