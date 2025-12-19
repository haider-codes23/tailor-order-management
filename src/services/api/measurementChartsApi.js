import { httpClient } from "@/services/http/httpClient"

/**
 * Measurement Charts API Service
 * 
 * This service provides functions for interacting with the measurement charts
 * endpoints. These are pure functions that make HTTP requests and return Promises.
 * 
 * Architecture pattern:
 * Component → React Query Hook → API Service → httpClient → MSW/Backend
 * 
 * Each function here corresponds to one API endpoint and one type of operation.
 * The functions are intentionally simple and focused, doing nothing more than
 * making the HTTP request and returning the response data.
 * 
 * Why this layer exists:
 * 1. Single source of truth for API communication
 * 2. Easy to test independently from React components
 * 3. Clear separation between HTTP concerns and UI concerns
 * 4. Type safety and autocomplete when using these functions
 * 5. Easy to switch from mock to real backend (change httpClient config)
 */

/**
 * Get the current Standard Size Chart
 * 
 * Fetches the active size chart with all size rows and measurements.
 * This chart defines what each standard size (XS, S, M, L, XL) means
 * in terms of actual body measurements.
 * 
 * Used by:
 * - Admin settings page to display and edit size chart
 * - Customer form generation to get measurements for selected size
 * 
 * @returns {Promise<Object>} The complete size chart with rows array
 * 
 * Response structure:
 * {
 *   id: 1,
 *   name: "Standard Body Measurements",
 *   description: "...",
 *   is_active: true,
 *   rows: [
 *     { id: 1, size_code: "XS", shoulder: 13.5, bust: 32, ... },
 *     { id: 2, size_code: "S", shoulder: 14, bust: 34, ... },
 *     ...
 *   ],
 *   created_at: "...",
 *   updated_at: "..."
 * }
 * 
 * Example usage:
 * const sizeChart = await measurementChartsApi.getStandardSizeChart()
 * console.log(sizeChart.rows) // Array of size rows
 */
export const getStandardSizeChart = async () => {
  const response = await httpClient.get("/settings/standard-size-chart")
  return response
}

/**
 * Update the Standard Size Chart
 * 
 * Saves changes to the size chart rows. Used when Admin edits measurements
 * and clicks Save. The backend validates that all measurements are positive
 * numbers and that size codes are unique.
 * 
 * @param {Object} data - The updated chart data
 * @param {Array} data.rows - Array of size row objects with measurements
 * 
 * @returns {Promise<Object>} The updated size chart as saved
 * 
 * Request body structure:
 * {
 *   rows: [
 *     { id: 1, size_code: "XS", shoulder: 13.5, bust: 32, waist: 25, ... },
 *     { id: 2, size_code: "S", shoulder: 14, bust: 34, waist: 27, ... },
 *     ...
 *   ]
 * }
 * 
 * Error responses:
 * - 400: Validation failed (invalid measurements, duplicate sizes, etc.)
 * - 401: Not authenticated
 * - 403: Not authorized (only Admin can update charts)
 * 
 * Example usage:
 * const updatedRows = [
 *   { id: 1, size_code: "XS", shoulder: 13.5, bust: 32, waist: 25, ... },
 *   ...
 * ]
 * const result = await measurementChartsApi.updateStandardSizeChart({ rows: updatedRows })
 */
export const updateStandardSizeChart = async (data) => {
  const response = await httpClient.put("/settings/standard-size-chart", data)
  return response
}

/**
 * Get the current Standard Height Chart
 * 
 * Fetches the active height chart with all height ranges and corresponding
 * garment lengths. This chart maps customer height to appropriate dress lengths.
 * 
 * Used by:
 * - Admin settings page to display and edit height chart
 * - Customer form generation to get lengths for selected height range
 * 
 * @returns {Promise<Object>} The complete height chart with rows array
 * 
 * Response structure:
 * {
 *   id: 1,
 *   name: "Standard Height to Length Mapping",
 *   description: "...",
 *   is_active: true,
 *   rows: [
 *     { id: 1, height_range: "4'10\" - 5'0\"", kaftan_length: 50, ... },
 *     { id: 2, height_range: "5'1\" - 5'2\"", kaftan_length: 52, ... },
 *     ...
 *   ],
 *   created_at: "...",
 *   updated_at: "..."
 * }
 * 
 * Example usage:
 * const heightChart = await measurementChartsApi.getStandardHeightChart()
 * const ranges = heightChart.rows.map(row => row.height_range)
 */
export const getStandardHeightChart = async () => {
  const response = await httpClient.get("/settings/standard-height-chart")
  return response
}

/**
 * Update the Standard Height Chart
 * 
 * Saves changes to the height chart rows. Used when Admin edits length
 * measurements and clicks Save. The backend validates that all lengths
 * are positive numbers and that height ranges are unique.
 * 
 * @param {Object} data - The updated chart data
 * @param {Array} data.rows - Array of height row objects with length measurements
 * 
 * @returns {Promise<Object>} The updated height chart as saved
 * 
 * Request body structure:
 * {
 *   rows: [
 *     { 
 *       id: 1, 
 *       height_range: "4'10\" - 5'0\"", 
 *       kaftan_length: 50,
 *       sleeve_front_length: 22,
 *       sleeve_back_length: 23,
 *       ...
 *     },
 *     ...
 *   ]
 * }
 * 
 * Error responses:
 * - 400: Validation failed (invalid lengths, duplicate ranges, etc.)
 * - 401: Not authenticated
 * - 403: Not authorized (only Admin can update charts)
 * 
 * Example usage:
 * const updatedRows = [
 *   { id: 1, height_range: "4'10\" - 5'0\"", kaftan_length: 50, ... },
 *   ...
 * ]
 * const result = await measurementChartsApi.updateStandardHeightChart({ rows: updatedRows })
 */
export const updateStandardHeightChart = async (data) => {
  const response = await httpClient.put("/settings/standard-height-chart", data)
  return response
}

/**
 * Named export object for convenient importing
 * 
 * Allows you to import like:
 * import { measurementChartsApi } from '@/services/api/measurementChartsApi'
 * 
 * Then use like:
 * measurementChartsApi.getStandardSizeChart()
 * measurementChartsApi.updateStandardSizeChart({ rows })
 */
export const measurementChartsApi = {
  getStandardSizeChart,
  updateStandardSizeChart,
  getStandardHeightChart,
  updateStandardHeightChart,
}