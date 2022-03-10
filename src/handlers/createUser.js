const { getAccountService } = require("../accounts/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { username, firstName, lastName } = JSON.parse(event.body);

  const user = await getAccountService().createUser({
    username,
    firstName,
    lastName,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ user }),
  };
};

module.exports.handler = makeHandler({ handler });
