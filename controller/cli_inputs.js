import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";
import chalkAnimation from "chalk-animation";
import readline from "readline";
import fs from "fs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow("CLI Masters \n");
  await sleep();
  rainbowTitle.stop();

  figlet(`Crypto Data Export`, { font: "3-D" }, (err, data) => {
    console.log(gradient.pastel.multiline(data) + "\n");

    console.log(
      boxen("Crypto Currency Historical Data Export CLI", {
        borderColor: "blackBright",
        borderStyle: "bold",
      })
    );

    console.log(`
        ${chalk.green("Welcome!")} 
        Lorem ipsum dolor sit amet. 
        Id assumenda rerum est tempore nulla est sunt temporibus ut quia veniam id ipsam fugit quo velit corporis qui voluptatem sint. 
        Qui galisum dolores ut molestias sint et temporibus necessitatibus!
      `);
    return;
  });
  return;
}

// Asks API key & writes it to config.json
function questionAPI() {
  rl.question("Please enter your CryptoWatch API key: ", function (apiKey) {
    const client = {
      apiKey: apiKey,
    };

    const data = JSON.stringify(client);
    fs.writeFile("./controller/config.json", data, (err) => {
      if (err) throw err;
      console.log("API key saved");
    });
  });
}

export { welcome, questionAPI };
