---
title: Adding Route53 to my static site
description: Adding Route53 to my static site using AWS CDK, so that I can use a custom domain name
date: 2021-08-06
---

This post is a follow up to [Hosting my static site with AWS](/posts/hosting-my-static-site-with-aws/) where we created a simple static site that is distributed by AWS CloudFront. We can leverage AWS once again to manage our domain and ensure it is always pointing to our distribution domain name.

**The steps in this post require that you have a domain registered in AWS Route53 along with a created [hosted zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/AboutHZWorkingWith.html)**

### DNS record

The first step is to get a reference to our hosted zone, install and import these route53 modules:

```shell
npm i @aws-cdk/aws-route53 @aws-cdk/aws-route53-targets
```

```ts
import * as route53 from "@aws-cdk/aws-route53";
import * as route53Targets from "@aws-cdk/aws-route53-targets";
```

Get a reference to the Route53 Hosted Zone and create an A record pointing to our distribution:

```ts
const zone = route53.HostedZone.fromLookup(this, "Zone", {
  domainName: "<domain-name>",
});

new route53.ARecord(this, "SiteARecord", {
  recordName: "<domain-name>",
  target: route53.RecordTarget.fromAlias(
    new route53Targets.CloudFrontTarget(distribution)
  ),
  zone,
});
```

We must also generate a certificate to use with our custom domain name, we can use AWS Certificate Manager (if you've used a tool like EFF's certbot, this is even easier).

We should make sure to generate the certificate in the us-east-1 region by explicitly setting that because ([Certificates in us-east-1 are distributed globally](https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html)).

Install and import the `@aws-cdk/aws-certificatemanager` module:

```shell
npm i @aws-cdk/aws-certificatemanager
```

```ts
import * as acm from "@aws-cdk/aws-certificatemanager";
```

Define the certificate using the `DnsValidatedCertificate` construct:

```ts
const certificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
  domainName: "<domain-name>",
  hostedZone: zone,
  region: "us-east-1",
});
```

### Reconfigure the CloudFront distribution

CloudFront needs to know about the custom domain and which certificate to use, add the domain name to the distribution's `domainNames` property along with the certificate:

```ts
const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket),
    // viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  defaultRootObject: "index.html",
  domainNames: ["<domain-name>"],
  certificate: certificate,
});
```

Now let's run `cdk synth` to generate the CloudFormation, additionally we can check the diff to see the changes being made.

```shell
npx cdk synth
npx cdk diff
```

Upon deploying, CDK and CloudFormation should:

1. Create the A record
2. Generate and validate the cert for your domain
3. Configure the existing distribution to use your custom domain and certificate

It may take a while for DNS to propogate, but after a while you should be able to check to see that the site is accessible via your domain name.

You can find the source code for the current state of our static site [here](https://github.com/mattmurr/aws-cdk-static-site/tree/master/adding-route53-to-my-static-site).
