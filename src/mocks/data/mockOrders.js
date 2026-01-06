/**
 * Mock Orders Data
 * Updated to reference products from mockProducts.js
 */

import {
  ORDER_ITEM_STATUS,
  ORDER_SOURCE,
  PAYMENT_STATUS,
  SIZE_TYPE,
  CUSTOMIZATION_TYPE,
} from "@/constants/orderConstants"

// Order Items - stored separately for easier management
export let mockOrderItems = [
  // Order 1 Items - Rouge Legacy (prod_1)
  {
    id: "item-001",
    orderId: "order-001",
    productId: "prod_1",
    productName: "Rouge Legacy",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/47_f391d8d8-af44-46dc-a132-12d78198aa11.jpg?v=1757143827&width=1080",
    productSku: "RL-001",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.IN_PRODUCTION,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: {
        top: "Heavy embroidery on peshwas",
        bottom: "Lehnga with gold work",
        dupattaShawl: "Matching dupatta with border",
      },
      attachments: [],
    },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: ["peshwas", "lehnga"],
    measurements: {
      shoulder: "14.5",
      bust: "36",
      waist: "28",
      hip: "38",
      armhole: "8",
    },
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-001",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-20T10:00:00Z",
      },
      {
        id: "log-002",
        action: "Order form generated",
        user: "Sarah Khan",
        timestamp: "2024-12-20T11:30:00Z",
      },
      {
        id: "log-003",
        action: "Customer approved form",
        user: "Sarah Khan",
        timestamp: "2024-12-21T09:00:00Z",
      },
      {
        id: "log-004",
        action: "Inventory check passed",
        user: "Ali Hassan",
        timestamp: "2024-12-21T14:00:00Z",
      },
      {
        id: "log-005",
        action: "Production started",
        user: "Mohammad Aslam",
        timestamp: "2024-12-22T08:00:00Z",
      },
    ],
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-22T08:00:00Z",
  },

  // Order 2 Items - Celestial Regalia (prod_2)
  {
    id: "item-002",
    orderId: "order-002",
    productId: "prod_2",
    productName: "Celestial Regalia",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/16_42c5f09a-6c3c-4efc-9892-73c9e0d6a984.jpg?v=1757160715&width=1080",
    productSku: "CR-002",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: {
        top: "Silver tilla work on peshwas",
        bottom: "Lehnga with resham embroidery",
        dupattaShawl: "Double dupatta",
      },
      attachments: [],
    },
    color: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: "Ivory white with silver accents",
      attachments: [],
    },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: ["peshwas", "lehnga"],
    measurements: {
      shoulder: "14",
      bust: "34",
      waist: "26",
      hip: "36",
    },
    orderFormGenerated: true,
    orderFormApproved: false,
    timeline: [
      {
        id: "log-010",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-22T14:00:00Z",
      },
      {
        id: "log-011",
        action: "Order form generated",
        user: "Fatima Ali",
        timestamp: "2024-12-22T16:00:00Z",
      },
      {
        id: "log-012",
        action: "Form sent to customer",
        user: "Fatima Ali",
        timestamp: "2024-12-22T16:30:00Z",
      },
    ],
    createdAt: "2024-12-22T14:00:00Z",
    updatedAt: "2024-12-22T16:30:00Z",
  },

  // Order 3 Items - Moonlit Blush (prod_4) - Standard Size
  {
    id: "item-003",
    orderId: "order-003",
    productId: "prod_4",
    productName: "Moonlit Blush",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/3_2cac6e2f-bd36-4e84-9a93-5820ea42e4c6.jpg?v=1746994018&width=1080",
    productSku: "MB-004",
    sizeType: SIZE_TYPE.STANDARD,
    size: "M",
    quantity: 1,
    status: ORDER_ITEM_STATUS.DISPATCHED,
    style: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: {}, attachments: [] },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: [],
    measurements: {},
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-013",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-15T09:00:00Z",
      },
      {
        id: "log-014",
        action: "Order form approved",
        user: "Sarah Khan",
        timestamp: "2024-12-15T14:00:00Z",
      },
      {
        id: "log-015",
        action: "Production completed",
        user: "Mohammad Aslam",
        timestamp: "2024-12-20T12:00:00Z",
      },
      {
        id: "log-016",
        action: "QA approved",
        user: "Aisha Begum",
        timestamp: "2024-12-21T10:00:00Z",
      },
      {
        id: "log-017",
        action: "Dispatched via DHL",
        user: "Admin",
        timestamp: "2024-12-22T11:00:00Z",
      },
    ],
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-22T11:00:00Z",
  },

  // Order 4 Items - Elysian Verde (prod_5) - Standard Size
  {
    id: "item-004",
    orderId: "order-004",
    productId: "prod_5",
    productName: "Elysian Verde",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/1_4dc89fe7-40ee-4a96-8638-f3f5d6ae29e4.jpg?v=1746994088&width=1080",
    productSku: "EV-005",
    sizeType: SIZE_TYPE.STANDARD,
    size: "L",
    quantity: 1,
    status: ORDER_ITEM_STATUS.RECEIVED,
    style: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: {}, attachments: [] },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: [],
    measurements: {},
    orderFormGenerated: false,
    orderFormApproved: false,
    timeline: [
      {
        id: "log-018",
        action: "Order received from Shopify",
        user: "System",
        timestamp: "2024-12-24T08:00:00Z",
      },
    ],
    createdAt: "2024-12-24T08:00:00Z",
    updatedAt: "2024-12-24T08:00:00Z",
  },

  // Order 5 Items - Drape of Divinity (prod_6)
  {
    id: "item-005",
    orderId: "order-005",
    productId: "prod_6",
    productName: "Drape of Divinity",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/2_cbc7ba7c-2f5c-43c3-9d42-cd67d200f8a6.jpg?v=1746994127&width=1080",
    productSku: "DD-006",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.AWAITING_MATERIAL,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: { top: "Pearl work on blouse", bottom: "Saree with tilla work", dupattaShawl: "" },
      attachments: [],
    },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: ["saree", "blouse"],
    measurements: {
      shoulder: "13.5",
      bust: "34",
      waist: "27",
      blouse_length: "14",
    },
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-019",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-23T10:00:00Z",
      },
      {
        id: "log-020",
        action: "Form approved",
        user: "Sarah Khan",
        timestamp: "2024-12-23T15:00:00Z",
      },
      {
        id: "log-021",
        action: "Material shortage detected",
        user: "System",
        timestamp: "2024-12-24T09:00:00Z",
      },
    ],
    createdAt: "2024-12-23T10:00:00Z",
    updatedAt: "2024-12-24T09:00:00Z",
  },

  // Order 6 Items - Coral Mirage (prod_7) - Standard Size
  {
    id: "item-006",
    orderId: "order-006",
    productId: "prod_7",
    productName: "Coral Mirage",
    productImage:
      "https://musferahsaad.net/cdn/shop/files/1_4e6a8f2f-bb2e-4d3e-9587-d2c6e8f4d9a2.jpg?v=1746994200&width=1080",
    productSku: "CM-007",
    sizeType: SIZE_TYPE.STANDARD,
    size: "S",
    quantity: 1,
    status: ORDER_ITEM_STATUS.PRODUCTION_COMPLETED,
    style: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: {}, attachments: [] },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: [],
    measurements: {},
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-022",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-18T11:00:00Z",
      },
      {
        id: "log-023",
        action: "Form approved",
        user: "Fatima Ali",
        timestamp: "2024-12-18T14:00:00Z",
      },
      {
        id: "log-024",
        action: "Production completed",
        user: "Mohammad Aslam",
        timestamp: "2024-12-23T16:00:00Z",
      },
    ],
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-23T16:00:00Z",
  },

  // Order 7 Items - Aqua Elegance (prod_9) - Standard Size
  {
    id: "item-007",
    orderId: "order-007",
    productId: "prod_9",
    productName: "Aqua Elegance",
    productImage: "https://musferahsaad.net/cdn/shop/files/Aqua1.webp?v=1746993700&width=1080",
    productSku: "AE-009",
    sizeType: SIZE_TYPE.STANDARD,
    size: "M",
    quantity: 1,
    status: ORDER_ITEM_STATUS.INVENTORY_CHECK,
    style: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: {}, attachments: [] },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: [],
    measurements: {},
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-025",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-24T10:00:00Z",
      },
      {
        id: "log-026",
        action: "Form approved",
        user: "Sarah Khan",
        timestamp: "2024-12-24T12:00:00Z",
      },
      {
        id: "log-027",
        action: "Inventory check started",
        user: "System",
        timestamp: "2024-12-24T14:00:00Z",
      },
    ],
    createdAt: "2024-12-24T10:00:00Z",
    updatedAt: "2024-12-24T14:00:00Z",
  },

  // Order 8 Items - Ivory Sensation (prod_10)
  {
    id: "item-008",
    orderId: "order-008",
    productId: "prod_10",
    productName: "Ivory Sensation",
    productImage: "https://musferahsaad.net/cdn/shop/files/Ivory1.webp?v=1746993676&width=1080",
    productSku: "IS-010",
    sizeType: SIZE_TYPE.STANDARD,
    size: "XL",
    quantity: 1,
    status: ORDER_ITEM_STATUS.READY_FOR_PRODUCTION,
    style: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: {}, attachments: [] },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: [],
    measurements: {},
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-028",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-22T09:00:00Z",
      },
      {
        id: "log-029",
        action: "Form approved",
        user: "Fatima Ali",
        timestamp: "2024-12-22T11:00:00Z",
      },
      {
        id: "log-030",
        action: "Inventory check passed",
        user: "Ali Hassan",
        timestamp: "2024-12-23T10:00:00Z",
      },
    ],
    createdAt: "2024-12-22T09:00:00Z",
    updatedAt: "2024-12-23T10:00:00Z",
  },
]

