const { RESTClient } = require("cw-sdk-node");
const client = new RESTClient({
  creds: {
    apiKey: ""
  }
});

// All requests return promises that return the formatted API data.
async function getExchanges() {
  const response = await client.getExchanges();
  return response.results;
}

module.exports = {
  getExchanges
}