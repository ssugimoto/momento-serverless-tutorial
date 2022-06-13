const { getAccountService } = require("../accounts/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { organizationName } = JSON.parse(event.body);
  const { Authorization: username } = event.headers;

  const accountService = await getAccountService();

  const organization = await accountService.createOrganization({
    organizationName,
    foundingUser: username,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ organization }),
  };
};

module.exports.handler = makeHandler({ handler });
