const { MembershipDoesNotExistError } = require("../accounts/errors");
const { getAccountService } = require("../accounts/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  console.log(JSON.stringify(event));

  console.log("event.pathParameters=" + event.pathParameters);
  console.log("event.queryStringParameters=" + event.queryStringParameters);
  console.log("event.queryStringParameters username=" + event.queryStringParameters.username);

  const { username } = event.queryStringParameters;
  console.log("username", username);


  const accountService = await getAccountService();
  const username1 = "oliviaowner"; // "USER#oliviaowner";
  const user = await accountService.getUser({ username });

  if (!user) {
    throw new UserDoesNotExistError(username);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ user }),
  };
};

module.exports.handler = makeHandler({ handler });
