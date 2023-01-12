import { Construct } from "constructs";
import {
  CodePipeline,
  CodePipelineSource,
  CodeBuildStep,
} from "aws-cdk-lib/pipelines";
import { SiteStage } from "./site-stage";
import { Stack } from "aws-cdk-lib";
import { SiteStackProps } from "./site-stack";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new CodeBuildStep("Synth", {
        input: CodePipelineSource.connection("mattmurr/sociallyinept.dev", "master", {
          connectionArn: `arn:aws:codestar-connections:eu-west-2:${this.account}:connection/a94c4c50-f461-4d32-bdbb-e33329b79fc3`,
        }),
        commands: [
          // Fixes an issue with npm postinstall
          "npm set unsafe-perm true",

          "npm ci",
          "npm run build",
          "npm run synth",
        ],
        // By default, expects to already be in the cdk project directory
        primaryOutputDirectory: "cdk/cdk.out",
        rolePolicyStatements: [
          new PolicyStatement({
            actions: ["route53:ListHostedZonesByName"],
            resources: ["*"],
            effect: Effect.ALLOW,
          }),
        ],
      }),
    });

    pipeline.addStage(new SiteStage(this, "ThickRocksStage", props));
  }
}