// Orders
export let mockOrders = [
  {
    id: "order-001",
    orderNumber: "ORD-2024-001",
    shopifyOrderId: null,
    shopifyOrderNumber: null,
    source: ORDER_SOURCE.MANUAL,
    status: ORDER_ITEM_STATUS.IN_PRODUCTION,
    customerName: "Aisha Rahman",
    customerEmail: "aisha.rahman@email.com",
    customerPhone: "+971501234567",
    destination: "UAE",
    shippingAddress: {
      street1: "Villa 23, Palm Jumeirah",
      street2: "",
      city: "Dubai",
      state: "Dubai",
      postalCode: "12345",
      country: "UAE",
    },
    clientHeight: "5'6\" - 5'8\"",
    currency: "PKR",
    totalAmount: 575000,
    paymentStatus: PAYMENT_STATUS.PARTIAL,
    paymentMethod: "Bank Transfer",
    totalReceived: 300000,
    remainingAmount: 275000,
    consultantName: "Sarah Khan",
    productionInCharge: "Mohammad Aslam",
    productionShippingDate: "2025-01-15",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Bridal order - VIP customer",
    orderFormLink: null,
    itemIds: ["item-001"],
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-22T08:00:00Z",
  },
  {
    id: "order-002",
    orderNumber: "ORD-2024-002",
    shopifyOrderId: "SHOP-5678",
    shopifyOrderNumber: "#1002",
    source: ORDER_SOURCE.SHOPIFY,
    status: ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL,
    customerName: "Fatima Al-Maktoum",
    customerEmail: "fatima.maktoum@email.com",
    customerPhone: "+971509876543",
    destination: "UAE",
    shippingAddress: {
      street1: "Tower 5, Downtown Dubai",
      street2: "Apt 2301",
      city: "Dubai",
      state: "Dubai",
      postalCode: "54321",
      country: "UAE",
    },
    clientHeight: "5'3\" - 5'5\"",
    currency: "PKR",
    totalAmount: 575000,
    paymentStatus: PAYMENT_STATUS.PENDING,
    paymentMethod: "Credit Card",
    totalReceived: 0,
    remainingAmount: 575000,
    consultantName: "Fatima Ali",
    productionInCharge: null,
    productionShippingDate: "2025-02-01",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Shopify order - awaiting customer confirmation",
    orderFormLink: null,
    itemIds: ["item-002"],
    createdAt: "2024-12-22T14:00:00Z",
    updatedAt: "2024-12-22T16:30:00Z",
  },
  {
    id: "order-003",
    orderNumber: "ORD-2024-003",
    shopifyOrderId: null,
    shopifyOrderNumber: null,
    source: ORDER_SOURCE.MANUAL,
    status: ORDER_ITEM_STATUS.DISPATCHED,
    customerName: "Zara Khan",
    customerEmail: "zara.khan@email.com",
    customerPhone: "+441234567890",
    destination: "UK",
    shippingAddress: {
      street1: "45 Baker Street",
      street2: "Flat 3B",
      city: "London",
      state: "Greater London",
      postalCode: "W1U 8EW",
      country: "UK",
    },
    clientHeight: "5'6\" - 5'8\"",
    currency: "PKR",
    totalAmount: 62000,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod: "Bank Transfer",
    totalReceived: 62000,
    remainingAmount: 0,
    consultantName: "Sarah Khan",
    productionInCharge: "Mohammad Aslam",
    productionShippingDate: "2024-12-22",
    actualShippingDate: "2024-12-22",
    preTrackingId: "DHL-1234567890",
    urgent: false,
    notes: "Standard kaftan order - shipped",
    orderFormLink: "/forms/ORD-2024-003.pdf",
    itemIds: ["item-003"],
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-22T11:00:00Z",
  },
  {
    id: "order-004",
    orderNumber: "ORD-2024-004",
    shopifyOrderId: "SHOP-9012",
    shopifyOrderNumber: "#1004",
    source: ORDER_SOURCE.SHOPIFY,
    status: ORDER_ITEM_STATUS.RECEIVED,
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@email.com",
    customerPhone: "+919876543210",
    destination: "India",
    shippingAddress: {
      street1: "12 MG Road",
      street2: "",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
    },
    clientHeight: "5'0\" - 5'2\"",
    currency: "PKR",
    totalAmount: 180000,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod: "Credit Card",
    totalReceived: 180000,
    remainingAmount: 0,
    consultantName: "Fatima Ali",
    productionInCharge: null,
    productionShippingDate: "2025-01-20",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: true,
    notes: "Rush order - customer event on Jan 25",
    orderFormLink: null,
    itemIds: ["item-004"],
    createdAt: "2024-12-24T08:00:00Z",
    updatedAt: "2024-12-24T08:00:00Z",
  },
  {
    id: "order-005",
    orderNumber: "ORD-2024-005",
    shopifyOrderId: null,
    shopifyOrderNumber: null,
    source: ORDER_SOURCE.MANUAL,
    status: ORDER_ITEM_STATUS.AWAITING_MATERIAL,
    customerName: "Maria Rodriguez",
    customerEmail: "maria.rodriguez@email.com",
    customerPhone: "+12125551234",
    destination: "USA",
    shippingAddress: {
      street1: "789 Fifth Avenue",
      street2: "Suite 500",
      city: "New York",
      state: "NY",
      postalCode: "10022",
      country: "USA",
    },
    clientHeight: "5'9\" - 5'11\"",
    currency: "PKR",
    totalAmount: 160000,
    paymentStatus: PAYMENT_STATUS.PARTIAL,
    paymentMethod: "Wire Transfer",
    totalReceived: 80000,
    remainingAmount: 80000,
    consultantName: "Sarah Khan",
    productionInCharge: "Mohammad Aslam",
    productionShippingDate: "2025-01-30",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Waiting for silk fabric from supplier",
    orderFormLink: "/forms/ORD-2024-005.pdf",
    itemIds: ["item-005"],
    createdAt: "2024-12-23T10:00:00Z",
    updatedAt: "2024-12-24T09:00:00Z",
  },
  {
    id: "order-006",
    orderNumber: "ORD-2024-006",
    shopifyOrderId: "SHOP-3456",
    shopifyOrderNumber: "#1006",
    source: ORDER_SOURCE.SHOPIFY,
    status: ORDER_ITEM_STATUS.PRODUCTION_COMPLETED,
    customerName: "Emma Thompson",
    customerEmail: "emma.thompson@email.com",
    customerPhone: "+447890123456",
    destination: "UK",
    shippingAddress: {
      street1: "10 Downing Street",
      street2: "",
      city: "London",
      state: "Greater London",
      postalCode: "SW1A 2AA",
      country: "UK",
    },
    clientHeight: "5'3\" - 5'5\"",
    currency: "PKR",
    totalAmount: 180000,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod: "Credit Card",
    totalReceived: 180000,
    remainingAmount: 0,
    consultantName: "Fatima Ali",
    productionInCharge: "Mohammad Aslam",
    productionShippingDate: "2024-12-26",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Production complete - ready for QA",
    orderFormLink: "/forms/ORD-2024-006.pdf",
    itemIds: ["item-006"],
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-23T16:00:00Z",
  },
  {
    id: "order-007",
    orderNumber: "ORD-2024-007",
    shopifyOrderId: null,
    shopifyOrderNumber: null,
    source: ORDER_SOURCE.MANUAL,
    status: ORDER_ITEM_STATUS.INVENTORY_CHECK,
    customerName: "Sophia Chen",
    customerEmail: "sophia.chen@email.com",
    customerPhone: "+8613812345678",
    destination: "China",
    shippingAddress: {
      street1: "88 Nanjing Road",
      street2: "Building A",
      city: "Shanghai",
      state: "Shanghai",
      postalCode: "200001",
      country: "China",
    },
    clientHeight: "5'6\" - 5'8\"",
    currency: "PKR",
    totalAmount: 58000,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod: "Alipay",
    totalReceived: 58000,
    remainingAmount: 0,
    consultantName: "Sarah Khan",
    productionInCharge: null,
    productionShippingDate: "2025-01-10",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Inventory check in progress",
    orderFormLink: "/forms/ORD-2024-007.pdf",
    itemIds: ["item-007"],
    createdAt: "2024-12-24T10:00:00Z",
    updatedAt: "2024-12-24T14:00:00Z",
  },
  {
    id: "order-008",
    orderNumber: "ORD-2024-008",
    shopifyOrderId: "SHOP-7890",
    shopifyOrderNumber: "#1008",
    source: ORDER_SOURCE.SHOPIFY,
    status: ORDER_ITEM_STATUS.READY_FOR_PRODUCTION,
    customerName: "Amelia Williams",
    customerEmail: "amelia.williams@email.com",
    customerPhone: "+61412345678",
    destination: "Australia",
    shippingAddress: {
      street1: "42 George Street",
      street2: "",
      city: "Sydney",
      state: "NSW",
      postalCode: "2000",
      country: "Australia",
    },
    clientHeight: "5'6\" - 5'8\"",
    currency: "PKR",
    totalAmount: 68000,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentMethod: "Credit Card",
    totalReceived: 68000,
    remainingAmount: 0,
    consultantName: "Fatima Ali",
    productionInCharge: "Mohammad Aslam",
    productionShippingDate: "2025-01-05",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: false,
    notes: "Ready to start production",
    orderFormLink: "/forms/ORD-2024-008.pdf",
    itemIds: ["item-008"],
    createdAt: "2024-12-22T09:00:00Z",
    updatedAt: "2024-12-23T10:00:00Z",
  },
]

