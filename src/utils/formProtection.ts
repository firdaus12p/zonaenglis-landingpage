/**
 * Form Protection Utilities
 *
 * Handles form token for public form submissions
 * to prevent unauthorized form submissions
 */

import { API_BASE } from "../config/api";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get form token from server (cached for performance)
 */
export const getFormToken = async (): Promise<string> => {
  const now = Date.now();

  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && tokenExpiry > now + 300000) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${API_BASE}/form-token`);
    const data = await response.json();

    if (data.success && data.formToken) {
      cachedToken = data.formToken;
      tokenExpiry = now + data.expiresIn * 1000; // Convert seconds to ms
      return data.formToken;
    }

    throw new Error("Failed to get form token");
  } catch (error) {
    console.error("❌ Error fetching form token:", error);
    throw error;
  }
};

/**
 * Add form token to request body
 */
export const addFormToken = async (
  body: Record<string, any>
): Promise<Record<string, any>> => {
  const formToken = await getFormToken();
  return {
    ...body,
    formToken,
  };
};

/**
 * Clear cached token (call after failed submission)
 */
export const clearFormToken = () => {
  cachedToken = null;
  tokenExpiry = 0;
};

/**
 * Helper for making protected form submissions
 */
export const submitProtectedForm = async (
  url: string,
  data: Record<string, any>,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const protectedData = await addFormToken(data);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(protectedData),
      ...options,
    });

    // If token invalid, clear cache and don't retry (user should refresh)
    if (response.status === 403) {
      clearFormToken();
    }

    return response;
  } catch (error) {
    console.error("❌ Protected form submission failed:", error);
    throw error;
  }
};

export default {
  getFormToken,
  addFormToken,
  clearFormToken,
  submitProtectedForm,
};
