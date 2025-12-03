// registrarLoginValidation.js

export const validateRegistrarLogin = ({ email, password }) => {
  const errors = {};

  // Email validation
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[a-zA-Z0-9._%+-]+@cit\.edu$/i.test(email)) {
    errors.email = "Please enter a valid institutional email address (e.g., name@cit.edu)";
  }

  // Password validation
  if (!password.trim()) {
    errors.password = "Password is required";
  }

  return errors;
};
