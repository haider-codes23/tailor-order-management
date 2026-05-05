/**
 * Notification API Service — Phase 16
 * src/services/api/notificationApi.js
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/notifications"

/**
 * Get current user's notifications (paginated)
 * @param {Object} params - { page, limit, is_read, type }
 */
export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.page) query.set("page", params.page)
  if (params.limit) query.set("limit", params.limit)
  if (params.is_read !== undefined) query.set("is_read", params.is_read)
  if (params.type) query.set("type", params.type)

  const qs = query.toString()
  const response = await httpClient.get(`${BASE_URL}${qs ? `?${qs}` : ""}`)
  return response.data
}

/**
 * Get unread notification count (for bell badge)
 */
export const getUnreadCount = async () => {
  const response = await httpClient.get(`${BASE_URL}/unread-count`)
  return response.data
}

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
export const markAsRead = async (notificationId) => {
  const response = await httpClient.put(`${BASE_URL}/${notificationId}/read`)
  return response.data
}

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  const response = await httpClient.put(`${BASE_URL}/read-all`)
  return response.data
}

/**
 * Delete a notification
 * @param {string} notificationId
 */
export const deleteNotification = async (notificationId) => {
  const response = await httpClient.delete(`${BASE_URL}/${notificationId}`)
  return response.data
}