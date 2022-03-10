const AWS = require("aws-sdk");

let client = null;

const getDynamoDBClient = () => {
  if (client) return client;
  client = new AWS.DynamoDB({
    httpOptions: {
      connectTimeout: 1000,
      timeout: 1000,
    },
  });
  return client;
};

// Thanks, Paul Swail! https://github.com/aws/aws-sdk-js/issues/2464#issuecomment-503524701
const executeTransactWrite = async ({ client, params }) => {
  const transactionRequest = client.transactWriteItems(params);
  let cancellationReasons;
  transactionRequest.on("extractError", (response) => {
    try {
      cancellationReasons = JSON.parse(
        response.httpResponse.body.toString()
      ).CancellationReasons;
    } catch (err) {
      // suppress this just in case some types of errors aren't JSON parseable
      console.error("Error extracting cancellation error", err);
    }
  });
  return new Promise((resolve, reject) => {
    transactionRequest.send((err, response) => {
      if (err) {
        err.cancellationReasons = cancellationReasons;
        return reject(err);
      }
      return resolve(response);
    });
  });
};

module.exports = {
  getDynamoDBClient,
  executeTransactWrite,
};
