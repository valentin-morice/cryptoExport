import converter from "json-2-csv";
import fs from "fs";

async function exportCSV(param) {
  const csv = await converter.json2csvAsync(param);
  fs.writeFileSync("export.csv", csv);
}

export default exportCSV;
