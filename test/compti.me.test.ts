import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ComptiMe from '../lib/compti.me-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ComptiMe.ComptiMeStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
