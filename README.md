## Adding a cache to a serverless application

This is the code repository for a [tutorial on adding a cache to a serverless application](https://gomomento.com/docs/serverless-cache-walkthrough/adding-a-cache-to-serverless). Be sure to refer to that tutorial to walk through the steps of deploying a serverless application, then adding caching to improve the performance of your application.

> Note: This is the `step-4` branch, which includes all code for the first four steps in the tutorial. If you are looking for the final code for the application, you can find it on the `main` branch.

Most of the details of the application are explained in the tutorial. However, you can use this repository to take a deeper look at some of the code aspects that are not discussed in depth in the tutorial.

Specifically, look at the following areas for additional detail:

- [The `src/handlers` README](./src/handlers/README.md) for information on the Lambda function handlers;
- [The `src/accounts` README](./src/accounts/README.md) for details on the Accounts service;
- [The `src/clients` README](./src/clients/README.md) for information about API clients.

## Deploying

To deploy this service, you must have the [Serverless Framework](https://www.serverless.com/framework) installed. You can install it with the following command:

```bash
npm install -g serverless
```

You will also need to have AWS credentials available in your environment. See [here](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) to see how to set up your credentials.

Once you have configured your environment, you can deploy the application using the following command:

```bash
serverless deploy
```

The Serverless Framework will build and deploy your application to AWS. Following the deploy, you should see output indicating the URL endpoints that can be used to access your application:

```bash
✔ Service deployed to stack momento-serverless-tutorial-dev (58s)

endpoints:
  POST - https://${apiId}.execute-api.us-east-1.amazonaws.com/dev/users
  POST - https://${apiId}.execute-api.us-east-1.amazonaws.com/dev/organizations
  POST - https://${apiId}.execute-api.us-east-1.amazonaws.com/dev/organizations/{organization}/members
  GET - https://${apiId}.execute-api.us-east-1.amazonaws.com/dev/organizations/{organization}/members/{username}
functions:
  createUser: momento-serverless-tutorial-dev-createUser (21 kB)
  createOrganization: momento-serverless-tutorial-dev-createOrganization (21 kB)
  addUserToOrganization: momento-serverless-tutorial-dev-addUserToOrganization (21 kB)
  userInOrganization: momento-serverless-tutorial-dev-userInOrganization (21 kB)
```

Check out the tutorial to see how to exercise these endpoints.

In the `collections/` directory, there are exported collections for both Postman and Insomnia. For each, be sure to set the `endpoint` variable in your environment to the base URL for your API.
