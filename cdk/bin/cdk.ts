#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new App();
const domainName = "thick.rocks";

new PipelineStack(app, "ThickRocksPipelineStack", {
  description: `CodePipeline for ${domainName}`,
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  domainName,
});

app.synth();
