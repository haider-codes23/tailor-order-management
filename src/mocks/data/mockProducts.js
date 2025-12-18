/**
 * Mock Products and BOMs Data
 *
 * This represents your product catalog with Bill of Materials for each product.
 * The structure reflects the real complexity of tailoring products where a single
 * article (like a bridal dress or traditional outfit) may have multiple garment
 * pieces (shirt, pant, dupatta) and require dozens of materials including fabrics,
 * multi-head embroidered pieces, raw materials, and ADA-materials for embellishments.
 *
 * Key Concepts:
 * - Product = The sellable item (what customers order)
 * - BOM = Bill of Materials (the recipe for production)
 * - BOM Items = Individual materials needed with quantities
 * - Each BOM item references an inventory item by ID
 * - BOMs only include production materials: FABRIC, RAW_MATERIAL, MULTI_HEAD, ADA_MATERIAL
 * - READY_SAMPLE and READY_STOCK are excluded because they're completed dresses
 */

/**
 * Products Catalog
 *
 * These are the designs available in your catalog.
 * Each product will have one active BOM that defines materials needed.
 */
export const mockProducts = [
  {
    id: 1,
    name: "Ivory Muse Bridal Collection",
    sku: "IVORY-MUSE-001",
    description:
      "Elegant bridal ensemble featuring embroidered shirt, pant, and dupatta with intricate multi-head work and premium silk fabrics",
    shopify_product_id: null, // Not synced to Shopify yet
    shopify_variant_id: null,
    is_active: true,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-10T09:00:00Z",
  },
  {
    id: 2,
    name: "Mauve Magic Designer Dress",
    sku: "MAUVE-MAGIC-002",
    description:
      "Contemporary designer dress with tissue silk, multi-head organza, and exquisite raw material embellishments",
    shopify_product_id: "gid://shopify/Product/7234567890",
    shopify_variant_id: "gid://shopify/ProductVariant/9234567891",
    is_active: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 3,
    name: "Aqua Princess Peshwas",
    sku: "AQUA-PRINCESS-003",
    description:
      "Traditional peshwas style with tissue fabric, multi-head work, and extensive ADA-material embellishments including motis, sitaras, and dholki",
    shopify_product_id: null,
    shopify_variant_id: null,
    is_active: true,
    created_at: "2024-02-01T11:00:00Z",
    updated_at: "2024-02-01T11:00:00Z",
  },
  {
    id: 4,
    name: "Goldess Luxury Ensemble",
    sku: "GOLDESS-004",
    description:
      "Luxurious outfit with cotton silk, champagne karti work, and premium quality kulfi, behti, and bajra moti embellishments",
    shopify_product_id: "gid://shopify/Product/7234567892",
    shopify_variant_id: "gid://shopify/ProductVariant/9234567893",
    is_active: true,
    created_at: "2024-02-10T14:00:00Z",
    updated_at: "2024-02-10T14:00:00Z",
  },
  {
    id: 5,
    name: "Princess Solara Kaftan",
    sku: "PRINCESS-SOLARA-005",
    description:
      "Elegant kaftan design with tissue silk, kimkhab fabric, and golden sitara embellishments with kerki and bjara moti work",
    shopify_product_id: null,
    shopify_variant_id: null,
    is_active: true,
    created_at: "2024-02-20T15:30:00Z",
    updated_at: "2024-02-20T15:30:00Z",
  },
]

/**
 * BOMs (Bill of Materials)
 *
 * Each product has an active BOM that defines what materials are needed.
 * In a real system, products might have multiple BOM versions over time
 * as designs are refined, but only one is active at any time.
 */
export const mockBOMs = [
  {
    id: 101,
    product_id: 1, // Ivory Muse
    bom_name: "Ivory Muse - Original Design V1",
    is_active: true,
    created_at: "2024-01-10T09:30:00Z",
    updated_at: "2024-01-10T09:30:00Z",
  },
  {
    id: 102,
    product_id: 2, // Mauve Magic
    bom_name: "Mauve Magic - Standard Version",
    is_active: true,
    created_at: "2024-01-15T11:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
  },
  {
    id: 103,
    product_id: 3, // Aqua Princess
    bom_name: "Aqua Princess Peshwas - Detailed",
    is_active: true,
    created_at: "2024-02-01T11:30:00Z",
    updated_at: "2024-02-01T11:30:00Z",
  },
  {
    id: 104,
    product_id: 4, // Goldess
    bom_name: "Goldess - Premium Version",
    is_active: true,
    created_at: "2024-02-10T14:30:00Z",
    updated_at: "2024-02-10T14:30:00Z",
  },
  {
    id: 105,
    product_id: 5, // Princess Solara
    bom_name: "Princess Solara Kaftan - Standard",
    is_active: true,
    created_at: "2024-02-20T16:00:00Z",
    updated_at: "2024-02-20T16:00:00Z",
  },
]

