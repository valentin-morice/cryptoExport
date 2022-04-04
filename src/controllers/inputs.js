/* eslint-disable no-promise-executor-return */
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";
import { createSpinner } from "nanospinner";
import fs from "fs";
import inquirer from "inquirer";
import { getCoins, getExchanges } from "../core/api_sdk/cw_sdk.js";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
const configExists = fs.existsSync("./config.json");

// Initial user application setup
async function initialSetup() {
  // Check if user has saved API and/or DB information.
  await sleep(500);
  const spinner = createSpinner("Checking config.json...").start();
  await sleep();

  if (!configExists) {
    spinner.error({
      text: 'No "config.json" file found.',
    });

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
}

async function start() {
  console.clear();

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
  setParams();
}

async function setParams() {
  // Saving User Input
  let exchange;
  let coin;
  // -----------------

  // Calling Functions
  await initialSetup();
  await sleep(1000);
  await setExchange();
  await setCoin();
  console.log(exchange, coin);
  // -----------------

  // Functions for Building Requests
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
      .then((response) => (coin = response.coins));
  }
  // -----------------
}

export default start;
