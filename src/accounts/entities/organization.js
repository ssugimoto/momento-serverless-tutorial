const { slugifyName } = require("./utils");

class Organization {
  constructor({ organizationName, foundingUser }) {
    this.organizationName = slugifyName(organizationName);
    this.foundingUser = foundingUser;
  }

  pk() {
    return `ORG#${this.organizationName}`;
  }

  sk() {
    return this.pk();
  }

  keys() {
    return {
      PK: { S: this.pk() },
      SK: { S: this.sk() },
    };
  }

  toItem() {
    return {
      ...this.keys(),
      organizationName: { S: this.organizationName },
      foundingUser: { S: this.foundingUser },
    };
  }
}

const itemToOrganization = (item) => {
  return new Organization({
    organizationName: item.organizationName.S,
    foundingUser: item.foundingUser.S,
  });
};

module.exports = {
  Organization,
  itemToOrganization,
};
