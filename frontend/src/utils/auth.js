// Authentication utilities

/**
 * Check if user is logged in as admin
 * @returns {boolean}
 */
export const isAdminLoggedIn = () => {
  try {
    const adminToken = localStorage.getItem("adminToken");
    return Boolean(adminToken);
  } catch {
    return false;
  }
};

/**
 * Check if user is logged in (regular user)
 * @returns {boolean}
 */
export const isUserLoggedIn = () => {
  try {
    const token = localStorage.getItem("token");
    return Boolean(token);
  } catch {
    return false;
  }
};

/**
 * Get current user info from token
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (!token) return null;

    // Decode JWT token (simple base64 decode for payload)
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Logout user and redirect
 * @param {function} navigate - React Router navigate function
 * @param {boolean} isAdmin - Whether logging out from admin
 */
export const logout = (navigate, isAdmin = false) => {
  try {
    if (isAdmin) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token"); // Also remove regular token
      navigate("/"); // Redirect to root page
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/**
 * Check if current user has admin privileges
 * @returns {boolean}
 */
export const hasAdminPrivileges = () => {
  try {
    const user = getCurrentUser();
    return user && user.isAdmin;
  } catch {
    return false;
  }
};
