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
    // console.log('Salient: ');
    // console.log(glossary.toJSON());
    // console.log(glossary.concepts());
    // console.log("Simple Text: " + nlp.text(assistant.getRawInput()).root());
    // console.log(nlp.text(assistant.getRawInput()).tags());
    // console.log(nlp.sentence(assistant.getRawInput()).withLinks());

    

    if (isQuestion(glossary.toJSON())) {
        // console.log("Question!!!!!");
        var inputPrompt = assistant.buildInputPrompt(true, 'Question: ' + assistant.getRawInput());
        assistant.ask(false, question(assistant.getRawInput()));
    } else {
        var arr = getStatementType(nlp.text(assistant.getRawInput()).sentences[0].terms);
        console.log(arr);
        // let inputPrompt = assistant.buildInputPrompt(true, assistant.getRawInput());
        if (arr[0] == 0)
        {
            // assistant.ask(assistant.buildInputPrompt(standardNoun(arr[2], arr[1], arr[3])));
            var response = standardNoun(arr[2], arr[1], arr[3]);
            console.log(response + " : " + assistant.getRawInput());
            var inputPrompt = assistant.buildInputPrompt(true, response);
            console.log(inputPrompt);
            assistant.ask(inputPrompt);
            console.log("2");
        }
        else if (arr[0] == 1)
        {
            assistant.ask(assistant.buildInputPrompt(true, standardAdj(arr[2], arr[1], arr[3])));
        }
        
    }
}

function question( sentence)
{

}

function isQuestion(glossary) 
{
    if(glossary[0].isQTerm) 
    {
        return true;
    } 
        return false;
}


function standardNoun(sub, act, obj)
{
    switch ( Math.floor(Math.random()*2) )
    {
        case 0: 
            var gerund = nlp.verb(act).conjugate().gerund;
            var objects = nlp.noun(obj).pluralize();
            var response = "Do you think about " + gerund + " " + objects + " often?";
            console.log(response);
            return response;
        case 1:
            response = "Why did ";
            if (sub=="I") 
            {
                response += "you ";
            }
            else 
            {
                response += nlp.person(sub).pronoun() + " ";
            }
            response += nlp.verb(act).conjugate().infinitive + " ";
            if (sub=="me") 
            {
                response += "you?";
            }
            else 
            {
                response += nlp.person(sub).pronoun() + "?";
            }
            console.log(response);
            return response; 

    }

        
}

function standardAdj(sub, act, adj)
{
    switch ( Math.floor(Math.random()*2) )
    {
        case 0: 
            var gerund = nlp.verb(act).conjugate().gerund;
            var objects = nlp.noun(adj).pluralize();
            return "Do you think about " + gerund + " " + objects + " often?";
        case 1: 
            if (nlp.person(sub).pluralize()==sub || sub == "I") 
            {
                response = "Why are " + nlp.person(sub).pronoun();
            } 
            else 
            {
                response = "Why is " + nlp.person(sub).pronoun();
            }
            response += " " + adj;
            return response;
    }
}

function getStatementType(terms) {
    var flag = true;
    var arr = [-1, '', '', ''];

    for (var i = 0; i < terms.length && flag; i++) {
        if (terms[i].pos.Verb) {
            if (terms[i].tag != 'Gerund') {
                console.log(terms[i].text);
                arr[2] = terms[i].text;
                flag = false;

                for (var j = 0; j < i && !flag; j++) {
                    if ((terms[j].pos.Verb && terms[j].tag == 'Gerund') ||
                        terms[j].pos.Noun) {
                        flag = true;
                        arr[1] = terms[j].text;
                    }
                }
                flag = false;
                for (var k = i + 1; k < terms.length && !flag; k++) {
                    if ((terms[k].pos.Verb && terms[k].tag == 'Gerund')) {
                        flag = true; 
                        arr[3] = terms[k].text;
                        arr[0] = 0;
                    } else if (terms[k].pos.Noun) {
                            flag = true;
                            arr[3] = terms[k].text;
                            arr[0] = 0;
                        } else if (terms[k].pos.Adjective) {
                            flag = true;
                            arr[3] = terms[k].text;
                            arr[0] = 1;
                        }
                }
                flag = false;
            }
        }
    }

    return arr;
}