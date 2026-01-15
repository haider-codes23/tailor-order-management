/**
 * Mock Packets Data
 * Phase 12: Packet Workflow
 *
 * A packet is a physical collection of all materials needed to produce an order item.
 * The fabrication team gathers materials from inventory based on the pick list.
 */

import { PACKET_STATUS } from "@/constants/orderConstants"

// Counter for generating unique IDs
let packetIdCounter = 1

/**
 * Generate a unique packet ID
 */
export const generatePacketId = () => {
  return `packet-${String(packetIdCounter++).padStart(3, "0")}`
}

/**
 * Get packet by ID
 */
export const getPacketById = (packetId) => {
  return mockPackets.find((p) => p.id === packetId) || null
}

/**
 * Get packet by order item ID
 */
export const getPacketByOrderItemId = (orderItemId) => {
  return mockPackets.find((p) => p.orderItemId === orderItemId) || null
}

/**
 * Get packets assigned to a user
 */
export const getPacketsByAssignee = (userId) => {
  return mockPackets.filter((p) => p.assignedTo === userId)
}

/**
 * Get packets awaiting check (completed but not yet approved/rejected)
 */
export const getPacketsAwaitingCheck = () => {
  return mockPackets.filter((p) => p.status === PACKET_STATUS.COMPLETED)
}

/**
 * Create a packet from material requirements
 * This is called when an order item enters CREATE_PACKET status
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} orderId - The order ID
 * @param {Array} materialRequirements - Array of material requirements from inventory check
 * @param {Object} inventoryItemsMap - Map of inventory items for enrichment
 */
export const createPacketFromRequirements = (
  orderItemId,
  orderId,
  materialRequirements,
  inventoryItemsMap = {}
) => {
  const now = new Date().toISOString()

  // Build pick list from material requirements with full inventory details
  const pickList = materialRequirements.map((req, index) => {
    // Get the full inventory item details
    const inventoryItem = inventoryItemsMap[req.inventoryItemId] || {}

    return {
      id: `pick-${orderItemId}-${index + 1}`,
      inventoryItemId: req.inventoryItemId,
      // Full inventory item details
      inventoryItemName:
        inventoryItem.name || req.inventoryItemName || `Item ${req.inventoryItemId}`,
      inventoryItemSku: inventoryItem.sku || req.inventoryItemSku || "",
      inventoryItemCategory: inventoryItem.category || req.category || "",
      // Quantity and unit
      requiredQty: req.requiredQty,
      unit: inventoryItem.unit || req.unit || "Unit",
      // Location info for warehouse staff
      rackLocation: inventoryItem.rack_location || "TBD",
      // Piece/section this material is for
      piece: req.piece || "General",
      // Picking status
      isPicked: false,
      pickedQty: 0,
      pickedAt: null,
      notes: "",
    }
  })

  const packet = {
    id: generatePacketId(),
    orderItemId,
    orderId,
    status: PACKET_STATUS.PENDING,

    // Assignment info
    assignedTo: null, // User ID of fabrication team member
    assignedToName: null, // Display name
    assignedBy: null, // User ID of production head
    assignedByName: null,
    assignedAt: null,

    // Progress tracking
    startedAt: null,
    completedAt: null,

    // Verification info
    checkedBy: null,
    checkedByName: null,
    checkedAt: null,
    checkResult: null, // "APPROVED" | "REJECTED"
    rejectionReason: null,
    rejectionReasonCode: null,
    rejectionNotes: null,

    // The pick list - materials to gather
    pickList,

    // Summary counts
    totalItems: pickList.length,
    pickedItems: 0,

    // Notes and history
    notes: "",
    timeline: [
      {
        id: `timeline-${Date.now()}`,
        action: "Packet created",
        user: "System",
        timestamp: now,
        details: `Created with ${pickList.length} items to pick`,
      },
    ],

    // Timestamps
    createdAt: now,
    updatedAt: now,
  }

  return packet
}

/**
 * Mock packets data
 * Initially empty - packets are created dynamically when order items enter CREATE_PACKET
 */
export const mockPackets = []

/**
 * Sample packet for testing (commented out - uncomment to test UI)
 * This shows the full structure with real inventory item references
 */
/*
export const samplePacket = {
  id: "packet-001",
  orderItemId: "item-001",
  orderId: "order-001",
  status: PACKET_STATUS.IN_PROGRESS,
  
  assignedTo: "user-5",
  assignedToName: "Fabrication User",
  assignedBy: "user-3",
  assignedByName: "Production Head",
  assignedAt: "2026-01-15T10:00:00Z",
  
  startedAt: "2026-01-15T10:30:00Z",
  completedAt: null,
  
  checkedBy: null,
  checkedByName: null,
  checkedAt: null,
  checkResult: null,
  rejectionReason: null,
  rejectionReasonCode: null,
  rejectionNotes: null,
  
  pickList: [
    {
      id: "pick-item-001-1",
      inventoryItemId: 38,
      inventoryItemName: "Badam Lace",
      inventoryItemSku: "RAW-BADAMLACE-038",
      inventoryItemCategory: "RAW_MATERIAL",
      requiredQty: 10,
      unit: "Yard",
      rackLocation: "A7",
      piece: "kaftan",
      isPicked: true,
      pickedQty: 10,
      pickedAt: "2026-01-15T10:45:00Z",
      notes: "",
    },
    {
      id: "pick-item-001-2",
      inventoryItemId: 18,
      inventoryItemName: "Bajra Moti",
      inventoryItemSku: "ADA-BAJRAMOTI-018",
      inventoryItemCategory: "ADA_MATERIAL",
      requiredQty: 50,
      unit: "Gram",
      rackLocation: "B3",
      piece: "pouch",
      isPicked: false,
      pickedQty: 0,
      pickedAt: null,
      notes: "",
    },
    {
      id: "pick-item-001-3",
      inventoryItemId: 1,
      inventoryItemName: "Tissue Silk",
      inventoryItemSku: "FAB-TISSUE-001",
      inventoryItemCategory: "FABRIC",
      requiredQty: 3.5,
      unit: "Meter",
      rackLocation: "C2",
      piece: "kaftan",
      isPicked: false,
      pickedQty: 0,
      pickedAt: null,
      notes: "",
    },
  ],
  
  totalItems: 3,
  pickedItems: 1,
  
  notes: "Customer requested extra care with lace handling",
  timeline: [
    {
      id: "timeline-1",
      action: "Packet created",
      user: "System",
      timestamp: "2026-01-15T09:00:00Z",
      details: "Created with 3 items to pick",
    },
    {
      id: "timeline-2",
      action: "Packet assigned",
      user: "Production Head",
      timestamp: "2026-01-15T10:00:00Z",
      details: "Assigned to Fabrication User",
    },
    {
      id: "timeline-3",
      action: "Packet started",
      user: "Fabrication User",
      timestamp: "2026-01-15T10:30:00Z",
      details: "Started gathering materials",
    },
    {
      id: "timeline-4",
      action: "Item picked",
      user: "Fabrication User",
      timestamp: "2026-01-15T10:45:00Z",
      details: "Picked: Badam Lace - 10 Yard from rack A7",
    },
  ],
  
  createdAt: "2026-01-15T09:00:00Z",
  updatedAt: "2026-01-15T10:45:00Z",
}
*/
