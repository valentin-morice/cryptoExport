import { RESTClient } from "cw-sdk-node";
import { readFile } from "fs/promises";

const userData = JSON.parse(
  await readFile(new URL("../../controller/config.json", import.meta.url))
);

const client = new RESTClient({
  creds: {
    apiKey: userData.apiKey,
  },
});

// All requests return promises that return the formatted API data.
async function getExchanges() {
  const response = await client.getExchanges();
  return response;
}

console.log(await getExchanges());

export { getExchanges };
