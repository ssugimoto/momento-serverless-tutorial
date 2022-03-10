// Our middleware will serialize KnownErrors into a more user-friendly format
//   without requiring work from the handler.
// KnownError should be subclassed with a more specific error message and status code.
// In the subclasses, override the message and status code.

class KnownError extends Error {
  constructor() {
    super();
    this.message = "Internal error.";
    this.status = 500;
  }
}
class AlreadyExistsErrorBaseClass extends KnownError {
  constructor() {
    super();
    this.status = 409;
  }
}

class UserAlreadyExistsError extends AlreadyExistsErrorBaseClass {
  constructor(username) {
    super();
    this.message = `User with username ${username} already exists.`;
  }
}

class OrganizationAlreadyExistsError extends AlreadyExistsErrorBaseClass {
  constructor(organizationName) {
    super();
    this.message = `Organization with name ${organizationName} already exists.`;
  }
}

class MembershipAlreadyExistsError extends AlreadyExistsErrorBaseClass {
  constructor(username, organizationName) {
    super();
    this.message = `User ${username} is already a member of organization ${organizationName}`;
  }
}

class DoesNotExistErrorBaseClass extends KnownError {
  constructor() {
    super();
    this.status = 404;
  }
}

class UserDoesNotExistError extends DoesNotExistErrorBaseClass {
  constructor(username) {
    super();
    this.message = `User with username ${username} does not exist.`;
  }
}

class OrganizationDoesNotExistError extends DoesNotExistErrorBaseClass {
  constructor(organizationName) {
    super();
    this.message = `Organization with name ${organizationName} does not exist.`;
  }
}

class MembershipDoesNotExistError extends DoesNotExistErrorBaseClass {
  constructor(organizationName, username) {
    super();
    this.message = `User ${username} is not a member of organization ${organizationName}`;
  }
}

class InvalidUserPermissionError extends KnownError {
  constructor(username) {
    super();
    this.message = `User ${username} does not have permission to perform that action.`;
    this.status = 403;
  }
}

module.exports = {
  KnownError,
  UserAlreadyExistsError,
  OrganizationAlreadyExistsError,
  MembershipAlreadyExistsError,
  UserDoesNotExistError,
  OrganizationDoesNotExistError,
  MembershipDoesNotExistError,
  InvalidUserPermissionError,
};
