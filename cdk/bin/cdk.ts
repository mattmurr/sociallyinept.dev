#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();
new PipelineStack(app, "ThickRocksStack", {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  domainName: "thick.rocks",
});

app.synth();
