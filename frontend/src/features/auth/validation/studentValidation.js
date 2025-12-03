// studentValidation.js

export const validateStudentRegister = (formData) => {
  const errors = {};

  // First Name
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  // Last Name
  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  // Student ID (example format: XX-XXXX-XXX)
  if (!formData.registrarId.trim()) {
    errors.registrarId = "Student ID is required";
  }
  
  // Email
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[\w.-]+@cit\.edu$/.test(formData.email.trim())) {
    errors.email = "Please enter a valid institutional email (example@cit.edu)";
  }

  // Password
  if (!formData.password.trim()) {
    errors.password = "Password is required";
  } else {
    const rules = [
      { regex: /.{6,}/, message: "at least 6 characters" },
      { regex: /[A-Z]/, message: "at least one uppercase letter" },
      { regex: /[a-z]/, message: "at least one lowercase letter" },
      { regex: /\d/, message: "at least one number" },
      { regex: /[!@#$%^&*()_.,?":{}|<>]/, message: "at least one special character" },
    ];
    const failed = rules.filter(r => !r.regex.test(formData.password)).map(r => r.message);
    if (failed.length > 0) {
      errors.password = "Password must contain: " + failed.join(", ");
    }
  }

  // Confirm Password
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Terms
  if (!formData.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the Terms of Service and Privacy Policy";
  }

  return errors;
};
