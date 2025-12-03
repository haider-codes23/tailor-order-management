import { ORDER_STATUSES } from "./constants"

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined) return "-"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - 'short' | 'long' | 'time'
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = "short") {
  if (!date) return "-"

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (format === "short") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj)
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  if (format === "time") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  return dateObj.toLocaleDateString()
}

/**
 * Format order status to human-readable label
 * @param {string} status - Order status constant
 * @returns {string} Human-readable status label
 */
export function formatOrderStatus(status) {
  const statusLabels = {
    [ORDER_STATUSES.RECEIVED]: "Received",
    [ORDER_STATUSES.INVENTORY_CHECK]: "Checking Inventory",
    [ORDER_STATUSES.AWAITING_MATERIAL]: "Awaiting Materials",
    [ORDER_STATUSES.READY_FOR_PRODUCTION]: "Ready for Production",
    [ORDER_STATUSES.IN_PRODUCTION]: "In Production",
    [ORDER_STATUSES.PRODUCTION_COMPLETED]: "Production Complete",
    [ORDER_STATUSES.AWAITING_CLIENT_APPROVAL]: "Awaiting Client Approval",
    [ORDER_STATUSES.REWORK_REQUIRED]: "Rework Required",
    [ORDER_STATUSES.CLIENT_APPROVED]: "Client Approved",
    [ORDER_STATUSES.DISPATCHED]: "Dispatched",
    [ORDER_STATUSES.COMPLETED]: "Completed",
    [ORDER_STATUSES.CANCELLED]: "Cancelled",
  }

  return statusLabels[status] || status
}

/**
 * Get Tailwind color classes for order status badges
 * @param {string} status - Order status constant
 * @returns {string} Tailwind CSS classes
 */
export function getOrderStatusColor(status) {
  const statusColors = {
    [ORDER_STATUSES.RECEIVED]: "bg-blue-100 text-blue-800",
    [ORDER_STATUSES.INVENTORY_CHECK]: "bg-yellow-100 text-yellow-800",
    [ORDER_STATUSES.AWAITING_MATERIAL]: "bg-orange-100 text-orange-800",
    [ORDER_STATUSES.READY_FOR_PRODUCTION]: "bg-green-100 text-green-800",
    [ORDER_STATUSES.IN_PRODUCTION]: "bg-indigo-100 text-indigo-800",
    [ORDER_STATUSES.PRODUCTION_COMPLETED]: "bg-purple-100 text-purple-800",
    [ORDER_STATUSES.AWAITING_CLIENT_APPROVAL]: "bg-pink-100 text-pink-800",
    [ORDER_STATUSES.REWORK_REQUIRED]: "bg-red-100 text-red-800",
    [ORDER_STATUSES.CLIENT_APPROVED]: "bg-emerald-100 text-emerald-800",
    [ORDER_STATUSES.DISPATCHED]: "bg-teal-100 text-teal-800",
    [ORDER_STATUSES.COMPLETED]: "bg-gray-100 text-gray-800",
    [ORDER_STATUSES.CANCELLED]: "bg-gray-100 text-gray-800",
  }

  return statusColors[status] || "bg-gray-100 text-gray-800"
}

/**
 * Calculate time difference from now
 * @param {string|Date} date - Past date
 * @returns {string} Human-readable time difference
 */
export function timeAgo(date) {
  if (!date) return "-"

  const dateObj = typeof date === "string" ? new Date(date) : date
  const seconds = Math.floor((new Date() - dateObj) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? "s" : ""} ago`
    }
  }

  return "just now"
}
