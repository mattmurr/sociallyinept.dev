---
title: Hosting my static site with AWS
date: 2021-07-10
---

### Part 1 - Setting up CDK and hosting with S3

Based on [aws-cdk-examples/static-site](https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/static-site/static-site.ts)

Set up the project directory with CDK:

```shell
mkdir compti.me
cd compti.me
cdk init --language=typescript
```

`cdk init` sets up the template for a CDK project, ready to define the infrastructure.

These modules have the constructors for a basic S3 web server ([aws-construct-library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)):

```shell
npm i -D @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment
```

```ts
// compti.me-stack.ts

import * as s3 from "@aws-cdk/aws-s3";
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
```

Define the bucket and deployment within the constructor block, along with the path
to my static site assets

```ts
// compti.me-stack.ts

...

export class ComptiMeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      // Bucket name must be globally unique
      bucketName: "compti.me",

      // Let the bucket know we want to serve a website using `index.html`
      websiteIndexDocument: "index.html",

      // Bucket should be publicly readable or viewers will get 403 error code
      publicReadAccess: true,

      // Remove all objects in the bucket when destroying the bucket
      autoDeleteObjects: true,
    });

    new s3deploy.BucketDeployment(this, "BucketDeploy", {
      // Source our site files from `./site` dir
      sources: [s3deploy.Source.asset("./site")],

      // References the bucket defined above as the destination for our assets
      destinationBucket: bucket,
    });

    // Print the publicly accessible bucket URL
    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
  }
}
```

Create the directory for the static site assets as referenced in `s3deploy.BucketDeployment`:

```html
// site/index.html

<!DOCTYPE html>
<html>
  <body>
    <h1>Hello from S3!</h1>
  </body>
</html>
```

1. Running `cdk synth` will generate the CloudFormation, great to spot any errors
   before attempting to deploy.
2. Run `cdk bootstrap` as we are deploying assets to S3 ([Bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)),
   this should happen once per account/region.
3. Finally `cdk deploy` deploys the stack and provisions the infrastructure in AWS.

```shell
cdk synth
cdk bootstrap
cdk deploy
```

The Public URL printed out in the terminal after `cdk deploy` accessible in the browser:

{% image "./site/img/hello-from-s3.png", "Hello From S3!" %}

### Part 2 - Setting up CloudFront

Serving the site via a CloudFront distribution promises a variety of benefits ([CloudFront](https://aws.amazon.com/cloudfront/)).

The following modules define CloudFront constructors:

```shell
npm i -D @aws-cdk/aws-cloudfront @aws-cdk/aws-cloudfront-origins
```

More imports:

```ts
// compti.me-stack.ts
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
```

Modify the bucket to block read access and no longer configure the bucket as a
web server:

```ts
// compti.me-stack.ts

const bucket = new s3.Bucket(this, "Bucket", {
  // Bucket name must be globally unique
  bucketName: "compti.me",

  // Remove all objects in the bucket when destroying the bucket
  autoDeleteObjects: true,
});
```

Define a CloudFront distribution with an S3Origin, (redirecting all HTTP traffic
to HTTPS):

```ts
// compti.me-stack.ts

constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
  super(scope, id, props);

  ...

  const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
    defaultBehavior: {
      origin: new origins.S3Origin(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
    defaultRootObject: "index.html",
  });

  // Print out the distribution domainName
  new cdk.CfnOutput(this, "DistributionDomainName", {
    value: distribution.domainName,
  });
}
```

Add invalidation to our BucketDeployment so that the cache may be rebuilt:

```ts
// compti.me-stack.ts

new s3deploy.BucketDeployment(this, "BucketDeployWithInvalidation", {
  // Source our site files from `./site` dir
  sources: [s3deploy.Source.asset("./site")],

  // References the bucket defined above as the destination for our assets
  destinationBucket: bucket,

  // References the CloudFront distrubution defined above
  distribution,

  // All the paths in the bucket that should be invalidated
  distributionPaths: ["/*"],
});
```

Test out the new changes with `cdk synth`. If all is well, `cdk deploy` will make
the changes to the stack:

```shell
cdk synth
cdk deploy
```

On success, the CloudFront domain name should be printed to the terminal, serving
the same S3 contents when viewed in the browser.
