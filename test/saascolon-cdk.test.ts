import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SaascolonCdk from '../lib/aws-cognito/email-only-password-less/email-only-password-less-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SaascolonCdk.SaascolonCdkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
