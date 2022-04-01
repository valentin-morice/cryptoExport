#!/usr/bin/env node
import { welcome, questionAPI, doubleSleep } from "./controller/cli_inputs.js";
import fs from "fs";

console.clear;

async function runMain() {
  await welcome();
  // Check if user is registered, if not, register user
  if (fs.existsSync("./controller/config.json")) {
    await doubleSleep();
    console.log("Already registered");
  } else {
    questionAPI();
  }
}

runMain();
