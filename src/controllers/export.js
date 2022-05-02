import fs from "fs";
import * as XLSX from "xlsx";
import converter from "json-2-csv";
import { sleep } from "../helpers/misc.js";
import { createSpinner } from "nanospinner";

async function exportExcel(param) {
  const spinner = createSpinner("Creating XLSX...").start();
  try {
    const fileName = "crypto_export.xlsx";
    const ws = XLSX.utils.json_to_sheet(param);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "output");
    XLSX.writeFile(wb, fileName);

    await sleep();
    spinner.success({ text: "The file was successfully exported to XLSX.\n" });
  } catch (error) {
    spinner.error({text: 'Export error!'});
    throw new Error(error);
  }
}

async function exportCsv(param) {
  const spinner = createSpinner("Creating CSV...").start();
  try {
    const csv = await converter.json2csvAsync(param);
    fs.writeFileSync("output.csv", csv);

    await sleep();
    spinner.success({ text: "The file was successfully exported to CSV.\n" });
  } catch (error) {
    spinner.error({text: 'Export error!'});
    throw new Error(error);
  }
}

export { exportExcel, exportCsv };
