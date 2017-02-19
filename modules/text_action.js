var salient  = require ('salient');
var nlp = require('nlp_compromise');
var request = require('request');
nlp.plugin(require('nlp-links'));

var url = "https://api.api.ai/v1/query?v=20150910&lang=en&sessionId=1234567890&query=";

module.exports = {};

module.exports.actOnText = function(assistant)  {
    console.log("Acting on text");
    // console.log('Classify: ');
    // console.log(speakeasy.classify(assistant.getRawInput()));
    // console.log('Sentiment: ');
    // console.log('Salient: ');
    // console.log(glossary.toJSON());
    // console.log(glossary.concepts());
    // console.log("Simple Text: " + nlp.text(assistant.getRawInput()).root());
    // console.log(nlp.text(assistant.getRawInput()).tags());
    // console.log(nlp.sentence(assistant.getRawInput()).withLinks());

    var options = {
        url: url + encodeURIComponent(assistant.getRawInput()),
        headers: {
            'Authorization': 'Bearer da0ad313992148faac58e02ac892a3ef'
        }
    };

    if (assistant.getRawInput().toLowerCase().startsWith('say ')) {
        var response = assistant.getRawInput().substring(4);
        var inputPrompt = assistant.buildInputPrompt(false, response);
        assistant.ask(inputPrompt);
    } else {


        console.log(options);
        request(options, function (error, response, body) {

            console.log(error);
            // console.log(response);
            // console.log(body);


            if (error || response.statusCode != 200) {
                processSpeech(assistant);                

            } else {
                var json = JSON.parse(body);
                console.log(json);
                var response = json.result.fulfillment.speech;
                console.log(response);

                if (response == 'fallback' || response == '') {
                    processSpeech(assistant);
                } else {
                    assistant.ask(assistant.buildInputPrompt(false, response));
                }
            }
        });

    }
}


function processSpeech (assistant) {

    var glossary = new salient.glossary.Glossary();
    glossary.parse(assistant.getRawInput());

    if (isQuestion(glossary.toJSON())) {
        // console.log("Question!!!!!");
        var inputPrompt = assistant.buildInputPrompt(true, question(assistant.getRawInput()));
        assistant.ask(inputPrompt);

    } else {
        var arr = getStatementType(nlp.text(assistant.getRawInput()).sentences[0].terms);
        console.log(arr);
                // let inputPrompt = assistant.buildInputPrompt(true, assistant.getRawInput());
                if (arr[0] == 0)
                {
                    // assistant.ask(assistant.buildInputPrompt(standardNoun(arr[2], arr[1], arr[3])));
                    var response = standardNoun(arr[1], arr[2], arr[3]);
                    console.log(response + " : " + assistant.getRawInput());
                    var inputPrompt = assistant.buildInputPrompt(true, response);
                    console.log(inputPrompt);
                    assistant.ask(inputPrompt);
                // console.log("2");
            }
            else if (arr[0] == 1)
            {
                assistant.ask(assistant.buildInputPrompt(true, standardAdj(arr[1], arr[2], arr[3])));
            }
            else {
                assistant.ask(assistant.buildInputPrompt(false, randomSentence()));
            }
        }
    }

function question(sentence)
{
    var c = Math.floor(Math.random() * 6);
    switch (c) {
        case 0:
        return "Why do you want to know that?"
        case 1:
        return "You do not want to know that."
        case 2:
        return "Do you have an interest in the topic?"
        case 3:
        return "I am not sure I can answer that."
        case 4:
        return "Are you sure you want to know that?"
        case 5:
        return "That's not my problem."
    }
}


function isQuestion(glossary) 
{
    // console.log(glossary[0].term);
    if(glossary[0].isQTerm || glossary[0].term.toLowerCase() == 'can') 
    {
        return true;
    } 
    return false;
}


function standardNoun(sub, act, obj)
{
    switch ( Math.floor(Math.random()*6) )
    {
        case 0: 
        var gerund = nlp.verb(act).conjugate().gerund;
        var objects = nlp.noun(obj).pluralize();
        var response = "Do you think about " + gerund + " " + obj + " often?";
        console.log(response);
        return response;
        case 1:
        response = "Why did ";
        if (sub=="I" || sub == 'i') 
        {
            response += "you ";
        }
        else 
        {
            response += sub + " ";
        }
        response += nlp.verb(act).conjugate().infinitive + " ";
        if (sub=="me") 
        {
            response += "you?";
        }
        else 
        {
            response += obj + "?";
        }
        console.log(response);
        return response;
        case 2:
        return "How does that make you feel?"
        case 3:
        return "Interesting, tell me more."
        case 4:
        return "You think you are crazy, but it's only an illusion."
        case 5:
        return "Let's talk about some other things instead."


    }


}

function standardAdj(sub, act, adj)
{
    switch ( Math.floor(Math.random()*6) )
    {
        case 0: 
        var gerund = nlp.verb(act).conjugate().gerund;
        var objects = nlp.noun(adj).pluralize();
        return "Do you think about " + gerund + " " + objects + " often?";
        case 1: 
        if (nlp.person(sub).pluralize()==sub || sub == "I" || sub == 'i') 
        {
            response = "Why are ";
            if (sub == 'i' || sub == 'I') {
                response += 'you';
            } else {
                response += nlp.person(sub).pronoun()
            }
        } 
        else 
        {
            response = "Why is " + sub;
        }
        response += " " + adj + "?";
        return response;
        case 2:
        return "How does that make you feel?"
        case 3:
        return "Interesting, tell me more."
        case 4:
        return "You think you are crazy, but it's only an illusion."
        case 5:
        return "Let's talk about some other things instead."
    }
}

function getStatementType(terms) {
    var flag = true;
    var arr = [-1, '', '', ''];

    for (var i = 0; i < terms.length && flag; i++) {
        if (terms[i].pos.Verb) {
            if (terms[i].tag != 'Gerund') {
                // console.log(terms[i].text);
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
                console.log(terms[k]);
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

function randomSentence () {
    switch (Math.floor(Math.random() * 6)) {
        case 0: 
        return 'I am not sure I understand you.';
        case 1:
        return 'This is getting boring, just now you were talking about something else.';
        case 2:
        return 'What is it that you really want to know?';
        case 3:
        return 'Does talking to me help?';
        case 4:
        return 'Is that so?';
        case 5:
        return 'Come on, pour out your thoughts';
        case 6:
        return 'Can you say that again?'
        case 7:
        return 'Sorry, what was that?'
        case 8:
        return 'I missed that.';
        case 9:
        return 'I didn\'t get that. Can you say that again?';
    }
}