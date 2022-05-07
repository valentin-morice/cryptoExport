import fs from "fs";
import * as XLSX from "xlsx";
import converter from "json-2-csv";
import { sleep } from "../helpers/misc.js";
import { createSpinner } from "nanospinner";

const date = new Date();
const today = `${date.getDay()}_${date.getMonth()}_${date.getFullYear()}`;
const now = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

async function exportExcel(data, coin, type) {
  const spinner = createSpinner("Creating XLSX...").start();
  try {
    const fileName = `${coin}_export_${today}_${now}.${type}`;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "output");
    XLSX.writeFile(wb, fileName);

    await sleep();
    spinner.success({ text: "The file was successfully exported to XLSX.\n" });
    return fileName;
  } catch (error) {
    spinner.error({text: 'Export error!'});
    throw new Error(error);
  }
}

async function exportCsv(data, coin, type) {
  const spinner = createSpinner("Creating CSV...").start();
  try {
    const fileName = `${coin}_export_${today}_${now}.${type}`;
    const csv = await converter.json2csvAsync(data);
    fs.writeFileSync(fileName, csv);

    await sleep();
    spinner.success({ text: "The file was successfully exported to CSV.\n" });
    return fileName;
  } catch (error) {
    spinner.error({text: 'Export error!'});
    throw new Error(error);
  }
}

export { exportExcel, exportCsv };
