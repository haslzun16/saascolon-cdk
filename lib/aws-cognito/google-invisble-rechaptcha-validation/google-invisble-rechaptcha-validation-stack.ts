import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import { CfnUserPool, CfnUserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment } from '@aws-cdk/aws-cognito';
import lambda = require('@aws-cdk/aws-lambda');
import { Duration } from '@aws-cdk/core';
import iam = require("@aws-cdk/aws-iam");

export class GoogleInvisbleRechaptchaValidationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* #region  Cognito UserPool & App Client for Main APP */

    const PRE_SIGNUP = new lambda.Function(this, 'google-invisble-rechaptcha-validation-pre-sign-up-function', {
      functionName: 'google-invisble-rechaptcha-validation-pre-sign-up',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/google-invisble-rechaptcha-validation/pre-signup-lambda'), // your function directory
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

    const DEFINE_AUTH_CHALLENGE = new lambda.Function(this, 'google-invisble-rechaptcha-validation-define-auth-challenge-function', {
      functionName: 'google-invisble-rechaptcha-validation-define-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/google-invisble-rechaptcha-validation/define-auth-challenge-lambda'), // your function directory
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

    const CREATE_AUTH_CHALLENGE = new lambda.Function(this, 'google-invisble-rechaptcha-validation-create-auth-challenge-function', {
      functionName: 'google-invisble-rechaptcha-validation-create-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/google-invisble-rechaptcha-validation/create-auth-challenge-lambda'), // your function directory
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

    const VERIFY_AUTH_CHALLENGE = new lambda.Function(this, 'google-invisble-rechaptcha-validation-verify-auth-challenge-function', {
      functionName: 'google-invisble-rechaptcha-validation-verify-auth-challenge',
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lib/aws-cognito/google-invisble-rechaptcha-validation/verify-auth-challenge-lambda'), // your function directory
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

    const GOOGLE_RECAPTCHA_USER_POOL = new cognito.UserPool(this, 'google-invisble-rechaptcha-validation-userpool', {
      userPoolName: 'google-invisble-rechaptcha-validation-userpool',
      signInAliases: {
        email: true
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true
        }
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
      }

    });
    const APPCLIENT = new cognito.UserPoolClient(this, 'google-invisble-rechaptcha-validation-userpool-app-client', {
      userPool: GOOGLE_RECAPTCHA_USER_POOL,
      generateSecret: false,
      preventUserExistenceErrors: true,
      userPoolClientName: 'google-invisble-rechaptcha-validation-userpool-app-client',
      authFlows: {
        custom: true,
        userSrp: true,
        refreshToken: true
      }
    });

    const cfnUserPool = GOOGLE_RECAPTCHA_USER_POOL.node.defaultChild as CfnUserPool;
    cfnUserPool.accountRecoverySetting = {
      recoveryMechanisms: [{
        name: 'admin_only',
        priority: 1
      }]
    }
    cfnUserPool.tags.setTag("project","google-invisble-rechaptcha-validation-userpool");
    /* #endregion */
  }
}
