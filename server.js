// Copyright 2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// process.env.DEBUG = 'actions-on-google:*';

let ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
let express = require('express');
let bodyParser = require('body-parser');
var name = false;

let app = express();

app.set('port', (process.env.PORT || 8080));

var textModule = require('./modules/text_action.js');

app.use(bodyParser.json({type: 'application/json'}));

app.post('/', function (request, response) {
  console.log('handle post');
  // console.log(request.body);
  const assistant = new ActionsSdkAssistant({request: request, response: response});

  function mainIntent (assistant) {
    console.log('mainIntent');
    let inputPrompt = assistant.buildInputPrompt(true, '<speak>Hi! <break time="1"/> ' + 
        'I am Dr. Sbaitso. What is your name?</speak>');
    name = true;
    assistant.ask(inputPrompt);
}

function rawInput (assistant) {
    console.log(assistant.getRawInput());
    if (assistant.getRawInput() === 'bye') {
      assistant.tell('Goodbye!');
  } else {
        /*if (name == true) {
            name = false;
            let inputPrompt = assistant.buildInputPrompt(true, 
                '<speak>Hello ' + assistant.getRawInput() + ', my name is Doctor Sbaitso.' +
                'I am here to help you. ' + 'Say whatever is in your mind freely. ' + 
                'Our conversation will be kept in strict confidence. ' + 
                'Memory contents will be wiped after you leave. ' + 
                'So, tell me about your problems.</speak>');
            assistant.ask(inputPrompt);
        }
      else {*/
        textModule.actOnText(assistant);
        console.log("1");
      // }
  }
}

let actionMap = new Map();
actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
actionMap.set(assistant.StandardIntents.TEXT, rawInput);

assistant.handleRequest(actionMap);
});

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]