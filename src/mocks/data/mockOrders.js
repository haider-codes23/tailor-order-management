/**
 * Mock Orders Data
 * Sample orders for development and testing
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
  // Order 1 Items
  {
    id: "item-001",
    orderId: "order-001",
    productId: "prod-001",
    productName: "Bridal Sherwani",
    productImage: "/images/products/sherwani-1.jpg",
    productSku: "SHR-001",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.IN_PRODUCTION,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: {
        top: "Embroidered collar",
        bottom: "Straight cut",
        dupattaShawl: "Matching shawl",
      },
      attachments: [],
    },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: ["shirt_trouser"],
    measurements: {
      shoulder: "18",
      front_carriage: "14",
      back_carriage: "15",
      round_chest: "42",
      round_waist: "36",
      sleeve_length: "25",
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
  {
    id: "item-002",
    orderId: "order-001",
    productId: "prod-002",
    productName: "Waistcoat",
    productImage: "/images/products/waistcoat-1.jpg",
    productSku: "WST-001",
    sizeType: SIZE_TYPE.STANDARD,
    size: "L",
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
        id: "log-006",
        action: "Order received",
        user: "System",
        timestamp: "2024-12-20T10:00:00Z",
      },
      {
        id: "log-007",
        action: "Order form generated",
        user: "Sarah Khan",
        timestamp: "2024-12-20T11:30:00Z",
      },
      {
        id: "log-008",
        action: "Customer approved form",
        user: "Sarah Khan",
        timestamp: "2024-12-21T09:00:00Z",
      },
      {
        id: "log-009",
        action: "Production completed",
        user: "Mohammad Aslam",
        timestamp: "2024-12-24T16:00:00Z",
      },
    ],
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-24T16:00:00Z",
  },

  // Order 2 Items
  {
    id: "item-003",
    orderId: "order-002",
    productId: "prod-003",
    productName: "Bridal Lehnga",
    productImage: "/images/products/lehnga-1.jpg",
    productSku: "LHG-001",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: {
        top: "Heavy embroidery on choli",
        bottom: "Flared lehnga",
        dupattaShawl: "Double dupatta",
      },
      attachments: [],
    },
    color: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: "Deep maroon with gold accents",
      attachments: [],
    },
    fabric: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    measurementCategories: ["lehnga_choli"],
    measurements: {
      shoulder: "14",
      round_chest: "36",
      round_waist: "28",
      blouse_length: "14",
      lehenga_front_length: "42",
      lehenga_waist: "28",
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

  // Order 3 Items
  {
    id: "item-004",
    orderId: "order-003",
    productId: "prod-004",
    productName: "Party Wear Saree",
    productImage: "/images/products/saree-1.jpg",
    productSku: "SAR-001",
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

  // Order 4 Items
  {
    id: "item-005",
    orderId: "order-004",
    productId: "prod-001",
    productName: "Bridal Sherwani",
    productImage: "/images/products/sherwani-1.jpg",
    productSku: "SHR-001",
    sizeType: SIZE_TYPE.STANDARD,
    size: "XL",
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
  {
    id: "item-006",
    orderId: "order-004",
    productId: "prod-002",
    productName: "Waistcoat",
    productImage: "/images/products/waistcoat-1.jpg",
    productSku: "WST-001",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
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
        id: "log-019",
        action: "Order received from Shopify",
        user: "System",
        timestamp: "2024-12-24T08:00:00Z",
      },
    ],
    createdAt: "2024-12-24T08:00:00Z",
    updatedAt: "2024-12-24T08:00:00Z",
  },

  // Order 5 Items - Awaiting Material
  {
    id: "item-007",
    orderId: "order-005",
    productId: "prod-005",
    productName: "Designer Kaftan",
    productImage: "/images/products/kaftan-1.jpg",
    productSku: "KFT-001",
    sizeType: SIZE_TYPE.CUSTOM,
    size: "Custom",
    quantity: 1,
    status: ORDER_ITEM_STATUS.AWAITING_MATERIAL,
    style: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: { top: "Pearl work on neckline", bottom: "Flowing design", dupattaShawl: "" },
      attachments: [],
    },
    color: { type: CUSTOMIZATION_TYPE.ORIGINAL, details: "", attachments: [] },
    fabric: {
      type: CUSTOMIZATION_TYPE.CUSTOMIZED,
      details: "Premium silk georgette",
      attachments: [],
    },
    measurementCategories: ["kaftan"],
    measurements: {
      shoulder: "15",
      shoulder_till_floor: "58",
      round_chest: "38",
      round_waist: "30",
    },
    orderFormGenerated: true,
    orderFormApproved: true,
    timeline: [
      {
        id: "log-020",
        action: "Order received",
        user: "Fatima Ali",
        timestamp: "2024-12-18T11:00:00Z",
      },
      {
        id: "log-021",
        action: "Order form approved",
        user: "Fatima Ali",
        timestamp: "2024-12-19T09:00:00Z",
      },
      {
        id: "log-022",
        action: "Inventory check - material shortage",
        user: "Ali Hassan",
        timestamp: "2024-12-19T14:00:00Z",
      },
      {
        id: "log-023",
        action: "Material ordered from supplier",
        user: "Ali Hassan",
        timestamp: "2024-12-19T15:00:00Z",
      },
    ],
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-19T15:00:00Z",
  },
]

// Orders
export let mockOrders = [
  {
    id: "order-001",
    orderNumber: "ORD-2024-001",
    source: ORDER_SOURCE.MANUAL,
    shopifyOrderId: null,
    customerName: "Ahmed Khan",
    destination: "United Arab Emirates",
    address: "Villa 42, Palm Jumeirah, Dubai, UAE",
    clientHeight: "5ft8in-5ft10in",
    modesty: "NO",
    consultantId: "user-002",
    consultantName: "Sarah Khan",
    productionInchargeId: "user-003",
    productionInchargeName: "Mohammad Aslam",
    currency: "USD",
    paymentMethod: "wire_transfer",
    totalAmount: 2500,
    payments: [
      {
        id: "pay-001",
        amount: 1000,
        receiptUrl: "/receipts/pay-001.jpg",
        createdAt: "2024-12-20T12:00:00Z",
      },
      {
        id: "pay-002",
        amount: 500,
        receiptUrl: "/receipts/pay-002.jpg",
        createdAt: "2024-12-22T10:00:00Z",
      },
    ],
    paymentStatus: PAYMENT_STATUS.PENDING,
    fwdDate: "2024-12-20",
    productionShippingDate: "2024-12-28",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: null,
    notes: "Customer prefers minimal embroidery. Call before delivery.",
    orderFormLink: "https://drive.google.com/file/d/abc123",
    itemIds: ["item-001", "item-002"],
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-22T08:00:00Z",
  },
  {
    id: "order-002",
    orderNumber: "ORD-2024-002",
    source: ORDER_SOURCE.SHOPIFY,
    shopifyOrderId: "SHP-78234",
    customerName: "Priya Sharma",
    destination: "India",
    address: "B-204, Green Valley Apartments, Andheri West, Mumbai 400053",
    clientHeight: "5ft2in-5ft4in",
    modesty: "YES",
    consultantId: "user-004",
    consultantName: "Fatima Ali",
    productionInchargeId: null,
    productionInchargeName: null,
    currency: "USD",
    paymentMethod: "paypal",
    totalAmount: 3500,
    payments: [
      {
        id: "pay-003",
        amount: 3500,
        receiptUrl: "/receipts/pay-003.jpg",
        createdAt: "2024-12-22T14:30:00Z",
      },
    ],
    paymentStatus: PAYMENT_STATUS.PAID,
    fwdDate: "2024-12-22",
    productionShippingDate: "2025-01-15",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: "EVENT",
    notes: "Wedding on Jan 20th. Must ship by Jan 15th latest!",
    orderFormLink: null,
    itemIds: ["item-003"],
    createdAt: "2024-12-22T14:00:00Z",
    updatedAt: "2024-12-22T16:30:00Z",
  },
  {
    id: "order-003",
    orderNumber: "ORD-2024-003",
    source: ORDER_SOURCE.SHOPIFY,
    shopifyOrderId: "SHP-78190",
    customerName: "Zara Abdullah",
    destination: "United Kingdom",
    address: "45 Baker Street, London W1U 8EW, UK",
    clientHeight: "5ft4in-5ft6in",
    modesty: "NO",
    consultantId: "user-002",
    consultantName: "Sarah Khan",
    productionInchargeId: "user-003",
    productionInchargeName: "Mohammad Aslam",
    currency: "GBP",
    paymentMethod: "credit_card",
    totalAmount: 800,
    payments: [
      {
        id: "pay-004",
        amount: 800,
        receiptUrl: "/receipts/pay-004.jpg",
        createdAt: "2024-12-15T10:00:00Z",
      },
    ],
    paymentStatus: PAYMENT_STATUS.PAID,
    fwdDate: "2024-12-15",
    productionShippingDate: "2024-12-20",
    actualShippingDate: "2024-12-22",
    preTrackingId: "DHL-789456123",
    urgent: null,
    notes: "",
    orderFormLink: "https://drive.google.com/file/d/xyz789",
    itemIds: ["item-004"],
    createdAt: "2024-12-15T09:00:00Z",
    updatedAt: "2024-12-22T11:00:00Z",
  },
  {
    id: "order-004",
    orderNumber: "SHP-78299",
    source: ORDER_SOURCE.SHOPIFY,
    shopifyOrderId: "SHP-78299",
    customerName: "Omar Farooq",
    destination: "Saudi Arabia",
    address: "King Fahd Road, Al Olaya District, Riyadh 12211",
    clientHeight: "6ft0in-6ft2in",
    modesty: "YES",
    consultantId: null,
    consultantName: null,
    productionInchargeId: null,
    productionInchargeName: null,
    currency: "SAR",
    paymentMethod: "paypal",
    totalAmount: 4200,
    payments: [],
    paymentStatus: PAYMENT_STATUS.PENDING,
    fwdDate: "2024-12-24",
    productionShippingDate: null,
    actualShippingDate: null,
    preTrackingId: null,
    urgent: null,
    notes: "New Shopify order - needs consultant assignment",
    orderFormLink: null,
    itemIds: ["item-005", "item-006"],
    createdAt: "2024-12-24T08:00:00Z",
    updatedAt: "2024-12-24T08:00:00Z",
  },
  {
    id: "order-005",
    orderNumber: "ORD-2024-005",
    source: ORDER_SOURCE.MANUAL,
    shopifyOrderId: null,
    customerName: "Aisha Malik",
    destination: "Canada",
    address: "1250 René-Lévesque Blvd W, Montreal, QC H3B 4W8",
    clientHeight: "5ft4in-5ft6in",
    modesty: "NO",
    consultantId: "user-004",
    consultantName: "Fatima Ali",
    productionInchargeId: "user-003",
    productionInchargeName: "Mohammad Aslam",
    currency: "CAD",
    paymentMethod: "wire_transfer",
    totalAmount: 1800,
    payments: [
      {
        id: "pay-005",
        amount: 900,
        receiptUrl: "/receipts/pay-005.jpg",
        createdAt: "2024-12-18T12:00:00Z",
      },
    ],
    paymentStatus: PAYMENT_STATUS.PENDING,
    fwdDate: "2024-12-18",
    productionShippingDate: "2024-12-30",
    actualShippingDate: null,
    preTrackingId: null,
    urgent: null,
    notes: "Waiting for silk georgette from supplier. Expected Dec 26.",
    orderFormLink: "https://drive.google.com/file/d/def456",
    itemIds: ["item-007"],
    createdAt: "2024-12-18T11:00:00Z",
    updatedAt: "2024-12-19T15:00:00Z",
  },
]

// Helper functions
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

// Calculate remaining amount
export const calculateRemainingAmount = (order) => {
  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0)
  return order.totalAmount - totalPaid
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
