/**
 * Measurement Categories for Custom Order Forms
 * Each category has groups of measurements specific to that garment type
 * All measurements are in inches
 */

export const MEASUREMENT_CATEGORIES = {
  SHIRT_TROUSER: {
    id: "shirt_trouser",
    name: "Short / Long Shirt + Trouser",
    groups: [
      {
        name: "Upper Body",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "round_upper_chest", label: "Round upper chest measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_empire_line", label: "Round empire line measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
          { id: "round_neck", label: "Round neck measurement" },
        ],
      },
      {
        name: "Sleeves & Lower Body",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "sleeve_length", label: "Sleeve length measurement" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
          { id: "tapered_pant_length", label: "Tapered pant length (trouser waist till ankle)" },
          { id: "round_trouser_waist_ankle", label: "Round trouser waist till ankle" },
          { id: "round_trouser_waist", label: "Round trouser waist measurement" },
          { id: "round_upper_thigh", label: "Round upper thigh measurement" },
          { id: "round_lower_thigh", label: "Round lower thigh measurement" },
          { id: "round_knee", label: "Round knee measurement" },
          { id: "round_calf", label: "Round calf measurement" },
          { id: "round_ankle", label: "Round ankle measurement" },
        ],
      },
    ],
  },

  KAFTAN: {
    id: "kaftan",
    name: "Kaftan",
    groups: [
      {
        name: "Upper Body / Blouse / Shirt Measurements",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "shoulder_till_floor", label: "Shoulder till floor measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
          { id: "round_neck", label: "Round neck measurement" },
        ],
      },
      {
        name: "Neckline & Sleeve Measurements",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "saree_blouse_length", label: "Saree blouse length" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
        ],
      },
    ],
  },

  SAREE: {
    id: "saree",
    name: "Saree",
    groups: [
      {
        name: "Upper Body / Blouse / Shirt Measurements",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "shoulder_till_apex", label: "Shoulder till apex (nipple) point – dart length" },
          {
            id: "shoulder_till_empire",
            label: "Shoulder till empire line measurement (just below bust)",
          },
          { id: "shoulder_till_waist", label: "Shoulder till waist measurement" },
          { id: "round_upper_chest", label: "Round upper chest measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_empire_line", label: "Round empire line measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
        ],
      },
      {
        name: "Neckline & Sleeve Measurements",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "saree_blouse_length", label: "Saree blouse length" },
          { id: "sleeve_length", label: "Sleeve length measurement" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
          { id: "saree_length", label: "Saree length" },
          { id: "petticoat_length", label: "Petticoat length" },
          { id: "petticoat_waist", label: "Petticoat waist" },
          { id: "saree_waist", label: "Saree waist" },
        ],
      },
    ],
  },

  GOWN_LEHNGA: {
    id: "gown_lehnga",
    name: "Gown / Lehnga",
    groups: [
      {
        name: "Upper Body / Blouse / Shirt Measurements",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "shoulder_till_apex", label: "Shoulder till apex (nipple) point – dart length" },
          {
            id: "shoulder_till_empire",
            label: "Shoulder till empire line measurement (just below bust)",
          },
          { id: "shoulder_till_waist", label: "Shoulder till waist measurement" },
          { id: "shoulder_till_floor", label: "Shoulder till floor measurement" },
          { id: "round_upper_chest", label: "Round upper chest measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_empire_line", label: "Round empire line measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
          { id: "round_neck", label: "Round neck measurement" },
        ],
      },
      {
        name: "Neckline & Sleeve Measurements",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "sleeve_length", label: "Sleeve length measurement" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
          { id: "lower_length", label: "Lower length" },
          { id: "lower_waist", label: "Lower waist" },
        ],
      },
    ],
  },

  LEHNGA_CHOLI: {
    id: "lehnga_choli",
    name: "Lehnga Choli",
    groups: [
      {
        name: "Upper Body / Blouse / Shirt Measurements",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "shoulder_till_apex", label: "Shoulder till apex (nipple) point – dart length" },
          {
            id: "shoulder_till_empire",
            label: "Shoulder till empire line measurement (just below bust)",
          },
          { id: "shoulder_till_waist", label: "Shoulder till waist measurement" },
          { id: "round_upper_chest", label: "Round upper chest measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_empire_line", label: "Round empire line measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
          { id: "blouse_length", label: "Blouse length measurement" },
          { id: "round_neck", label: "Round neck measurement" },
        ],
      },
      {
        name: "Neckline & Sleeve Measurements",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "sleeve_length", label: "Sleeve length measurement" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
        ],
      },
      {
        name: "Lehenga & Full-Length Measurements",
        measurements: [
          { id: "lehenga_front_length", label: "Lehenga front length" },
          { id: "lehenga_waist", label: "Lehenga waist" },
        ],
      },
    ],
  },

  SHIRT_SHARARA: {
    id: "shirt_sharara",
    name: "Shirt + (Sharara / Gharara / Dhaka / Farshi / Lehnga)",
    groups: [
      {
        name: "Upper Body / Blouse / Shirt Measurements",
        measurements: [
          { id: "shoulder", label: "Shoulder measurement" },
          { id: "front_carriage", label: "Front carriage measurement" },
          { id: "back_carriage", label: "Back carriage measurement" },
          { id: "shoulder_till_apex", label: "Shoulder till apex (nipple) point – dart length" },
          {
            id: "shoulder_till_empire",
            label: "Shoulder till empire line measurement (just below bust)",
          },
          { id: "shoulder_till_waist", label: "Shoulder till waist measurement" },
          { id: "shoulder_till_knee", label: "Shoulder till knee measurement" },
          { id: "shoulder_till_floor", label: "Shoulder till floor measurement" },
          { id: "round_upper_chest", label: "Round upper chest measurement" },
          { id: "round_chest", label: "Round chest measurement" },
          { id: "round_empire_line", label: "Round empire line measurement" },
          { id: "round_waist", label: "Round waist measurement" },
          { id: "round_small_hip", label: "Round small hip (navel) measurement" },
          { id: "round_hip", label: "Round hip measurement" },
          { id: "round_neck", label: "Round neck measurement" },
        ],
      },
      {
        name: "Neckline & Sleeve Measurements",
        measurements: [
          { id: "front_neckline_low", label: "Front neckline low" },
          { id: "back_neckline_low", label: "Back neckline low" },
          { id: "neckline_broad", label: "Neckline broad" },
          { id: "sleeve_length", label: "Sleeve length measurement" },
          { id: "round_armhole", label: "Round armhole measurement" },
          { id: "round_bicep", label: "Round bicep measurement" },
          { id: "round_elbow", label: "Round elbow measurement" },
          { id: "round_wrist", label: "Round wrist measurement" },
        ],
      },
      {
        name: "Trouser / Pant / Lehenga Measurements",
        measurements: [
          { id: "round_trouser_waist_ankle", label: "Round trouser waist till ankle" },
          { id: "sharara_length", label: "Sharara / Gharara / Dhaka / Farshi / Lehnga length" },
          { id: "waist", label: "Waist" },
        ],
      },
    ],
  },
}

// Helper to get all category options for dropdowns
export const MEASUREMENT_CATEGORY_OPTIONS = Object.values(MEASUREMENT_CATEGORIES).map((cat) => ({
  value: cat.id,
  label: cat.name,
}))

// Helper to get category by ID
export const getMeasurementCategoryById = (categoryId) => {
  return Object.values(MEASUREMENT_CATEGORIES).find((cat) => cat.id === categoryId)
}

// Helper to get all measurement IDs for a category
export const getMeasurementIdsForCategory = (categoryId) => {
  const category = getMeasurementCategoryById(categoryId)
  if (!category) return []

  return category.groups.flatMap((group) => group.measurements.map((m) => m.id))
}
