const axios = require("axios");
exports.handler = async (event, context) => {
  console.log(event);
  let payload;
  if ("v2CheckBoxCaptcha" in event.request.validationData) {
    payload = {
      secret: "SECRET_STRING",
      response: event.request.validationData.v2CheckBoxCaptcha,
      remoteip: undefined, // Optional. The user's IP address.
    };
    const verifyResponse = await axios({
      method: "post",
      url: "https://www.google.com/recaptcha/api/siteverify",
      params: payload,
    });
    console.log(verifyResponse.data);
    if (verifyResponse.data.success) {
      event.response.autoConfirmUser = true;
      event.response.autoVerifyPhone = true;
    } else {
      event.response.autoConfirmUser = false;
      event.response.autoVerifyPhone = false;
    }
  } else if ("v3Captcha" in event.request.validationData) {
    payload = {
      secret: "SECRET_STRING",
      response: event.request.validationData.v3Captcha,
      remoteip: undefined, // Optional. The user's IP address.
    };
    const verifyResponse = await axios({
      method: "post",
      url: "https://www.google.com/recaptcha/api/siteverify",
      params: payload,
    });
    console.log(verifyResponse.data);
    if (verifyResponse.data.success && verifyResponse.data.score >= 0.7) {
      event.response.autoConfirmUser = true;
      event.response.autoVerifyEmail = true;
    } else {
      event.response.autoConfirmUser = false;
      event.response.autoVerifyEmail = false;
    }
  }

  return event;
};
