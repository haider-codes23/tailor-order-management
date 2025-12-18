import { http, HttpResponse, delay } from "msw"
import { mockStandardSizeChart, mockStandardHeightChart } from "../data/mockMeasurementCharts"
import { appConfig } from "@/config/appConfig"

/**
 * Measurement Charts Handlers for Mock Service Worker
 *
 * These handlers simulate backend API endpoints for managing the Global
 * Standard Measurement Charts. In a real system, these endpoints would:
 * - Read from and write to a database
 * - Validate that measurement values are numeric and positive
 * - Enforce that only Admin users can update charts
 * - Log changes for audit purposes
 *
 * For our mock, we're simulating those behaviors with in-memory data
 * and realistic response delays.
 *
 * Key patterns you'll see here:
 * 1. Realistic network delays (200-300ms) to simulate real API behavior
 * 2. Proper HTTP status codes (200 for success, 400 for validation errors)
 * 3. Validation logic that mimics what a backend would enforce
 * 4. Mutation of mock data to simulate database persistence
 *
 * These patterns repeat in every MSW handler file we create, so
 * understanding them here helps you understand the entire system.
 */

export const measurementChartsHandlers = [
  /**
   * GET /settings/standard-size-chart
   *
   * Retrieves the current Standard Size Chart with all size rows.
   *
   * Use case: When Admin opens the Size Chart settings page, the UI
   * calls this endpoint to load the current chart data for display
   * and editing.
   *
   * Response structure:
   * {
   *   id: 1,
   *   name: "Standard Body Measurements",
   *   description: "...",
   *   is_active: true,
   *   rows: [ {size_code, shoulder, bust, ...}, ... ],
   *   created_at: "...",
   *   updated_at: "..."
   * }
   */
  http.get(`${appConfig.apiBaseUrl}/settings/standard-size-chart`, async () => {
    // Simulate network delay - real APIs take time to respond
    // This helps us see loading states and ensures our UI handles async properly
    await delay(200)

    // In a real backend, this would be a database query like:
    // SELECT * FROM standard_size_charts WHERE is_active = true
    // For our mock, we just return the in-memory data structure
    return HttpResponse.json(mockStandardSizeChart, { status: 200 })
  }),

  /**
   * PUT /settings/standard-size-chart
   *
   * Updates the Standard Size Chart with new measurement values.
   *
   * Use case: When Admin edits measurements in the UI and clicks Save,
   * the form submits the updated chart data to this endpoint. The handler
   * validates the data and updates the mock chart if valid.
   *
   * Request body structure:
   * {
   *   rows: [
   *     { id: 1, size_code: "XS", shoulder: 13.5, bust: 32, ... },
   *     { id: 2, size_code: "S", shoulder: 14, bust: 34, ... },
   *     ...
   *   ]
   * }
   *
   * Validation rules enforced:
   * - At least one row must be provided (can't have empty chart)
   * - Each row must have a size_code
   * - All measurement fields must be positive numbers
   * - Size codes should be unique (no duplicate sizes)
   *
   * If validation fails, returns 400 Bad Request with error details.
   * If validation passes, updates the mock data and returns the updated chart.
   */
  http.put(`${appConfig.apiBaseUrl}/settings/standard-size-chart`, async ({ request }) => {
    await delay(300)

    // Parse the request body to get the updated chart data
    const body = await request.json()
    const { rows } = body

    // Validation: Ensure we have rows to work with
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Size chart must contain at least one size row",
        },
        { status: 400 }
      )
    }

    // Validation: Check each row has required fields and valid values
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Every row needs a size code
      if (!row.size_code || typeof row.size_code !== "string") {
        return HttpResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: `Row ${i + 1}: size_code is required and must be a string`,
          },
          { status: 400 }
        )
      }

      // Validate that measurement fields are numbers and positive
      const measurementFields = ["shoulder", "bust", "waist", "hip", "armhole"]
      for (const field of measurementFields) {
        const value = row[field]

        if (value === undefined || value === null) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Row ${i + 1} (${row.size_code}): ${field} is required`,
            },
            { status: 400 }
          )
        }

        if (typeof value !== "number" || value <= 0) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Row ${i + 1} (${row.size_code}): ${field} must be a positive number`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validation: Check for duplicate size codes
    const sizeCodes = rows.map((row) => row.size_code.toUpperCase())
    const uniqueSizeCodes = new Set(sizeCodes)
    if (sizeCodes.length !== uniqueSizeCodes.size) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Duplicate size codes found. Each size must be unique.",
        },
        { status: 400 }
      )
    }

    // Validation passed! Update the mock data
    // In a real backend, this would be a database UPDATE query
    // For our mock, we mutate the in-memory object
    mockStandardSizeChart.rows = rows
    mockStandardSizeChart.updated_at = new Date().toISOString()

    // Return the updated chart to confirm the changes
    return HttpResponse.json(mockStandardSizeChart, { status: 200 })
  }),

  /**
   * GET /settings/standard-height-chart
   *
   * Retrieves the current Standard Height Chart with all height range rows.
   *
   * Use case: When Admin opens the Height Chart settings page, the UI
   * calls this endpoint to load current chart data.
   *
   * Response structure:
   * {
   *   id: 1,
   *   name: "Standard Height to Length Mapping",
   *   description: "...",
   *   is_active: true,
   *   rows: [ {height_range, kaftan_length, sleeve_front_length, ...}, ... ],
   *   created_at: "...",
   *   updated_at: "..."
   * }
   */
  http.get(`${appConfig.apiBaseUrl}/settings/standard-height-chart`, async () => {
    await delay(200)

    // Return the height chart data from our mock
    return HttpResponse.json(mockStandardHeightChart, { status: 200 })
  }),

  /**
   * PUT /settings/standard-height-chart
   *
   * Updates the Standard Height Chart with new length values.
   *
   * Use case: When Admin edits height-to-length mappings and clicks Save,
   * the form submits updated data to this endpoint.
   *
   * Request body structure:
   * {
   *   rows: [
   *     { id: 1, height_range: "4'10\" - 5'0\"", kaftan_length: 50, ... },
   *     { id: 2, height_range: "5'1\" - 5'2\"", kaftan_length: 52, ... },
   *     ...
   *   ]
   * }
   *
   * Validation rules enforced:
   * - At least one row must be provided
   * - Each row must have a height_range string
   * - All length measurements must be positive numbers
   * - Height ranges should be unique
   */
  http.put(`${appConfig.apiBaseUrl}/settings/standard-height-chart`, async ({ request }) => {
    await delay(300)

    const body = await request.json()
    const { rows } = body

    // Validation: Ensure we have rows
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Height chart must contain at least one height range row",
        },
        { status: 400 }
      )
    }

    // Validation: Check each row has required fields and valid values
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Every row needs a height range
      if (!row.height_range || typeof row.height_range !== "string") {
        return HttpResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: `Row ${i + 1}: height_range is required and must be a string`,
          },
          { status: 400 }
        )
      }

      // Validate that length fields are numbers and positive
      const lengthFields = ["kaftan_length", "sleeve_front_length", "sleeve_back_length"]
      for (const field of lengthFields) {
        const value = row[field]

        if (value === undefined || value === null) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Row ${i + 1} (${row.height_range}): ${field} is required`,
            },
            { status: 400 }
          )
        }

        if (typeof value !== "number" || value <= 0) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Row ${i + 1} (${row.height_range}): ${field} must be a positive number`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validation: Check for duplicate height ranges
    const heightRanges = rows.map((row) => row.height_range)
    const uniqueHeightRanges = new Set(heightRanges)
    if (heightRanges.length !== uniqueHeightRanges.size) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Duplicate height ranges found. Each range must be unique.",
        },
        { status: 400 }
      )
    }

    // Validation passed! Update the mock data
    mockStandardHeightChart.rows = rows
    mockStandardHeightChart.updated_at = new Date().toISOString()

    // Return the updated chart
    return HttpResponse.json(mockStandardHeightChart, { status: 200 })
  }),
]
