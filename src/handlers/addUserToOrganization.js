const { getAccountService } = require("../accounts/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { memberUsername, role } = JSON.parse(event.body);
  const { Authorization: username } = event.headers;
  const { organization: organizationName } = event.pathParameters;

  const accountService = await getAccountService();

  const membership = await accountService.addUserToOrganization({
    organizationName,
    memberUsername,
    role,
    addingUser: username,
  });
  return {
    statusCode: 200,
    body: JSON.stringify({ membership }),
  };
};

module.exports.handler = makeHandler({ handler });
