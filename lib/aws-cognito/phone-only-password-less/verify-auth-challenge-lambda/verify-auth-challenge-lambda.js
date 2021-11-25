exports.handler = async (event) => {
    console.log(event.request);
    
    const expectedAnswer = event.request.privateChallengeParameters.secretLoginCode; 
    if (event.request.challengeAnswer === expectedAnswer) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }
    
    return event;
};