---
title: Serverless Next.js with CDK
description: Next.js hosted on AWS using Lambda@Edge and CDK
date: 2021-07-18
---

### Initial Next.js setup

Initializing CDK and creating our next-app:

```shell
mkdir next-cms
cd next-cms
cdk init --language=typescript
npx create-next-app app
```

Make it easy to run scripts easily from the project root, modify `package.json`:

```json
"scripts": {
  "build": "tsc",
  "watch": "tsc -w",
  "test": "jest",
  "cdk": "cdk",
  "dev": "cd app && npm run dev",
  "deploy": "npx cdk deploy"
}
```

The default .gitignore is changed to not ignore the `.js` files in our Next.js
`app/` directory:

```gitignore
*.js
!jest.config.js
*.d.ts
node_modules

# CDK asset staging directory
.cdk.staging
cdk.out

!app/**/*
```

### SSR with CloudFront and Lambda@Edge

See: [serverless-nextjs/cdkconstruct](https://serverless-nextjs.com/docs/cdkconstruct/)

```shell
npm i -D @sls-next/cdk-construct @sls-next/lambda-at-edge
```

`@sls-next/cdk-construct` provides everything needed to setup CloudFront, S3 (for
static assets) and deploy the Next.js generated lambda functions to Lambda@Edge:

```ts
import * as cdk from "@aws-cdk/core";
import { NextJsLambdaEdge } from "@sls-next/cdk-construct";

export class NextCmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { distribution } = new NextJSLambdaEdge(this, "NextApp", {
      serverlessBuildOutDir: "./app/out",
    });

    new cdk.CfnOutput(this, "Distribution URL", {
      value: distribution.domainName,
    });
  }
}
```

`@sls-next/lambda-at-edge` has the `Builder` class which builds the next app
make sure the region for this stack is us-east-1. ([Everything will be distributed
to edge locations](https://github.com/serverless-nextjs/serverless-next.js/tree/master#my-lambda-is-deployed-to-us-east-1-how-can-i-deploy-it-to-another-region))

```ts
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { NextCmsStack } from "../lib/next-cms-stack";
import { Builder } from "@sls-next/lambda-at-edge";

const builder = new Builder("./app", "./app/build", {
  args: ["build"],
});

builder.build().then(() => {
  const app = new cdk.App();
  new NextCmsStack(app, "NextCmsStack", {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      // Everything is global and distributed to edge locations
      region: "us-east-1",
    },
  });
});
```

When deployed, the distribution domainName is printed into the terminal:

{% image "./site/img/next-cms-lambda-edge.png", "Deploy default Next.js template using CloudFront + Lambda@Edge" %}

I will follow up with another post, adding blog post functionality to the app alongside
AppSync and DynamoDB as the backend to a content management system.
