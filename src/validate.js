const extraAsserts = require('validator.js-asserts');
const { Assert, Validator, Constraint, Violation } = require('validator.js');
const { isPlainObject, isString, isArray } = require('lodash');

// Headers assert.
const Headers = function() {
  this.__class__ = 'Headers';

  this.validate = headers => {
    if (!isPlainObject(headers)) {
      throw new Violation(this, headers, "headers should be an object");
    }

    for (const header of Object.values(headers)) {
      if (!isString(header)) {
        throw new Violation(this, headers, "headers values should be strings");
      }
    }

    return true;
  };

  return this;
}

// Body assert.
const Body = function() {
  this.__class__ = 'Body';

  this.validate = body => {
    if (isPlainObject(body) || isArray(body)) {
      return true;
    }

    throw new Violation(this, body, "body should be an array or object");
  };

  return this;
}

// Validator instance.
const validator = new Validator();

// Validate function.
exports.validate = (data, constraints) => validator.validate(data, new Constraint(constraints, {
  deepRequired: true
}));

// Extended asserts.
exports.is = Assert.extend({
  ...extraAsserts,
  Headers,
  Body,
});
