const middy = require("@middy/core");
const { KnownError } = require("./../accounts/errors");

const httpErrorResponse = () => {
  const httpErrorResponseOnError = async (request) => {
    console.log(request.error);
    let message = "Internal error.";
    let status = 500;
    if (request.error && request.error instanceof KnownError) {
      message = request.error.message;
      status = request.error.status;
    }

    request.response = {
      statusCode: status,
      body: JSON.stringify({
        error: message,
      }),
    };
  };

  return {
    onError: httpErrorResponseOnError,
  };
};

const makeHandler = ({ handler }) => middy(handler).use(httpErrorResponse());

module.exports = { makeHandler };
