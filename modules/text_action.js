var natural = require ('natural');
var speakeasy = require ('speakeasy-nlp');
module.exports = {};

module.exports.actOnText = function(assistant)  {
    console.log("Acting on text");
    let inputPrompt = assistant.buildInputPrompt(true, assistant.getRawInput());
      assistant.ask(inputPrompt);
}