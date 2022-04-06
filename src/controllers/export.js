import converter from "json-2-csv";
import fs from "fs";
import { createSpinner } from "nanospinner";
import { sleep } from "./inputs.js";
import * as XLSX from "xlsx";

async function exportXLSX(param) {
  const spinner = createSpinner("Creating XLSX...").start();
  const fileName = "output.xlsx";
  const ws = XLSX.utils.json_to_sheet(param);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "output");
  XLSX.writeFile(wb, fileName);
  await sleep();
  spinner.success({ text: "XLSX Created" });
  console.log(""); // Jump a line
}

async function exportCSV(param) {
  const spinner = createSpinner("Creating CSV...").start();
  const csv = await converter.json2csvAsync(param);
  fs.writeFileSync("output.csv", csv);
  await sleep();
  spinner.success({ text: "CSV Created" });
  console.log(""); // Jump a line
}

export { exportXLSX, exportCSV };
