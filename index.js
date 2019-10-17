const express = require("serverless-express/express");
const dynamodb = require("serverless-dynamodb-client").doc;

const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const moment = require("moment");

const { dialogflow } = require("actions-on-google");
const app = dialogflow();

app.intent("Default Welcome Intent", conv => {
  conv.add("Hallo, chef Eddy hier. Wat wil je weten?");
});

app.intent("Menu - no", async (conv, params) => {
  conv.add("Tot ziens, en smakelijk eten!");
  conv.close();
});

app.intent("Menu - yes", async (conv, params) => {
  conv.ask("Wat wil je weten?");
});

app.intent("Menu", async (conv, params) => {
  const { type } = params;
  const date =
    params["date-time"] !== "" ? new moment(params["date-time"]) : new moment();

  const menu = await dynamodb
    .get({
      TableName: process.env.MENU_TABLE,
      Key: {
        date: date.format("YYYY-MM-DD")
      }
    })
    .promise();

  if (!menu || !menu.Item) {
    conv.add("Geen menu gevonden.");
    return;
  }

  switch (type) {
    case "soep":
      conv.add(menu.Item.soup);
      break;
    case "vlees":
      conv.add(menu.Item.meat);
      break;
    case "veggie":
    case "vegetarische maaltijd":
      conv.add(menu.Item.veggie);
      break;
    case "grill":
    case "grill van de week":
      conv.add(menu.Item.grill);
      break;
    case "alternatieve maaltijd":
    case "licht alternatieve maaltijd":
    case "alternatief":
    case "light":
      conv.add(menu.Item.light);
      break;
    case "groenten":
      conv.add(menu.Item.vegetables);
      break;
    case "":
      /*
      const full = `Vandaag is de soep ${menu.soup}, het vlees ${
        menu.meat
      }, de veggie ${menu.veggie}, de licht alternatieve maaltijd ${
        menu.light
      }, de grill ${menu.grill} en de groenten ${menu.vegetables}`;
      */
      conv.ask("Wil je de volledige menu horen?");
      break;
    default:
      console.log(params);
      conv.add("Dat begreep ik niet.");
      break;
  }

  conv.ask("Heeft u nog andere vragen?");
});

/*


const app = dialogflow();



app.fallback(conv => {
  console.log("fallback");
  conv.ask(
    new SimpleResponse({
      speech: "I'm sorry, I didn't catch that",
      text: "I'm sorry, I didn't catch that"
    })
  );
});



exports.menu = function(event, context, callback) {
  console.log("handle menu");
  app
    .handler(event, {})
    .then(res => {
      console.log(res);
      if (res.status != 200) {
        callback(null, { fulfillmentText: `I got status code: ${res.status}` });
      } else {
        callback(null, res.body);
      }
    })
    .catch(e => {
      callback(null, { fulfillmentText: `There was an error\n${e}` });
    });
};

*/

module.exports = express().use(bodyParser.json(), app);
