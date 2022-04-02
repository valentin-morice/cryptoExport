/* eslint-disable no-promise-executor-return */
import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import { createSpinner } from "nanospinner";
import readline from "readline";
import fs from "fs";
import inquirer from "inquirer";

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
const configExists = fs.existsSync("./config.json");

// Initial user application setup
async function initialSetup() {
  // Check if user has saved API and/or DB information.
  const spinner = createSpinner("Checking config.json...").start();
  await sleep();

  if (!configExists) {
    spinner.error({
      text: 'No "config.json" file found.',
    });

    const apiKeyInputHandler = async () => {
      let apiKey;
      const question = inquirer
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

      await question;

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
    // TODO next step - The app should prompt the user with the next steps
    spinner.success({ text: "Found API key" });
    return;
  }
}

async function start() {
  console.clear();

  figlet(
    "Crypto Export API",
    {
      font: "The Edge",
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
      This small application is made by the swaggest swaggers in the whole World Wide Web 2.0 (Soon to be 3.0, hide your daughters).

      You can do lots of stuff like exporting crypto data into excel and many more (not really).
      Let's start! :)
      `);
    }
  );
  setParams();
}

async function setParams() {
  await initialSetup();
  await sleep(1000);
  inquirer
    .prompt([
      {
        type: "list",
        message: "Please choose an exchange",
        choices: ["kraken", "bitfinex"],
        name: "exchanges",
      },
    ])
    .then((response) => console.log(response));
}

export default start;
