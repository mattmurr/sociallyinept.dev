---
title: Link my domain with CloudFront using Route53
date: 2021-08-06
---

Following on from [Hosting my static site with AWS](/posts/hosting-my-static-site-with-aws/)

### Generating TLS Certificates

Install and import the `@aws-cdk/aws-route53` module:

```shell
npm i -D @aws-cdk/aws-route53
```

```ts
import * as route53 from "@aws-cdk/aws-route53";
```

Get a reference to the Route53 Hosted Zone:

```ts
const zone = route53.HostedZone.fromLookup(this, "Zone", {
  domainName: "compti.me",
});
```

Generate the certificate using DNS for validation [(Certificates in us-east-1 are
distributed globally)](https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html).

Install ACM module and import:

```shell
npm i -D @aws-cdk/aws-certificatemanager
```

```ts
import * as acm from "@aws-cdk/aws-certificatemanager";
```

Define the certificate using the `DnsValidatedCertificate` construct:

```ts
const certificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
  domainName: "compti.me",
  hostedZone: zone,
  region: "us-east-1",
});
```

### Reconfigure the CloudFront distribution

Add the domain name to the `domainNames` property along with the certificate:

```ts
const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  defaultRootObject: "index.html",
  domainNames: ["compti.me"],
  certificate: certificate,
});
```

### Route53 DNS record

The `@aws-cdk/aws-route53-targets` module contains the `CloudFrontTarget` constructor,
which helps in creating a DNS record pointing at a CloudFront distribution.

```shell
npm i -D @aws-cdk/aws-route53-targets
```

```ts
import * as route53Targets from "@aws-cdk/aws-route53-targets";
```

Point the domain name at the CloudFront distribution using the Hosted Zone reference:

```ts
// Create the A record pointing to cloudfront
new route53.ARecord(this, "SiteARecord", {
  recordName: "compti.me",
  target: route53.RecordTarget.fromAlias(
    new route53Targets.CloudFrontTarget(distribution)
  ),
  zone,
});
```

### Re-deploy

```shell
cdk synth
cdk deploy
```

Upon deploying, CDK and CloudFormation should:

1. Create the "compti.me" A record using Route53
2. Generate the cert for "compti.me" and validate the cert, again using Route53
3. Configure the distribution to use the custom domain + cert

Once DNS has propogated, verify the DNS records and check to see that the site
is accessible:

{% image "./site/img/dig-compti.me.png" "DNS records" %}
