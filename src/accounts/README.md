## Accounts Service module

This module includes the Accounts Service, which is a class that implements the business logic for working with Users, Organizations, and Memberships.

This is pretty similar to something you would use in a non-serverless environment, which a class that exposes core functions like `createUser`, `getUser`, `addMemberToOrganization`, etc.

The key point in working with the service in a serverless environment with AWS Lambda is the class re-use logic. Lambda functions are stateless by default, but the same function environment may be used across multiple invocations. For this reason, it is a best practice to [reuse network connections](https://gomomento.com/docs/guides/caching-with-aws-lambda#connection-reuse) across invocations for faster performance.

To make this easy, we have a `getAccountService` function that provides access to a singleton AccountService instance with a re-used DynamoDB client. You can read more about that client in the [clients module](./../clients/README.md).
