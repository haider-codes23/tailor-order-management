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
import { appConfig } from "@/config/appConfig"

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
// XHR-BASED UPLOAD HELPER (supports real upload progress)
// ============================================================================

/**
 * Upload a file via XMLHttpRequest.
 *
 * We use raw XHR instead of the fetch-based httpClient because the fetch API
 * does not support upload progress events at all. XHR's upload.onprogress is
 * the only browser-native way to get real-time "% uploaded" updates.
 *
 * This helper preserves the same auth + error handling as httpClient:
 *  - Sends Bearer token from localStorage
 *  - Sends cookies (credentials: include)
 *  - Throws an Error with .status / .body on non-2xx responses
 *  - Returns parsed JSON on success
 *
 * @param {string} endpoint - e.g. "/qa/order-item/abc/upload-video"
 * @param {FormData} formData - The request body
 * @param {(percent: number) => void} [onProgress] - Progress callback (0-100)
 * @returns {Promise<any>} Parsed JSON response
 */
function xhrUpload(endpoint, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `${appConfig.apiBaseUrl}${endpoint}`
    const token = localStorage.getItem("authToken")

    const xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    xhr.withCredentials = true // send cookies (mirrors fetch credentials:"include")

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }
    // NOTE: do NOT set Content-Type for FormData — the browser sets it
    // automatically with the correct multipart boundary.

    // Real upload progress events
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total)
          onProgress(percent)
        }
      }
    }

    xhr.onload = () => {
      // Parse response body (JSON if possible, else raw text)
      let body = null
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        body = xhr.responseText
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body)
      } else {
        const message =
          (body && (body.message || body.error)) || `HTTP Error ${xhr.status}`
        const error = new Error(message)
        error.status = xhr.status
        error.statusText = xhr.statusText
        error.body = body
        // Shape the error like axios so hook onError handlers still work:
        // error.response?.data?.error
        error.response = { data: body, status: xhr.status }
        reject(error)
      }
    }

    xhr.onerror = () => {
      const error = new Error("Network error during upload")
      error.status = 0
      reject(error)
    }

    xhr.onabort = () => {
      const error = new Error("Upload cancelled")
      error.status = 0
      reject(error)
    }

    xhr.send(formData)
  })
}

// ============================================================================
// VIDEO UPLOAD (Order Item Level) — XHR-based for real progress events
// ============================================================================

/**
 * Upload video file for an Order Item
 * Called after ALL sections of an order item are QA_APPROVED
 * Uses XHR directly so the upload progress bar can animate in real time.
 *
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { videoFile: File, uploadedBy: userId, onProgress?: (percent) => void }
 * @returns {Promise} Updated order item with video data (including YouTube URL)
 */
export const uploadOrderItemVideo = async (orderItemId, data) => {
  const formData = new FormData()
  formData.append("videoFile", data.videoFile)
  formData.append("uploadedBy", data.uploadedBy)

  const body = await xhrUpload(
    `${BASE_URL}/order-item/${orderItemId}/upload-video`,
    formData,
    data.onProgress
  )

  // Match the shape previously returned by httpClient.post(...).data
  // httpClient returned `response.data` which was already the parsed JSON,
  // so callers expect the parsed body here directly.
  return body
}

/**
 * Upload re-video file for a Sales request
 * Clears the re-video request and stores new video.
 * Uses XHR directly so the upload progress bar can animate in real time.
 *
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { videoFile: File, uploadedBy: userId, onProgress?: (percent) => void }
 * @returns {Promise} Updated order item with new video data
 */
export const uploadReVideo = async (orderItemId, data) => {
  const formData = new FormData()
  formData.append("videoFile", data.videoFile)
  formData.append("uploadedBy", data.uploadedBy)

  const body = await xhrUpload(
    `${BASE_URL}/order-item/${orderItemId}/upload-revideo`,
    formData,
    data.onProgress
  )

  return body
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

  // Video Upload (XHR-based with progress)
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