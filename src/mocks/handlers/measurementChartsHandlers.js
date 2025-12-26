import { http, HttpResponse, delay } from "msw"
import { mockStandardSizeChart, mockStandardHeightChart } from "../data/mockMeasurementCharts"
import { appConfig } from "@/config/appConfig"

/**
 * Measurement Charts Handlers for Mock Service Worker
 *
 * These handlers simulate backend API endpoints for managing the Global
 * Standard Measurement Charts. Updated to use /admin/measurements paths.
 */

export const measurementChartsHandlers = [
  /**
   * GET /admin/measurements/standard-size-chart
   *
   * Retrieves the current Standard Size Chart with all size rows.
   */
  http.get(`${appConfig.apiBaseUrl}/admin/measurements/standard-size-chart`, async () => {
    await delay(200)
    return HttpResponse.json(mockStandardSizeChart, { status: 200 })
  }),

  /**
   * PUT /admin/measurements/standard-size-chart
   *
   * Updates the Standard Size Chart with new measurement values.
   */
  http.put(`${appConfig.apiBaseUrl}/admin/measurements/standard-size-chart`, async ({ request }) => {
    await delay(300)

    const body = await request.json()
    const { rows } = body

    // Validation
    if (!rows || !Array.isArray(rows)) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid data format. Expected an array of size rows.",
        },
        { status: 400 }
      )
    }

    // Validate each row has required fields
    const requiredFields = ["size_code", "shoulder", "bust", "waist", "hip", "armhole"]
    for (const row of rows) {
      for (const field of requiredFields) {
        if (row[field] === undefined || row[field] === null) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Missing required field: ${field} in size ${row.size_code}`,
            },
            { status: 400 }
          )
        }

        // Check that numeric fields are actually numbers
        if (field !== "size_code" && typeof row[field] !== "number") {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Field ${field} must be a number in size ${row.size_code}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validation passed! Update the mock data
    mockStandardSizeChart.rows = rows
    mockStandardSizeChart.updated_at = new Date().toISOString()

    return HttpResponse.json(mockStandardSizeChart, { status: 200 })
  }),

  /**
   * GET /admin/measurements/standard-height-chart
   *
   * Retrieves the current Standard Height Chart with all height range rows.
   */
  http.get(`${appConfig.apiBaseUrl}/admin/measurements/standard-height-chart`, async () => {
    await delay(200)
    return HttpResponse.json(mockStandardHeightChart, { status: 200 })
  }),

  /**
   * PUT /admin/measurements/standard-height-chart
   *
   * Updates the Standard Height Chart with new length values.
   */
  http.put(`${appConfig.apiBaseUrl}/admin/measurements/standard-height-chart`, async ({ request }) => {
    await delay(300)

    const body = await request.json()
    const { rows } = body

    // Validation
    if (!rows || !Array.isArray(rows)) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid data format. Expected an array of height rows.",
        },
        { status: 400 }
      )
    }

    // Validate each row has required fields
    const requiredFields = [
      "height_range",
      "kaftan_length",
      "sleeve_front_length",
      "sleeve_back_length",
    ]
    for (const row of rows) {
      for (const field of requiredFields) {
        if (row[field] === undefined || row[field] === null) {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Missing required field: ${field} in height range ${row.height_range}`,
            },
            { status: 400 }
          )
        }

        // Check that numeric fields are actually numbers
        if (field !== "height_range" && typeof row[field] !== "number") {
          return HttpResponse.json(
            {
              error: "VALIDATION_ERROR",
              message: `Field ${field} must be a number in height range ${row.height_range}`,
            },
            { status: 400 }
          )
        }
      }
    }

    // Validation passed! Update the mock data
    mockStandardHeightChart.rows = rows
    mockStandardHeightChart.updated_at = new Date().toISOString()

    return HttpResponse.json(mockStandardHeightChart, { status: 200 })
  }),
]