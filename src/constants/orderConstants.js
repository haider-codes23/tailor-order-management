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
  PARTIAL_CREATE_PACKET: "PARTIAL_CREATE_PACKET", // NEW
  PACKET_CHECK: "PACKET_CHECK",
  PARTIAL_PACKET_CHECK: "PARTIAL_PACKET_CHECK", // NEW
  QUALITY_ASSURANCE: "QUALITY_ASSURANCE", // NEW - QA takes photos/videos before client approval
  // ============================================================================
  // PHASE 12.5: DYEING DEPARTMENT STATUSES (NEW)
  // ============================================================================
  READY_FOR_DYEING: "READY_FOR_DYEING",
  PARTIALLY_IN_DYEING: "PARTIALLY_IN_DYEING",
  IN_DYEING: "IN_DYEING",
  DYEING_COMPLETED: "DYEING_COMPLETED",
  // ============================================================================
  READY_FOR_PRODUCTION: "READY_FOR_PRODUCTION",
  IN_PRODUCTION: "IN_PRODUCTION",
  PARTIAL_IN_PRODUCTION: "PARTIAL_IN_PRODUCTION", // NEW
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
  AWAITING_CUSTOMER_FORM_APPROVAL: {
    label: "Awaiting Customer Approval",
    color: "bg-yellow-100 text-yellow-800",
  },
  FABRICATION_BESPOKE: {
    label: "Fabrication (Bespoke)",
    color: "bg-purple-200",
    description: "Custom BOM creation in progress",
  },
  INVENTORY_CHECK: { label: "Inventory Check", color: "bg-purple-100 text-purple-800" },
  AWAITING_MATERIAL: { label: "Awaiting Material", color: "bg-orange-100 text-orange-800" },
  CREATE_PACKET: { label: "Create Packet", color: "bg-indigo-100 text-indigo-800" },
  PARTIAL_CREATE_PACKET: {
    label: "Partial Packet Creation",
    color: "bg-indigo-200 text-indigo-900",
    description: "Some sections ready for packet, others awaiting material",
  },
  PACKET_CHECK: { label: "Packet Check", color: "bg-cyan-100 text-cyan-800" },
  PARTIAL_PACKET_CHECK: {
    label: "Partial Packet Check",
    color: "bg-cyan-200 text-cyan-900",
    description: "Verifying partial packet while some sections await material",
  },
  QUALITY_ASSURANCE: {
    label: "Quality Assurance",
    color: "bg-violet-100 text-violet-800",
    description: "QA review - photos/videos for client",
  }, // NEW
  // ============================================================================
  // PHASE 12.5: DYEING DEPARTMENT STATUS CONFIGS (NEW)
  // ============================================================================
  READY_FOR_DYEING: {
    label: "Ready for Dyeing",
    color: "bg-fuchsia-100 text-fuchsia-800",
    description: "All verified sections ready for dyeing department",
  },
  PARTIALLY_IN_DYEING: {
    label: "Partially in Dyeing",
    color: "bg-fuchsia-200 text-fuchsia-900",
    description: "Some sections in dyeing, others in packet flow or awaiting material",
  },
  IN_DYEING: {
    label: "In Dyeing",
    color: "bg-fuchsia-300 text-fuchsia-900",
    description: "All sections currently in dyeing process",
  },
  DYEING_COMPLETED: {
    label: "Dyeing Completed",
    color: "bg-fuchsia-400 text-white",
    description: "All sections completed dyeing, ready for production",
  },
  // ============================================================================
  READY_FOR_PRODUCTION: { label: "Ready for Production", color: "bg-teal-100 text-teal-800" },
  IN_PRODUCTION: { label: "In Production", color: "bg-amber-100 text-amber-800" },
  PARTIAL_IN_PRODUCTION: {
    label: "Partial Production",
    color: "bg-amber-200 text-amber-900",
    description: "Some sections in production, others pending",
  },
  PRODUCTION_COMPLETED: { label: "Production Completed", color: "bg-lime-100 text-lime-800" },
  AWAITING_CLIENT_APPROVAL: {
    label: "Awaiting Client Approval",
    color: "bg-pink-100 text-pink-800",
  },
  CLIENT_APPROVED: { label: "Client Approved", color: "bg-emerald-100 text-emerald-800" },
  DISPATCHED: { label: "Dispatched", color: "bg-sky-100 text-sky-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  REWORK_REQUIRED: { label: "Rework Required", color: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
}

// ============================================================================
// PACKET WORKFLOW CONSTANTS (NEW - Phase 12)
// ============================================================================

/**
 * Packet Status - Internal status of a packet within CREATE_PACKET phase
 * A packet goes through these stages as the fabrication team gathers materials
 */
export const PACKET_STATUS = {
  PENDING: "PENDING", // Created but not yet assigned
  ASSIGNED: "ASSIGNED", // Assigned to fabrication team member
  IN_PROGRESS: "IN_PROGRESS", // Fabrication team is gathering materials
  COMPLETED: "COMPLETED", // All materials gathered, ready for check
  APPROVED: "APPROVED", // Production head approved the packet
  REJECTED: "REJECTED", // Production head rejected - needs rework
  INVALIDATED: "INVALIDATED",
}

