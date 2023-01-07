const validator = require("validator");

const isEmpty = require("./is-Empty");

const validateSignUp = ({ name, email, password, password2 }) => {
  let errors = {};

  name = !isEmpty(name) ? name : "";
  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";
  password2 = !isEmpty(password2) ? password2 : "";

  if (!validator.isLength(name, { min: 2, max: 30 })) {
    errors.name = "Name shoould have 2 to 30 characters";
  }

  if (validator.isEmpty(name)) {
    errors.name = "Name field is required";
  }

  if (validator.isEmpty(email)) {
    errors.email = "Email field is required";
  }

  if (!validator.isEmail(email)) {
    errors.email = "Email is invalid";
  }

  if (validator.isEmpty(password)) {
    errors.password = "Password field is required";
  }

  if (!validator.isLength(password, { min: 6, max: 30 })) {
    errors.password = "Password should be min 6 characters";
  }

  if (validator.isEmpty(password2)) {
    errors.password2 = "Confirmed Password field is required";
  }

  if (!validator.equals(password, password2)) {
    errors.password2 = "Passwords should match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = {
  validateSignUp: validateSignUp,
};
