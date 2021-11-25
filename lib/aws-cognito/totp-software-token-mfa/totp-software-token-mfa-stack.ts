import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import { CfnUserPool, CfnUserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment, Mfa } from '@aws-cdk/aws-cognito';
import lambda = require('@aws-cdk/aws-lambda');
import { Duration } from '@aws-cdk/core';
import iam = require("@aws-cdk/aws-iam");

export class TOTPSoftwareTokenMFAStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* #region  Cognito UserPool & App Client for Main APP */

    const PRE_SIGNUP = new lambda.Function(this, 'totp-software-token-mfa-pre-sign-up-function', {
      functionName: 'totp-software-token-mfa-pre-sign-up',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/totp-software-token-mfa/pre-signup-lambda'), // your function directory
      handler: 'pre-signup-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "sns:*"
        ],
        resources: ['*']
      })]
    });

    const DEFINE_AUTH_CHALLENGE = new lambda.Function(this, 'totp-software-token-mfa-define-auth-challenge-function', {
      functionName: 'totp-software-token-mfa-define-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/totp-software-token-mfa/define-auth-challenge-lambda'), // your function directory
      handler: 'define-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "sns:*"
        ],
        resources: ['*']
      })]
    });

    const CREATE_AUTH_CHALLENGE = new lambda.Function(this, 'totp-software-token-mfa-create-auth-challenge-function', {
      functionName: 'totp-software-token-mfa-create-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/totp-software-token-mfa/create-auth-challenge-lambda'), // your function directory
      handler: 'create-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "sns:*"
        ],
        resources: ['*']
      })]
    });

    const VERIFY_AUTH_CHALLENGE = new lambda.Function(this, 'totp-software-token-mfa-verify-auth-challenge-function', {
      functionName: 'totp-software-token-mfa-verify-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/totp-software-token-mfa/verify-auth-challenge-lambda'), // your function directory
      handler: 'verify-auth-challenge-lambda.handler',
      timeout: Duration.seconds(3),
      memorySize: 128,
      initialPolicy: [new iam.PolicyStatement({
        actions: [
          "lambda:*",
          "sns:*"
        ],
        resources: ['*']
      })]
    });


    const TOTP_SOFTWARE_TOKEN_MFA_USER_POOL = new cognito.UserPool(this, 'totp-software-token-mfa-userpool', {
      userPoolName: 'totp-software-token-mfa-userpool',
      signInAliases: {
        email: true
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true
        }
      },
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },

      selfSignUpEnabled: true,
      userInvitation: {
        emailBody: '[SAASCOLON]: Your username is {username} and temporary password is {####}.',
        emailSubject: '[SAASCOLON]: Your temporary password',
        smsMessage: '[SAASCOLON]: Your username is {username} and temporary password is {####}.'
      },
      passwordPolicy: {
        tempPasswordValidity: Duration.days(8),
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true
      },
      signInCaseSensitive: false,
      lambdaTriggers: {
        preSignUp: PRE_SIGNUP,
        // defineAuthChallenge: DEFINE_AUTH_CHALLENGE,
        // createAuthChallenge: CREATE_AUTH_CHALLENGE,
        // verifyAuthChallengeResponse: VERIFY_AUTH_CHALLENGE
      }

    });
    const APPCLIENT = new cognito.UserPoolClient(this, 'totp-software-token-mfa-userpool-app-client', {
      userPool: TOTP_SOFTWARE_TOKEN_MFA_USER_POOL,
      generateSecret: false,
      preventUserExistenceErrors: true,
      userPoolClientName: 'totp-software-token-mfa-userpool-app-client',
      authFlows: {
        userSrp: true,
        custom: false,
        refreshToken: true
      }
    });

    const cfnUserPool = TOTP_SOFTWARE_TOKEN_MFA_USER_POOL.node.defaultChild as CfnUserPool;
    cfnUserPool.accountRecoverySetting = {
      recoveryMechanisms: [{
        name: 'admin_only',
        priority: 1
      }]
    }
    cfnUserPool.tags.setTag("project", "totp-software-token-mfa-userpool");
    cfnUserPool.deviceConfiguration = {
      challengeRequiredOnNewDevice: true,
      deviceOnlyRememberedOnUserPrompt: true

    }
    /* #endregion */
  }
}
