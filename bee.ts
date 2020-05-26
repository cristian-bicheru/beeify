#!/usr/bin/env ts-node-script
// build before including
import { IgApiClient } from './instagram-private-api/dist/src';
const ig = new IgApiClient();

var readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var hidden = false;
function toggleAsterisks() {
  if (hidden) {
    rl.input.on("keypress", function (c, k) {});
  } else {
    rl.input.on("keypress", function (c, k) {
      var len = rl.line.length;
      readline.moveCursor(rl.output, -len, 0);
      readline.clearLine(rl.output, 1);
      for (var i = 0; i < len; i++) {
        rl.output.write("*");
      }
    });
  }
};

const getInput = (function () {
    const getLineGen = (async function* () {
        for await (const line of rl) {
            yield line;
        }
    })();
    return async () => ((await getLineGen.next()).value);
})();

var lineReader = readline.createInterface({
  input: require('fs').createReadStream('./bee.txt')
});

var i = 0;
var paragraph = "";
var mod = 40;
var bmovie = [];
const parsedFile = new Promise((resolve, reject) => {lineReader.on('close', function() {resolve(true);});});

lineReader.on('line', function (line) {
  if (!Object.is(line.charCodeAt(0), NaN)) {
    i += 1;
    paragraph += line+' ';

    if (i == mod) {
        bmovie.push(paragraph.replace(/\s+/g, ' '));
        i = 0;
        paragraph = "";
    }
  }
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  console.log("Enter Username:");
  const user = await getInput();
  console.log("Enter Password:");
  await toggleAsterisks();
  const pass = await getInput();
  ig.state.generateDevice(user);
  ig.simulate.preLoginFlow();
  await ig.account.login(user, pass);

  const hitlist = ['names go here...'];
  var userId;
  var thread;

  parsedFile.then(async (value) => {
    for (var usr of hitlist) {
      console.log(usr);
      userId = await ig.user.getIdByUsername(usr);
      thread = ig.entity.directThread([userId.toString()]);
      for (var msg of bmovie) {
        await thread.broadcastText(msg);
	await sleep(2000);
      }
      await thread.broadcastText(paragraph);
    }
  });
})();
