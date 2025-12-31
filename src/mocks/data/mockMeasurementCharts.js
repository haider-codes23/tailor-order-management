/**
 * Mock Measurement Charts Data
 *
 * These charts define the standard measurements used for Standard size orders.
 * When a customer selects a standard size, these measurements determine what
 * gets shown on their order form and what production uses as a reference.
 *
 * The Size Chart defines body measurements (shoulder, bust, waist, hip, armhole)
 * for each standard size (XS, S, M, L, XL, XXL).
 *
 * The Height Chart defines garment lengths (kaftan, sleeve front, sleeve back)
 * based on customer height ranges.
 *
 * These charts are editable by Admin users and are foundational for the
 * Customer Forms workflow that will be built in Phase 10.
 */

/**
 * Standard Size Chart
 *
 * Defines body measurements for each standard size.
 * All measurements are in inches.
 *
 * Business context: When a customer orders size "M", the system knows
 * this means shoulder=15, bust=38, waist=30, hip=40, armhole=8.5
 */
export const mockStandardSizeChart = {
  id: 1,
  name: "Standard Body Measurements",
  description: "Default size chart used for all standard-sized orders",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",

  // The actual measurement rows
  rows: [
    {
      id: 1,
      size_code: "XS",
      shoulder: 13.5,
      bust: 32,
      waist: 25,
      hip: 35,
      armhole: 7.5,
      uk_size: 6,
      us_size: 2,
      sequence: 1,
    },
    {
      id: 2,
      size_code: "S",
      shoulder: 14,
      bust: 34,
      waist: 27,
      hip: 37,
      armhole: 8,
      uk_size: 8,
      us_size: 4,
      sequence: 2,
    },
    {
      id: 3,
      size_code: "M",
      shoulder: 15,
      bust: 38,
      waist: 30,
      hip: 40,
      armhole: 8.5,
      uk_size: 12,
      us_size: 8,
      sequence: 3,
    },
    {
      id: 4,
      size_code: "L",
      shoulder: 16,
      bust: 42,
      waist: 34,
      hip: 44,
      armhole: 9,
      uk_size: 14,
      us_size: 10,
      sequence: 4,
    },
    {
      id: 5,
      size_code: "XL",
      shoulder: 17,
      bust: 46,
      waist: 38,
      hip: 48,
      armhole: 9.5,
      uk_size: 16,
      us_size: 12,
      sequence: 5,
    },
    {
      id: 6,
      size_code: "XXL",
      shoulder: 18,
      bust: 50,
      waist: 42,
      hip: 52,
      armhole: 10,
      uk_size: 18,
      us_size: 14,
      sequence: 6,
    },
  ],
}

/**
 * Standard Height Chart
 *
 * Defines garment lengths based on customer height ranges.
 * All measurements are in inches.
 *
 * Business context: A customer who is 5'3"-5'5" needs different dress lengths
 * than someone who is 5'6"-5'8", even if they wear the same size.
 *
 * These lengths apply to specific garment types:
 * - kaftan_length: Full length for kaftan-style dresses
 * - sleeve_front_length: Front sleeve measurement
 * - sleeve_back_length: Back sleeve measurement
 */
