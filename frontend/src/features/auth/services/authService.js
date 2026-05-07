import api from "../../../api";

/**
 * Sanitizes user data to remove any sensitive fields before storing
 */
function sanitizeUserData(user) {
  if (!user) return null;
  
  // Create a safe copy without sensitive fields
  const safeUser = { ...user };
  
  // Explicitly remove sensitive fields (even if backend shouldn't send them)
  delete safeUser.password;
  delete safeUser.passwordHash;
  delete safeUser.token;
  
  return safeUser;
}

export async function login(email, password) {
  try {
    const res = await api.post("/auth/login", { email, password });

    const { token, user } = res.data;

    if (!token || !user) {
      throw new Error("Invalid response from server");
    }

    // Store token securely
    localStorage.setItem("token", token);
    
    // Sanitize and store only safe user data
    const safeUser = sanitizeUserData(user);
    if (safeUser) {
      localStorage.setItem("user", JSON.stringify(safeUser));
    }

    return { token, user: safeUser };
  } catch (error) {
    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Invalid email or password";
    throw new Error(errorMessage);
  }
}

export async function registerUser(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data; // { message, user }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
