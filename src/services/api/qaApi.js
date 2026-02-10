/**
 * QA API Service - Phase 14 Redesign
 * src/services/api/qaApi.js
 *
 * Complete rewrite for new QA workflow:
 * - Section-level approval/rejection with round tracking
 * - Order Item-level video uploads
 * - Sales re-video request handling
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/qa"

// ============================================================================
// QA QUEUE & STATS
// ============================================================================

/**
 * Get QA Production Queue
 * Returns order items with sections in QA_PENDING status, grouped by order item
 * @returns {Promise} List of order items with their sections awaiting QA review
 */
export const getQAProductionQueue = async () => {
  const response = await httpClient.get(`${BASE_URL}/queue`)
  return response.data
}

/**
 * Get Sales Re-video Requests
 * Returns order items that have re-video requests from Sales
 * @returns {Promise} List of order items with re-video requests
 */
export const getSalesRequests = async () => {
  const response = await httpClient.get(`${BASE_URL}/sales-requests`)
  return response.data
}

/**
 * Get QA Dashboard Statistics
 * @returns {Promise} Stats: pendingReview, readyForVideo, salesRequests
 */
export const getQAStats = async () => {
  const response = await httpClient.get(`${BASE_URL}/stats`)
  return response.data
}

// ============================================================================
// SECTION APPROVAL/REJECTION
// ============================================================================

/**
 * Approve a section in QA
 * Moves section from QA_PENDING to QA_APPROVED
 * Increments the round and stores approval data
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name (e.g., "shirt", "dupatta")
 * @param {Object} data - { approvedBy: userId }
 * @returns {Promise} Updated section with approval status
 */
export const approveSection = async (orderItemId, sectionName, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/section/${orderItemId}/${sectionName}/approve`,
    data
  )
  return response.data
}

/**
 * Reject a section in QA
 * Moves section from QA_PENDING to QA_REJECTED
 * Increments the round and stores rejection reason + notes
 * Section will be sent back to Production Head
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name
 * @param {Object} data - { rejectedBy: userId, reasonCode: string, notes: string }
 * @returns {Promise} Updated section with rejection status
 */
export const rejectSection = async (orderItemId, sectionName, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/section/${orderItemId}/${sectionName}/reject`,
    data
  )
  return response.data
}

// ============================================================================
// VIDEO UPLOAD (Order Item Level)
// ============================================================================

// ============================================================================
// VIDEO FILE VALIDATION HELPERS
// ============================================================================

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
]

const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm"]

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024 // 2GB

/**
 * Validate a video file before upload
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected" }
  }

  if (!(file instanceof File)) {
    return { valid: false, error: "Invalid file object" }
  }

  // Check file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    // Fallback: check extension if MIME type is generic
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(`.${ext}`)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed formats: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`,
      }
    }
  }

  // Check file size
  if (file.size > MAX_VIDEO_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum size is 2GB.`,
    }
  }

  // Check minimum size (likely corrupt if < 1KB)
  if (file.size < 1024) {
    return { valid: false, error: "File appears to be empty or corrupt" }
  }

  return { valid: true }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string (e.g. "24.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

// ============================================================================
// VIDEO UPLOAD (Order Item Level) — Now sends FormData with video file
// ============================================================================

/**
 * Upload video file for an Order Item
 * Called after ALL sections of an order item are QA_APPROVED
 * Sends the video file as FormData — MSW simulates YouTube upload
 * In production, backend will upload to YouTube via OAuth and return the URL
 *
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { videoFile: File, uploadedBy: userId }
 * @returns {Promise} Updated order item with video data (including simulated YouTube URL)
 */
export const uploadOrderItemVideo = async (orderItemId, data) => {
  const formData = new FormData()
  formData.append("videoFile", data.videoFile)
  formData.append("uploadedBy", data.uploadedBy)

  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/upload-video`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data
}

/**
 * Upload re-video file for a Sales request
 * Clears the re-video request and stores new video
 *
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { videoFile: File, uploadedBy: userId }
 * @returns {Promise} Updated order item with new video data
 */
export const uploadReVideo = async (orderItemId, data) => {
  const formData = new FormData()
  formData.append("videoFile", data.videoFile)
  formData.append("uploadedBy", data.uploadedBy)

  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/upload-revideo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data
}

// ============================================================================
// SEND TO SALES
// ============================================================================

/**
 * Send order to Sales for client approval
 * Called when ALL order items in an order have videos uploaded
 * Moves order status to READY_FOR_CLIENT_APPROVAL
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { sentBy: userId }
 * @returns {Promise} Updated order ready for Sales
 */
export const sendOrderToSales = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/send-to-sales`, data)
  return response.data
}

// ============================================================================
// ORDER ITEM DETAILS (for QA review)
// ============================================================================

/**
 * Get Order Item details for QA review
 * Returns all sections with their current statuses, round history, etc.
 *
 * @param {string} orderItemId - The order item ID
 * @returns {Promise} Complete order item data with section statuses
 */
export const getOrderItemForQA = async (orderItemId) => {
  const response = await httpClient.get(`${BASE_URL}/order-item/${orderItemId}`)
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
  // Queue & Stats
  getQAProductionQueue,
  getSalesRequests,
  getQAStats,

  // Section Actions
  approveSection,
  rejectSection,

  // Video Upload (now file-based)
  uploadOrderItemVideo,
  uploadReVideo,

  // Video File Validation
  validateVideoFile,
  formatFileSize,

  // Send to Sales
  sendOrderToSales,

  // Order Item Details
  getOrderItemForQA,

  // YouTube URL Helpers (for display, not upload)
  isValidYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
}

export default qaApi
