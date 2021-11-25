// Dependencies
const AWS = require("aws-sdk");

// Set region
AWS.config.update({ region: "us-east-1" });
const SES = new AWS.SES();

/**
 * Generate passwordless sign-in OTP and send to user
 * @param {AWS Lambda Event} event
 */
exports.handler = async (event) => {
  console.log("CUSTOM_CHALLENGE_LAMBDA", event);

  let secretLoginCode;
  if (!event.request.session || !event.request.session.length) {
    // Generate a new secret login code and send it to the user
    secretLoginCode = Date.now().toString().slice(-4);
    console.log("OTP / Secret Login Code: " + secretLoginCode);
    try {
      if ("email" in event.request.userAttributes) {
        const emailResult = await SES.sendEmail(
          (params = {
            Destination: { ToAddresses: [event.request.userAttributes.email] },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: `<html><body><p>This is your secret login code:</p>
                           <h3>${secretLoginCode}</h3></body></html>`,
                },
                Text: {
                  Charset: "UTF-8",
                  Data: `Your secret login code: ${secretLoginCode}`,
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: "Your secret login code",
              },
            },
            Source: "SOURCE-EMAIL",
          })
        ).promise();
        console.log(emailResult);
        console.log("EMAIL DELIVERED");
      } else if ("phone_number" in event.request.userAttributes) {
        var params = {
          Message: secretLoginCode,
          PhoneNumber: event.request.userAttributes.phone_number,
        };
        // Create promise and SNS service object
        var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
          .publish(params)
          .promise();
        const result = await publishTextPromise;
        console.log(result);
        console.log("SMS DELIVERED");
      }
    } catch (error) {
      // Handle SMS Failure
      console.log(error);
    }
  } else {
    // re-use code generated in previous challenge
    const previousChallenge = event.request.session.slice(-1)[0];
    secretLoginCode =
      previousChallenge.challengeMetadata.match(/CODE-(\d*)/)[1];
  }

  console.log(event.request.userAttributes);

  // Add the secret login code to the private challenge parameters
  // so it can be verified by the "Verify Auth Challenge Response" trigger
  event.response.privateChallengeParameters = { secretLoginCode };

  // Add the secret login code to the session so it is available
  // in a next invocation of the "Create Auth Challenge" trigger
  event.response.challengeMetadata = `CODE-${secretLoginCode}`;

  return event;
};
