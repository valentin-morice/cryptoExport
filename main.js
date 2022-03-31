#!/usr/bin/env node
import { welcome, questionAPI } from "./controller/cli_inputs.js";
import fs from "fs";

console.clear();

// Check if user is registered, if not, register user
if (fs.existsSync("./controller/config.json"))
  console.log("Already registered");
else {
  questionAPI();
}
