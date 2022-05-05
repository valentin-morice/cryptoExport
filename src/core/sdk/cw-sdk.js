import { RESTClient } from "cw-sdk-node";
import CoinGecko from "coingecko-api";
const coingeckoClient = new CoinGecko();

async function getExchanges(apiKeys) {
  const client = new RESTClient({
    creds: { apiKey: apiKeys.cryptoWatch }
  });
  const exchanges = await client.getExchanges();
  let exchangesArr = [];
  for (let i = 0; i < exchanges.length; i++) {
    if (exchanges[i].active === true) {
      exchangesArr.push(exchanges[i].symbol);
    }
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

async function getData(exchange, coin, params, apiKeys) {
  const client = new RESTClient({
    creds: { apiKey: apiKeys.cryptoWatch }
  });
  return await client.getOHLC(exchange, coin, params);
}

export { getExchanges, getCoins, getData };
