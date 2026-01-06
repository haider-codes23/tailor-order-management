/**
 * Mock Products Data
 *
 * New Structure:
 * - product_items: Array of main garment pieces with individual prices
 * - add_ons: Array of add-on items with prices (often 0 if included free)
 * - subtotal: Sum of all item prices
 * - discount: Fixed discount amount in PKR
 * - total_price: subtotal - discount
 */

/**
 * Default Size Chart Template
 * Used as starting template when creating product measurement charts
 */
const DEFAULT_SIZE_CHART_TEMPLATE = {
  rows: [
    {
      id: 1,
      size_code: "XS",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 6,
      us_size: 2,
      sequence: 1,
    },
    {
      id: 2,
      size_code: "S",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 8,
      us_size: 4,
      sequence: 2,
    },
    {
      id: 3,
      size_code: "M",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 12,
      us_size: 8,
      sequence: 3,
    },
    {
      id: 4,
      size_code: "L",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 14,
      us_size: 10,
      sequence: 4,
    },
    {
      id: 5,
      size_code: "XL",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 16,
      us_size: 12,
      sequence: 5,
    },
    {
      id: 6,
      size_code: "XXL",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 18,
      us_size: 14,
      sequence: 6,
    },
  ],
}

const DEFAULT_HEIGHT_CHART_TEMPLATE = {
  rows: [
    {
      id: 1,
      height_range: "5'0\" - 5'2\"",
      height_min_inches: 60,
      height_max_inches: 62,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: 1,
    },
    {
      id: 2,
      height_range: "5'3\" - 5'5\"",
      height_min_inches: 63,
      height_max_inches: 65,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: 2,
    },
    {
      id: 3,
      height_range: "5'6\" - 5'8\"",
      height_min_inches: 66,
      height_max_inches: 68,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: 3,
    },
    {
      id: 4,
      height_range: "5'9\" - 5'11\"",
      height_min_inches: 69,
      height_max_inches: 71,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: 4,
    },
    {
      id: 5,
      height_range: "6'0\" - 6'2\"",
      height_min_inches: 72,
      height_max_inches: 74,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: 5,
    },
  ],
}

/**
 * Available measurement fields for size chart
 * Products can enable/disable which fields apply to them
 */
export const SIZE_CHART_FIELDS = [
  { id: "shoulder", label: "Shoulder", unit: "inches" },
  { id: "bust", label: "Bust", unit: "inches" },
  { id: "waist", label: "Waist", unit: "inches" },
  { id: "hip", label: "Hip", unit: "inches" },
  { id: "armhole", label: "Armhole", unit: "inches" },
  { id: "sleeve_length", label: "Sleeve Length", unit: "inches" },
  { id: "shirt_length", label: "Shirt Length", unit: "inches" },
  { id: "trouser_length", label: "Trouser Length", unit: "inches" },
  { id: "trouser_waist", label: "Trouser Waist", unit: "inches" },
  { id: "inseam", label: "Inseam", unit: "inches" },
]

/**
 * Available measurement fields for height chart
 */
export const HEIGHT_CHART_FIELDS = [
  { id: "kaftan_length", label: "Kaftan Length", unit: "inches" },
  { id: "sleeve_front_length", label: "Sleeve Front", unit: "inches" },
  { id: "sleeve_back_length", label: "Sleeve Back", unit: "inches" },
  { id: "gown_length", label: "Gown Length", unit: "inches" },
  { id: "lehnga_length", label: "Lehnga Length", unit: "inches" },
  { id: "sharara_length", label: "Sharara Length", unit: "inches" },
]

// ==================== PRODUCTS ====================

