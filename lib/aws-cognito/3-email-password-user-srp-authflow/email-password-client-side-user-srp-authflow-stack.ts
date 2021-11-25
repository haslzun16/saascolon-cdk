// npm install -g aws-cdk
// cdk --version


import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import { CfnUserPool, Mfa } from '@aws-cdk/aws-cognito';
import { Duration } from '@aws-cdk/core';

export class EmailPasswordClientSideUserSRPAuthFlowStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const USER_POOL_CLIENT_SIDE_AUTH_FLOW = new cognito.UserPool(this, 'email-password-client-side-user-srp-authflow-using-cdk', {
      userPoolName: 'email-password-client-side-user-srp-authflow-using-cdk',
      signInAliases: {
        email: true
      },
      signInCaseSensitive: false,
      standardAttributes: {
        email: {
          mutable: true,
          required: true
        }
      },
      passwordPolicy: {
        tempPasswordValidity: Duration.days(7),
        minLength: 7,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true
      },
      selfSignUpEnabled: true,
      mfa: Mfa.OFF,
      autoVerify: {
        email: true
      },

      userInvitation: {
        emailBody: '[SAASCOLON]: Your username is {username} and temporary password is {####}.',
        emailSubject: '[SAASCOLON]: Your temporary password',
        smsMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.'
      },
    });
    const APPCLIENT = new cognito.UserPoolClient(this, 'email-password-client-side-user-srp-authflow-using-cdk-app-client', {
      userPool: USER_POOL_CLIENT_SIDE_AUTH_FLOW,
      generateSecret: false,
      preventUserExistenceErrors: true,
      userPoolClientName: 'email-password-client-side-user-srp-authflow-app-client',
      authFlows: {
        userSrp: true,
        refreshToken: true
      }
    });

    const cfnUserPool = USER_POOL_CLIENT_SIDE_AUTH_FLOW.node.defaultChild as CfnUserPool;
    cfnUserPool.accountRecoverySetting = {
      recoveryMechanisms: [{
        name: 'verified_email',
        priority: 1
      }]
    }
    cfnUserPool.userPoolAddOns = {
      advancedSecurityMode: 'OFF'
    },
      cfnUserPool.emailConfiguration = {
        emailSendingAccount: 'DEVELOPER',
        from: 'EMAIL_ADDRESS',
        replyToEmailAddress: 'EMAIL_ADDRESS',
        sourceArn: 'arn:aws:ses:us-east-1:336295293319:identity/EMAIL_ADDRESS'
      },
      cfnUserPool.tags.setTag("project", "email-password-client-side-user-srp-authflow-using-cdk");
  }
}
