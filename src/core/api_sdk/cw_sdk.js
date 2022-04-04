import { RESTClient } from "cw-sdk-node";
import { readFile } from "fs/promises";
import CoinGecko from "coingecko-api";

const coingeckoClient = new CoinGecko();

async function getExchanges() {
  const config = JSON.parse(
    await readFile(new URL("../../../config.json", import.meta.url))
  );
  const client = new RESTClient({
    creds: {
      apiKey: config.apiKeys.cryptoWatch,
    },
  });
  const exchanges = await client.getExchanges();
  let exchangesArr = [];
  for (let i = 0; i < exchanges.length; i++) {
    exchangesArr.push(exchanges[i].symbol);
  }
  return exchangesArr.sort();
}

async function getCoins() {
  let coinsArr = [];
  const coins = await coingeckoClient.coins.markets({
    order: CoinGecko.ORDER.MARKET_CAP_DESC,
    per_page: 10,
  });
  for (let i = 0; i < 10; i++) {
    coinsArr.push(coins.data[i].symbol);
  }
  return coinsArr;
}

export { getExchanges, getCoins };
