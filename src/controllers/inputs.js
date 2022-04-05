/* eslint-disable no-promise-executor-return */
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";
import fs from "fs";
import inquirer from "inquirer";
import { getCoins, getExchanges, getData } from "../core/api_sdk/cw_sdk.js";
import datePrompt from "date-prompt";
import util from "util";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
const configExists = fs.existsSync("./config.json");

// Initial user application setup
async function initialSetup() {
  await sleep(500);
  const spinner = createSpinner("Checking config.json...").start();
  await sleep();

  // Check if user has saved API and/or DB information.
  if (!configExists) {
    spinner.error({
      text: 'No "config.json" file found.',
    });
    // Input API Key
    const apiKeyInputHandler = async () => {
      let apiKey;
      async function question() {
        await inquirer
          .prompt([
            {
              name: "apiKey",
              type: "input",
              message: "Please enter your CryptoWatch API key: ",
            },
          ])
          .then(function (response) {
            if (typeof response.apiKey !== "string") {
              console.error("Invalid API Key.");
              console.info("Please try again.");
              apiKeyInputHandler();
            }
            apiKey = response.apiKey;
          });
      }

      await question();

      // Creating new config.json file in root folder.
      const config = {
        apiKeys: {
          cryptoWatch: apiKey,
        },
      };

      fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
        if (err) throw new Error("Something went wrong! Error: ", err);
        console.log("  API key saved");
      });
    };

    await apiKeyInputHandler();
  } else if (configExists) {
    spinner.success({ text: "Found API key" });
  }
  // -----------------
}

async function start() {
  console.clear();
  // Style CLI Welcome Screen
  figlet(
    "Crypto Export API",
    {
      font: "Banner",
    },
    (err, data) => {
      if (err) throw new Error(err);
      console.log(`${gradient.pastel.multiline(data)}\n`);
      console.log(
        boxen("Crypto Currency Historical Data Export CLI", {
          borderColor: "blackBright",
          borderStyle: "bold",
        })
      );
      console.log(`
${chalk.green("Welcome!")} 
This small application is made by the swaggest swaggers in the whole World Wide Web 2.0
(Soon to be 3.0, hide your daughters).

You can do lots of stuff like exporting crypto data into excel and many more (not really).
Let's start! :)
      `);
    }
  );
  // -----------------

  // Setting Params for API Request
  setParams();
  // -----------------
}

async function setParams() {
  // Saving User Input
  let exchange;
  let coin;
  let date;
  let after;
  let period;
  let params = {};
  let periods = new Map([
    ["1mn", 60],
    ["3mn", 180],
    ["5mn", 300],
    ["15mn", 900],
    ["30mn", 1800],
    ["1h", 3600],
    ["2h", 7200],
    ["4h", 14400],
    ["6h", 21600],
    ["12h", 43200],
    ["1d", 86400],
    ["3d", 259200],
    ["1w", 604800],
    ["1w, start Monday", "604800_Monday"],
  ]);
  // -----------------

  // Calling Functions
  await initialSetup();
  await sleep(1000);
  await setExchange();
  await setCoin();
  await setDate();
  console.log(
    util.inspect(await getData(exchange, coin, params), {
      showHidden: false,
      depth: null,
      colors: true,
    })
  );
  // -----------------

  // Functions for Building Request
  async function setExchange() {
    await inquirer
      .prompt([
        {
          type: "list",
          message: "Please choose an exchange",
          choices: await getExchanges(),
          name: "exchanges",
        },
      ])
      .then((response) => (exchange = response.exchanges));
  }

  async function setCoin() {
    await inquirer
      .prompt([
        {
          type: "list",
          message: "Please choose a coin",
          choices: await getCoins(),
          name: "coins",
        },
      ])
      .then((response) => (coin = response.coins + "usd"));
  }

  async function setDate() {
    let choice;
    await inquirer
      .prompt([
        {
          type: "list",
          message: "Please choose a date filter",
          choices: [
            "Only before X date",
            "Only after X date",
            "Specify time range",
          ],
          name: "OHLCoptions",
        },
      ])
      .then((response) => (choice = response.OHLCoptions));

    if (choice === "Only before X date" || choice === "Only after X date") {
      await datePrompt("Pick a date").then((response) => {
        // Converting Date to UNIX Timestamp
        date = parseInt((new Date(response) / 1000).toFixed(0));
        if (date > (new Date() / 1000).toFixed(0)) {
          console.log(
            "Error: Date cannot be greater than today. Please try again"
          );
          process.exit(0);
        }
      });
      if (choice === "Only before X date") {
        params.before = date;
      } else if (choice === "Only after X date") {
        params.after = date;
      }
      await inquirer
        .prompt([
          {
            type: "list",
            message: "Please choose a date filter",
            choices: [...periods.keys()],
            name: "chosePeriods",
          },
        ])
        .then(
          (response) => (params.periods = periods.get(response.chosePeriods))
        );
    } else {
      await datePrompt("Pick an opening date").then((response) => {
        // Converting Date to UNIX Timestamp
        params.before = parseInt((new Date(response) / 1000).toFixed(0));
        if (params.before > (new Date() / 1000).toFixed(0)) {
          console.log(
            "Error: Date cannot be greater than today. Please try again"
          );
          process.exit(0);
        }
      });
      await datePrompt("Pick a closing date").then((response) => {
        // Need to add error and re-prompt if closing date < opening date
        // Converting Date to UNIX Timestamp
        params.after = parseInt((new Date(response) / 1000).toFixed(0));
      });
      if (params.after > (new Date() / 1000).toFixed(0)) {
        console.log(
          "Error: Date cannot be greater than today. Please try again"
        );
        process.exit(0);
      } else if (params.before > params.after) {
        console.log(
          "Error: Closing date cannot be earlier than opening date. Please try again"
        );
        process.exit(0);
      }
      await inquirer
        .prompt([
          {
            type: "list",
            message: "Please choose a candle time frame",
            choices: [...periods.keys()],
            name: "chosePeriods",
          },
        ])
        .then(
          (response) => (params.periods = periods.get(response.chosePeriods))
        );
    }
  }
  // -----------------
}

export default start;
