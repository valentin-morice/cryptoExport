import { start, setParams } from "./src/controllers/inputs.js";
import { exportXLSX, exportCSV } from "./src/controllers/export.js";

await start();
const data = await setParams();
console.log(""); // Jump a line
if (data.format === "xlsx") {
  await exportXLSX(data.cw[data.params.periods]);
} else {
  await exportCSV(data.cw[data.params.periods]);
}
