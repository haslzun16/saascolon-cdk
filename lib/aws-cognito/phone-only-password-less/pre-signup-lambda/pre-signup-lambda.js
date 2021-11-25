exports.handler = async (event, context) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyPhone = true;
  return event;
};