export const mockProducts = [
  // 1. ROUGE LEGACY - Bridal (Peshwas, Lehnga, Dupatta + Pouch, Veil)
  {
    id: "prod_1",
    name: "Rouge Legacy",
    sku: "RL-001",
    description:
      "A masterclass in tradition and grandeur, this couture ensemble is rendered in a rich deep red hue and harmoniously blends classic paisley, floral jaal, and geometric patterns.",
    category: "Bridal",
    active: true,
    primary_image:
      "https://musferahsaad.net/cdn/shop/files/47_f391d8d8-af44-46dc-a132-12d78198aa11.jpg?v=1757143827&width=1080",

    product_items: [
      { piece: "peshwas", price: 350000 },
      { piece: "lehnga", price: 150000 },
      { piece: "dupatta", price: 75000 },
    ],
    add_ons: [
      { piece: "pouch", price: 0 },
      { piece: "veil", price: 0 },
    ],

    subtotal: 575000,
    discount: 0,
    total_price: 575000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-04-20T14:30:00Z",
  },

  // 2. CELESTIAL REGALIA - Bridal (Peshwas, Lehnga, Dupatta + Pouch)
  {
    id: "prod_2",
    name: "Celestial Regalia",
    sku: "CR-002",
    description:
      "Celestial Regalia evokes a vision of modern majesty—where celestial light meets couture brilliance. This contoured bridal silhouette is meticulously handcrafted with silver tilla and resham embroidery.",
    category: "Bridal",
    active: true,
    primary_image:
      "https://musferahsaad.net/cdn/shop/files/16_42c5f09a-6c3c-4efc-9892-73c9e0d6a984.jpg?v=1757160715&width=1080",

    product_items: [
      { piece: "peshwas", price: 350000 },
      { piece: "lehnga", price: 150000 },
      { piece: "dupatta", price: 75000 },
    ],
    add_ons: [{ piece: "pouch", price: 0 }],

    subtotal: 575000,
    discount: 0,
    total_price: 575000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-01-20T11:00:00Z",
    updated_at: "2024-04-21T15:00:00Z",
  },

  // 3. RUBY MAHARANI - Bridal (Peshwas, Lehnga, Dupatta + Pouch, Veil)
  {
    id: "prod_3",
    name: "Ruby Maharani",
    sku: "RM-003",
    description:
      "Ruby Maharani is a celebration of grandeur and color, capturing the spirit of regal femininity in full bloom. Crafted in a deep garnet red, this couture peshwas features elaborate multicolor resham and tilla embroidery.",
    category: "Bridal",
    active: true,
    primary_image:
      "https://musferahsaad.net/cdn/shop/files/58_5175da28-2ab8-44da-ae27-16f92aed8f68.jpg?v=1757160657&width=1080",

    product_items: [
      { piece: "peshwas", price: 350000 },
      { piece: "lehnga", price: 150000 },
      { piece: "dupatta", price: 75000 },
    ],
    add_ons: [
      { piece: "pouch", price: 0 },
      { piece: "veil", price: 0 },
    ],

    subtotal: 575000,
    discount: 0,
    total_price: 575000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-04-22T10:00:00Z",
  },

  // 4. MOONLIT BLUSH - Formal (Kaftan + Pouch)
  {
    id: "prod_4",
    name: "Moonlit Blush",
    sku: "MB-004",
    description:
      "A vision of chic sophistication, Moonlit Blush reimagines the kaftan in luminous rose-pink tissue. The neckline is exquisitely embroidered with cutwork and layered with intricate hand embellishments.",
    category: "Formal",
    active: true,
    primary_image:
      "https://musferahsaad.net/cdn/shop/files/MoonlitBlush6_087a435f-95ec-4314-bce8-001aa2a28134.webp?v=1758891284&width=1080",

    product_items: [{ piece: "kaftan", price: 62000 }],
    add_ons: [{ piece: "pouch", price: 0 }],

    subtotal: 62000,
    discount: 0,
    total_price: 62000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-02-10T12:00:00Z",
    updated_at: "2024-04-23T13:00:00Z",
  },

  // 5. ELYSIAN VERDE - Formal (Shirt, Farshi Sharara + Dupatta, Shawl, Pouch)
  {
    id: "prod_5",
    name: "Elysian Verde",
    sku: "EV-005",
    description:
      "Elysian Verde brings the beauty of nature to couture form. In deep green tones with gorgeous gold hand embellishments, the silhouette flows with effortless sophistication.",
    category: "Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/67.png?v=1761888916&width=1080",

    product_items: [
      { piece: "shirt", price: 100000 },
      { piece: "farshi", price: 50000 },
      { piece: "sharara", price: 30000 },
    ],
    add_ons: [
      { piece: "dupatta", price: 0 },
      { piece: "shawl", price: 0 },
      { piece: "pouch", price: 0 },
    ],

    subtotal: 180000,
    discount: 0,
    total_price: 180000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },

    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-02-15T14:00:00Z",
    updated_at: "2024-04-24T15:00:00Z",
  },

  // 6. DRAPE OF DIVINITY - Formal (Saree, Peti Coat, Blouse + Pouch)
  {
    id: "prod_6",
    name: "Drape of Divinity",
    sku: "DD-006",
    description:
      "Drape of Divinity reimagines the saree as an emblem of a goddess. Its flowing form, enriched with artisanal handwork, intricate tilla work and resham embroidery, embodies timeless allure.",
    category: "Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/10.png?v=1762027513&width=1080",

    product_items: [
      { piece: "saree", price: 100000 },
      { piece: "peti_coat", price: 30000 },
      { piece: "blouse", price: 30000 },
    ],
    add_ons: [{ piece: "pouch", price: 0 }],

    subtotal: 160000,
    discount: 0,
    total_price: 160000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },

    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2024-04-25T11:00:00Z",
  },

  // 7. CORAL MIRAGE - Formal (Blouse, Sharara + Dupatta, Pouch)
  {
    id: "prod_7",
    name: "Coral Mirage",
    sku: "CM-007",
    description:
      "A symphony of coral tones brought to life through exquisite craftsmanship. Coral Mirage captures the poetry of soft structure and fluid grace.",
    category: "Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/78.png?v=1761866944&width=1080",

    product_items: [
      { piece: "blouse", price: 100000 },
      { piece: "sharara", price: 50000 },
    ],
    add_ons: [
      { piece: "dupatta", price: 30000 },
      { piece: "pouch", price: 0 },
    ],

    subtotal: 180000,
    discount: 0,
    total_price: 180000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },

    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-03-01T09:00:00Z",
    updated_at: "2024-04-26T10:00:00Z",
  },

  // 8. SUNLIT GRACE - Formal (Jacket, Gown + Dupatta, Pouch)
  {
    id: "prod_8",
    name: "Sunlit Grace",
    sku: "SG-008",
    description:
      "Sunlit Grace evokes the golden warmth of daylight woven into couture. The silhouette reflects refined tailoring with delicate embellishment, blending tradition with effortless sophistication.",
    category: "Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/35.png?v=1761868233&width=1080",

    product_items: [
      { piece: "jacket", price: 150000 },
      { piece: "gown", price: 100000 },
    ],
    add_ons: [
      { piece: "dupatta", price: 30000 },
      { piece: "pouch", price: 0 },
    ],

    subtotal: 280000,
    discount: 0,
    total_price: 280000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },

    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-03-05T11:00:00Z",
    updated_at: "2024-04-27T12:00:00Z",
  },

  // 9. AQUA ELEGANCE - Ready to Ship (Kaftan + Pouch)
  {
    id: "prod_9",
    name: "Aqua Elegance",
    sku: "AE-009",
    description:
      "Immerse yourself in the lavish splendor of Aqua Elegance. This magnificent creation showcases a harmonious fusion of architectural elements and gentle floral vines.",
    category: "Semi-Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/Aqua1.webp?v=1746994128&width=1080",

    product_items: [{ piece: "kaftan", price: 58000 }],
    add_ons: [{ piece: "pouch", price: 0 }],

    subtotal: 58000,
    discount: 0,
    total_price: 58000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-03-10T14:00:00Z",
    updated_at: "2024-04-28T15:00:00Z",
  },

  // 10. IVORY SENSATION - Ready to Ship (Shirt, Pants + Dupatta, Pouch)
  {
    id: "prod_10",
    name: "Ivory Sensation",
    sku: "IS-010",
    description:
      "Ivory Sensation stands as a true testament to artistic craftsmanship. It showcases a stunning embroidered chiffon chikankari shirt, embellished with the finesse of delicate Adda work.",
    category: "Semi-Formal",
    active: true,
    primary_image: "https://musferahsaad.net/cdn/shop/files/Ivory1.webp?v=1746993676&width=1080",

    product_items: [
      { piece: "shirt", price: 40000 },
      { piece: "pants", price: 18000 },
    ],
    add_ons: [
      { piece: "dupatta", price: 10000 },
      { piece: "pouch", price: 0 },
    ],

    subtotal: 68000,
    discount: 0,
    total_price: 68000,

    // NEW: Product-specific measurement charts
    measurement_charts: {
      has_size_chart: true,
      has_height_chart: true,
      // Which fields are enabled for this product's size chart
      enabled_size_fields: ["shoulder", "bust", "waist", "hip", "armhole"],
      // Which fields are enabled for this product's height chart
      enabled_height_fields: [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
        "lehnga_length",
      ],
      size_chart: {
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
      },
      height_chart: {
        rows: [
          {
            id: 1,
            height_range: "5'0\" - 5'2\"",
            kaftan_length: 52,
            sleeve_front_length: 17,
            sleeve_back_length: 15,
            lehnga_length: 40,
            sequence: 1,
          },
          {
            id: 2,
            height_range: "5'3\" - 5'5\"",
            kaftan_length: 54,
            sleeve_front_length: 18,
            sleeve_back_length: 16,
            lehnga_length: 42,
            sequence: 2,
          },
          {
            id: 3,
            height_range: "5'6\" - 5'8\"",
            kaftan_length: 56,
            sleeve_front_length: 19,
            sleeve_back_length: 17,
            lehnga_length: 44,
            sequence: 3,
          },
          {
            id: 4,
            height_range: "5'9\" - 5'11\"",
            kaftan_length: 58,
            sleeve_front_length: 20,
            sleeve_back_length: 18,
            lehnga_length: 46,
            sequence: 4,
          },
          {
            id: 5,
            height_range: "6'0\" - 6'2\"",
            kaftan_length: 60,
            sleeve_front_length: 21,
            sleeve_back_length: 19,
            lehnga_length: 48,
            sequence: 5,
          },
        ],
      },
    },
    shopify_product_id: null,
    shopify_variant_id: null,
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-04-29T11:00:00Z",
  },
]

