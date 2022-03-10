const { slugifyName } = require("./utils");

class Membership {
  constructor({ organizationName, memberUsername, role }) {
    this.organizationName = slugifyName(organizationName);
    this.memberUsername = memberUsername;
    this.role = role;
  }

  pk() {
    return `ORGMEMBERS#${this.organizationName}`;
  }

  sk() {
    return `MEMBER#${this.memberUsername}`;
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
      memberUsername: { S: this.memberUsername },
      role: { S: this.role },
    };
  }
}

const itemToMembership = (item) => {
  return new Membership({
    organizationName: item.organizationName.S,
    memberUsername: item.memberUsername.S,
    role: item.role.S,
  });
};

module.exports = {
  Membership,
  itemToMembership,
};
