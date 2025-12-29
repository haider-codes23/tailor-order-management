/**
 * Order Constants
 * Central place for all order-related constants
 */

// Order Item Statuses - The workflow each item goes through
export const ORDER_ITEM_STATUS = {
  RECEIVED: "RECEIVED",
  AWAITING_CUSTOMER_FORM_APPROVAL: "AWAITING_CUSTOMER_FORM_APPROVAL",
  INVENTORY_CHECK: "INVENTORY_CHECK",
  AWAITING_MATERIAL: "AWAITING_MATERIAL",
  CREATE_PACKET: "CREATE_PACKET",
  PACKET_CHECK: "PACKET_CHECK",
  READY_FOR_PRODUCTION: "READY_FOR_PRODUCTION",
  IN_PRODUCTION: "IN_PRODUCTION",
  PRODUCTION_COMPLETED: "PRODUCTION_COMPLETED",
  AWAITING_CLIENT_APPROVAL: "AWAITING_CLIENT_APPROVAL",
  REWORK_REQUIRED: "REWORK_REQUIRED",
  CLIENT_APPROVED: "CLIENT_APPROVED",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
}

// Status display configuration
export const ORDER_ITEM_STATUS_CONFIG = {
  [ORDER_ITEM_STATUS.RECEIVED]: {
    label: "Received",
    color: "bg-slate-100 text-slate-700",
  },
  [ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL]: {
    label: "Awaiting Form Approval",
    color: "bg-amber-100 text-amber-700",
  },
  [ORDER_ITEM_STATUS.INVENTORY_CHECK]: {
    label: "Inventory Check",
    color: "bg-blue-100 text-blue-700",
  },
  [ORDER_ITEM_STATUS.AWAITING_MATERIAL]: {
    label: "Awaiting Material",
    color: "bg-orange-100 text-orange-700",
  },
  [ORDER_ITEM_STATUS.CREATE_PACKET]: {
    label: "Create Packet",
    color: "bg-purple-100 text-purple-700",
  },
  [ORDER_ITEM_STATUS.PACKET_CHECK]: {
    label: "Packet Check",
    color: "bg-indigo-100 text-indigo-700",
  },
  [ORDER_ITEM_STATUS.READY_FOR_PRODUCTION]: {
    label: "Ready for Production",
    color: "bg-cyan-100 text-cyan-700",
  },
  [ORDER_ITEM_STATUS.IN_PRODUCTION]: {
    label: "In Production",
    color: "bg-yellow-100 text-yellow-700",
  },
  [ORDER_ITEM_STATUS.PRODUCTION_COMPLETED]: {
    label: "Production Completed",
    color: "bg-teal-100 text-teal-700",
  },
  [ORDER_ITEM_STATUS.AWAITING_CLIENT_APPROVAL]: {
    label: "Awaiting Client Approval",
    color: "bg-pink-100 text-pink-700",
  },
  [ORDER_ITEM_STATUS.REWORK_REQUIRED]: {
    label: "Rework Required",
    color: "bg-red-100 text-red-700",
  },
  [ORDER_ITEM_STATUS.CLIENT_APPROVED]: {
    label: "Client Approved",
    color: "bg-emerald-100 text-emerald-700",
  },
  [ORDER_ITEM_STATUS.DISPATCHED]: {
    label: "Dispatched",
    color: "bg-sky-100 text-sky-700",
  },
  [ORDER_ITEM_STATUS.COMPLETED]: {
    label: "Completed",
    color: "bg-green-100 text-green-700",
  },
}

// Order source
export const ORDER_SOURCE = {
  SHOPIFY: "shopify",
  MANUAL: "manual",
}

// Payment status
export const PAYMENT_STATUS = {
  PAID: "PAID",
  EXTRA_PAID: "EXTRA_PAID",
  PENDING: "PENDING",
}

// Urgent order types
export const URGENT_TYPE = {
  EVENT: "EVENT",
  RTS: "RTS", // Ready to Ship
}

// Size types
export const SIZE_TYPE = {
  STANDARD: "standard",
  CUSTOM: "custom",
}

// Standard sizes
export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

// Customization types (for style, color, fabric)
export const CUSTOMIZATION_TYPE = {
  ORIGINAL: "original",
  CUSTOMIZED: "customized",
}

// Currency options
export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
]

// Payment methods
export const PAYMENT_METHODS = [
  { value: "paypal", label: "PayPal" },
  { value: "bank_of_america", label: "Bank of America" },
  { value: "wire_transfer", label: "Wire Transfer" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
]

// Dispatch methods
export const DISPATCH_METHODS = [
  { value: "fedex", label: "FedEx" },
  { value: "ups", label: "UPS" },
  { value: "tcs", label: "TCS" },
  { value: "post_ex", label: "Post-Ex" },
  { value: "dhl", label: "DHL" },
  { value: "pickup", label: "Pickup" },
  { value: "other", label: "Other" },
]