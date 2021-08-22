---
title: Hosting my static site with AWS
description: Hosting THIS blog using AWS CloudFront and S3 deployed via AWS CDK
date: 2021-07-10
---

### Setting up CDK and hosting with S3

Recently I've been playing around a lot with [AWS CDK](https://aws.amazon.com/cdk/), so much so that I decided to rewrite my blog to be more minimal and leverage the speedy development process that comes with <abbr title="Infrastructure as code">IaC</abbr>

**This post assumes you already have an AWS account.**

Set up your project directory with CDK:

```shell
mkdir <site-name>
cd <site-name>
npx cdk init --language=typescript
```

`cdk init` bootstraps the project directory, ready to define the infrastructure.

During the `cdk init` bootstrap, the file `lib/<site-name>-stack.ts` was generated, this is the file we will be modifying the entirety of this post. Lets get started!

Install and import these modules, they have the constructors to easily define a basic S3 web server:

```shell
npm i @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment
```

```ts
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
```

Define the bucket and deployment within the constructor block (your bucket name must follow the [S3 Bucket naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)):

```ts
const bucket = new s3.Bucket(this, "Bucket", {
  bucketName: "<bucket-name>",
  websiteIndexDocument: "index.html",
  publicReadAccess: true,
  autoDeleteObjects: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY
});

new s3Deploy.BucketDeployment(this, "BucketDeploy", {
  // Source our site files from `./site` dir
  sources: [s3Deploy.Source.asset("./site")],
  destinationBucket: bucket,
});

new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
```

The last line will produce an output so we can see the URL for our site printed to the terminal.

That's all we need to host a basic static site in AWS.

Lets create some assets to host and then deploy our site.

Create the directory for the static site assets with the path we referenced in our `BucketDeployment` and create an index.html file:

```shell
mkdir site
cat << EOF >> site/index.html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello from S3!</h1>
  </body>
</html>
EOF
```

Now we're ready to deploy our site to AWS.

1. Running `cdk synth` will generate the CloudFormation, great to spot any errors 
  before attempting to deploy.
2. Run `cdk bootstrap` as we are deploying assets to S3 ([Bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html)), 
  this is necessary once per account/region.
3. Finally `cdk deploy` deploys the stack and provisions our infrastructure in AWS.

```shell
npx cdk synth
npx cdk bootstrap
npx cdk deploy
```

Upon deployment you'll be asked about IAM statement changes, I recommend reading these to get an understanding of the changes behind the scenes. 

When the deployment is finished the Public URL should be printed out in the terminal, we can access this in a browser:

{% image "./site/img/hello-from-s3.png", "Hello From S3!" %}

In my case, my bucket name was not globally unique and I had to change it. Before I could successfully deploy.

### Distribute via CloudFront

Serving our site via an AWS [CloudFront](https://aws.amazon.com/cloudfront/) distribution promises a variety of benefits).

The following modules contain constructors for CloudFront, install and import them:

```shell
npm i @aws-cdk/aws-cloudfront @aws-cdk/aws-cloudfront-origins
```

```ts
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
```

Now define our new distribution with our existing bucket we made earlier as the origin:

```ts
const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket)
  },
  defaultRootObject: "index.html"
});

// Print out the distribution domainName
new cdk.CfnOutput(this, "DistributionDomainName", {
  value: "https://" + distribution.domainName,
});
```

CloudFront will serve files from our origin, in our case the we want to serve the `index.html` file.

We are also outputting the distribution domain name which we can later navigate to in our browser.

If you would like to enforce HTTPS connections, you can add the following line to the `defaultBehaviour` object:
```ts
viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
```

Since we are no longer using S3 as a web server, lets modify the bucket definition:

```ts
const bucket = new s3.Bucket(this, "Bucket", {
  bucketName: "<bucket-name>",
  autoDeleteObjects: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY
});
```

Lets try out these new changes, we can run `cdk synth` again to see the generated CloudFormation. Since we already have an existing stack in AWS, we are making changes to said stack. `cdk diff` will display an overview of these changes.

```shell
npx cdk synth
npx cdk diff
```

You will see that among other changes, the following new resources are going to be added:

- `AWS::CloudFront::CloudFrontOriginAccessIdentity`
- `AWS::CloudFront::Distribution`

The bucket policy will also be modified to grant read access to the new `CloudFrontOriginAccessIdentity` principle.

Lets try and deploy.

```shell
npx cdk deploy
```

On success, our CloudFront domain name will be printed to the terminal, serving the same S3 contents from earlier in the browser. [Here](https://github.com/mattmurr/aws-cdk-static-site/tree/master/distribute-via-cloudfront) is a link to the GitHub repo.

We should also add cache invalidation to our distribution which will clear the distribution's cache when we deploy changes to our site.

Modify our BucketDeployment with a reference to our distribution and which paths to invalidate:

```ts
new s3Deploy.BucketDeployment(this, "BucketDeployWithInvalidation", {
  sources: [s3deploy.Source.asset("./site")],
  destinationBucket: bucket,
  distribution,
  distributionPaths: ["/*"],
});
```

Now simply just re-deploy the new changes and now have our own static website being distributed by AWS CloudFront, our site is also aware to changes and clears the cached content so that we are always distributing up-to-date content.

I've [continued on](/posts/adding-route53-to-my-static-site) from this post by adding Route53 in order to have a custom domain name for my static site.
