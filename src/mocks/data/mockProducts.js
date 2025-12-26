/**
 * Mock Products and BOMs - COMPLETE VERSION
 *
 * Data Structure:
 * - 5 Products with full details
 * - BOMs for ALL sizes (XS, S, M, L, XL, XXL, CUSTOM) for each product
 * - BOM items for every BOM
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
    primary_image: "https://musferahsaad.net/cdn/shop/files/White1.webp?v=1746992812&width=1080",
    base_price: 32000,
    created_at: "2024-03-05T08:30:00Z",
    updated_at: "2024-12-19T16:45:00Z",
  },
  {
    id: "prod_4",
    name: "RUBY ELEGANCE",
    sku: "RUBY-001",
    description: "Deep ruby red formal wear with crystal embellishments",
    category: "FORMAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567893",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456792",
    images: ["https://musferahsaad.net/cdn/shop/files/CrimsonQueen3_1800x1800.webp?v=1759854932"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/Romance1.webp?v=1746992837&width=1080",
    base_price: 52000,
    created_at: "2024-04-12T11:00:00Z",
    updated_at: "2024-12-21T10:15:00Z",
  },
  {
    id: "prod_5",
    name: "AZURE DREAM",
    sku: "AZUR-001",
    description: "Light blue summer collection with floral embroidery",
    category: "CASUAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567894",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456793",
    images: ["https://musferahsaad.net/cdn/shop/files/SkylineMuse2_1800x1800.webp?v=1759854970"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/Symphony1.webp?v=1746992802&width=1080",
    base_price: 28000,
    created_at: "2024-05-20T09:30:00Z",
    updated_at: "2024-12-22T14:20:00Z",
  },
]

// ==================== BOMs (ALL SIZES FOR ALL PRODUCTS) ====================
export const mockBOMs = [
  // === GOLDESS (prod_1) - ALL SIZES ===
  { id: "bom_1", product_id: "prod_1", size: "XS", version: 1, name: "Size XS - Version 1", is_active: true, notes: "Extra Small size", created_at: "2024-01-15T10:00:00Z", updated_at: "2024-01-15T10:00:00Z" },
  { id: "bom_2", product_id: "prod_1", size: "S", version: 1, name: "Size S - Version 1", is_active: true, notes: "Small size", created_at: "2024-01-15T10:05:00Z", updated_at: "2024-01-15T10:05:00Z" },
  { id: "bom_3", product_id: "prod_1", size: "M", version: 1, name: "Size M - Version 1", is_active: true, notes: "Medium size", created_at: "2024-01-15T10:10:00Z", updated_at: "2024-01-15T10:10:00Z" },
  { id: "bom_4", product_id: "prod_1", size: "L", version: 1, name: "Size L - Version 1", is_active: true, notes: "Large size", created_at: "2024-01-15T10:15:00Z", updated_at: "2024-01-15T10:15:00Z" },
  { id: "bom_5", product_id: "prod_1", size: "XL", version: 1, name: "Size XL - Version 1", is_active: true, notes: "Extra Large size", created_at: "2024-01-15T10:20:00Z", updated_at: "2024-01-15T10:20:00Z" },
  { id: "bom_6", product_id: "prod_1", size: "XXL", version: 1, name: "Size XXL - Version 1", is_active: true, notes: "Double Extra Large size", created_at: "2024-01-15T10:25:00Z", updated_at: "2024-01-15T10:25:00Z" },
  { id: "bom_7", product_id: "prod_1", size: "CUSTOM", version: 1, name: "Size CUSTOM - Version 1", is_active: true, notes: "Custom measurements", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z" },

  // === MAUVE MAGIC (prod_2) - ALL SIZES ===
  { id: "bom_8", product_id: "prod_2", size: "XS", version: 1, name: "Size XS - Version 1", is_active: true, notes: "Extra Small size", created_at: "2024-02-10T09:00:00Z", updated_at: "2024-02-10T09:00:00Z" },
  { id: "bom_9", product_id: "prod_2", size: "S", version: 1, name: "Size S - Version 1", is_active: true, notes: "Small size", created_at: "2024-02-10T09:05:00Z", updated_at: "2024-02-10T09:05:00Z" },
  { id: "bom_10", product_id: "prod_2", size: "M", version: 1, name: "Size M - Version 1", is_active: true, notes: "Medium size", created_at: "2024-02-10T09:10:00Z", updated_at: "2024-02-10T09:10:00Z" },
  { id: "bom_11", product_id: "prod_2", size: "L", version: 1, name: "Size L - Version 1", is_active: true, notes: "Large size", created_at: "2024-02-10T09:15:00Z", updated_at: "2024-02-10T09:15:00Z" },
  { id: "bom_12", product_id: "prod_2", size: "XL", version: 1, name: "Size XL - Version 1", is_active: true, notes: "Extra Large size", created_at: "2024-02-10T09:20:00Z", updated_at: "2024-02-10T09:20:00Z" },
  { id: "bom_13", product_id: "prod_2", size: "XXL", version: 1, name: "Size XXL - Version 1", is_active: true, notes: "Double Extra Large size", created_at: "2024-02-10T09:25:00Z", updated_at: "2024-02-10T09:25:00Z" },
  { id: "bom_14", product_id: "prod_2", size: "CUSTOM", version: 1, name: "Size CUSTOM - Version 1", is_active: true, notes: "Custom measurements", created_at: "2024-02-10T09:30:00Z", updated_at: "2024-02-10T09:30:00Z" },

  // === EMERALD GRACE (prod_3) - ALL SIZES ===
  { id: "bom_15", product_id: "prod_3", size: "XS", version: 1, name: "Size XS - Version 1", is_active: true, notes: "Extra Small size", created_at: "2024-03-05T08:30:00Z", updated_at: "2024-03-05T08:30:00Z" },
  { id: "bom_16", product_id: "prod_3", size: "S", version: 1, name: "Size S - Version 1", is_active: true, notes: "Small size", created_at: "2024-03-05T08:35:00Z", updated_at: "2024-03-05T08:35:00Z" },
  { id: "bom_17", product_id: "prod_3", size: "M", version: 1, name: "Size M - Version 1", is_active: true, notes: "Medium size", created_at: "2024-03-05T08:40:00Z", updated_at: "2024-03-05T08:40:00Z" },
  { id: "bom_18", product_id: "prod_3", size: "L", version: 1, name: "Size L - Version 1", is_active: true, notes: "Large size", created_at: "2024-03-05T08:45:00Z", updated_at: "2024-03-05T08:45:00Z" },
  { id: "bom_19", product_id: "prod_3", size: "XL", version: 1, name: "Size XL - Version 1", is_active: true, notes: "Extra Large size", created_at: "2024-03-05T08:50:00Z", updated_at: "2024-03-05T08:50:00Z" },
  { id: "bom_20", product_id: "prod_3", size: "XXL", version: 1, name: "Size XXL - Version 1", is_active: true, notes: "Double Extra Large size", created_at: "2024-03-05T08:55:00Z", updated_at: "2024-03-05T08:55:00Z" },
  { id: "bom_21", product_id: "prod_3", size: "CUSTOM", version: 1, name: "Size CUSTOM - Version 1", is_active: true, notes: "Custom measurements", created_at: "2024-03-05T09:00:00Z", updated_at: "2024-03-05T09:00:00Z" },

  // === RUBY ELEGANCE (prod_4) - ALL SIZES ===
  { id: "bom_22", product_id: "prod_4", size: "XS", version: 1, name: "Size XS - Version 1", is_active: true, notes: "Extra Small size", created_at: "2024-04-12T11:00:00Z", updated_at: "2024-04-12T11:00:00Z" },
  { id: "bom_23", product_id: "prod_4", size: "S", version: 1, name: "Size S - Version 1", is_active: true, notes: "Small size", created_at: "2024-04-12T11:05:00Z", updated_at: "2024-04-12T11:05:00Z" },
  { id: "bom_24", product_id: "prod_4", size: "M", version: 1, name: "Size M - Version 1", is_active: true, notes: "Medium size", created_at: "2024-04-12T11:10:00Z", updated_at: "2024-04-12T11:10:00Z" },
  { id: "bom_25", product_id: "prod_4", size: "L", version: 1, name: "Size L - Version 1", is_active: true, notes: "Large size", created_at: "2024-04-12T11:15:00Z", updated_at: "2024-04-12T11:15:00Z" },
  { id: "bom_26", product_id: "prod_4", size: "XL", version: 1, name: "Size XL - Version 1", is_active: true, notes: "Extra Large size", created_at: "2024-04-12T11:20:00Z", updated_at: "2024-04-12T11:20:00Z" },
  { id: "bom_27", product_id: "prod_4", size: "XXL", version: 1, name: "Size XXL - Version 1", is_active: true, notes: "Double Extra Large size", created_at: "2024-04-12T11:25:00Z", updated_at: "2024-04-12T11:25:00Z" },
  { id: "bom_28", product_id: "prod_4", size: "CUSTOM", version: 1, name: "Size CUSTOM - Version 1", is_active: true, notes: "Custom measurements", created_at: "2024-04-12T11:30:00Z", updated_at: "2024-04-12T11:30:00Z" },

  // === AZURE DREAM (prod_5) - ALL SIZES ===
  { id: "bom_29", product_id: "prod_5", size: "XS", version: 1, name: "Size XS - Version 1", is_active: true, notes: "Extra Small size", created_at: "2024-05-20T09:30:00Z", updated_at: "2024-05-20T09:30:00Z" },
  { id: "bom_30", product_id: "prod_5", size: "S", version: 1, name: "Size S - Version 1", is_active: true, notes: "Small size", created_at: "2024-05-20T09:35:00Z", updated_at: "2024-05-20T09:35:00Z" },
  { id: "bom_31", product_id: "prod_5", size: "M", version: 1, name: "Size M - Version 1", is_active: true, notes: "Medium size", created_at: "2024-05-20T09:40:00Z", updated_at: "2024-05-20T09:40:00Z" },
  { id: "bom_32", product_id: "prod_5", size: "L", version: 1, name: "Size L - Version 1", is_active: true, notes: "Large size", created_at: "2024-05-20T09:45:00Z", updated_at: "2024-05-20T09:45:00Z" },
  { id: "bom_33", product_id: "prod_5", size: "XL", version: 1, name: "Size XL - Version 1", is_active: true, notes: "Extra Large size", created_at: "2024-05-20T09:50:00Z", updated_at: "2024-05-20T09:50:00Z" },
  { id: "bom_34", product_id: "prod_5", size: "XXL", version: 1, name: "Size XXL - Version 1", is_active: true, notes: "Double Extra Large size", created_at: "2024-05-20T09:55:00Z", updated_at: "2024-05-20T09:55:00Z" },
  { id: "bom_35", product_id: "prod_5", size: "CUSTOM", version: 1, name: "Size CUSTOM - Version 1", is_active: true, notes: "Custom measurements", created_at: "2024-05-20T10:00:00Z", updated_at: "2024-05-20T10:00:00Z" },
]

// ==================== BOM ITEMS ====================
// Pattern: Each size needs scaled material quantities
// Formula: Base quantity + (size_factor * increment)
// Size factors: XS=-2, S=-1, M=0, L=+1, XL=+2, XXL=+3, CUSTOM=0

const generateBOMItems = () => {
  const items = []
  let itemId = 1

  // Size scaling factors
  const sizeScales = {
    XS: -0.3,
    S: -0.15,
    M: 0,
    L: 0.15,
    XL: 0.3,
    XXL: 0.45,
    CUSTOM: 0,
  }

  // === GOLDESS (prod_1) BOMs - Formal wear with heavy embroidery ===
  ALL_SIZES.forEach((size, idx) => {
    const bomId = `bom_${idx + 1}`
    const scale = sizeScales[size]
    
    // Velvet fabric for shirt
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_1", // Velvet - Royal Gold
      quantity_per_unit: parseFloat((2.8 + scale * 0.5).toFixed(2)),
      unit: "METER",
      garment_piece: "SHIRT",
      sequence_order: 1,
      notes: `Main shirt fabric - Size ${size}`,
    })

    // Raw silk for trouser
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_2", // Raw Silk - Black
      quantity_per_unit: parseFloat((2.0 + scale * 0.4).toFixed(2)),
      unit: "METER",
      garment_piece: "TROUSER",
      sequence_order: 2,
      notes: `Trouser fabric - Size ${size}`,
    })

    // Zari thread for embroidery
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_11", // Zari Thread - Gold
      quantity_per_unit: Math.round(350 + scale * 80),
      unit: "GRAM",
      garment_piece: "SHIRT",
      sequence_order: 3,
      notes: `Heavy embroidery - Size ${size}`,
    })
  })

  // === MAUVE MAGIC (prod_2) BOMs - Semi-formal with sequins ===
  ALL_SIZES.forEach((size, idx) => {
    const bomId = `bom_${idx + 8}`
    const scale = sizeScales[size]
    
    // Chiffon fabric
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_5", // Chiffon - Mauve
      quantity_per_unit: parseFloat((2.6 + scale * 0.4).toFixed(2)),
      unit: "METER",
      garment_piece: "SHIRT",
      sequence_order: 1,
      notes: `Delicate chiffon - Size ${size}`,
    })

    // Sequins
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_12", // Sequins - Gold
      quantity_per_unit: Math.round(250 + scale * 50),
      unit: "PIECE",
      garment_piece: "SHIRT",
      sequence_order: 2,
      notes: `Sequin embellishment - Size ${size}`,
    })
  })

  // === EMERALD GRACE (prod_3) BOMs - Casual with buttons ===
  ALL_SIZES.forEach((size, idx) => {
    const bomId = `bom_${idx + 15}`
    const scale = sizeScales[size]
    
    // Lawn fabric
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_6", // Lawn - Emerald Green
      quantity_per_unit: parseFloat((2.4 + scale * 0.4).toFixed(2)),
      unit: "METER",
      garment_piece: "SHIRT",
      sequence_order: 1,
      notes: `Lightweight lawn - Size ${size}`,
    })

    // Buttons
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_10", // Buttons - White Pearl
      quantity_per_unit: 8,
      unit: "PIECE",
      garment_piece: "SHIRT",
      sequence_order: 2,
      notes: `Button closure - Size ${size}`,
    })
  })

  // === RUBY ELEGANCE (prod_4) BOMs - Premium formal with crystals ===
  ALL_SIZES.forEach((size, idx) => {
    const bomId = `bom_${idx + 22}`
    const scale = sizeScales[size]
    
    // Silk velvet
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_3", // Silk - Ruby Red
      quantity_per_unit: parseFloat((3.0 + scale * 0.5).toFixed(2)),
      unit: "METER",
      garment_piece: "SHIRT",
      sequence_order: 1,
      notes: `Luxurious silk - Size ${size}`,
    })

    // Crystal embellishments
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_12", // Sequins - Gold (using as crystal placeholder)
      quantity_per_unit: Math.round(400 + scale * 80),
      unit: "PIECE",
      garment_piece: "SHIRT",
      sequence_order: 2,
      notes: `Crystal work - Size ${size}`,
    })

    // Zari thread
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_11", // Zari Thread - Gold
      quantity_per_unit: Math.round(300 + scale * 70),
      unit: "GRAM",
      garment_piece: "SHIRT",
      sequence_order: 3,
      notes: `Premium embroidery - Size ${size}`,
    })
  })

  // === AZURE DREAM (prod_5) BOMs - Casual summer with floral ===
  ALL_SIZES.forEach((size, idx) => {
    const bomId = `bom_${idx + 29}`
    const scale = sizeScales[size]
    
    // Cotton lawn
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_6", // Lawn - Emerald Green (reusing as blue placeholder)
      quantity_per_unit: parseFloat((2.2 + scale * 0.3).toFixed(2)),
      unit: "METER",
      garment_piece: "SHIRT",
      sequence_order: 1,
      notes: `Summer cotton - Size ${size}`,
    })

    // Embroidery thread
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_11", // Zari Thread - Gold
      quantity_per_unit: Math.round(150 + scale * 30),
      unit: "GRAM",
      garment_piece: "SHIRT",
      sequence_order: 2,
      notes: `Floral embroidery - Size ${size}`,
    })

    // Buttons
    items.push({
      id: `bom_item_${itemId++}`,
      bom_id: bomId,
      inventory_item_id: "inv_10", // Buttons - White Pearl
      quantity_per_unit: 6,
      unit: "PIECE",
      garment_piece: "SHIRT",
      sequence_order: 3,
      notes: `Button closure - Size ${size}`,
    })
  })

  return items
}

export const mockBOMItems = generateBOMItems()

// ==================== HELPER FUNCTIONS ====================

/**
 * Get active BOM for a product and specific size
 */
