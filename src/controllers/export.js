import converter from "json-2-csv";
import fs from "fs";
import { createSpinner } from "nanospinner";
import { sleep } from "./inputs.js";

async function exportCSV(param) {
  const spinner = createSpinner("Creating CSV...").start();
  const csv = await converter.json2csvAsync(param);
  fs.writeFileSync("export.csv", csv);
  await sleep();
  spinner.success({ text: "CSV Created" });
}

export default exportCSV;
