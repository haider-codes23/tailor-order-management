import { httpClient } from "@/services/http/httpClient"

/**
 * Authentication API Service
 * 
 * This module contains pure functions that make HTTP requests for authentication.
 * These functions are framework-agnostic and can be used anywhere, not just in React.
 * 
 * Each function:
 * - Takes only the data needed for the request
 * - Returns a promise that resolves with the response data
 * - Throws an error if the request fails
 * 
 * React Query will wrap these functions and add state management like
 * loading states, error handling, caching, and retries.
 */

/**
 * Log in with email and password
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<{user: Object, accessToken: string}>}
 */
export async function loginUser(credentials) {
  const response = await httpClient.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  })
  
  return response
}

/**
 * Refresh the access token using the refresh token cookie
 * 
 * @returns {Promise<{accessToken: string}>}
 */
export async function refreshToken() {
  const response = await httpClient.post("/auth/refresh")
  return response
}

/**
 * Log out the current user
 * 
 * @returns {Promise<{message: string}>}
 */
export async function logoutUser() {
  const response = await httpClient.post("/auth/logout")
  return response
}

/**
 * Get current user information
 * 
 * Validates the current access token and returns updated user data.
 * Useful for checking if a token is still valid or refreshing user permissions.
 * 
 * @returns {Promise<{user: Object}>}
 */
export async function getCurrentUser() {
  const response = await httpClient.get("/auth/me")
  return response
}












