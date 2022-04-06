import { start, setParams } from "./src/controllers/inputs.js";
import exportCSV from "./src/controllers/export.js";

await start();
const data = await setParams();
await exportCSV(data.cw[data.params.periods]);
