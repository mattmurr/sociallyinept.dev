---
title: Hosting my static site with AWS
date: 2021-07-10
---

## Part 1 - Setting up CDK and hosting with S3

The CDK stack is based on [aws-cdk-examples/static-site](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts)

Set up our project directory with CDK

```shell
mkdir {my-site}
cd my-site
cdk init --language=typescript
npm i --save-dev @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment
```

`cdk init` has created a {my-site}-stack.ts file for us in `lib/` this file is
used to define our infrastructure.

Import our installed modules at the top of our \*-stack.ts:

```ts
import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
```

Inside the constructor block we must define the bucket where we will store our
static website:

```ts
export class MySiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      // Bucket name must be globally unique
      bucketName: "my-site-bucket",

      websiteIndexDocument: "index.html",
      publicReadAccess: true,

      // Delete the bucket when running `cdk destroy`
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, "BucketDeploy", {
      // Where we will source our site files from locally
      sources: [s3deploy.Source.asset("./site")],

      // References the bucket we defined above
      destinationBucket: bucket,

      retainOnDelete: false,
    });

    // Print out our publicly accessible bucket URL
    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
  }
}
```

Create the directory for the static site files (this directory should be referenced
in the \*-stack.ts file in the `s3deploy.BucketDeployment` sources):

Place your site files in here, for now I've created a basic `index.html`:

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello from S3!</h1>
  </body>
</html>
```

Now we can prepare to deploy, `cdk synth` _Synthesizes and prints the CloudFormation
template for this stack_. Should hopefully display any errors.

We must also run `cdk bootstrap` as we are using placing assets in an S3 bucket,
see: [Bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)

Finally `cdk deploy` will deploy our cloudformation stack and begin provisioning
the infrastructure in AWS.

## Part 2 - Setting up CloudFront and Route53
