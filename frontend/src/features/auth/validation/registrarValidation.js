// registrarValidation.js
export function validateRegistrarRegister(formData) {
  const errors = {};

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  // Validate registrar ID (exactly 4 digits)
  if (!formData.registrarId.trim()) {
    errors.registrarId = "Registrar ID is required";
  } else if (!/^\d{4}$/.test(formData.registrarId.trim())) {
    errors.registrarId = "Registrar ID must be exactly 4 digits";
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[a-zA-Z0-9._%+-]+@cit\.edu$/i.test(formData.email.trim())) {
    errors.email = "Please enter a valid institutional email address (e.g., name@cit.edu)";
  }

  // Validate password
  if (!formData.password.trim()) {
    errors.password = "Password is required";
  } else {
    const passwordRules = [
      { regex: /.{8,}/, message: "at least 8 characters" },
      { regex: /[A-Z]/, message: "at least one uppercase letter" },
      { regex: /[a-z]/, message: "at least one lowercase letter" },
      { regex: /\d/, message: "at least one number" },
      { regex: /[!@#$%^&*()_,.?":{}|<>]/, message: "at least one special character" }
    ];

    const failed = passwordRules
      .filter(rule => !rule.regex.test(formData.password))
      .map(rule => rule.message);

    if (failed.length > 0) {
      errors.password = "Password must contain: " + failed.join(", ");
    }
  }

  // Confirm password
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Terms agreement
  if (!formData.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the Terms of Service and Privacy Policy";
  }

  return errors;
}
