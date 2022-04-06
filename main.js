import { start, setParams } from "./src/controllers/inputs.js";
import exportCSV from "./src/controllers/export.js";

await start();
const data = await setParams();
console.log(""); // Jump a line
await exportCSV(data.cw[data.params.periods]);
