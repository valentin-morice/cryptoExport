import { RESTClient } from "cw-sdk-node";
import { readFile } from "fs/promises";

const config = JSON.parse(
  await readFile(new URL("../../../config.json", import.meta.url))
);

const client = new RESTClient({
  creds: {
    apiKey: config.apiKeys.cryptoWatch,
  },
});

async function getExchanges() {
  const exchanges = await client.getExchanges();
  let exchangesArr = [];
  for (let i = 0; i < exchanges.length; i++) {
    exchangesArr.push(exchanges[i].symbol);
  }
  return exchangesArr.sort();
}

export default getExchanges;
