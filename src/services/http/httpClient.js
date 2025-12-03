import { appConfig } from "@/config/appConfig"

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem("authToken")
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token)
  } else {
    localStorage.removeItem("authToken")
  }
}

/**
 * Build headers with auth token if available
 */
function buildHeaders(customHeaders = {}) {
  const token = getAuthToken()

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Handle HTTP errors
 */
async function handleResponse(response) {
  // If response is OK, parse JSON
  if (response.ok) {
    // Handle 204 No Content
    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return response.json()
    }

    return response.text()
  }

  // Handle errors
  let errorMessage = `HTTP Error ${response.status}`
  let errorBody = null

  try {
    errorBody = await response.json()
    errorMessage = errorBody.message || errorBody.error || errorMessage
  } catch {
    // If JSON parsing fails, try text
    try {
      errorMessage = await response.text()
    } catch {
      // Keep default error message
    }
  }

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth token
    setAuthToken(null)

    // Redirect to login (we'll implement this better with router later)
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login"
    }
  }

  // Create error object
  const error = new Error(errorMessage)
  error.status = response.status
  error.statusText = response.statusText
  error.body = errorBody

  throw error
}

/**
 * Main request function
 */
async function request(method, endpoint, options = {}) {
  const { body, params, headers: customHeaders, ...fetchOptions } = options

  // Build URL with query params if provided
  let url = `${appConfig.apiBaseUrl}${endpoint}`

  if (params) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }

  // Build fetch options
  const fetchConfig = {
    method,
    headers: buildHeaders(customHeaders),
    ...fetchOptions,
  }

  // Add body if present (and not GET/HEAD)
  if (body && !["GET", "HEAD"].includes(method)) {
    fetchConfig.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, fetchConfig)
    return handleResponse(response)
  } catch (error) {
    // Network errors or errors thrown by handleResponse
    console.error("HTTP Client Error:", error)
    throw error
  }
}

/**
 * HTTP Client API
 */
export const httpClient = {
  get: (endpoint, options = {}) => request("GET", endpoint, options),

  post: (endpoint, body, options = {}) => request("POST", endpoint, { ...options, body }),

  put: (endpoint, body, options = {}) => request("PUT", endpoint, { ...options, body }),

  patch: (endpoint, body, options = {}) => request("PATCH", endpoint, { ...options, body }),

  delete: (endpoint, options = {}) => request("DELETE", endpoint, options),
}

/**
 * Refresh token function (to be called when access token expires)
 * The refresh token is sent as httpOnly cookie by backend automatically
 */
export async function refreshAuthToken() {
  try {
    // Call refresh endpoint (refresh token sent as cookie)
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Important: sends httpOnly cookies
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()

      // Store new access token
      if (data.accessToken) {
        setAuthToken(data.accessToken)
        return data.accessToken
      }
    }

    // If refresh fails, clear token and redirect to login
    setAuthToken(null)
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }

    return null
  } catch (error) {
    console.error("Token refresh failed:", error)
    setAuthToken(null)
    return null
  }
}