// ==================== HELPER FUNCTIONS ====================

export const getOrderById = (orderId) => mockOrders.find((o) => o.id === orderId)

export const getOrderItemById = (itemId) => mockOrderItems.find((i) => i.id === itemId)

export const getOrderItemsByOrderId = (orderId) =>
  mockOrderItems.filter((i) => i.orderId === orderId)

export const getOrderWithItems = (orderId) => {
  const order = getOrderById(orderId)
  if (!order) return null
  return {
    ...order,
    items: getOrderItemsByOrderId(orderId),
  }
}

// Get all orders with items
export const getAllOrdersWithItems = () => {
  return mockOrders.map((order) => getOrderWithItems(order.id))
}

// Calculate remaining amount
export const calculateRemainingAmount = (order) => {
  if (order.payments && order.payments.length > 0) {
    const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0)
    return order.totalAmount - totalPaid
  }
  return order.remainingAmount || order.totalAmount - (order.totalReceived || 0)
}

// Calculate delayed days
export const calculateDelayedDays = (order) => {
  if (!order.productionShippingDate || !order.actualShippingDate) return null
  const planned = new Date(order.productionShippingDate)
  const actual = new Date(order.actualShippingDate)
  const diffTime = actual - planned
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get order status summary based on items
export const getOrderStatusSummary = (orderId) => {
  const items = getOrderItemsByOrderId(orderId)
  if (items.length === 0) return { summary: "No items", counts: {} }

  const counts = {}
  items.forEach((item) => {
    counts[item.status] = (counts[item.status] || 0) + 1
  })

  // Check if all items have same status
  const statuses = Object.keys(counts)
  if (statuses.length === 1) {
    return { summary: statuses[0], counts }
  }

  // Mixed statuses
  const total = items.length
  const completed =
    (counts[ORDER_ITEM_STATUS.COMPLETED] || 0) + (counts[ORDER_ITEM_STATUS.DISPATCHED] || 0)

  return {
    summary: `${completed} of ${total} items completed`,
    counts,
  }
}

// Generate new order number
export const generateOrderNumber = () => {
  const year = new Date().getFullYear()
  const count = mockOrders.filter((o) => o.source === ORDER_SOURCE.MANUAL).length + 1
  return `ORD-${year}-${String(count).padStart(3, "0")}`
}

// Generate unique IDs
export const generateOrderId = () => `order-${String(mockOrders.length + 1).padStart(3, "0")}`
export const generateOrderItemId = () =>
  `item-${String(mockOrderItems.length + 1).padStart(3, "0")}`
export const generatePaymentId = () => `pay-${String(Date.now())}`
export const generateTimelineId = () => `log-${String(Date.now())}`
