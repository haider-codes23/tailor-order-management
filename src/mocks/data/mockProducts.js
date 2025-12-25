/**
 * Mock Products and BOMs - WITH SIZE SUPPORT
 *
 * Data Structure:
 * - mockProducts: Product catalog with Shopify integration fields
 * - mockBOMs: Bill of Materials (versioned, SIZE-SPECIFIC)
 * - mockBOMItems: Individual material requirements per BOM
 *
 * NEW RULES (Phase 7B):
 * - Each BOM has a SIZE field: XS, S, M, L, XL, XXL, CUSTOM
 * - Products can have multiple ACTIVE BOMs (one per size)
 * - BOM names auto-include size: "Size M - Version 1"
 * - Each size has independent version history
 */

// ==================== SIZE CONSTANTS ====================
export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
export const ALL_SIZES = [...STANDARD_SIZES, "CUSTOM"]

// ==================== PRODUCTS ====================
export const mockProducts = [
  {
    id: "prod_1",
    name: "GOLDESS",
    sku: "GOLD-001",
    description: "Elegant golden ensemble with intricate embroidery",
    category: "FORMAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567890",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456789",
    images: [
      "https://musferahsaad.net/cdn/shop/files/EmeraldOracle8_1800x1800.webp?v=1759854964",
      "https://musferahsaad.net/cdn/shop/files/EmeraldOracle7_1800x1800.webp?v=1759854964",
    ],
    primary_image: "https://musferahsaad.net/cdn/shop/files/EmeraldOracle5.webp?v=1759854964&width=1080",
    base_price: 45000,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-12-20T14:30:00Z",
  },
  {
    id: "prod_2",
    name: "MAUVE MAGIC",
    sku: "MAUVE-001",
    description: "Stunning mauve dress with delicate detailing",
    category: "SEMI_FORMAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567891",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456790",
    images: ["https://musferahsaad.net/cdn/shop/files/SunsetOmbre5_1800x1800.webp?v=1760088371"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/SunsetOmbre2.webp?v=1760088371&width=1080",
    base_price: 38000,
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-12-18T11:20:00Z",
  },
  {
    id: "prod_3",
    name: "EMERALD GRACE",
    sku: "EMER-001",
    description: "Vibrant emerald green outfit with traditional embellishments",
    category: "CASUAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567892",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456791",
    images: ["https://musferahsaad.net/cdn/shop/files/MysticEmerald4_1800x1800.webp?v=1759854950"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/MysticEmerald1.webp?v=1759854949&width=1080",
    base_price: 32000,
    created_at: "2024-03-05T08:30:00Z",
    updated_at: "2024-12-19T16:45:00Z",
  },
]

// ==================== BOMs (SIZE-BASED) ====================
export const mockBOMs = [
  // === GOLDESS - Size M BOMs ===
  {
    id: "bom_1",
    product_id: "prod_1",
    size: "M", // ← NEW: Size-specific BOM
    version: 2,
    name: "Size M - Version 2", // ← NEW: Auto-generated name format
    is_active: true,
    notes: "Updated fabric quantities for medium size",
    created_at: "2024-12-20T10:00:00Z",
    updated_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "bom_2",
    product_id: "prod_1",
    size: "M",
    version: 1,
    name: "Size M - Version 1",
    is_active: false,
    notes: "Initial BOM for medium size",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-12-20T09:30:00Z",
  },

  // === GOLDESS - Size L BOMs ===
  {
    id: "bom_3",
    product_id: "prod_1",
    size: "L",
    version: 1,
    name: "Size L - Version 1",
    is_active: true,
    notes: "Larger fabric quantities for L size",
    created_at: "2024-12-18T14:00:00Z",
    updated_at: "2024-12-18T14:00:00Z",
  },

  // === GOLDESS - Size XL BOMs ===
  {
    id: "bom_4",
    product_id: "prod_1",
    size: "XL",
    version: 1,
    name: "Size XL - Version 1",
    is_active: true,
    notes: "Extra large size - increased material requirements",
    created_at: "2024-12-19T11:00:00Z",
    updated_at: "2024-12-19T11:00:00Z",
  },

  // === MAUVE MAGIC - Size S BOMs ===
  {
    id: "bom_5",
    product_id: "prod_2",
    size: "S",
    version: 1,
    name: "Size S - Version 1",
    is_active: true,
    notes: "Small size BOM",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-02-10T09:00:00Z",
  },

  // === MAUVE MAGIC - Size M BOMs ===
  {
    id: "bom_6",
    product_id: "prod_2",
    size: "M",
    version: 2,
    name: "Size M - Version 2",
    is_active: true,
    notes: "Updated embroidery pattern",
    created_at: "2024-12-18T11:20:00Z",
    updated_at: "2024-12-18T11:20:00Z",
  },
  {
    id: "bom_7",
    product_id: "prod_2",
    size: "M",
    version: 1,
    name: "Size M - Version 1",
    is_active: false,
    notes: "Original design",
    created_at: "2024-02-10T09:30:00Z",
    updated_at: "2024-12-18T11:00:00Z",
  },

  // === EMERALD GRACE - Size M BOMs ===
  {
    id: "bom_8",
    product_id: "prod_3",
    size: "M",
    version: 1,
    name: "Size M - Version 1",
    is_active: true,
    notes: "Casual design - lightweight fabric",
    created_at: "2024-03-05T08:30:00Z",
    updated_at: "2024-03-05T08:30:00Z",
  },

  // === EMERALD GRACE - Size L BOMs ===
  {
    id: "bom_9",
    product_id: "prod_3",
    size: "L",
    version: 1,
    name: "Size L - Version 1",
    is_active: true,
    notes: "Large size - adjusted fabric cuts",
    created_at: "2024-03-05T09:00:00Z",
    updated_at: "2024-03-05T09:00:00Z",
  },
]

// ==================== BOM ITEMS ====================
export const mockBOMItems = [
  // === GOLDESS - Size M v2 (bom_1) ===
  {
    id: "bom_item_1",
    bom_id: "bom_1",
    inventory_item_id: "inv_1", // Velvet - Royal Gold
    quantity_per_unit: 2.8,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Main fabric for shirt",
  },
  {
    id: "bom_item_2",
    bom_id: "bom_1",
    inventory_item_id: "inv_2", // Raw Silk - Black
    quantity_per_unit: 2.0,
    unit: "METER",
    garment_piece: "TROUSER",
    sequence_order: 2,
    notes: "Trouser fabric",
  },
  {
    id: "bom_item_3",
    bom_id: "bom_1",
    inventory_item_id: "inv_11", // Zari Thread - Gold
    quantity_per_unit: 350,
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Heavy embroidery",
  },

  // === GOLDESS - Size L v1 (bom_3) ===
  {
    id: "bom_item_4",
    bom_id: "bom_3",
    inventory_item_id: "inv_1", // Velvet - Royal Gold
    quantity_per_unit: 3.2, // More fabric for L size
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Main fabric for shirt - Large size",
  },
  {
    id: "bom_item_5",
    bom_id: "bom_3",
    inventory_item_id: "inv_2", // Raw Silk - Black
    quantity_per_unit: 2.3, // More fabric for L size
    unit: "METER",
    garment_piece: "TROUSER",
    sequence_order: 2,
    notes: "Trouser fabric - Large size",
  },
  {
    id: "bom_item_6",
    bom_id: "bom_3",
    inventory_item_id: "inv_11", // Zari Thread - Gold
    quantity_per_unit: 400, // More embroidery for L size
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Heavy embroidery - Large size",
  },

  // === GOLDESS - Size XL v1 (bom_4) ===
  {
    id: "bom_item_7",
    bom_id: "bom_4",
    inventory_item_id: "inv_1", // Velvet - Royal Gold
    quantity_per_unit: 3.6, // Even more for XL
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Main fabric for shirt - Extra Large size",
  },
  {
    id: "bom_item_8",
    bom_id: "bom_4",
    inventory_item_id: "inv_2", // Raw Silk - Black
    quantity_per_unit: 2.6, // More fabric for XL
    unit: "METER",
    garment_piece: "TROUSER",
    sequence_order: 2,
    notes: "Trouser fabric - Extra Large size",
  },
  {
    id: "bom_item_9",
    bom_id: "bom_4",
    inventory_item_id: "inv_11", // Zari Thread - Gold
    quantity_per_unit: 450, // More embroidery for XL
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Heavy embroidery - Extra Large size",
  },

  // === MAUVE MAGIC - Size S v1 (bom_5) ===
  {
    id: "bom_item_10",
    bom_id: "bom_5",
    inventory_item_id: "inv_5", // Chiffon - Mauve
    quantity_per_unit: 2.3, // Less fabric for S size
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Delicate chiffon for small size",
  },
  {
    id: "bom_item_11",
    bom_id: "bom_5",
    inventory_item_id: "inv_12", // Sequins - Gold
    quantity_per_unit: 200,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 2,
    notes: "Light embellishment",
  },

  // === MAUVE MAGIC - Size M v2 (bom_6) ===
  {
    id: "bom_item_12",
    bom_id: "bom_6",
    inventory_item_id: "inv_5", // Chiffon - Mauve
    quantity_per_unit: 2.6,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Delicate chiffon for medium size",
  },
  {
    id: "bom_item_13",
    bom_id: "bom_6",
    inventory_item_id: "inv_12", // Sequins - Gold
    quantity_per_unit: 250,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 2,
    notes: "Enhanced embellishment - v2",
  },

  // === EMERALD GRACE - Size M v1 (bom_8) ===
  {
    id: "bom_item_14",
    bom_id: "bom_8",
    inventory_item_id: "inv_6", // Lawn - Emerald Green
    quantity_per_unit: 2.4,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Lightweight casual fabric",
  },
  {
    id: "bom_item_15",
    bom_id: "bom_8",
    inventory_item_id: "inv_10", // Buttons - White Pearl
    quantity_per_unit: 8,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 2,
    notes: "Simple button closure",
  },

  // === EMERALD GRACE - Size L v1 (bom_9) ===
  {
    id: "bom_item_16",
    bom_id: "bom_9",
    inventory_item_id: "inv_6", // Lawn - Emerald Green
    quantity_per_unit: 2.8, // More for L size
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Lightweight casual fabric - Large size",
  },
  {
    id: "bom_item_17",
    bom_id: "bom_9",
    inventory_item_id: "inv_10", // Buttons - White Pearl
    quantity_per_unit: 8, // Same button count
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 2,
    notes: "Simple button closure",
  },
]

// ==================== HELPER FUNCTIONS (UPDATED) ====================

/**
 * Get active BOM for a product and specific size
 * @param {string} productId - Product ID
 * @param {string} size - Size code (XS, S, M, L, XL, XXL, CUSTOM)
 * @returns {Object|undefined} Active BOM for that product+size combination
 */
export function getActiveBOM(productId, size) {
  return mockBOMs.find((bom) => bom.product_id === productId && bom.size === size && bom.is_active)
}

/**
 * Get all active BOMs for a product (across all sizes)
 * @param {string} productId - Product ID
 * @returns {Array} All active BOMs for the product
 */
export function getAllActiveBOMs(productId) {
  return mockBOMs.filter((bom) => bom.product_id === productId && bom.is_active)
}

/**
 * Get BOM items for a specific BOM
 * @param {string} bomId - BOM ID
 * @returns {Array} BOM items
 */
export function getBOMItems(bomId) {
  return mockBOMItems.filter((item) => item.bom_id === bomId)
}

/**
 * Get all BOMs for a product, optionally filtered by size
 * @param {string} productId - Product ID
 * @param {string} [size] - Optional size filter
 * @returns {Array} BOMs sorted by version (latest first)
 */
export function getProductBOMs(productId, size = null) {
  let boms = mockBOMs.filter((bom) => bom.product_id === productId)

  // Filter by size if provided
  if (size) {
    boms = boms.filter((bom) => bom.size === size)
  }

  // Sort by version within each size group
  return boms.sort((a, b) => {
    // First sort by size
    if (a.size !== b.size) {
      return a.size.localeCompare(b.size)
    }
    // Then by version (latest first)
    return b.version - a.version
  })
}

/**
 * Get available sizes for a product (sizes that have at least one BOM)
 * @param {string} productId - Product ID
 * @returns {Array} Array of size codes that have BOMs
 */
export function getAvailableSizes(productId) {
  const productBOMs = mockBOMs.filter((bom) => bom.product_id === productId)
  const sizes = [...new Set(productBOMs.map((bom) => bom.size))]
  return sizes.sort() // Sort alphabetically
}

/**
 * Generate next version number for a product+size combination
 * @param {string} productId - Product ID
 * @param {string} size - Size code
 * @returns {number} Next version number
 */
export function getNextVersionNumber(productId, size) {
  const existingBOMs = mockBOMs.filter((bom) => bom.product_id === productId && bom.size === size)
  if (existingBOMs.length === 0) return 1
  return Math.max(...existingBOMs.map((bom) => bom.version)) + 1
}