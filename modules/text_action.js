var salient  = require ('salient');
var nlp = require('nlp_compromise');
nlp.plugin(require('nlp-links'));

module.exports = {};

//determine which kind of response function to call depending on the user's input
module.exports.actOnText = function(assistant)  {
    console.log("Acting on text");
    var glossary = new salient.glossary.Glossary();
    glossary.parse(assistant.getRawInput());

    //repeat what the user said
    if (assistant.getRawInput().toLowerCase().startsWith('say ')) {
        var response = assistant.getRawInput().substring(4);
        var inputPrompt = assistant.buildInputPrompt(false, response);
        assistant.ask(inputPrompt);
    //call the question function
    } else if (isQuestion(glossary.toJSON())) {
        var inputPrompt = assistant.buildInputPrompt(true, question(assistant.getRawInput()));
        assistant.ask(inputPrompt);
    } else {
        var arr = getStatementType(nlp.text(assistant.getRawInput()).sentences[0].terms);
        console.log(arr);
        //call standardNoun when the object is a noun
        if (arr[0] == 0)
        {
            var response = standardNoun(arr[1], arr[2], arr[3]);
            console.log(response + " : " + assistant.getRawInput());
            var inputPrompt = assistant.buildInputPrompt(true, response);
            console.log(inputPrompt);
            assistant.ask(inputPrompt);
        }
        // call standardAdj when the object is an adjective
        else if (arr[0] == 1)
        {
            assistant.ask(assistant.buildInputPrompt(true, standardAdj(arr[1], arr[2], arr[3])));
        }
        //return a random default statement
        else {
            assistant.ask(assistant.buildInputPrompt(false, randomSentence()));
        }
        
    }
}

//choose one response if the user asks a question
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

//determine if the user asks a question by checking if the
//1st word of the input String is a "question word"
function isQuestion(glossary) 
{
    if(glossary[0].isQTerm || glossary[0].term.toLowerCase() == 'can') 
    {
        return true;
    } 
        return false;
}

//choose a response if the sentence has an object that's a noun
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

//choose a response if the object of the sentence is an adjective
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

//determine if it's a simple statement with an adjective/noun object or not
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

//misc responses for anything we haven't covered
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
    }
}