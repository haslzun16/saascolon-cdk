import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import { CfnUserPool, CfnUserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment } from '@aws-cdk/aws-cognito';
import lambda = require('@aws-cdk/aws-lambda');
import { Duration } from '@aws-cdk/core';
import iam = require("@aws-cdk/aws-iam");

export class EmailOnlyPasswordLessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* #region  Cognito UserPool & App Client for Main APP */

    const PRE_SIGNUP = new lambda.Function(this, 'email-only-password-less-pre-sign-up-function', {
      functionName: 'email-only-password-less-pre-sign-up',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/email-only-password-less/pre-signup-lambda'), // your function directory
      handler: 'pre-signup-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "ses:*"
        ],
        resources: ['*']
      })]
    });

    const DEFINE_AUTH_CHALLENGE = new lambda.Function(this, 'email-only-password-less-define-auth-challenge-function', {
      functionName: 'email-only-password-less-define-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/email-only-password-less/define-auth-challenge-lambda'), // your function directory
      handler: 'define-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "ses:*"
        ],
        resources: ['*']
      })]
    });

    const CREATE_AUTH_CHALLENGE = new lambda.Function(this, 'email-only-password-less-create-auth-challenge-function', {
      functionName: 'email-only-password-less-create-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/email-only-password-less/create-auth-challenge-lambda'), // your function directory
      handler: 'create-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "ses:*"
        ],
        resources: ['*']
      })]
    });

    const VERIFY_AUTH_CHALLENGE = new lambda.Function(this, 'email-only-password-less-verify-auth-challenge-function', {
      functionName: 'email-only-password-less-verify-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/email-only-password-less/verify-auth-challenge-lambda'), // your function directory
      handler: 'verify-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "ses:*"
        ],
        resources: ['*']
      })]
    });

    const EMAIL_ONLY_PASSWORD_LESS_USER_POOL = new cognito.CfnUserPool(this, 'email-only-password-less-userpool', {
      userPoolName: 'email-only-password-less-userpool',
      usernameAttributes: ['email'],
      usernameConfiguration: {
        caseSensitive: false
      },
      schema: [
        {
          attributeDataType: 'String',
          name: 'email',
          mutable: true,
          required: true
        },
      ],
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          requireUppercase: false
        }
      },
      adminCreateUserConfig: {
        allowAdminCreateUserOnly: false,
        unusedAccountValidityDays: 8,
        inviteMessageTemplate: {
          emailMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.',
          emailSubject: '[SAASCOLON]: Your temporary password',
          smsMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.'
        }
      },
      mfaConfiguration: 'OFF',
      accountRecoverySetting: {
        recoveryMechanisms: [{
          name: 'admin_only',
          priority: 1
        }]
      },
      userPoolAddOns: {
        advancedSecurityMode: 'OFF'
      },
      emailConfiguration: {
        emailSendingAccount: 'DEVELOPER',
        from: 'smunukuntla@saascolon.com',
        replyToEmailAddress: 'smunukuntla@saascolon.com',
        sourceArn: 'arn:aws:ses:us-east-1:336295293319:identity/smunukuntla@saascolon.com'
      },

      // smsVerificationMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.',
      // emailVerificationSubject: '[SAASCOLON]: Your temporary password',
      // emailVerificationMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.',
      verificationMessageTemplate: {
        defaultEmailOption: 'CONFIRM_WITH_CODE', // CONFIRM_WITH_LINK,
      },
      userPoolTags: {
        "project": "email-only-password-less-userpool"
      },
      deviceConfiguration: {
        challengeRequiredOnNewDevice: false,
        deviceOnlyRememberedOnUserPrompt: true
      },
      lambdaConfig: {
        preSignUp: PRE_SIGNUP.functionArn,
        defineAuthChallenge: DEFINE_AUTH_CHALLENGE.functionArn,
        createAuthChallenge: CREATE_AUTH_CHALLENGE.functionArn,
        verifyAuthChallengeResponse: VERIFY_AUTH_CHALLENGE.functionArn
      }
    });

    const APPCLIENT = new CfnUserPoolClient(this, 'email-only-password-less-userpool-app-client', {
      userPoolId: EMAIL_ONLY_PASSWORD_LESS_USER_POOL.ref,
      generateSecret: false,
      refreshTokenValidity: 30,
      preventUserExistenceErrors: 'ENABLED',
      clientName: 'email-only-password-less-userpool-app-client',
      explicitAuthFlows: ['ALLOW_CUSTOM_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'] // 'ALLOW_USER_PASSWORD_AUTH', 'ALLOW_USER_SRP_AUTH'
    });
    /* #endregion */
  }
}
