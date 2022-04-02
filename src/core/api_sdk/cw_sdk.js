import { RESTClient } from "cw-sdk-node";
import { readFile } from "fs/promises";
const config = JSON.parse(
  await readFile(new URL("./../../config.json", import.meta.url))
);

const client = new RESTClient({
  creds: {
    apiKey: config.apiKeys.cryptoWatch,
  },
});

export async function getExchanges() {
  return await client.getExchanges();
}
