const {
  getDynamoDBClient,
  executeTransactWrite,
} = require("../clients/dynamodb");
const { getMomentoClient } = require("../clients/momento");
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
const { CacheGetStatus } = require("@momento/sdk");
const TABLE_NAME = process.env.TABLE_NAME;
const CACHE_NAME = process.env.CACHE_NAME;

class AccountService {
  constructor(dynamoDBClient, cacheClient) {
    this._dynamoDBClient = dynamoDBClient;
    this._cacheClient = cacheClient;
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

      await this._cacheClient.set(
        CACHE_NAME,
        getUserCacheKey(user),
        JSON.stringify(user.toItem()),
        1800
      );

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

    let getResp = await this._cacheClient.get(
      CACHE_NAME,
      getUserCacheKey(user)
    );
    if (getResp.status === CacheGetStatus.Hit) {
      const cacheContent = JSON.parse(getResp.text());
      return cacheContent ? itemToUser(cacheContent) : null;
    }

    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: user.keys(),
      })
      .promise();

    await this._cacheClient.set(
      process.env.CACHE_NAME,
      getUserCacheKey(user),
      JSON.stringify(response.Item || ""),
      60
    );

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
    const organizationCacheKey = `ORG#${organization.organizationName}`;

    let getResp = await this._cacheClient.get(
      process.env.CACHE_NAME,
      organizationCacheKey
    );
    if (getResp.status === CacheGetStatus.Hit) {
      const cacheContent = JSON.parse(getResp.text());
      return cacheContent ? itemToOrganization(cacheContent) : null;
    }

    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: organization.keys(),
      })
      .promise();

    await this._cacheClient.set(
      process.env.CACHE_NAME,
      organizationCacheKey,
      JSON.stringify(response.Item || ""),
      60
    );

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

      await this._cacheClient.set(
        process.env.CACHE_NAME,
        getMembershipCacheKey(membership),
        JSON.stringify(membership.toItem()),
        60
      );

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

    let getResp = await this._cacheClient.get(
      process.env.CACHE_NAME,
      getMembershipCacheKey(membership)
    );
    if (getResp.status === CacheGetStatus.Hit) {
      const cacheContent = JSON.parse(getResp.text());
      return cacheContent ? itemToMembership(cacheContent) : null;
    }

    const response = await this._dynamoDBClient
      .getItem({
        TableName: TABLE_NAME,
        Key: membership.keys(),
      })
      .promise();

    await this._cacheClient.set(
      process.env.CACHE_NAME,
      getMembershipCacheKey(membership),
      JSON.stringify(response.Item || ""),
      60
    );

    return response.Item ? itemToMembership(response.Item) : null;
  }
}

const getUserCacheKey = (user) => {
  return `USER#${user.username}`;
};

const getMembershipCacheKey = (membership) => {
  return `MEMBER#${membership.organizationName}#${membership.memberUsername}`;
};

let service = null;

module.exports.getAccountService = async (props) => {
  if (service) return service;

  let dynamoDBClient = (props || {}).dynamoDBClient;
  if (!dynamoDBClient) {
    dynamoDBClient = getDynamoDBClient();
  }

  let cacheClient = (props || {}).cacheClient;
  if (!cacheClient) {
    cacheClient = await getMomentoClient();
  }

  service = new AccountService(dynamoDBClient, cacheClient);

  return service;
};