/**
 * BOM Items
 *
 * These are the individual material requirements for each BOM.
 * Each item references an inventory_item_id (we'll create those in Phase 6)
 * and specifies quantity and unit.
 *
 * Note: In reality, you'd have 20-30+ items per BOM based on your images.
 * For mock data, I'm creating realistic but manageable sets.
 * You can expand these later to match your full complexity.
 */
export const mockBOMItems = [
  // Ivory Muse BOM Items (BOM ID 101)
  // SHIRT components
  {
    id: 1001,
    bom_id: 101,
    inventory_item_id: 1, // Raw silk butti fabric
    quantity_per_unit: 3.5,
    unit: "Yard",
    notes: "For shirt - premium quality",
    sequence_order: 1,
    garment_piece: "SHIRT",
  },
  {
    id: 1002,
    bom_id: 101,
    inventory_item_id: 2, // NECKLINE multi-head
    quantity_per_unit: 1,
    unit: "QTY",
    notes: "Pre-embroidered neckline",
    sequence_order: 2,
    garment_piece: "SHIRT",
  },
  {
    id: 1003,
    bom_id: 101,
    inventory_item_id: 3, // SLEEVE multi-head
    quantity_per_unit: 2,
    unit: "QTY",
    notes: "One for each sleeve",
    sequence_order: 3,
    garment_piece: "SHIRT",
  },
  {
    id: 1004,
    bom_id: 101,
    inventory_item_id: 4, // Cotton silk fabric
    quantity_per_unit: 3.5,
    unit: "Yard",
    notes: "Inner lining",
    sequence_order: 4,
    garment_piece: "SHIRT",
  },
  {
    id: 1005,
    bom_id: 101,
    inventory_item_id: 5, // Net fabric
    quantity_per_unit: 1,
    unit: "Yard",
    notes: "Accent details",
    sequence_order: 5,
    garment_piece: "SHIRT",
  },
  {
    id: 1006,
    bom_id: 101,
    inventory_item_id: 10, // Bajra moti ADA-MATERIAL
    quantity_per_unit: 50,
    unit: "GRAMS",
    notes: "Shirt embellishment",
    sequence_order: 6,
    garment_piece: "SHIRT",
  },
  {
    id: 1007,
    bom_id: 101,
    inventory_item_id: 11, // NAGH ADA-MATERIAL
    quantity_per_unit: 30,
    unit: "GRAMS",
    notes: "Border work",
    sequence_order: 7,
    garment_piece: "SHIRT",
  },

  // PANT components
  {
    id: 1008,
    bom_id: 101,
    inventory_item_id: 6, // Chiffon fabric
    quantity_per_unit: 2.5,
    unit: "Yard",
    notes: "For pant",
    sequence_order: 8,
    garment_piece: "PANT",
  },
  {
    id: 1009,
    bom_id: 101,
    inventory_item_id: 7, // P raw silk fabric
    quantity_per_unit: 2.5,
    unit: "Yard",
    notes: "Pant lining",
    sequence_order: 9,
    garment_piece: "PANT",
  },

  // DUPATTA components
  {
    id: 1010,
    bom_id: 101,
    inventory_item_id: 8, // Tensil organza fabric
    quantity_per_unit: 2.75,
    unit: "Yard",
    notes: "For dupatta",
    sequence_order: 10,
    garment_piece: "DUPATTA",
  },
  {
    id: 1011,
    bom_id: 101,
    inventory_item_id: 9, // Border multi-head
    quantity_per_unit: 9,
    unit: "Yard",
    notes: "Dupatta border all sides",
    sequence_order: 11,
    garment_piece: "DUPATTA",
  },

  // Mauve Magic BOM Items (BOM ID 102)
  {
    id: 2001,
    bom_id: 102,
    inventory_item_id: 20, // Tissue Silk fabric
    quantity_per_unit: 3.5,
    unit: "Yard",
    notes: "Main shirt fabric",
    sequence_order: 1,
    garment_piece: "SHIRT",
  },
  {
    id: 2002,
    bom_id: 102,
    inventory_item_id: 21, // M.H organza multi-head
    quantity_per_unit: 1.5,
    unit: "Yard",
    notes: "Decorative panels",
    sequence_order: 2,
    garment_piece: "SHIRT",
  },
  {
    id: 2003,
    bom_id: 102,
    inventory_item_id: 22, // Kimkhaab fabric
    quantity_per_unit: 1,
    unit: "Yard",
    notes: "Accent fabric",
    sequence_order: 3,
    garment_piece: "SHIRT",
  },
  {
    id: 2004,
    bom_id: 102,
    inventory_item_id: 4, // Cotton silk
    quantity_per_unit: 3.5,
    unit: "Yard",
    notes: "Inner layer",
    sequence_order: 4,
    garment_piece: "SHIRT",
  },
  {
    id: 2005,
    bom_id: 102,
    inventory_item_id: 23, // Bajra moti RAW-MATERIAL
    quantity_per_unit: 20,
    unit: "GRAMS",
    notes: "Moti work",
    sequence_order: 5,
    garment_piece: "SHIRT",
  },
  {
    id: 2006,
    bom_id: 102,
    inventory_item_id: 24, // BETKHI CHAMPAGNE RAW-MATERIAL
    quantity_per_unit: 20,
    unit: "GRAMS",
    notes: "Champagne colored betkhi",
    sequence_order: 6,
    garment_piece: "SHIRT",
  },
  {
    id: 2007,
    bom_id: 102,
    inventory_item_id: 25, // KULFI RAW-MATERIAL
    quantity_per_unit: 30,
    unit: "GRAMS",
    notes: "Kulfi embellishment",
    sequence_order: 7,
    garment_piece: "SHIRT",
  },
  {
    id: 2008,
    bom_id: 102,
    inventory_item_id: 26, // DUBKA RAW-MATERIAL
    quantity_per_unit: 10,
    unit: "GRAMS",
    notes: "Dubka work",
    sequence_order: 8,
    garment_piece: "SHIRT",
  },
  {
    id: 2009,
    bom_id: 102,
    inventory_item_id: 27, // PEARL RAW-MATERIAL
    quantity_per_unit: 10,
    unit: "GRAMS",
    notes: "Pearl accents",
    sequence_order: 9,
    garment_piece: "SHIRT",
  },
  {
    id: 2010,
    bom_id: 102,
    inventory_item_id: 28, // P rawsilk fabric
    quantity_per_unit: 3.5,
    unit: "Yard",
    notes: "For pant",
    sequence_order: 10,
    garment_piece: "PANT",
  },
  {
    id: 2011,
    bom_id: 102,
    inventory_item_id: 29, // Emb. organza multi-head
    quantity_per_unit: 3,
    unit: "Yard",
    notes: "Dupatta embroidery",
    sequence_order: 11,
    garment_piece: "DUPATTA",
  },
  {
    id: 2012,
    bom_id: 102,
    inventory_item_id: 30, // Border multi-head
    quantity_per_unit: 9,
    unit: "Yard",
    notes: "Dupatta border",
    sequence_order: 12,
    garment_piece: "DUPATTA",
  },

  // Aqua Princess BOM Items (BOM ID 103) - This one has extensive ADA-MATERIAL items like your image
  {
    id: 3001,
    bom_id: 103,
    inventory_item_id: 31, // TISSUE fabric
    quantity_per_unit: 5,
    unit: "Yard",
    notes: "Main peshwas fabric",
    sequence_order: 1,
    garment_piece: "PESHWAS",
  },
  {
    id: 3002,
    bom_id: 103,
    inventory_item_id: 32, // Front neckline multi-head
    quantity_per_unit: 1,
    unit: "QTY",
    notes: "Pre-embroidered neckline",
    sequence_order: 2,
    garment_piece: "PESHWAS",
  },
  {
    id: 3003,
    bom_id: 103,
    inventory_item_id: 33, // Sleeve multi-head
    quantity_per_unit: 2,
    unit: "QTY",
    notes: "Both sleeves",
    sequence_order: 3,
    garment_piece: "PESHWAS",
  },
  {
    id: 3004,
    bom_id: 103,
    inventory_item_id: 34, // Ghera border multi-head
    quantity_per_unit: 1,
    unit: "QTY",
    notes: "Bottom border",
    sequence_order: 4,
    garment_piece: "PESHWAS",
  },
  // Extensive ADA-MATERIAL items as shown in your Aqua Princess image
  {
    id: 3005,
    bom_id: 103,
    inventory_item_id: 35, // Bajra moti ADA-MATERIAL
    quantity_per_unit: 200,
    unit: "GRAMS",
    notes: "Heavy moti work",
    sequence_order: 5,
    garment_piece: "PESHWAS",
  },
  {
    id: 3006,
    bom_id: 103,
    inventory_item_id: 36, // FROZE ADA-MATERIAL
    quantity_per_unit: 30,
    unit: "GRAMS",
    notes: "Froze embellishment",
    sequence_order: 6,
    garment_piece: "PESHWAS",
  },
  {
    id: 3007,
    bom_id: 103,
    inventory_item_id: 37, // NAGH ADA-MATERIAL
    quantity_per_unit: 10,
    unit: "GRAMS",
    notes: "Nagh work",
    sequence_order: 7,
    garment_piece: "PESHWAS",
  },
  {
    id: 3008,
    bom_id: 103,
    inventory_item_id: 38, // GREEN MOTI 7 NO ADA-MATERIAL
    quantity_per_unit: 35,
    unit: "GRAMS",
    notes: "Green accent motis",
    sequence_order: 8,
    garment_piece: "PESHWAS",
  },
  {
    id: 3009,
    bom_id: 103,
    inventory_item_id: 39, // CORAL MOTRI ADA-MATERIAL
    quantity_per_unit: 76,
    unit: "GRAMS",
    notes: "Coral colored motris",
    sequence_order: 9,
    garment_piece: "PESHWAS",
  },
  {
    id: 3010,
    bom_id: 103,
    inventory_item_id: 40, // WHITE PEARL ADA-MATERIAL
    quantity_per_unit: 37,
    unit: "GRAMS",
    notes: "White pearl work",
    sequence_order: 10,
    garment_piece: "PESHWAS",
  },
  {
    id: 3011,
    bom_id: 103,
    inventory_item_id: 41, // PLATE SITARA ADA-MATERIAL
    quantity_per_unit: 5,
    unit: "GRAMS",
    notes: "Sitara accents",
    sequence_order: 11,
    garment_piece: "PESHWAS",
  },
  {
    id: 3012,
    bom_id: 103,
    inventory_item_id: 42, // DHOLKI ADA-MATERIAL
    quantity_per_unit: 26,
    unit: "GRAMS",
    notes: "Dholki embellishment",
    sequence_order: 12,
    garment_piece: "PESHWAS",
  },
  {
    id: 3013,
    bom_id: 103,
    inventory_item_id: 43, // GREE MOTI ADA-MATERIAL
    quantity_per_unit: 14,
    unit: "GRAMS",
    notes: "Additional green motis",
    sequence_order: 13,
    garment_piece: "PESHWAS",
  },
  {
    id: 3014,
    bom_id: 103,
    inventory_item_id: 44, // CORAL MOTI ADA-MATERIAL
    quantity_per_unit: 23,
    unit: "GRAMS",
    notes: "Coral moti finishing",
    sequence_order: 14,
    garment_piece: "PESHWAS",
  },
  // DUPATTA components
  {
    id: 3015,
    bom_id: 103,
    inventory_item_id: 45, // TENSIL ORGANZA fabric
    quantity_per_unit: 3,
    unit: "Yard",
    notes: "Dupatta fabric",
    sequence_order: 15,
    garment_piece: "DUPATTA",
  },
  {
    id: 3016,
    bom_id: 103,
    inventory_item_id: 46, // KIMKHAAB fabric
    quantity_per_unit: 1,
    unit: "Yard",
    notes: "Dupatta accent",
    sequence_order: 16,
    garment_piece: "DUPATTA",
  },
  {
    id: 3017,
    bom_id: 103,
    inventory_item_id: 47, // TASSELS RAW-MATERIAL
    quantity_per_unit: 4,
    unit: "QTY",
    notes: "Dupatta corner tassels",
    sequence_order: 17,
    garment_piece: "DUPATTA",
  },

  // I'll add simplified versions for Goldess and Princess Solara
  // In reality, these would have 20-30 items each like the examples above

  // Goldess BOM Items (BOM ID 104)
  {
    id: 4001,
    bom_id: 104,
    inventory_item_id: 50, // Tissue fabric
    quantity_per_unit: 5,
    unit: "Yard",
    notes: "Main fabric",
    sequence_order: 1,
    garment_piece: "SHIRT",
  },
  {
    id: 4002,
    bom_id: 104,
    inventory_item_id: 51, // Cotton silk
    quantity_per_unit: 6,
    unit: "Yard",
    notes: "Lining and details",
    sequence_order: 2,
    garment_piece: "SHIRT",
  },
  {
    id: 4003,
    bom_id: 104,
    inventory_item_id: 52, // Champagne karti ADA-MATERIAL
    quantity_per_unit: 110,
    unit: "GRAMS",
    notes: "Main embellishment - champagne karti in multiple places",
    sequence_order: 3,
    garment_piece: "SHIRT",
  },
  {
    id: 4004,
    bom_id: 104,
    inventory_item_id: 53, // Kulfi ADA-MATERIAL
    quantity_per_unit: 10,
    unit: "GRAMS",
    notes: "Kulfi work",
    sequence_order: 4,
    garment_piece: "SHIRT",
  },
  {
    id: 4005,
    bom_id: 104,
    inventory_item_id: 54, // Behti ADA-MATERIAL
    quantity_per_unit: 11,
    unit: "GRAMS",
    notes: "Behti embellishment",
    sequence_order: 5,
    garment_piece: "SHIRT",
  },
  {
    id: 4006,
    bom_id: 104,
    inventory_item_id: 55, // Bajra moti ADA-MATERIAL
    quantity_per_unit: 70,
    unit: "GRAMS",
    notes: "Moti work throughout",
    sequence_order: 6,
    garment_piece: "SHIRT",
  },
  {
    id: 4007,
    bom_id: 104,
    inventory_item_id: 56, // Lace RAW-MATERIAL
    quantity_per_unit: 18,
    unit: "GRAMS",
    notes: "Lace finishing",
    sequence_order: 7,
    garment_piece: "SHIRT",
  },
  {
    id: 4008,
    bom_id: 104,
    inventory_item_id: 57, // Badam ADA-MATERIAL
    quantity_per_unit: 64,
    unit: "GRAMS",
    notes: "Badam work accents",
    sequence_order: 8,
    garment_piece: "SHIRT",
  },
  {
    id: 4009,
    bom_id: 104,
    inventory_item_id: 58, // P- raw silk fabric
    quantity_per_unit: 2.5,
    unit: "Yard",
    notes: "Pant fabric",
    sequence_order: 9,
    garment_piece: "PANT",
  },
  {
    id: 4010,
    bom_id: 104,
    inventory_item_id: 59, // CHIFFON fabric
    quantity_per_unit: 3,
    unit: "Yard",
    notes: "Dupatta fabric",
    sequence_order: 10,
    garment_piece: "DUPATTA",
  },
  {
    id: 4011,
    bom_id: 104,
    inventory_item_id: 60, // Champagne badaam ADA-MATERIAL
    quantity_per_unit: 55,
    unit: "GRAMS",
    notes: "Dupatta embellishment",
    sequence_order: 11,
    garment_piece: "DUPATTA",
  },
  {
    id: 4012,
    bom_id: 104,
    inventory_item_id: 61, // Lace RAW-MATERIAL
    quantity_per_unit: 9,
    unit: "GRAMS",
    notes: "Dupatta lace border",
    sequence_order: 12,
    garment_piece: "DUPATTA",
  },

  // Princess Solara BOM Items (BOM ID 105)
  {
    id: 5001,
    bom_id: 105,
    inventory_item_id: 70, // Tissue silk fabric
    quantity_per_unit: 5.5,
    unit: "Yard",
    notes: "Main kaftan fabric",
    sequence_order: 1,
    garment_piece: "KAFTAN",
  },
  {
    id: 5002,
    bom_id: 105,
    inventory_item_id: 71, // Kimkhab fabric
    quantity_per_unit: 1.5,
    unit: "Yard",
    notes: "Accent panels",
    sequence_order: 2,
    garment_piece: "KAFTAN",
  },
  {
    id: 5003,
    bom_id: 105,
    inventory_item_id: 72, // Bajra moti ADA-MATERIAL
    quantity_per_unit: 200,
    unit: "GRAMS",
    notes: "Heavy moti work throughout",
    sequence_order: 3,
    garment_piece: "KAFTAN",
  },
  {
    id: 5004,
    bom_id: 105,
    inventory_item_id: 73, // Kerki 3no. sona color ADA-MATERIAL
    quantity_per_unit: 150,
    unit: "GRAMS",
    notes: "Golden kerki embellishment",
    sequence_order: 4,
    garment_piece: "KAFTAN",
  },
  {
    id: 5005,
    bom_id: 105,
    inventory_item_id: 74, // Patti sitara golden ADA-MATERIAL
    quantity_per_unit: 23,
    unit: "GRAMS",
    notes: "Golden sitara work",
    sequence_order: 5,
    garment_piece: "KAFTAN",
  },
  {
    id: 5006,
    bom_id: 105,
    inventory_item_id: 75, // Champaign crystal 4no ADA-MATERIAL
    quantity_per_unit: 5,
    unit: "GRAMS",
    notes: "Crystal accents",
    sequence_order: 6,
    garment_piece: "KAFTAN",
  },
  {
    id: 5007,
    bom_id: 105,
    inventory_item_id: 76, // Champaign drop crystal ADA-MATERIAL
    quantity_per_unit: 78,
    unit: "GRAMS",
    notes: "Hanging crystal drops",
    sequence_order: 7,
    garment_piece: "KAFTAN",
  },
  {
    id: 5008,
    bom_id: 105,
    inventory_item_id: 77, // Golden sitara 3no ADA-MATERIAL
    quantity_per_unit: 2,
    unit: "GRAMS",
    notes: "Small golden sitaras",
    sequence_order: 8,
    garment_piece: "KAFTAN",
  },
  {
    id: 5009,
    bom_id: 105,
    inventory_item_id: 78, // Golden sitara 6no ADA-MATERIAL
    quantity_per_unit: 3,
    unit: "GRAMS",
    notes: "Medium golden sitaras",
    sequence_order: 9,
    garment_piece: "KAFTAN",
  },
  {
    id: 5010,
    bom_id: 105,
    inventory_item_id: 79, // Golden sitara 8no ADA-MATERIAL
    quantity_per_unit: 10,
    unit: "GRAMS",
    notes: "Large golden sitaras",
    sequence_order: 10,
    garment_piece: "KAFTAN",
  },
  {
    id: 5011,
    bom_id: 105,
    inventory_item_id: 80, // Antique sitara phoo ADA-MATERIAL
    quantity_per_unit: 6,
    unit: "GRAMS",
    notes: "Antique finish sitaras",
    sequence_order: 11,
    garment_piece: "KAFTAN",
  },
  {
    id: 5012,
    bom_id: 105,
    inventory_item_id: 81, // Sika ADA-MATERIAL
    quantity_per_unit: 1,
    unit: "GRAMS",
    notes: "Special sika work",
    sequence_order: 12,
    garment_piece: "KAFTAN",
  },
  {
    id: 5013,
    bom_id: 105,
    inventory_item_id: 82, // Tekenor sitara golden ADA-MATERIAL
    quantity_per_unit: 17,
    unit: "GRAMS",
    notes: "Technical sitara embellishment",
    sequence_order: 13,
    garment_piece: "KAFTAN",
  },
]

