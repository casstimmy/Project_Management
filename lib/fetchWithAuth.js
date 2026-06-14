/**
 * Wrapper around fetch that automatically includes the JWT token
 * from localStorage in the Authorization header.
 */
export default function fetchWithAuth(url, options = {}) {
  const { noStore = false, ...rest } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...rest.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON if not FormData
  if (rest.body && !(rest.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (noStore) {
    headers["Cache-Control"] = "no-cache";
    headers.Pragma = "no-cache";
  }

  return fetch(url, {
    ...rest,
    headers,
    // Explicit for reliability: ensure auth cookie is always sent on same-origin calls.
    credentials: rest.credentials || "same-origin",
    ...(noStore ? { cache: "no-store" } : {}),
  });
}
