/* eslint-disable no-promise-executor-return */
import fs from "fs";
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import inquirer from "inquirer";
import datePrompt from "date-prompt";
import { sleep } from "../helpers/misc.js"
import { createSpinner } from "nanospinner";
import { exportExcel, exportCsv } from "./export.js";
import { getCoins, getExchanges, getData } from "../core/api_sdk/cw_sdk.js";

/**
 * @function welcome System's entry point.
*/
export async function welcome() {
  console.clear();
  console.log(chalk.blackBright("Made by @aange-marcel and @felipesantos94 in 🇫🇷"));
  figlet("Crypto Export API", {font: "5 Line Oblique"},
    (err, data) => {
      if (err) throw new Error(err);
      const welcomeText = '  '.repeat(19) + "Export crypto currency technical data into CSV or XLSX files."; // Formatting welcome text padding alignment
      console.log(
        boxen(`${chalk.red.bold(data)} \n\n\n ${welcomeText}`,
        {
          title: "Crypto Currency Historical Data Export CLI",
          borderColor: "blackBright",
          borderStyle: "double",
          padding: 1,
          margin: 1,
          float: "center"
        })
      );
    }
  );
  console.log(""); // Jump cli line

  await initialSetup();
}

/**
 * @function initialSetup System's entry point. Validating if the user already has a api keychain configuration.
*/
async function initialSetup() {
  // Check if user has saved API and/or DB information.
  await sleep(10);
  const spinner = createSpinner("Checking API keys...").start();
  
  const configExists = fs.existsSync("./config.json");
  if (configExists) {
    spinner.success({ text: "API keychain found.\n" });
    await inputHandler();
  } else {
    spinner.error();
    console.warn(chalk.whiteBright.bold("\n  ⚠️  No API key found.\n"));

    // First API key setup
    console.log(chalk.blackBright("This must be your first access. We're going to set everything up within seconds. \nIf the problem persists, contact us.\n"));
    console.log("➤ Creating API keychain...");
    let apiKey;
    async function question() {
      await inquirer.prompt([{
        name: "apiKey",
        type: "input",
        message: "Enter your API key: "
      }]).then(function (response) {
        if (typeof response.apiKey !== "string") {
          console.error("Invalid API Key.");
          console.info("Please try again.");
          apiKeyInputHandler();
        }
        apiKey = response.apiKey;
        console.log(""); // Jump cli line
      });
    }
  
    await question();
  
    // Creating new config.json file in root folder.
    const config = {
      apiKeys: {
        cryptoWatch: apiKey
      }
    };
  
    fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
      if (err) throw new Error("Something went wrong! Error: ", err);
      console.log("\n  API key saved\n");
    });

    const checkConfig = fs.existsSync("./config.json");
    if (checkConfig) {
      await inputHandler();
    } else {
      throw new Error("Could not create config file");
    }
  }
};

async function exchangeInput(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Exchange:",
    choices: await getExchanges(),
    name: "exchanges"
  }]).then((response) => (inputData.exchange = response.exchanges));
  console.log(""); // Jump cli line
}

async function coinInput(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Crypto currency:",
    choices: await getCoins(),
    name: "coins"
  }]).then((response) => (inputData.coin = response.coins + "usd"));
  console.log(""); // Jump cli line
}

async function dateInput(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Date filter:",
    choices: [
      "Only before X date",
      "Only after X date",
      "Specify time range",
    ],
    name: "OHLCoptions"
  }]).then((response) => (inputData.choice = response.OHLCoptions));
  console.log(""); // Jump cli line

  if (inputData.choice === "Only before X date" || inputData.choice === "Only after X date") {
    await datePrompt("Date range:").then((response) => {
      inputData.date = parseInt((new Date(response) / 1000).toFixed(0));
      if (inputData.date > (new Date() / 1000).toFixed(0)) {
        console.log("Error: Date cannot be greater than today. Please try again");
        process.exit(0);
      }
    });
    if (inputData.choice === "Only before X date") {
      inputData.params.before = inputData.date;
    } else if (inputData.choice === "Only after X date") {
      inputData.params.after = inputData.date;
    }
    await inquirer.prompt([{
      type: "list",
      message: "Time interval:",
      choices: [...inputData.periods.keys()],
      name: "chosePeriods",
    }]).then((response) => (inputData.params.periods = inputData.periods.get(response.chosePeriods)));
    console.log(""); // Jump cli line
  } else {
    await datePrompt("Opening date:").then((response) => {
      inputData.params.after = parseInt((new Date(response) / 1000).toFixed(0));
      if (inputData.params.after > (new Date() / 1000).toFixed(0)) {
        console.log("Error: Date cannot be greater than today. Please try again\n");
        process.exit(0);
      }
    });
    await datePrompt("Closing date:").then((response) => {
      inputData.params.before = parseInt((new Date(response) / 1000).toFixed(0));
    });
    if (inputData.params.before > (new Date() / 1000).toFixed(0)) {
      console.log("Error: Date cannot be greater than today. Please try again\n");
      process.exit(0);
    } else if (inputData.params.before < inputData.params.after) {
      console.log("Error: Closing date cannot be earlier than opening date. Please try again\n");
      process.exit(0);
    }

    await inquirer.prompt([{
      type: "list",
      message: "Time interval:",
      choices: [...inputData.periods.keys()],
      name: "chosePeriods"
    }]).then((response) => (inputData.params.periods = inputData.periods.get(response.chosePeriods)));
  }
}

async function exportInput(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Select the exported file format:",
    choices: ["xlsx", "csv"],
    name: "format"
  }]).then((response) => (inputData.format = response.format));
}

async function inputHandler() {
  // Saving User Input. Additional keys added throught Fn.
  let inputData = {
    params: {},
    periods: new Map([
      ["1 hour", 3600],
      ["2 hours", 7200],
      ["4 hours", 14400],
      ["6 hours", 21600],
      ["12 hours", 43200],
      ["1 days", 86400],
      ["3 days", 259200],
      ["1 week", 604800],
      ["1 week, start Monday", "604800_Monday"],
    ]),
  };

  // Preparing data from user inputs
  await exchangeInput(inputData);
  await coinInput(inputData);
  await dateInput(inputData);
  await exportInput(inputData),

  // Set-Up Data for SheetJS
  inputData.cw = await getData(inputData.exchange, inputData.coin, inputData.params);

  if (inputData.format === "xlsx") {
    await exportExcel(inputData.cw[inputData.params.periods]);
  } else if (inputData.format === "csv") {
    await exportCsv(inputData.cw[inputData.params.periods]);
  } else {
    console.error("Invalid file format");
    process.exit(0);
  }
}
