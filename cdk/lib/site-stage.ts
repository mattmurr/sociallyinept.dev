import { Stage } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { SiteStack } from './site-stack';
import { SiteStackProps } from './site-stack';

export class SiteStage extends Stage {
    
    constructor(scope: Construct, id: string, props: SiteStackProps) {
      super(scope, id, props);
  
      new SiteStack(this, 'SiteStack', props);
    }
}
