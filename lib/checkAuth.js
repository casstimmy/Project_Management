import { jwtDecode } from "jwt-decode";

/**
 * Check if the stored token is valid and not expired.
 * Returns the decoded user object if valid, or null if expired/invalid.
 * Automatically clears expired tokens from localStorage.
 */
export function checkAuth() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // Check expiry (exp is in seconds, Date.now() is in ms)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("appMode");
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("appMode");
    return null;
  }
}

/**
 * Get the stored token string, or null if expired/missing.
 */
export function getToken() {
  const user = checkAuth();
  if (!user) return null;
  return localStorage.getItem("token");
}

/**
 * Returns true if token will expire within the given minutes.
 */
export function isTokenExpiringSoon(withinMinutes = 30) {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const expiresAt = decoded.exp * 1000;
    return expiresAt - Date.now() < withinMinutes * 60 * 1000;
  } catch {
    return true;
  }
}