// ==================== BOMs ====================

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"]

/**
 * Generate BOMs for all products
 * Each product gets one active BOM per size
 */
function generateBOMs() {
  const boms = []
  let bomId = 1

  mockProducts.forEach((product) => {
    // Get all pieces from product (items + add-ons)
    const allPieces = [
      ...product.product_items.map((i) => i.piece),
      ...product.add_ons.map((a) => a.piece),
    ]

    // Create BOMs for common sizes (M and L for each product)
    ;["M", "L"].forEach((size, sizeIdx) => {
      boms.push({
        id: `bom_${bomId}`,
        product_id: product.id,
        size: size,
        version: 1,
        name: `Size ${size} - Version 1`,
        is_active: true,
        notes: `Standard BOM for ${product.name} - Size ${size}`,
        pieces: allPieces, // Derived from product
        created_at: product.created_at,
        updated_at: product.updated_at,
      })
      bomId++
    })
  })

  return boms
}

export const mockBOMs = generateBOMs()

// ==================== BOM ITEMS ====================

/**
 * Generate BOM items grouped by piece type
 */
function generateBOMItems() {
  const items = []
  let itemId = 1

  const sizeScales = {
    XS: -0.2,
    S: -0.1,
    M: 0,
    L: 0.1,
    XL: 0.2,
    XXL: 0.3,
    CUSTOM: 0,
  }

  mockBOMs.forEach((bom) => {
    const product = mockProducts.find((p) => p.id === bom.product_id)
    if (!product) return

    const scale = sizeScales[bom.size]
    const allPieces = [
      ...product.product_items.map((i) => i.piece),
      ...product.add_ons.map((a) => a.piece),
    ]

    // Generate items for each piece
    allPieces.forEach((piece, pieceIdx) => {
      // Add 1-3 materials per piece
      const materialsPerPiece = piece === "pouch" ? 1 : pieceIdx % 2 === 0 ? 3 : 2

      for (let i = 0; i < materialsPerPiece; i++) {
        items.push({
          id: `bom_item_${itemId++}`,
          bom_id: bom.id,
          inventory_item_id: `inv_${((pieceIdx * 3 + i) % 12) + 1}`,
          quantity_per_unit: parseFloat((2.0 + scale * 0.3 + i * 0.5).toFixed(2)),
          unit: i === 0 ? "METER" : i === 1 ? "GRAM" : "PIECE",
          piece: piece, // Link to piece type
          sequence_order: i + 1,
          notes: `Material ${i + 1} for ${piece} - Size ${bom.size}`,
        })
      }
    })
  })

  return items
}

