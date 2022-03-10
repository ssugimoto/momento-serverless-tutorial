## Service clients

This module includes clients for external services, such as AWS services or (in later modules) a Momento cache.

We manage initialization logic for external services in a separate module for two reasons:

- First, it allows for centraliziation of common configuration, such as the HTTP timeouts for our AWS clients;

- Second, it simplifies [connection reuse](https://gomomento.com/docs/guides/caching-with-aws-lambda#connection-reuse) for our clients in a way that optimizes for the AWS Lambda environment.

Each client includes a `getClient()` function that is used to retrieve an instance of the client. The client modules will instantiate and return a singleton instance of the client which allows for the connection reuse across Lambda function instances.
