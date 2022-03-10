class User {
  constructor({ username, firstName, lastName }) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  pk() {
    return `USER#${this.username}`;
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
      username: { S: this.username },
      firstName: { S: this.firstName },
      lastName: { S: this.lastName },
    };
  }
}

const itemToUser = (item) => {
  return new User({
    username: item.username.S,
    firstName: item.firstName.S,
    lastName: item.lastName.S,
  });
};

module.exports = {
  User,
  itemToUser,
};
