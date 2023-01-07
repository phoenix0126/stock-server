const validator = require("validator");
const isEmpty = require("./is-Empty");

const validateSignIn = ({ email, password }) => {
  let errors = {};

  email = isEmpty(email) ? "" : email;
  password = isEmpty(password) ? "" : password;

  if (validator.isEmpty(email)) {
    errors.email = "Email field is required";
  }

  if (!validator.isEmail(email)) {
    errors.email = "Email invalid";
  }

  if (validator.isEmpty(password)) {
    errors.password = "Password field is require";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = {
  validateSignIn: validateSignIn,
};
