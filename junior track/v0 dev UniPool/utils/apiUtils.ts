// utils/apiUtils.ts
import { apiConfig } from "./apiConfig";

/**
 * Utility function for making API calls with fallback to localStorage
 * @param apiCall Function that makes the actual API call
 * @param fallback Function that provides fallback behavior using localStorage
 * @param params Parameters to pass to both functions
 * @returns Promise with the result
 */
export async function withFallback<T, P>(
  apiCall: (params: P) => Promise<T>,
  fallback: (params: P) => Promise<T>,
  params: P
): Promise<T> {
  // If the API is online, try to use it
  if (apiConfig.isApiOnline) {
    try {
      return await apiCall(params);
    } catch (error) {
      console.warn("API call failed, falling back to localStorage:", error);
      // If the API call fails, fall back to localStorage
      return await fallback(params);
    }
  }

  // If the API is known to be offline, use the fallback directly
  return await fallback(params);
}

/**
 * Helper function for making fetch requests to the API
 * @param endpoint API endpoint
 * @param options fetch options
 * @returns Promise with the response data
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${apiConfig.baseUrl}${endpoint}`;

    // Default options for all API calls
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // Send cookies with cross-origin requests
    };

    // Merge default options with provided options
    const fetchOptions = { ...defaultOptions, ...options };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      // Try to parse error message from the response
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.detail ||
            errorData.message ||
            `API error: ${response.status}`
        );
      } catch (parseError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    // For 204 No Content responses, return null
    if (response.status === 204) {
      return null as T;
    }

    // Parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchApi error:", error);
    throw error;
  }
}
