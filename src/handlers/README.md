## Lambda function handlers

The `src/handlers` directory contains the Lambda function handlers for each of the endpoints in our application.

Below are a few notes about how the Lambda function handlers work and our design philosophy around them.

### Lambda function signature

When configuring a Lambda function, you must point to a specific file and exported function that will serve as the entrypoint for your function when a configured event invokes the function.

This entrypoint function should take two arguments:

- `event`, which contains information about the triggering event for a particular invocation, and
- `context`, which includes information about the function configuration and environment.

The `event` object will be more useful in handling the invocation. The event shape will depend on the event source triggering it. For an SQS message event, it will include a batch of SQS messages, including the queue name, message ID, and message contents for your function to operate on. For an HTTP event like from API Gateway, it will include the payload body, the URL path invoked, HTTP headers, and more from the request.

### Lambda function response

The response from your Lambda function can be important to proper handling of the event. For certain events, like SQS messages or Kinesis stream records, a non-error response indicates that the events were handled successfully and further processing can proceed.

For an HTTP event, you need to return a response shape that will indicate the response that API Gateway should return to the original client. This should include a `statusCode` property for the HTTP status code, as well as a `body` for the response body. You may optionally include `headers` for HTTP headers as well.

### Lambda handler structure

Your Lambda handler entrypoint functions should be small wrappers around your service code. They should do the work to parse and validate the incoming event and prepare the proper response, but they shouldn't do much business logic themselves. The business logic work should be sent to your service code. To see this in action, check out the [Accounts Service module](./../accounts/README.md).

In our function code, we parse out the relevant data from the HTTP request. We also have a small, error-handling middleware using [Middy](https://middy.js.org/), which allows us to throw errors lower in the stack that will be rendered properly to our HTTP clients.
