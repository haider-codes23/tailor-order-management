/**
 * QA API Service
 * src/services/api/qaApi.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Handles all API calls related to the QA module
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/qa"

// ============================================================================
// QA QUEUE
// ============================================================================

/**
 * Get all sections in QA_PENDING status (QA Queue)
 * @returns {Promise} List of sections awaiting QA video link
 */
export const getQAQueue = async () => {
  const response = await httpClient.get(`${BASE_URL}/queue`)
  return response.data
}

/**
 * Get QA queue statistics
 * @returns {Promise} Stats: pending count, ready for client count, completed today
 */
export const getQAStats = async () => {
  const response = await httpClient.get(`${BASE_URL}/stats`)
  return response.data
}

// ============================================================================
// SECTION DETAILS
// ============================================================================

/**
 * Get section details for QA review
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name (e.g., "shirt", "dupatta")
 * @returns {Promise} Section details with production summary
 */
export const getQASectionDetails = async (orderItemId, sectionName) => {
  const response = await httpClient.get(
    `${BASE_URL}/order-item/${orderItemId}/section/${sectionName}`
  )
  return response.data
}

// ============================================================================
// VIDEO LINK MANAGEMENT
// ============================================================================

/**
 * Add YouTube video link to a section
 * Moves section from QA_PENDING to READY_FOR_CLIENT_APPROVAL
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name
 * @param {Object} data - { youtubeUrl: string, uploadedBy: userId }
 * @returns {Promise} Updated section status
 */
export const addSectionVideoLink = async (orderItemId, sectionName, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${sectionName}/add-video-link`,
    data
  )
  return response.data
}

/**
 * Update YouTube video link for a section
 * Only allowed if section is still in READY_FOR_CLIENT_APPROVAL
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name
 * @param {Object} data - { youtubeUrl: string, updatedBy: userId }
 * @returns {Promise} Updated section status
 */
export const updateSectionVideoLink = async (orderItemId, sectionName, data) => {
  const response = await httpClient.put(
    `${BASE_URL}/order-item/${orderItemId}/section/${sectionName}/video-link`,
    data
  )
  return response.data
}

// ============================================================================
// SECTIONS READY FOR CLIENT (for Sales to see)
// ============================================================================

/**
 * Get all sections that have video links added (READY_FOR_CLIENT_APPROVAL)
 * This is used by Sales to see what's ready to send to clients
 * @returns {Promise} List of sections with video links
 */
export const getSectionsReadyForClient = async () => {
  const response = await httpClient.get(`${BASE_URL}/ready-for-client`)
  return response.data
}

// ============================================================================
// HELPER: YouTube URL Validation
// ============================================================================

/**
 * Validate YouTube URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false

  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/v\/[\w-]+/,
  ]

  return patterns.some((pattern) => pattern.test(url))
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Get YouTube embed URL from video URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Embed URL or null if invalid
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
}

// ============================================================================
// EXPORT
// ============================================================================

export const qaApi = {
  // Queue
  getQAQueue,
  getQAStats,

  // Section Details
  getQASectionDetails,

  // Video Link Management
  addSectionVideoLink,
  updateSectionVideoLink,

  // For Sales
  getSectionsReadyForClient,

  // Helpers
  isValidYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
}

export default qaApi