export const PACKET_STATUS_CONFIG = {
  PENDING: { label: "Pending Assignment", color: "bg-gray-100 text-gray-800", icon: "Clock" },
  ASSIGNED: { label: "Assigned", color: "bg-blue-100 text-blue-800", icon: "UserCheck" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-800", icon: "Package" },
  COMPLETED: { label: "Awaiting Check", color: "bg-cyan-100 text-cyan-800", icon: "CheckSquare" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800", icon: "CheckCircle" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800", icon: "XCircle" },
  INVALIDATED: {
    label: "Invalidated",
    color: "bg-gray-200 text-gray-600",
    icon: "Ban",
    description: "Packet invalidated due to dyeing rejection",
  },
}

/**
 * Section Status - Status for each included item/add-on within an order item
 * Each section (Shirt, Farshi, Dupatta, etc.) has its own independent status
 */
export const SECTION_STATUS = {
  PENDING_INVENTORY_CHECK: "PENDING_INVENTORY_CHECK",
  INVENTORY_PASSED: "INVENTORY_PASSED",
  AWAITING_MATERIAL: "AWAITING_MATERIAL",
  CREATE_PACKET: "CREATE_PACKET",
  PACKET_CREATED: "PACKET_CREATED",
  PACKET_VERIFIED: "PACKET_VERIFIED",
  // ============================================================================
  // PHASE 12.5: DYEING SECTION STATUSES (NEW)
  // ============================================================================
  READY_FOR_DYEING: "READY_FOR_DYEING",
  DYEING_ACCEPTED: "DYEING_ACCEPTED",
  DYEING_IN_PROGRESS: "DYEING_IN_PROGRESS",
  DYEING_COMPLETED: "DYEING_COMPLETED",
  DYEING_REJECTED: "DYEING_REJECTED",
  // ============================================================================
  READY_FOR_PRODUCTION: "READY_FOR_PRODUCTION",
  IN_PRODUCTION: "IN_PRODUCTION",
  PRODUCTION_COMPLETED: "PRODUCTION_COMPLETED",
  QA_PENDING: "QA_PENDING",
  QA_APPROVED: "QA_APPROVED",
  COMPLETED: "COMPLETED",
}

export const SECTION_STATUS_CONFIG = {
  PENDING_INVENTORY_CHECK: {
    label: "Pending Check",
    color: "bg-gray-100 text-gray-800",
    icon: "Clock",
  },
  INVENTORY_PASSED: {
    label: "Inventory OK",
    color: "bg-green-100 text-green-800",
    icon: "CheckCircle",
  },
  AWAITING_MATERIAL: {
    label: "Awaiting Material",
    color: "bg-orange-100 text-orange-800",
    icon: "AlertCircle",
  },
  CREATE_PACKET: {
    label: "Ready for Packet",
    color: "bg-indigo-100 text-indigo-800",
    icon: "Package",
  },
  PACKET_CREATED: {
    label: "Packet Created",
    color: "bg-cyan-100 text-cyan-800",
    icon: "PackageCheck",
  },
  PACKET_VERIFIED: {
    label: "Packet Verified",
    color: "bg-teal-100 text-teal-800",
    icon: "ShieldCheck",
  },
  // ============================================================================
  // PHASE 12.5: DYEING SECTION STATUS CONFIGS (NEW)
  // ============================================================================
  READY_FOR_DYEING: {
    label: "Ready for Dyeing",
    color: "bg-fuchsia-100 text-fuchsia-800",
    icon: "Droplets",
  },
  DYEING_ACCEPTED: {
    label: "Dyeing Accepted",
    color: "bg-fuchsia-200 text-fuchsia-900",
    icon: "UserCheck",
  },
  DYEING_IN_PROGRESS: {
    label: "Dyeing in Progress",
    color: "bg-fuchsia-300 text-fuchsia-900",
    icon: "Loader",
  },
  DYEING_COMPLETED: {
    label: "Dyeing Complete",
    color: "bg-fuchsia-400 text-white",
    icon: "CheckCircle2",
  },
  DYEING_REJECTED: {
    label: "Dyeing Rejected",
    color: "bg-red-100 text-red-800",
    icon: "XCircle",
  },
  // ============================================================================
  READY_FOR_PRODUCTION: {
    label: "Ready for Production",
    color: "bg-blue-100 text-blue-800",
    icon: "Factory",
  },
  IN_PRODUCTION: {
    label: "In Production",
    color: "bg-amber-100 text-amber-800",
    icon: "Cog",
  },
  PRODUCTION_COMPLETED: {
    label: "Production Done",
    color: "bg-lime-100 text-lime-800",
    icon: "CheckSquare",
  },
  QA_PENDING: {
    label: "QA Pending",
    color: "bg-violet-100 text-violet-800",
    icon: "Camera",
  },
  QA_APPROVED: {
    label: "QA Approved",
    color: "bg-emerald-100 text-emerald-800",
    icon: "Award",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: "Check",
  },
}

// ============================================================================
// PHASE 12.5: DYEING REJECTION REASONS (NEW)
// ============================================================================

/**
 * Dyeing Rejection Reasons
 * Predefined reasons that dyeing department can select when rejecting a section
 * Note: Selecting a reason is OPTIONAL, but providing notes is REQUIRED
 */
export const DYEING_REJECTION_REASONS = {
  MATERIAL_QUALITY_ISSUE: {
    code: "MATERIAL_QUALITY_ISSUE",
    label: "Material Quality Issue",
    description: "The fabric or material has quality defects",
  },
  COLOR_MISMATCH: {
    code: "COLOR_MISMATCH",
    label: "Color Mismatch",
    description: "Color doesn't match specifications or customer requirements",
  },
  FABRIC_DEFECT: {
    code: "FABRIC_DEFECT",
    label: "Fabric Defect",
    description: "Fabric has tears, holes, or visible damage",
  },
  MISSING_INVENTORY_MATERIAL: {
    code: "MISSING_INVENTORY_MATERIAL",
    label: "Missing Inventory Material",
    description: "Required materials are missing from the packet",
  },
  INCORRECT_MEASUREMENTS: {
    code: "INCORRECT_MEASUREMENTS",
    label: "Incorrect Measurements",
    description: "Material measurements don't match BOM specifications",
  },
  STAINS_OR_MARKS: {
    code: "STAINS_OR_MARKS",
    label: "Stains or Marks",
    description: "Material has stains, marks, or discoloration",
  },
  WRONG_MATERIAL_TYPE: {
    code: "WRONG_MATERIAL_TYPE",
    label: "Wrong Material Type",
    description: "Incorrect material type included in packet",
  },
  INSUFFICIENT_QUANTITY: {
    code: "INSUFFICIENT_QUANTITY",
    label: "Insufficient Quantity",
    description: "Material quantity is less than required",
  },
  DAMAGE_DURING_HANDLING: {
    code: "DAMAGE_DURING_HANDLING",
    label: "Damage During Handling",
    description: "Material was damaged during packet handling",
  },
  OTHER: {
    code: "OTHER",
    label: "Other",
    description: "Other reason - details must be provided in notes",
  },
}

// ============================================================================
// DYEING TIMELINE EVENTS (NEW - Phase 12.5)
// ============================================================================

/**
 * Dyeing Timeline Event Types
 * Used for tracking dyeing workflow events in order item timeline
 */
export const DYEING_TIMELINE_EVENTS = {
  READY_FOR_DYEING: "READY_FOR_DYEING",
  SECTION_ACCEPTED: "SECTION_ACCEPTED",
  SECTION_STARTED: "SECTION_STARTED",
  SECTION_COMPLETED: "SECTION_COMPLETED",
  SECTION_REJECTED: "SECTION_REJECTED",
  AUTO_ASSIGNED: "AUTO_ASSIGNED",
  INVENTORY_RELEASED: "INVENTORY_RELEASED",
  PACKET_INVALIDATED: "PACKET_INVALIDATED",
}

export const DYEING_TIMELINE_MESSAGES = {
  READY_FOR_DYEING: (sections) => `Sections ready for dyeing: ${sections.join(", ")}`,
  SECTION_ACCEPTED: (section, user) => `${section} accepted for dyeing by ${user}`,
  SECTION_STARTED: (section, user) => `Dyeing started for ${section} by ${user}`,
  SECTION_COMPLETED: (section, user) => `Dyeing completed for ${section} by ${user}`,
  SECTION_REJECTED: (section, user, reason) => 
    `${section} rejected from dyeing by ${user}. Reason: ${reason}`,
  AUTO_ASSIGNED: (sections, user) => 
    `Sections ${sections.join(", ")} auto-assigned to ${user} (Round 2+)`,
  INVENTORY_RELEASED: (section) => 
    `Inventory released back to stock for ${section} due to dyeing rejection`,
  PACKET_INVALIDATED: (section) => 
    `Packet for ${section} marked as invalidated due to dyeing rejection`,
}

/**
 * Standard rejection reasons for packet check
 * Production head selects one when rejecting a packet
 */
export const PACKET_REJECTION_REASONS = [
  { code: "WRONG_MATERIALS", label: "Wrong materials gathered" },
  { code: "INCORRECT_QTY", label: "Incorrect quantities" },
  { code: "DAMAGED_MATERIALS", label: "Damaged materials found" },
  { code: "MISSING_ITEMS", label: "Missing items in packet" },
  { code: "QUALITY_ISSUE", label: "Material quality issues" },
  { code: "WRONG_COLOR", label: "Wrong color/shade" },
  { code: "OTHER", label: "Other (specify in notes)" },
]

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
