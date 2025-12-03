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
 * Get user data from localStorage
 */
export function getStoredUser() {
  const userJson = localStorage.getItem("user")
  return userJson ? JSON.parse(userJson) : null
}

/**
 * Store user data in localStorage
 */
export function setStoredUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  } else {
    localStorage.removeItem("user")
  }
}

/**
 * Clear all auth data
 */
export function clearAuth() {
  setAuthToken(null)
  setStoredUser(null)
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
 * Refresh token function
 * Returns new access token or null if refresh fails
 */
async function refreshAuthToken() {
  try {
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Send httpOnly refresh token cookie
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.accessToken) {
        setAuthToken(data.accessToken)
        return data.accessToken
      }
    }

    return null
  } catch (error) {
    console.error("Token refresh failed:", error)
    return null
  }
}

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue = []

/**
 * Process queued requests after token refresh
 */
function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

/**
 * Handle HTTP response with automatic token refresh on 401
 */
async function handleResponse(response, originalRequest) {
  // If response is OK, parse and return
  if (response.ok) {
    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return response.json()
    }

    return response.text()
  }

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401) {
    // If this is already a refresh request, don't retry
    if (originalRequest.url.includes("/auth/refresh")) {
      clearAuth()
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
      throw new Error("Session expired")
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return fetch(originalRequest.url, originalRequest).then(handleResponse)
        })
        .catch((err) => {
          throw err
        })
    }

    // Start refresh process
    isRefreshing = true

    try {
      const newToken = await refreshAuthToken()

      if (newToken) {
        // Token refreshed successfully
        isRefreshing = false
        processQueue(null, newToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        const retryResponse = await fetch(originalRequest.url, originalRequest)
        return handleResponse(retryResponse, originalRequest)
      } else {
        // Refresh failed
        isRefreshing = false
        processQueue(new Error("Token refresh failed"), null)
        clearAuth()

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login"
        }

        throw new Error("Session expired")
      }
    } catch (error) {
      isRefreshing = false
      processQueue(error, null)
      clearAuth()

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login"
      }

      throw error
    }
  }

  // Handle other errors
  let errorMessage = `HTTP Error ${response.status}`
  let errorBody = null

  try {
    errorBody = await response.json()
    errorMessage = errorBody.message || errorBody.error || errorMessage
  } catch {
    try {
      errorMessage = await response.text()
    } catch {
      // Keep default error message
    }
  }

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

  // Build URL with query params
  let url = `${appConfig.apiBaseUrl}${endpoint}`

  if (params) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }

  // Build fetch options
  const fetchConfig = {
    method,
    headers: buildHeaders(customHeaders),
    credentials: "include", // Important: include cookies for refresh token
    ...fetchOptions,
  }

  // Add body if present
  if (body && !["GET", "HEAD"].includes(method)) {
    fetchConfig.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, fetchConfig)
    return handleResponse(response, { url, ...fetchConfig })
  } catch (error) {
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