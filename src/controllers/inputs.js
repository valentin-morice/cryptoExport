import fs from "fs";
import util from "util";
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import inquirer from "inquirer";
import datePrompt from "date-prompt";
import child_process from "child_process";
import { sleep } from "../helpers/misc.js";
import { readFile } from "fs/promises";
import { createSpinner } from "nanospinner";
import { exportExcel, exportCsv } from "./export.js";
import { getCoins, getExchanges, getData } from "../core/sdk/cw_sdk.js";
import { isNotEmptyObject } from "../helpers/validations.js";

/**
 * @function startProgram System's entry point. Validating if the user already has a api keychain configuration.
*/
export async function startProgram() {
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
  console.log(""); // Jump line

  // Check if user has saved API and/or DB information.
  await sleep(10);
  const spinner = createSpinner("Getting ready initial configurations...").start();
  
  let config;
  const configExists = fs.existsSync("./config.json");
  if (configExists) {
    spinner.success({text: "Configurations loaded successfully.\n"});
    spinner.start({text: "Checking API keys..."});
    config = await readFile(new URL("../../config.json", import.meta.url));
    
    if (config.length === 0) {
      fs.writeFile("./config.json", JSON.stringify({}, null, 2), (err) => {
        if (err) throw new Error("Something went wrong! Error: ", err);
      });
      config = await readFile(new URL("../../config.json", import.meta.url));
    }
    
    config = JSON.parse(config);
    if (!isNotEmptyObject(config) || !config.apiKeys) {
      spinner.error();
      console.warn(chalk.whiteBright.bold("\n  ⚠️  No API keys found.\n"));
      config = await setupApiKey();
    } else {
      spinner.success({text: chalk.green("API keychain found.\n")});
    }
    await inputHandler(config);
  } else {
    spinner.error();
    console.warn(chalk.whiteBright.bold("\n  ⚠️  No API keys found.\n"));
    config = await setupApiKey();
  }

  await inputHandler(config);
};

/**
 * @function setupApiKey Prompt the user to insert their API key and handles the config.json creation.
*/
async function setupApiKey() {
  // First API key setup
  console.log("Looks like the API keychain is empty. Let's set everything up.")
  console.log(chalk.blackBright("If the problem persists, please contact us at: https://github.com/aange-marcel/cryptoExport/issues/new.\n"));
  
  // Prompt the user for a valid api key
  const apiKey = await prompts.apiKey();

  // Creating new config.json file in root folder.
  const config = {
    apiKeys: {
      cryptoWatch: apiKey
    }
  };

  fs.writeFile("./config.json", JSON.stringify(config, null, 2), (err) => {
    if (err) throw new Error("Something went wrong! Error: ", err);
  });

  const checkConfig = fs.existsSync("./config.json");
  if (checkConfig) {
    await sleep(10);
    createSpinner(chalk.green("API keychain created and key saved successfully.\n")).success();
    return config;
  } else {
    throw new Error("Could not create config file");
  }
}

/**
 * @function dateRangeInput Prompt the user to select a date range filter.
 * @param inputData The user inputs saved in memory to be processed by the aplication.
*/
async function dateRangeFilter(inputData) {
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
  } else if (inputData.choice === "Closing and Opening date range") {
    await datePrompt("Opening date:").then((response) => {
      inputData.params.after = parseInt((new Date(response) / 1000).toFixed(0));
      if (inputData.params.after > (new Date() / 1000).toFixed(0)) {
        console.log("Error: Date cannot be greater than today. Please try again\n");
        process.exit(0);
      }
    });
    await datePrompt("Closing date:").then((response) => {
      inputData.params.before = parseInt((new Date(response) / 1000).toFixed(0));
      if (inputData.params.before > (new Date() / 1000).toFixed(0)) {
        console.log("Error: Date cannot be greater than today. Please try again\n");
        process.exit(0);
      }
    });

    if (inputData.params.before < inputData.params.after) {
      console.log("Error: Closing date cannot be earlier than opening date. Please try again\n");
      process.exit(0);
    }
  }
}

const prompts = {
  exchange: async function (inputData) { 
    await inquirer.prompt([{
      type: "list",
      message: "Exchange:",
      choices: inputData.exchanges,
      name: "exchanges"
    }]).then((response) => {
      inputData.exchange = response.exchanges;
      console.log(""); // Jump line
    })
  },
  coin: async function (inputData) { 
    await inquirer.prompt([{
      type: "list",
      message: "Crypto currency:",
      choices: inputData.coins,
      name: "coins"
    }]).then((response) => {
      inputData.coin = response.coins + "usd";
      console.log(""); // Jump line
    })
  },
  date: async function (inputData) {
    await inquirer.prompt([{
      type: "list",
      message: "Date filter:",
      choices: [
        "Only before X date",
        "Only after X date",
        "Closing and Opening date range",
      ],
      name: "OHLCoptions"
    }]).then((response) => {
      inputData.choice = response.OHLCoptions;
      console.log(""); // Jump line
    })
  },
  interval: async function (inputData) {
    await inquirer.prompt([{
      type: "list",
      message: "Time interval:",
      choices: [...inputData.periods.keys()],
      name: "chosePeriods"
    }]).then((response) => {
      inputData.params.periods = inputData.periods.get(response.chosePeriods);
      console.log(""); // Jump line
    });
  },
  export: async function (inputData) {
    await inquirer.prompt([{
      type: "list",
      message: "Select the exported file format:",
      choices: ["xlsx", "csv"],
      name: "format"
    }]).then((response) => (inputData.format = response.format))
  },
  apiKey: async function () {
    let apiKey;
    await inquirer.prompt([{
      type: "input",
      message: "Please, enter your API key: ",
      name: "apiKey",
    }]).then((response) => (apiKey = response.apiKey));
    return apiKey;
  }
}

async function inputHandler(apiKeys) {
  // User inputs in memory to be exported
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
    ])
  };

  // await sleep(10);
  const assetsLoad = createSpinner("Loading cryptocurrency assets...").start();
  try {
    inputData["coins"] = await getCoins(apiKeys);
    inputData["exchanges"] = await getExchanges(apiKeys);
    assetsLoad.success({text: chalk.green("Assets loaded successfully!")});
  } catch (error) {
    assetsLoad.error();
    console.error("Could not load exchanges and/or coins.");
    throw new Error(error);
  }

  // Prompt the user to select an exchange type.
  await prompts.exchange(inputData);
  // Prompt the user to select a crypto currency to be exported.
  await prompts.coin(inputData);
  // Prompt the user to select a date range filter.
  await prompts.date(inputData);
  await dateRangeFilter(inputData);
  // Prompt the user to select a time interval for the date range filter.
  await prompts.interval(inputData);
  // Prompt the user to select a export filter.
  await prompts.export(inputData);
  
  // Fetch crypto data from API to be exported
  inputData.cw = await getData(inputData.exchange, inputData.coin, inputData.params, apiKeys);
  
  let file;
  if (inputData.format === "xlsx") {
    file = await exportExcel(inputData.cw[inputData.params.periods], inputData.coin, "xlsx");
  } else if (inputData.format === "csv") {
    file = await exportCsv(inputData.cw[inputData.params.periods], inputData.coin, "csv");
  } else {
    console.error("Invalid file format");
    process.exit(0);
  }

  if (file) {
    const exec = util.promisify(child_process.exec);
    try {
      await exec(`open ./${file}`);
    } catch (err) {
       console.error(err);
    };
  }
}
