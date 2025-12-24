/**
 * Mock Products and BOMs
 *
 * Data Structure:
 * - mockProducts: Product catalog with Shopify integration fields
 * - mockBOMs: Bill of Materials (versioned, one active per product)
 * - mockBOMItems: Individual material requirements per BOM
 *
 * Rules:
 * - Products can have multiple BOMs (design changes over time)
 * - Only one BOM is active (is_active: true)
 * - BOM items can ONLY reference: FABRIC, RAW_MATERIAL, MULTI_HEAD, ADDA_MATERIAL
 * - BOM items CANNOT reference: READY_STOCK, READY_SAMPLE
 */

// ==================== PRODUCTS ====================
export const mockProducts = [
  {
    id: "prod_1",
    name: "GOLDESS",
    sku: "GOLD-001",
    description: "Elegant golden ensemble with intricate embroidery",
    category: "FORMAL",
    active: true,
    // Shopify integration fields (for future use)
    shopify_product_id: "gid://shopify/Product/8234567890",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456789",
    // Images
    images: [
      "https://musferahsaad.net/cdn/shop/files/EmeraldOracle8_1800x1800.webp?v=1759854964",
      "https://musferahsaad.net/cdn/shop/files/EmeraldOracle7_1800x1800.webp?v=1759854964",
    ],
    primary_image: "https://musferahsaad.net/cdn/shop/files/EmeraldOracle5.webp?v=1759854964&width=1080",
    // Pricing (optional, for reference)
    base_price: 45000, // PKR
    // Active BOM reference (computed field)
    active_bom_id: "bom_1",
    // Metadata
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
    active_bom_id: "bom_3",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-12-18T11:20:00Z",
  },
  {
    id: "prod_3",
    name: "EMERALD GRACE",
    ug: "EMER-001",
    description: "Vibrant emerald green outfit with traditional embellishments",
    category: "FORMAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567892",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456791",
    images: ["https://musferahsaad.net/cdn/shop/files/MoonlitBlush4_48f27a34-46ce-4e38-8541-6fc24642e644_1800x1800.webp?v=1758901653"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/MoonlitBlush6_087a435f-95ec-4314-bce8-001aa2a28134.webp?v=1758891284&width=1080",
    base_price: 52000,
    active_bom_id: "bom_5",
    created_at: "2024-03-05T10:30:00Z",
    updated_at: "2024-12-19T16:45:00Z",
  },
  {
    id: "prod_4",
    name: "PEARL ELEGANCE",
    sku: "PEARL-001",
    description: "Sophisticated pearl white ensemble",
    category: "BRIDAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567893",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456792",
    images: ["https://musferahsaad.net/cdn/shop/files/Romance3_3119c0f4-e24f-4149-ad87-ae0668ca5041_1800x1800.webp?v=1746993697"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/Romance1_3cd17918-cec4-43b3-a589-0df365b0e3c0.webp?v=1746993697&width=1080",
    base_price: 95000,
    active_bom_id: "bom_7",
    created_at: "2024-04-12T11:00:00Z",
    updated_at: "2024-12-22T09:15:00Z",
  },
  {
    id: "prod_5",
    name: "CRIMSON DREAMS",
    sku: "CRIM-001",
    description: "Bold crimson outfit with modern cuts",
    category: "CASUAL",
    active: true,
    shopify_product_id: "gid://shopify/Product/8234567894",
    shopify_variant_id: "gid://shopify/ProductVariant/44123456793",
    images: ["https://musferahsaad.net/cdn/shop/files/06AquaPrincess_1800x1800.jpg?v=1746992117"],
    primary_image: "https://musferahsaad.net/cdn/shop/files/01AquaPrincess.jpg?v=1746992117&width=1080",
    base_price: 28000,
    active_bom_id: "bom_9",
    created_at: "2024-05-20T14:20:00Z",
    updated_at: "2024-12-21T13:30:00Z",
  },
]

// ==================== BOMs ====================
export const mockBOMs = [
  // GOLDESS - Active BOM (v2)
  {
    id: "bom_1",
    product_id: "prod_1",
    version: 2,
    is_active: true,
    name: "GOLDESS Standard BOM v2",
    notes: "Updated material quantities after design refinement",
    created_by: "user_admin",
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
  },
  // GOLDESS - Old BOM (v1, inactive)
  {
    id: "bom_2",
    product_id: "prod_1",
    version: 1,
    is_active: false,
    name: "GOLDESS Standard BOM v1",
    notes: "Original design - replaced due to material shortage",
    created_by: "user_admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
  },
  // MAUVE MAGIC - Active BOM
  {
    id: "bom_3",
    product_id: "prod_2",
    version: 1,
    is_active: true,
    name: "MAUVE MAGIC Standard BOM",
    notes: "Standard production BOM",
    created_by: "user_admin",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-02-10T09:00:00Z",
  },
  // MAUVE MAGIC - Old BOM (inactive)
  {
    id: "bom_4",
    product_id: "prod_2",
    version: 0,
    is_active: false,
    name: "MAUVE MAGIC Prototype BOM",
    notes: "Initial prototype - not used in production",
    created_by: "user_admin",
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-10T09:00:00Z",
  },
  // EMERALD GRACE - Active BOM
  {
    id: "bom_5",
    product_id: "prod_3",
    version: 1,
    is_active: true,
    name: "EMERALD GRACE Standard BOM",
    notes: "Heavy embroidery design",
    created_by: "user_admin",
    created_at: "2024-03-05T10:30:00Z",
    updated_at: "2024-03-05T10:30:00Z",
  },
  // EMERALD GRACE - Old BOM (inactive)
  {
    id: "bom_6",
    product_id: "prod_3",
    version: 0,
    is_active: false,
    name: "EMERALD GRACE Light BOM",
    notes: "Lighter version - customer preferred heavier embroidery",
    created_by: "user_admin",
    created_at: "2024-03-01T10:30:00Z",
    updated_at: "2024-03-05T10:30:00Z",
  },
  // PEARL ELEGANCE - Active BOM
  {
    id: "bom_7",
    product_id: "prod_4",
    version: 1,
    is_active: true,
    name: "PEARL ELEGANCE Bridal BOM",
    notes: "Premium bridal collection",
    created_by: "user_admin",
    created_at: "2024-04-12T11:00:00Z",
    updated_at: "2024-04-12T11:00:00Z",
  },
  // PEARL ELEGANCE - Old BOM (inactive)
  {
    id: "bom_8",
    product_id: "prod_4",
    version: 0,
    is_active: false,
    name: "PEARL ELEGANCE Standard BOM",
    notes: "Standard version - upgraded to bridal tier",
    created_by: "user_admin",
    created_at: "2024-04-01T11:00:00Z",
    updated_at: "2024-04-12T11:00:00Z",
  },
  // CRIMSON DREAMS - Active BOM
  {
    id: "bom_9",
    product_id: "prod_5",
    version: 1,
    is_active: true,
    name: "CRIMSON DREAMS Casual BOM",
    notes: "Minimal embroidery, modern cuts",
    created_by: "user_admin",
    created_at: "2024-05-20T14:20:00Z",
    updated_at: "2024-05-20T14:20:00Z",
  },
]

// ==================== BOM ITEMS ====================
export const mockBOMItems = [
  // === GOLDESS BOM v2 (Active) ===
  {
    id: "bom_item_1",
    bom_id: "bom_1",
    inventory_item_id: "inv_1", // Banarasi Silk - Gold (FABRIC)
    quantity_per_unit: 3.5,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Main shirt fabric",
  },
  {
    id: "bom_item_2",
    bom_id: "bom_1",
    inventory_item_id: "inv_2", // Organza - Ivory (FABRIC)
    quantity_per_unit: 2.0,
    unit: "METER",
    garment_piece: "DUPATTA",
    sequence_order: 2,
    notes: "Dupatta base",
  },
  {
    id: "bom_item_3",
    bom_id: "bom_1",
    inventory_item_id: "inv_11", // Zari Thread - Gold (RAW_MATERIAL)
    quantity_per_unit: 250,
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Embroidery on neckline and sleeves",
  },
  {
    id: "bom_item_4",
    bom_id: "bom_1",
    inventory_item_id: "inv_12", // Sequins - Gold (RAW_MATERIAL)
    quantity_per_unit: 500,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 4,
    notes: "Border embellishment",
  },
  {
    id: "bom_item_5",
    bom_id: "bom_1",
    inventory_item_id: "inv_21", // Multi-Head Floral Pattern (MULTI_HEAD)
    quantity_per_unit: 1,
    unit: "DESIGN",
    garment_piece: "DUPATTA",
    sequence_order: 5,
    notes: "Corner motifs on dupatta",
  },

  // === MAUVE MAGIC BOM (Active) ===
  {
    id: "bom_item_6",
    bom_id: "bom_3",
    inventory_item_id: "inv_3", // Chiffon - Mauve (FABRIC)
    quantity_per_unit: 3.0,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Main fabric",
  },
  {
    id: "bom_item_7",
    bom_id: "bom_3",
    inventory_item_id: "inv_4", // Raw Silk - Cream (FABRIC)
    quantity_per_unit: 2.5,
    unit: "METER",
    garment_piece: "PANT",
    sequence_order: 2,
    notes: "Trouser fabric",
  },
  {
    id: "bom_item_8",
    bom_id: "bom_3",
    inventory_item_id: "inv_13", // Pearl Beads - White (RAW_MATERIAL)
    quantity_per_unit: 300,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Neckline detailing",
  },
  {
    id: "bom_item_9",
    bom_id: "bom_3",
    inventory_item_id: "inv_22", // Multi-Head Paisley Design (MULTI_HEAD)
    quantity_per_unit: 1,
    unit: "DESIGN",
    garment_piece: "SHIRT",
    sequence_order: 4,
    notes: "Back panel embroidery",
  },

  // === EMERALD GRACE BOM (Active) ===
  {
    id: "bom_item_10",
    bom_id: "bom_5",
    inventory_item_id: "inv_5", // Velvet - Emerald (FABRIC)
    quantity_per_unit: 4.0,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Heavy velvet for winter collection",
  },
  {
    id: "bom_item_11",
    bom_id: "bom_5",
    inventory_item_id: "inv_2", // Organza - Ivory (FABRIC)
    quantity_per_unit: 2.5,
    unit: "METER",
    garment_piece: "DUPATTA",
    sequence_order: 2,
    notes: "Light dupatta contrast",
  },
  {
    id: "bom_item_12",
    bom_id: "bom_5",
    inventory_item_id: "inv_11", // Zari Thread - Gold (RAW_MATERIAL)
    quantity_per_unit: 400,
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Heavy zari work on front panel",
  },
  {
    id: "bom_item_13",
    bom_id: "bom_5",
    inventory_item_id: "inv_14", // Crystal Stones - Clear (RAW_MATERIAL)
    quantity_per_unit: 200,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 4,
    notes: "Stone embellishment",
  },
  {
    id: "bom_item_14",
    bom_id: "bom_5",
    inventory_item_id: "inv_51", // Adda Work - Emerald (ADDA_MATERIAL)
    quantity_per_unit: 1,
    unit: "SET",
    garment_piece: "SHIRT",
    sequence_order: 5,
    notes: "Traditional adda work on sleeves",
  },

  // === PEARL ELEGANCE BOM (Active) ===
  {
    id: "bom_item_15",
    bom_id: "bom_7",
    inventory_item_id: "inv_6", // Pure Silk - Pearl White (FABRIC)
    quantity_per_unit: 5.0,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Premium bridal silk",
  },
  {
    id: "bom_item_16",
    bom_id: "bom_7",
    inventory_item_id: "inv_2", // Organza - Ivory (FABRIC)
    quantity_per_unit: 3.0,
    unit: "METER",
    garment_piece: "DUPATTA",
    sequence_order: 2,
    notes: "Bridal dupatta",
  },
  {
    id: "bom_item_17",
    bom_id: "bom_7",
    inventory_item_id: "inv_11", // Zari Thread - Gold (RAW_MATERIAL)
    quantity_per_unit: 500,
    unit: "GRAM",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Extensive zari embroidery",
  },
  {
    id: "bom_item_18",
    bom_id: "bom_7",
    inventory_item_id: "inv_13", // Pearl Beads - White (RAW_MATERIAL)
    quantity_per_unit: 1000,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 4,
    notes: "Heavy pearl work all over",
  },
  {
    id: "bom_item_19",
    bom_id: "bom_7",
    inventory_item_id: "inv_14", // Crystal Stones - Clear (RAW_MATERIAL)
    quantity_per_unit: 500,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 5,
    notes: "Premium crystal embellishment",
  },
  {
    id: "bom_item_20",
    bom_id: "bom_7",
    inventory_item_id: "inv_21", // Multi-Head Floral Pattern (MULTI_HEAD)
    quantity_per_unit: 2,
    unit: "DESIGN",
    garment_piece: "DUPATTA",
    sequence_order: 6,
    notes: "Bridal motifs on dupatta",
  },

  // === CRIMSON DREAMS BOM (Active) ===
  {
    id: "bom_item_21",
    bom_id: "bom_9",
    inventory_item_id: "inv_7", // Cotton Lawn - Crimson (FABRIC)
    quantity_per_unit: 3.0,
    unit: "METER",
    garment_piece: "SHIRT",
    sequence_order: 1,
    notes: "Lightweight summer fabric",
  },
  {
    id: "bom_item_22",
    bom_id: "bom_9",
    inventory_item_id: "inv_4", // Raw Silk - Cream (FABRIC)
    quantity_per_unit: 2.0,
    unit: "METER",
    garment_piece: "PANT",
    sequence_order: 2,
    notes: "Contrast trouser",
  },
  {
    id: "bom_item_23",
    bom_id: "bom_9",
    inventory_item_id: "inv_12", // Sequins - Gold (RAW_MATERIAL)
    quantity_per_unit: 100,
    unit: "PIECE",
    garment_piece: "SHIRT",
    sequence_order: 3,
    notes: "Minimal border sequins",
  },
]

/**
 * Helper function to get active BOM for a product
 */
export function getActiveBOM(productId) {
  return mockBOMs.find((bom) => bom.product_id === productId && bom.is_active)
}

/**
 * Helper function to get BOM items for a specific BOM
 */
export function getBOMItems(bomId) {
  return mockBOMItems.filter((item) => item.bom_id === bomId)
}

/**
 * Helper function to get all BOMs for a product (including inactive ones)
 */
export function getProductBOMs(productId) {
  return mockBOMs
    .filter((bom) => bom.product_id === productId)
    .sort((a, b) => b.version - a.version) // Latest version first
}
