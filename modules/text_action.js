var natural = require ('natural');
var speakeasy = require ('speakeasy-nlp');
module.exports = {};

module.exports.actOnText = function(assistant)  {
    console.log("Acting on text");
    let inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
        assistant.getRawInput() + '</say-as></speak>',
        ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
      assistant.ask(inputPrompt);
}