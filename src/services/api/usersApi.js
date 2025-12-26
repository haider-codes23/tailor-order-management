/**
 * Users API Service
 *
 * This module provides functions to interact with the Users API.
 * All functions return Promises and work with our httpClient.
 */

import {httpClient} from "../http/httpClient"

/**
 * Get all users with optional filters
 * @param {Object} filters - Optional filters { role, is_active, search }
 * @returns {Promise} Response with users array
 */
export async function getUsers(filters = {}) {
  const params = new URLSearchParams()

  if (filters.role) params.append("role", filters.role)
  if (filters.is_active !== undefined) params.append("is_active", filters.is_active)
  if (filters.search) params.append("search", filters.search)

  const queryString = params.toString()
  const url = queryString ? `/users?${queryString}` : "/users"

  return httpClient.get(url)
}

/**
 * Get a single user by ID
 * @param {number|string} userId - User ID
 * @returns {Promise} Response with user object
 */
export async function getUserById(userId) {
  return httpClient.get(`/users/${userId}`)
}

/**
 * Create a new user
 * @param {Object} userData - User data { name, email, role, phone?, is_active?, permissions }
 * @returns {Promise} Response with created user
 */
export async function createUser(userData) {
  return httpClient.post("/users", userData)
}

/**
 * Update an existing user
 * @param {number|string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} Response with updated user
 */
export async function updateUser(userId, updates) {
  return httpClient.put(`/users/${userId}`, updates)
}

/**
 * Delete (deactivate) a user
 * @param {number|string} userId - User ID
 * @returns {Promise} Response confirming deletion
 */
export async function deleteUser(userId) {
  return httpClient.delete(`/users/${userId}`)
}

/**
 * Activate a user (set is_active = true)
 * @param {number|string} userId - User ID
 * @returns {Promise} Response with updated user
 */
export async function activateUser(userId) {
  return updateUser(userId, { is_active: true })
}

/**
 * Deactivate a user (set is_active = false)
 * @param {number|string} userId - User ID
 * @returns {Promise} Response with updated user
 */
export async function deactivateUser(userId) {
  return updateUser(userId, { is_active: false })
}