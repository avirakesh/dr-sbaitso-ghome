var natural = require ('natural');
var speakeasy = require ('speakeasy-nlp');
var salient  = require ('salient');
var nlp = require('nlp_compromise');
nlp.plugin(require('nlp-links'));
module.exports = {};

module.exports.actOnText = function(assistant)  {
    console.log("Acting on text");
    // console.log('Classify: ');
    // console.log(speakeasy.classify(assistant.getRawInput()));
    // console.log('Sentiment: ');
    var glossary = new salient.glossary.Glossary();
    glossary.parse(assistant.getRawInput());
    console.log('Salient: ');
    console.log(glossary.toJSON());
    console.log(glossary.concepts());
    console.log("Simple Text: " + nlp.text(assistant.getRawInput()).root());
    console.log(nlp.text(assistant.getRawInput()).tags());
    // console.log(nlp.sentence(assistant.getRawInput()).withLinks());

    

    // console.log(speakeasy.sentiment.analyze(assistant.getRawInput()));
    let inputPrompt = assistant.buildInputPrompt(true, assistant.getRawInput());
      assistant.ask(inputPrompt);
}