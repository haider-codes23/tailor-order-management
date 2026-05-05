/**
 * Dashboard API Service
 * HTTP functions for admin dashboard endpoints (Phase 17)
 */

import { httpClient } from "@/services/http/httpClient"

/**
 * Get order funnel data — counts per pipeline status
 */
export const getOrderFunnel = async () => {
  const response = await httpClient.get("/dashboard/order-funnel")
  return response.data
}

/**
 * Get production pipeline — order items bucketed by stage
 */
export const getProductionPipeline = async () => {
  const response = await httpClient.get("/dashboard/production-pipeline")
  return response.data
}

/**
 * Get inventory alerts summary
 */
export const getInventoryAlerts = async () => {
  const response = await httpClient.get("/dashboard/inventory-alerts")
  return response.data
}

/**
 * Get QA approval/rejection metrics
 */
export const getQAMetrics = async () => {
  const response = await httpClient.get("/dashboard/qa-metrics")
  return response.data
}

/**
 * Get per-salesperson revenue summary
 */
export const getSalesSummary = async () => {
  const response = await httpClient.get("/dashboard/sales-summary")
  return response.data
}

/**
 * Get recent activity feed across all orders
 */
export const getRecentActivity = async (limit = 20) => {
  const response = await httpClient.get(`/dashboard/recent-activity?limit=${limit}`)
  return response.data
}