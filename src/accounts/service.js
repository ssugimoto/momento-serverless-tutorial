const {
  getDynamoDBClient,
  executeTransactWrite,
} = require("../clients/dynamodb");
const {
  User,
  Organization,
  Membership,
  itemToUser,
  itemToOrganization,
  itemToMembership,
} = require("./entities");
const {
  UserAlreadyExistsError,
  OrganizationAlreadyExistsError,
  MembershipAlreadyExistsError,
  UserDoesNotExistError,
  OrganizationDoesNotExistError,
  MembershipDoesNotExistError,
  InvalidUserPermissionError,
} = require("./errors");
const TABLE_NAME = process.env.TABLE_NAME;

class AccountService {
  constructor(dynamoDBClient) {
    this._dynamoDBClient = dynamoDBClient;
  }

  async createUser({ username, firstName, lastName }) {
    const user = new User({ username, firstName, lastName });
    try {
      await this._dynamoDBClient
        .putItem({
          TableName: TABLE_NAME,
          Item: user.toItem(),
          ConditionExpression: "attribute_not_exists(PK)",
        })
        .promise();
      return user;
    } catch (error) {
      if (error.code === "ConditionalCheckFailedException") {
        throw new UserAlreadyExistsError(username);
      }
      throw error;
    }
  }

  async getUser({ username }) {
    const user = new User({ username });
    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: user.keys(),
      })
      .promise();
    return response.Item ? itemToUser(response.Item) : null;
  }

  async createOrganization({ organizationName, foundingUser }) {
    const user = await this.getUser({ username: foundingUser });
    if (!user) {
      throw new UserDoesNotExistError(foundingUser);
    }
    const organization = new Organization({
      organizationName,
      foundingUser,
    });
    const membership = new Membership({
      organizationName,
      memberUsername: foundingUser,
      role: "Owner",
    });
    try {
      const params = {
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              Item: organization.toItem(),
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },
          {
            Put: {
              TableName: TABLE_NAME,
              Item: membership.toItem(),
              ConditionExpression: "attribute_not_exists(PK)",
            },
          },
        ],
      };
      await executeTransactWrite({ client: this._dynamoDBClient, params });
      return organization;
    } catch (error) {
      if (error.code === "TransactionCanceledException") {
        if (error.cancellationReasons[0].Code === "ConditionalCheckFailed") {
          throw new OrganizationAlreadyExistsError(organizationName);
        }
      }
      throw error;
    }
  }

  async getOrganization({ organizationName }) {
    const organization = new Organization({ organizationName });
    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: organization.keys(),
      })
      .promise();
    return response.Item ? itemToOrganization(response.Item) : null;
  }

  async addUserToOrganization({
    organizationName,
    memberUsername,
    role,
    addingUser,
  }) {
    const [organization, newMemberUser, addingMembership] = await Promise.all([
      this.getOrganization({ organizationName }),
      this.getUser({ username: memberUsername }),
      this.getMembership({ organizationName, username: addingUser }),
    ]);

    if (!organization) {
      throw new OrganizationDoesNotExistError(organizationName);
    }

    if (!newMemberUser) {
      throw new UserDoesNotExistError(memberUsername);
    }

    if (!addingMembership) {
      throw new MembershipDoesNotExistError(organizationName, addingUser);
    }

    if (!["Owner", "Admin"].includes(addingMembership.role)) {
      throw new InvalidUserPermissionError(addingUser);
    }

    const membership = new Membership({
      organizationName,
      memberUsername,
      role,
    });
    try {
      await this._dynamoDBClient
        .putItem({
          TableName: TABLE_NAME,
          Item: membership.toItem(),
          ConditionExpression: "attribute_not_exists(PK)",
        })
        .promise();
      return membership;
    } catch (error) {
      if (error.code === "ConditionalCheckFailedException") {
        throw new MembershipAlreadyExistsError(memberUsername);
      }
      throw error;
    }
  }

  async getMembership({ organizationName, username }) {
    const membership = new Membership({
      organizationName,
      memberUsername: username,
    });
    const result = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: membership.keys(),
      })
      .promise();

    return itemToMembership(result.Item);
  }
}

let service = null;

module.exports.getAccountService = (props) => {
  if (service) return service;

  let dynamoDBClient = (props || {}).dynamoDBClient;
  if (!dynamoDBClient) {
    dynamoDBClient = getDynamoDBClient();
  }

  service = new AccountService(dynamoDBClient);

  return service;
};
