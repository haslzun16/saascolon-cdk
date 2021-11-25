// npm install -g aws-cdk
// cdk --version


import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import { CfnUserPool, CfnUserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment, Mfa } from '@aws-cdk/aws-cognito';
import lambda = require('@aws-cdk/aws-lambda');
import { Duration } from '@aws-cdk/core';
import iam = require("@aws-cdk/aws-iam");

export class PhonePasswordClientSideUserSRPAuthFlowStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const USER_POOL_CLIENT_SIDE_AUTH_FLOW = new cognito.UserPool(this, 'phone-password-auth-client-side-using-cdk', {
      userPoolName: 'phone-password-auth-client-side-using-cdk',
      signInAliases: {
        phone: true
      },
      signInCaseSensitive: false,
      standardAttributes: {
        phoneNumber: {
          mutable: true,
          required: true
        }
      },
      passwordPolicy: {
        tempPasswordValidity: Duration.days(8),
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true
      },
      selfSignUpEnabled: true,
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: false
      },
      autoVerify: {
        phone: true
      },
    });
    const APPCLIENT = new cognito.UserPoolClient(this, 'phone-password-auth-client-side-using-cdk-app-client', {
      userPool: USER_POOL_CLIENT_SIDE_AUTH_FLOW,
      generateSecret: false,
      preventUserExistenceErrors: true,
      userPoolClientName: 'phone-password-auth-client-side-using-cdk-app-client',
      authFlows: {
        userSrp: true,
        refreshToken: true
      }
    });

    const cfnUserPool = USER_POOL_CLIENT_SIDE_AUTH_FLOW.node.defaultChild as CfnUserPool;
    cfnUserPool.accountRecoverySetting = {
      recoveryMechanisms: [{
        name: 'verified_phone_number',
        priority: 1
      }]
    }
    cfnUserPool.userPoolAddOns = {
      advancedSecurityMode: 'OFF'
    },
      cfnUserPool.tags.setTag("project", "phone-password-auth-client-side-using-cdk");
  }
}