export function getActiveBOM(productId, size) {
  return mockBOMs.find((bom) => bom.product_id === productId && bom.size === size && bom.is_active)
}

/**
 * Get all active BOMs for a product (across all sizes)
 */
export function getAllActiveBOMs(productId) {
  return mockBOMs.filter((bom) => bom.product_id === productId && bom.is_active)
}

/**
 * Get BOM items for a specific BOM
 */
export function getBOMItems(bomId) {
  return mockBOMItems.filter((item) => item.bom_id === bomId)
}

/**
 * Get all BOMs for a product, optionally filtered by size
 */
export function getProductBOMs(productId, size = null) {
  let boms = mockBOMs.filter((bom) => bom.product_id === productId)

  if (size) {
    boms = boms.filter((bom) => bom.size === size)
  }

  return boms.sort((a, b) => {
    if (a.size !== b.size) {
      return a.size.localeCompare(b.size)
    }
    return b.version - a.version
  })
}

/**
 * Get available sizes for a product
 */
export function getAvailableSizes(productId) {
  const productBOMs = mockBOMs.filter((bom) => bom.product_id === productId)
  const sizes = [...new Set(productBOMs.map((bom) => bom.size))]
  return sizes.sort()
}

/**
 * Generate next version number for a product+size combination
 */
export function getNextVersionNumber(productId, size) {
  const existingBOMs = mockBOMs.filter((bom) => bom.product_id === productId && bom.size === size)
  if (existingBOMs.length === 0) return 1
  return Math.max(...existingBOMs.map((bom) => bom.version)) + 1
}