const AWS = require("aws-sdk");
const { SimpleCacheClient } = require("@gomomento/sdk");

MOMENTO_SECRET_ID = "accounts/MomentoAuthToken";
MOMENTO_DEFAULT_TTL = 60;

let client = null;

const getMomentoClient = async () => {
  if (client) return client;
  const token = await getMomentoAuthToken();
  client = new SimpleCacheClient(token, MOMENTO_DEFAULT_TTL);

  return client;
};

const getMomentoAuthToken = async () => {
  const sm = new AWS.SecretsManager({
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000,
    },
  });

  const response = await sm
    .getSecretValue({
      SecretId: MOMENTO_SECRET_ID,
    })
    .promise();

  return JSON.parse(response.SecretString).MOMENTO_AUTH_TOKEN;
};

module.exports = {
  getMomentoClient,
};