export const mockStandardHeightChart = {
  id: 1,
  name: "Standard Height to Length Mapping",
  description: "Maps height ranges to appropriate garment lengths",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",

  // The actual height-to-length mapping rows
  rows: [
  {
    id: 1,
    height_range: "4ft0in-4ft2in",
    height_min_inches: 48,
    height_max_inches: 50,
    kaftan_length: 46,
    sleeve_front_length: 20,
    sleeve_back_length: 21,
    sequence: 1,
  },
  {
    id: 2,
    height_range: "4ft3in-4ft5in",
    height_min_inches: 51,
    height_max_inches: 53,
    kaftan_length: 48,
    sleeve_front_length: 21,
    sleeve_back_length: 22,
    sequence: 2,
  },
  {
    id: 3,
    height_range: "4ft6in-4ft8in",
    height_min_inches: 54,
    height_max_inches: 56,
    kaftan_length: 49,
    sleeve_front_length: 21.5,
    sleeve_back_length: 22.5,
    sequence: 3,
  },
  {
    id: 4,
    height_range: "4ft9in-4ft11in",
    height_min_inches: 57,
    height_max_inches: 59,
    kaftan_length: 50,
    sleeve_front_length: 22,
    sleeve_back_length: 23,
    sequence: 4,
  },
  {
    id: 5,
    height_range: "5ft0in-5ft2in",
    height_min_inches: 60,
    height_max_inches: 62,
    kaftan_length: 52,
    sleeve_front_length: 23,
    sleeve_back_length: 24,
    sequence: 5,
  },
  {
    id: 6,
    height_range: "5ft3in-5ft5in",
    height_min_inches: 63,
    height_max_inches: 65,
    kaftan_length: 54,
    sleeve_front_length: 24,
    sleeve_back_length: 25,
    sequence: 6,
  },
  {
    id: 7,
    height_range: "5ft6in-5ft8in",
    height_min_inches: 66,
    height_max_inches: 68,
    kaftan_length: 56,
    sleeve_front_length: 25,
    sleeve_back_length: 26,
    sequence: 7,
  },
  {
    id: 8,
    height_range: "5ft9in-5ft11in",
    height_min_inches: 69,
    height_max_inches: 71,
    kaftan_length: 58,
    sleeve_front_length: 26,
    sleeve_back_length: 27,
    sequence: 8,
  },
  {
    id: 9,
    height_range: "6ft0in-6ft2in",
    height_min_inches: 72,
    height_max_inches: 74,
    kaftan_length: 60,
    sleeve_front_length: 27,
    sleeve_back_length: 28,
    sequence: 9,
  },
  {
    id: 10,
    height_range: "6ft3in-6ft5in",
    height_min_inches: 75,
    height_max_inches: 77,
    kaftan_length: 62,
    sleeve_front_length: 28,
    sleeve_back_length: 29,
    sequence: 10,
  },
  {
    id: 11,
    height_range: "6ft6in-6ft8in",
    height_min_inches: 78,
    height_max_inches: 80,
    kaftan_length: 64,
    sleeve_front_length: 29,
    sleeve_back_length: 30,
    sequence: 11,
  },
  {
    id: 12,
    height_range: "6ft9in-6ft11in",
    height_min_inches: 81,
    height_max_inches: 83,
    kaftan_length: 66,
    sleeve_front_length: 30,
    sleeve_back_length: 31,
    sequence: 12,
  },
  {
    id: 13,
    height_range: "7ft0in+",
    height_min_inches: 84,
    height_max_inches: 96,
    kaftan_length: 68,
    sleeve_front_length: 31,
    sleeve_back_length: 32,
    sequence: 13,
  },
],
}

/**
 * Helper Functions for Working with Measurement Charts
 *
 * These functions will be used extensively in Phase 10 when building
 * the customer forms workflow. They extract specific data from the charts
 * based on customer selections.
 */

/**
 * Get measurements for a specific size
 *
 * Used when generating a Standard form - shows only the selected size's measurements
 * instead of the entire chart.
 *
 * @param {string} sizeCode - Size code like "M" or "L"
 * @returns {object|null} - Measurements for that size, or null if not found
 */
export function getMeasurementsForSize(sizeCode) {
  const row = mockStandardSizeChart.rows.find(
    (row) => row.size_code.toUpperCase() === sizeCode.toUpperCase()
  )
  return row || null
}

/**
 * Get garment lengths for a specific height range
 *
 * Used when generating a Standard form - shows only the selected height's lengths
 * instead of the entire chart.
 *
 * @param {string} heightRange - Height range like "5'3\" - 5'5\""
 * @returns {object|null} - Lengths for that range, or null if not found
 */
export function getLengthsForHeight(heightRange) {
  const row = mockStandardHeightChart.rows.find((row) => row.height_range === heightRange)
  return row || null
}

/**
 * Get all available size codes
 *
 * Used in UI dropdowns for size selection
 *
 * @returns {string[]} - Array of size codes like ["XS", "S", "M", "L", "XL", "XXL"]
 */
export function getAvailableSizes() {
  return mockStandardSizeChart.rows.map((row) => row.size_code)
}

/**
 * Get all available height ranges
 *
 * Used in UI dropdowns for height selection
 *
 * @returns {string[]} - Array of height ranges
 */
export function getAvailableHeightRanges() {
  return mockStandardHeightChart.rows.map((row) => row.height_range)
}

/**
 * Validate that a size exists in the chart
 *
 * Used for form validation
 */
export function isValidSize(sizeCode) {
  return mockStandardSizeChart.rows.some(
    (row) => row.size_code.toUpperCase() === sizeCode.toUpperCase()
  )
}

/**
 * Validate that a height range exists in the chart
 *
 * Used for form validation
 */
export function isValidHeightRange(heightRange) {
  return mockStandardHeightChart.rows.some((row) => row.height_range === heightRange)
}
