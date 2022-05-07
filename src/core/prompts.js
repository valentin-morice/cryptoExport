import inquirer from "inquirer";

export async function exchange(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Exchange:",
    choices: inputData.exchanges,
    name: "exchanges"
  }]).then((response) => {
    inputData.exchange = response.exchanges;
    console.log(""); // Jump line
  })
};

export async function coin(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Crypto currency:",
    choices: inputData.coins,
    name: "coins"
  }]).then((response) => {
    inputData.coin = response.coins + "usd";
    console.log(""); // Jump line
  })
};

export async function date(inputData) {
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
};

export async function interval(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Time interval:",
    choices: [...inputData.periods.keys()],
    name: "chosePeriods"
  }]).then((response) => {
    inputData.params.periods = inputData.periods.get(response.chosePeriods);
    console.log(""); // Jump line
  });
}

export async function exportFile(inputData) {
  await inquirer.prompt([{
    type: "list",
    message: "Select the exported file format:",
    choices: ["xlsx", "csv"],
    name: "format"
  }]).then((response) => (inputData.format = response.format))
};

export async function apiKey() {
  let apiKey;
  await inquirer.prompt([{
    type: "input",
    message: "Please, enter your API key: ",
    name: "apiKey",
  }]).then((response) => (apiKey = response.apiKey));
  return apiKey;
};