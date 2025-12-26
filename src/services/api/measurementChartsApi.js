/**
 * Measurement Charts API Service
 *
 * This module provides functions to interact with the Measurement Charts API.
 * Updated to use /admin/measurements paths for better organization.
 *
 * These functions are used by React Query hooks in useMeasurementCharts.js
 */

import httpClient from "../httpClient"

/**
 * Get the Standard Size Chart
 *
 * Retrieves the current size chart with measurements for all standard sizes
 * (XS, S, M, L, XL, XXL)
 *
 * @returns {Promise} Response containing the size chart data
 */
export async function getStandardSizeChart() {
  return httpClient.get("/admin/measurements/standard-size-chart")
}

/**
 * Update the Standard Size Chart
 *
 * Saves changes to size chart measurements. This is called when an admin
 * edits measurements in the Size Chart settings and clicks Save.
 *
 * @param {Array} rows - Array of size chart rows with updated measurements
 * @returns {Promise} Response containing the updated size chart
 */
export async function updateStandardSizeChart(rows) {
  return httpClient.put("/admin/measurements/standard-size-chart", { rows })
}

/**
 * Get the Standard Height Chart
 *
 * Retrieves the current height chart that maps customer height ranges
 * to garment lengths (kaftan, sleeves, etc.)
 *
 * @returns {Promise} Response containing the height chart data
 */
export async function getStandardHeightChart() {
  return httpClient.get("/admin/measurements/standard-height-chart")
}

/**
 * Update the Standard Height Chart
 *
 * Saves changes to height chart measurements. This is called when an admin
 * edits length values in the Height Chart settings and clicks Save.
 *
 * @param {Array} rows - Array of height chart rows with updated lengths
 * @returns {Promise} Response containing the updated height chart
 */
export async function updateStandardHeightChart(rows) {
  return httpClient.put("/admin/measurements/standard-height-chart", { rows })
}
export const measurementChartsApi = {
  getStandardSizeChart,
  updateStandardSizeChart,
  getStandardHeightChart,
  updateStandardHeightChart,
}