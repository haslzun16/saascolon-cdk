console.log('Loading function');

exports.handler = async (event, context) => {
    console.log(event);
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    return event;
};

/