/**
 * Helper Functions for Working with Products and BOMs
 */

/**
 * Get active BOM for a product
 */
export function getActiveBOMForProduct(productId) {
  return mockBOMs.find((bom) => bom.product_id === productId && bom.is_active)
}

/**
 * Get all BOM items for a specific BOM
 */
export function getBOMItems(bomId) {
  return mockBOMItems.filter((item) => item.bom_id === bomId)
}

/**
 * Get complete BOM details including all items for a product
 */
export function getProductBOMDetails(productId) {
  const product = mockProducts.find((p) => p.id === productId)
  if (!product) return null

  const bom = getActiveBOMForProduct(productId)
  if (!bom) return null

  const items = getBOMItems(bom.id)

  return {
    product,
    bom,
    items,
  }
}

/**
 * Calculate total material requirements for a given quantity of a product
 * This is what inventory checking will use
 */
export function calculateMaterialRequirements(productId, quantity) {
  const bomDetails = getProductBOMDetails(productId)
  if (!bomDetails) return []

  // Group by inventory item and sum up total required quantities
  const requirements = {}

  bomDetails.items.forEach((item) => {
    const totalNeeded = item.quantity_per_unit * quantity

    if (requirements[item.inventory_item_id]) {
      requirements[item.inventory_item_id].total_quantity += totalNeeded
    } else {
      requirements[item.inventory_item_id] = {
        inventory_item_id: item.inventory_item_id,
        total_quantity: totalNeeded,
        unit: item.unit,
      }
    }
  })

  return Object.values(requirements)
}
