const { RESTClient } = require("cw-sdk-node");

const client = new RESTClient({
  creds: {
    apiKey: "", // your cw api key
  },
});

// All requests return promises that return the formatted API data.
client.getExchanges().then((response) => {
  let exchanges = response.result;
});