export const mockBOMItems = generateBOMItems()

// ==================== HELPER FUNCTIONS ====================

export function getActiveBOM(productId, size) {
  return mockBOMs.find((bom) => bom.product_id === productId && bom.size === size && bom.is_active)
}

export function getAllActiveBOMs(productId) {
  return mockBOMs.filter((bom) => bom.product_id === productId && bom.is_active)
}

export function getBOMItems(bomId) {
  return mockBOMItems.filter((item) => item.bom_id === bomId)
}

export function getBOMItemsByPiece(bomId, piece) {
  return mockBOMItems.filter((item) => item.bom_id === bomId && item.piece === piece)
}

export function getProductBOMs(productId, size = null) {
  let boms = mockBOMs.filter((bom) => bom.product_id === productId)
  if (size) {
    boms = boms.filter((bom) => bom.size === size)
  }
  return boms.sort((a, b) => {
    if (a.size !== b.size) return a.size.localeCompare(b.size)
    return b.version - a.version
  })
}

export function getAvailableSizes(productId) {
  const productBOMs = mockBOMs.filter((bom) => bom.product_id === productId)
  const sizes = [...new Set(productBOMs.map((bom) => bom.size))]
  return sizes.sort()
}

export function getNextVersionNumber(productId, size) {
  const existingBOMs = mockBOMs.filter((bom) => bom.product_id === productId && bom.size === size)
  if (existingBOMs.length === 0) return 1
  return Math.max(...existingBOMs.map((bom) => bom.version)) + 1
}

/**
 * Get all pieces for a product (for BOM section creation)
 */
export function getProductPieces(productId) {
  const product = mockProducts.find((p) => p.id === productId)
  if (!product) return []
  return [...product.product_items.map((i) => i.piece), ...product.add_ons.map((a) => a.piece)]
}

export { DEFAULT_SIZE_CHART_TEMPLATE, DEFAULT_HEIGHT_CHART_TEMPLATE }
