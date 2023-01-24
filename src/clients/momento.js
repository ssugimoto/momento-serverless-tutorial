const AWS = require("aws-sdk");
const { SimpleCacheClient } = require("@gomomento/sdk");

MOMENTO_SECRET_ID = "accounts/MomentoAuthToken/sugimoto";
MOMENTO_DEFAULT_TTL = 60;
MOMENTO_AUTH_TOKEN_JSON_KEY = "accounts_MomentoAuthToken"
let client = null;

const getMomentoClient = async () => {
  if (client) return client;
  const authToken = await getMomentoAuthToken();
  // console.log("momento token=" + token);
  // console.log(JSON.stringify(token));
  // //client = new SimpleCacheClient(token, MOMENTO_DEFAULT_TTL);
  // const authToken = process.env.MOMENTO_AUTH_TOKEN;
  console.log("momento authToken=" + authToken);
  client = new SimpleCacheClient(authToken, MOMENTO_DEFAULT_TTL);
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

  const obj = JSON.parse(response.SecretString);
  console.log("obj=" + obj)
  return obj.accounts_MomentoAuthToken;
  //return JSON.parse(response.SecretString);
};

module.exports = {
  getMomentoClient,
};
