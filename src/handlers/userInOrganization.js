const { MembershipDoesNotExistError } = require("../accounts/errors");
const { getAccountService } = require("../accounts/service");
const { makeHandler } = require("./utils");

const handler = async (event, context) => {
  const { organization: organizationName, username } = event.pathParameters;

  const membership = await getAccountService().getMembership({
    organizationName,
    username,
  });

  if (!membership) {
    throw new MembershipDoesNotExistError(organizationName, username);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ membership }),
  };
};

module.exports.handler = makeHandler({ handler });
