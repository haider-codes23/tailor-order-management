/**
 * Product Piece Types
 * Used for product composition and BOM sections
 */

// Main Garment Types
export const MAIN_GARMENTS = [
  { id: "shirt", label: "Shirt" },
  { id: "pants", label: "Pants / Trouser" },
  { id: "kaftan", label: "Kaftan" },
  { id: "jacket", label: "Jacket" },
  { id: "gown", label: "Gown" },
  { id: "peshwas", label: "Peshwas" },
  { id: "saree", label: "Saree" },
  { id: "peti_coat", label: "Peti Coat" },
  { id: "blouse", label: "Blouse" },
  { id: "sherwani", label: "Sherwani" },
  { id: "kurta", label: "Kurta" },
  { id: "farshi", label: "Farshi" },
  { id: "sharara", label: "Sharara" },
  { id: "gharara", label: "Gharara" },
  { id: "lehnga", label: "Lehnga" },
  { id: "unstitched_suit", label: "Unstitched Suit" },
]

// Add-on Types
export const ADD_ONS = [
  { id: "dupatta", label: "Dupatta" },
  { id: "veil", label: "Veil" },
  { id: "pouch", label: "Pouch" },
  { id: "shawl", label: "Shawl" },
  { id: "hijab", label: "Hijab" },
  { id: "shoes", label: "Shoes" },
  { id: "tassels", label: "Tassels" },
  { id: "laces", label: "Laces" },
  { id: "buttons", label: "Buttons" },
]

// Combined list for lookups
export const ALL_PIECE_TYPES = [...MAIN_GARMENTS, ...ADD_ONS]

/**
 * Get piece label by ID
 */
export const getPieceLabel = (pieceId) => {
  const piece = ALL_PIECE_TYPES.find((p) => p.id === pieceId)
  return piece?.label || pieceId
}

/**
 * Check if piece is a main garment
 */
export const isMainGarment = (pieceId) => {
  return MAIN_GARMENTS.some((g) => g.id === pieceId)
}

/**
 * Check if piece is an add-on
 */
export const isAddOn = (pieceId) => {
  return ADD_ONS.some((a) => a.id === pieceId)
}
