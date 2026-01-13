/**
 * Order Constants
 * Central place for all order-related constants
 */

// Order Item Statuses - The workflow each item goes through
export const ORDER_ITEM_STATUS = {
  RECEIVED: "RECEIVED",
  AWAITING_CUSTOMER_FORM_APPROVAL: "AWAITING_CUSTOMER_FORM_APPROVAL",
  FABRICATION_BESPOKE: "FABRICATION_BESPOKE", // NEW - Custom size items need custom BOM
  INVENTORY_CHECK: "INVENTORY_CHECK",
  AWAITING_MATERIAL: "AWAITING_MATERIAL",
  CREATE_PACKET: "CREATE_PACKET",
  PACKET_CHECK: "PACKET_CHECK",
  READY_FOR_PRODUCTION: "READY_FOR_PRODUCTION",
  IN_PRODUCTION: "IN_PRODUCTION",
  PRODUCTION_COMPLETED: "PRODUCTION_COMPLETED",
  AWAITING_CLIENT_APPROVAL: "AWAITING_CLIENT_APPROVAL",
  CLIENT_APPROVED: "CLIENT_APPROVED",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  REWORK_REQUIRED: "REWORK_REQUIRED",
  CANCELLED: "CANCELLED",
}

// Human-readable status labels with colors
export const ORDER_ITEM_STATUS_CONFIG = {
  RECEIVED: { label: "Received", color: "bg-blue-100 text-blue-800" },
  AWAITING_CUSTOMER_FORM_APPROVAL: { label: "Awaiting Customer Approval", color: "bg-yellow-100 text-yellow-800" },
  FABRICATION_BESPOKE: { label: "Fabrication (Bespoke)", color: "bg-purple-200", description: "Custom BOM creation in progress" },
  INVENTORY_CHECK: { label: "Inventory Check", color: "bg-purple-100 text-purple-800" },
  AWAITING_MATERIAL: { label: "Awaiting Material", color: "bg-orange-100 text-orange-800" },
  CREATE_PACKET: { label: "Create Packet", color: "bg-indigo-100 text-indigo-800" },
  PACKET_CHECK: { label: "Packet Check", color: "bg-cyan-100 text-cyan-800" },
  READY_FOR_PRODUCTION: { label: "Ready for Production", color: "bg-teal-100 text-teal-800" },
  IN_PRODUCTION: { label: "In Production", color: "bg-amber-100 text-amber-800" },
  PRODUCTION_COMPLETED: { label: "Production Completed", color: "bg-lime-100 text-lime-800" },
  AWAITING_CLIENT_APPROVAL: { label: "Awaiting Client Approval", color: "bg-pink-100 text-pink-800" },
  CLIENT_APPROVED: { label: "Client Approved", color: "bg-emerald-100 text-emerald-800" },
  DISPATCHED: { label: "Dispatched", color: "bg-sky-100 text-sky-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  REWORK_REQUIRED: { label: "Rework Required", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
}

// Order source - where the order came from
export const ORDER_SOURCE = {
  SHOPIFY: "shopify",
  MANUAL: "manual",
}

// Payment status
export const PAYMENT_STATUS = {
  PAID: "PAID",
  EXTRA_PAID: "EXTRA_PAID",
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
}

export const PAYMENT_STATUS_CONFIG = {
  PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
  EXTRA_PAID: { label: "Extra Paid", color: "bg-blue-100 text-blue-800" },
  PENDING: { label: "Pending", color: "bg-red-100 text-red-800" },
  PARTIAL: { label: "Partial", color: "bg-yellow-100 text-yellow-800" },
}

// Size type - standard or custom
export const SIZE_TYPE = {
  STANDARD: "standard",
  CUSTOM: "custom",
}

// Customization type - original or customized
export const CUSTOMIZATION_TYPE = {
  ORIGINAL: "original",
  CUSTOMIZED: "customized",
}

// Standard sizes (from measurement charts)
export const STANDARD_SIZES = [
  { value: "XS", label: "XS - Extra Small" },
  { value: "S", label: "S - Small" },
  { value: "M", label: "M - Medium" },
  { value: "L", label: "L - Large" },
  { value: "XL", label: "XL - Extra Large" },
  { value: "XXL", label: "XXL - Double Extra Large" },
]

// Currencies
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

// Urgent flags
export const URGENT_FLAGS = [
  { value: "EVENT", label: "EVENT - Time Sensitive" },
  { value: "RTS", label: "RTS - Ready to Ship" },
]

// Height ranges for dropdown (2-inch increments)
export const HEIGHT_RANGES = [
  { value: "4ft0in-4ft2in", label: "4 ft 0 in - 4 ft 2 in" },
  { value: "4ft3in-4ft5in", label: "4 ft 3 in - 4 ft 5 in" },
  { value: "4ft6in-4ft8in", label: "4 ft 6 in - 4 ft 8 in" },
  { value: "4ft9in-4ft11in", label: "4 ft 9 in - 4 ft 11 in" },
  { value: "5ft0in-5ft2in", label: "5 ft 0 in - 5 ft 2 in" },
  { value: "5ft3in-5ft5in", label: "5 ft 3 in - 5 ft 5 in" },
  { value: "5ft6in-5ft8in", label: "5 ft 6 in - 5 ft 8 in" },
  { value: "5ft9in-5ft11in", label: "5 ft 9 in - 5 ft 11 in" },
  { value: "6ft0in-6ft2in", label: "6 ft 0 in - 6 ft 2 in" },
  { value: "6ft3in-6ft5in", label: "6 ft 3 in - 6 ft 5 in" },
  { value: "6ft6in-6ft8in", label: "6 ft 6 in - 6 ft 8 in" },
  { value: "6ft9in-6ft11in", label: "6 ft 9 in - 6 ft 11 in" },
  { value: "7ft0in+", label: "7 ft 0 in and above" },
]

// Modesty options
export const MODESTY_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
]

// Aliases for backwards compatibility
export const URGENT_TYPE = URGENT_FLAGS