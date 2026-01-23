/**
 * Packet Handlers - MSW handlers for Phase 12 Packet Workflow
 *
 * Endpoints:
 * - GET    /api/packets                         - List all packets (with filters)
 * - GET    /api/packets/my-tasks                - Get packets assigned to current user
 * - GET    /api/packets/check-queue             - Get packets awaiting check
 * - GET    /api/order-items/:id/packet          - Get packet for an order item
 * - POST   /api/order-items/:id/packet/assign   - Assign packet to fabrication team
 * - POST   /api/order-items/:id/packet/start    - Start picking materials
 * - POST   /api/order-items/:id/packet/pick-item - Mark an item as picked
 * - POST   /api/order-items/:id/packet/complete - Mark packet as complete
 * - POST   /api/order-items/:id/packet/approve  - Approve packet (production head)
 * - POST   /api/order-items/:id/packet/reject   - Reject packet (production head)
 */

import { http, HttpResponse } from "msw"
import {
  mockPackets,
  getPacketByOrderItemId,
  createPacketFromRequirements,
  generatePacketId,
  createPartialPacketFromRequirements, // NEW
  addMaterialsToExistingPacket,
} from "../data/mockPackets"
import { mockOrderItems } from "../data/mockOrders"
import { mockInventoryItems } from "../data/mockInventory"
import { mockUsers } from "../data/mockUser"
import { ORDER_ITEM_STATUS, PACKET_STATUS, SECTION_STATUS } from "../../constants/orderConstants"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build inventory items map for enriching packet pick list
 */
const buildInventoryMap = () => {
  const map = {}
  mockInventoryItems.forEach((item) => {
    map[item.id] = item
  })
  return map
}

/**
 * Find user by ID
 */
const findUser = (userId) => {
  return mockUsers.find((u) => u.id === userId || u.id === parseInt(userId))
}

/**
 * Add timeline entry to packet
 */
const addPacketTimeline = (packet, action, user, details = "") => {
  packet.timeline.push({
    id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    user: user || "System",
    timestamp: new Date().toISOString(),
    details,
  })
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/packets
 * List all packets with optional filters
 */
const getPackets = http.get("/api/packets", async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const url = new URL(request.url)
  const status = url.searchParams.get("status")
  const assignedTo = url.searchParams.get("assignedTo")

  let packets = [...mockPackets]

  if (status) {
    packets = packets.filter((p) => p.status === status)
  }

  if (assignedTo) {
    packets = packets.filter(
      (p) => p.assignedTo === assignedTo || p.assignedTo === parseInt(assignedTo)
    )
  }

  // Sort by creation date, newest first
  packets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return HttpResponse.json({
    success: true,
    data: packets,
    meta: {
      total: packets.length,
    },
  })
})

/**
 * GET /api/packets/my-tasks
 * Get packets assigned to current user (fabrication team)
 */
const getMyPacketTasks = http.get("/api/packets/my-tasks", async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const status = url.searchParams.get("status")

  let packets = mockPackets.filter(
    (p) => p.assignedTo === userId || p.assignedTo === parseInt(userId)
  )

  if (status) {
    packets = packets.filter((p) => p.status === status)
  }

  // Enrich with order item details
  const enrichedPackets = packets.map((packet) => {
    const orderItem = mockOrderItems.find((oi) => oi.id === packet.orderItemId)
    return {
      ...packet,
      orderItemDetails: orderItem
        ? {
            productName: orderItem.productName,
            productSku: orderItem.productSku,
            size: orderItem.size,
            quantity: orderItem.quantity,
          }
        : null,
    }
  })

  // Sort by assignment date, oldest first (FIFO)
  enrichedPackets.sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt))

  return HttpResponse.json({
    success: true,
    data: enrichedPackets,
    meta: {
      total: enrichedPackets.length,
      pending: enrichedPackets.filter((p) => p.status === PACKET_STATUS.ASSIGNED).length,
      inProgress: enrichedPackets.filter((p) => p.status === PACKET_STATUS.IN_PROGRESS).length,
      completed: enrichedPackets.filter((p) => p.status === PACKET_STATUS.COMPLETED).length,
    },
  })
})

/**
 * GET /api/packets/check-queue
 * Get packets awaiting check (for production head)
 */
const getPacketCheckQueue = http.get("/api/packets/check-queue", async () => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Get packets that are completed and awaiting verification
  const packets = mockPackets.filter((p) => p.status === PACKET_STATUS.COMPLETED)

  // Enrich with order item details
  const enrichedPackets = packets.map((packet) => {
    const orderItem = mockOrderItems.find((oi) => oi.id === packet.orderItemId)
    return {
      ...packet,
      orderItemDetails: orderItem
        ? {
            productName: orderItem.productName,
            productSku: orderItem.productSku,
            productImage: orderItem.productImage,
            size: orderItem.size,
            quantity: orderItem.quantity,
            orderId: orderItem.orderId,
          }
        : null,
    }
  })

  // Sort by completion date, oldest first (FIFO)
  enrichedPackets.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))

  return HttpResponse.json({
    success: true,
    data: enrichedPackets,
    meta: {
      total: enrichedPackets.length,
    },
  })
})

/**
 * GET /api/order-items/:id/packet
 * Get packet details for an order item
 */
const getOrderItemPacket = http.get("/api/order-items/:id/packet", async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const { id } = params
  const packet = getPacketByOrderItemId(id)

  if (!packet) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `No packet found for order item ${id}`,
      },
      { status: 404 }
    )
  }

  // Get order item details
  const orderItem = mockOrderItems.find((oi) => oi.id === id)

  return HttpResponse.json({
    success: true,
    data: {
      ...packet,
      orderItemDetails: orderItem
        ? {
            productName: orderItem.productName,
            productSku: orderItem.productSku,
            size: orderItem.size,
            quantity: orderItem.quantity,
            orderId: orderItem.orderId,
          }
        : null,
    },
  })
})

/**
 * POST /api/order-items/:id/packet/assign
 * Assign packet to a fabrication team member
 */
const assignPacket = http.post(
  "/api/order-items/:id/packet/assign",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const data = await request.json()
    const { assignToUserId, assignedByUserId } = data

    // Find or create packet
    let packet = getPacketByOrderItemId(id)

    if (!packet) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No packet found for order item ${id}. Packet should be created when entering CREATE_PACKET status.`,
        },
        { status: 404 }
      )
    }

    // Get user details
    const assignee = findUser(assignToUserId)
    const assigner = findUser(assignedByUserId)

    if (!assignee) {
      return HttpResponse.json(
        {
          success: false,
          error: "User not found",
          message: `User ${assignToUserId} not found`,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Update packet
    packet.assignedTo = assignToUserId
    packet.assignedToName = assignee.name
    packet.assignedBy = assignedByUserId
    packet.assignedByName = assigner?.name || "Unknown"
    packet.assignedAt = now
    packet.status = PACKET_STATUS.ASSIGNED
    packet.updatedAt = now

    addPacketTimeline(
      packet,
      "Packet assigned",
      assigner?.name || "Production Head",
      `Assigned to ${assignee.name}`
    )

    // Update order item status if needed
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
    if (orderItemIndex !== -1) {
      mockOrderItems[orderItemIndex].updatedAt = now
    }

    return HttpResponse.json({
      success: true,
      data: packet,
      message: `Packet assigned to ${assignee.name}`,
    })
  }
)

/**
 * POST /api/order-items/:id/packet/start
 * Fabrication team starts picking materials
 */
const startPacket = http.post("/api/order-items/:id/packet/start", async ({ params, request }) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { id } = params
  const data = await request.json()
  const { userId } = data

  const packet = getPacketByOrderItemId(id)

  if (!packet) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `No packet found for order item ${id}`,
      },
      { status: 404 }
    )
  }

  if (packet.status !== PACKET_STATUS.ASSIGNED) {
    return HttpResponse.json(
      {
        success: false,
        error: "Invalid status",
        message: `Cannot start packet in ${packet.status} status. Must be ASSIGNED.`,
      },
      { status: 400 }
    )
  }

  const user = findUser(userId)
  const now = new Date().toISOString()

  packet.status = PACKET_STATUS.IN_PROGRESS
  packet.startedAt = now
  packet.updatedAt = now

  addPacketTimeline(
    packet,
    "Packet started",
    user?.name || "Fabrication Team",
    "Started gathering materials"
  )

  return HttpResponse.json({
    success: true,
    data: packet,
    message: "Packet picking started",
  })
})

/**
 * POST /api/order-items/:id/packet/pick-item
 * Mark a pick list item as picked
 */
const pickItem = http.post("/api/order-items/:id/packet/pick-item", async ({ params, request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const { id } = params
  const data = await request.json()
  const { pickItemId, pickedQty, userId, notes } = data

  const packet = getPacketByOrderItemId(id)

  if (!packet) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `No packet found for order item ${id}`,
      },
      { status: 404 }
    )
  }

  const pickItemIndex = packet.pickList.findIndex((item) => item.id === pickItemId)

  if (pickItemIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: "Item not found",
        message: `Pick list item ${pickItemId} not found`,
      },
      { status: 404 }
    )
  }

  const user = findUser(userId)
  const now = new Date().toISOString()
  const pickItem = packet.pickList[pickItemIndex]

  // Update pick item
  pickItem.isPicked = true
  pickItem.pickedQty = pickedQty || pickItem.requiredQty
  pickItem.pickedAt = now
  pickItem.notes = notes || ""

  // Update picked count
  packet.pickedItems = packet.pickList.filter((item) => item.isPicked).length
  packet.updatedAt = now

  addPacketTimeline(
    packet,
    "Item picked",
    user?.name || "Fabrication Team",
    `Picked: ${pickItem.inventoryItemName} - ${pickItem.pickedQty} ${pickItem.unit} from rack ${pickItem.rackLocation}`
  )

  return HttpResponse.json({
    success: true,
    data: packet,
    message: `${pickItem.inventoryItemName} marked as picked`,
  })
})

/**
 * POST /api/order-items/:id/packet/complete
 * Mark packet as complete (all materials gathered)
 */
const completePacket = http.post(
  "/api/order-items/:id/packet/complete",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const data = await request.json()
    const { userId, notes } = data

    const packet = getPacketByOrderItemId(id)

    if (!packet) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No packet found for order item ${id}`,
        },
        { status: 404 }
      )
    }

    if (packet.status !== PACKET_STATUS.IN_PROGRESS) {
      return HttpResponse.json(
        {
          success: false,
          error: "Invalid status",
          message: `Cannot complete packet in ${packet.status} status. Must be IN_PROGRESS.`,
        },
        { status: 400 }
      )
    }

    // Check if all items are picked
    const unPickedItems = packet.pickList.filter((item) => !item.isPicked)
    if (unPickedItems.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          error: "Incomplete",
          message: `${unPickedItems.length} items not yet picked. Please pick all items before completing.`,
          data: { unPickedItems },
        },
        { status: 400 }
      )
    }

    const user = findUser(userId)
    const now = new Date().toISOString()

    packet.status = PACKET_STATUS.COMPLETED
    packet.completedAt = now
    packet.notes = notes || packet.notes
    packet.updatedAt = now

    // Update order item status to PACKET_CHECK
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
    if (orderItemIndex !== -1) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.PACKET_CHECK
      mockOrderItems[orderItemIndex].updatedAt = now
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: "Packet completed - awaiting verification",
        user: user?.name || "Fabrication Team",
        timestamp: now,
      })
    }

    addPacketTimeline(
      packet,
      "Packet completed",
      user?.name || "Fabrication Team",
      `All ${packet.totalItems} materials gathered. Ready for verification.`
    )

    return HttpResponse.json({
      success: true,
      data: packet,
      message: "Packet marked as complete. Awaiting Production Head verification.",
    })
  }
)

/**
 * POST /api/order-items/:id/packet/approve
 * Production head approves the packet
 */
const approvePacket = http.post(
  "/api/order-items/:id/packet/approve",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const data = await request.json()
    const { userId, isReadyStock, notes } = data

    const packet = getPacketByOrderItemId(id)

    if (!packet) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No packet found for order item ${id}`,
        },
        { status: 404 }
      )
    }

    if (packet.status !== PACKET_STATUS.COMPLETED) {
      return HttpResponse.json(
        {
          success: false,
          error: "Invalid status",
          message: `Cannot approve packet in ${packet.status} status. Must be COMPLETED.`,
        },
        { status: 400 }
      )
    }

    const user = findUser(userId)
    const now = new Date().toISOString()

    packet.status = PACKET_STATUS.APPROVED
    packet.checkedBy = userId
    packet.checkedByName = user?.name || "Production Head"
    packet.checkedAt = now
    packet.checkResult = "APPROVED"
    packet.notes = notes || packet.notes
    packet.updatedAt = now

    // Determine next status based on whether it's ready stock or needs production
    // If ready stock -> QUALITY_ASSURANCE (QA takes photos/videos)
    // If needs production -> READY_FOR_PRODUCTION
    // Determine next status based on packet type and ready stock status
    let nextStatus
    let timelineMessage

    // Check if this is a partial packet with sections still pending
    if (packet.isPartial && packet.sectionsPending && packet.sectionsPending.length > 0) {
      // Partial packet - some sections still awaiting material
      // Update section statuses for the approved sections to READY_FOR_DYEING
      const orderItem = mockOrderItems.find((oi) => oi.id === id)
      if (orderItem && orderItem.sectionStatuses) {
        packet.sectionsIncluded.forEach((section) => {
          const sectionKey = section.toLowerCase()
          if (orderItem.sectionStatuses[sectionKey]) {
            // Set to READY_FOR_DYEING instead of PACKET_VERIFIED
            orderItem.sectionStatuses[sectionKey].status = SECTION_STATUS.READY_FOR_DYEING
            orderItem.sectionStatuses[sectionKey].updatedAt = now
          }
        })
      }

      if (isReadyStock) {
        nextStatus = ORDER_ITEM_STATUS.QUALITY_ASSURANCE
        timelineMessage = `Partial packet approved for sections: ${packet.sectionsIncluded.join(", ")}. Moving to QA. Pending: ${packet.sectionsPending.join(", ")}`
      } else {
        // Changed from PARTIAL_IN_PRODUCTION to PARTIALLY_IN_DYEING
        nextStatus = ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING
        timelineMessage = `Partial packet approved for sections: ${packet.sectionsIncluded.join(", ")}. Moving to dyeing. Pending: ${packet.sectionsPending.join(", ")}`
      }
    } else {
      // Full packet OR partial packet with all sections now complete
      // IMPORTANT: Only update sections that need updating - don't reset sections
      // that have already progressed beyond PACKET_VERIFIED (e.g., in dyeing or completed)
      const orderItem = mockOrderItems.find((oi) => oi.id === id)
      if (orderItem && orderItem.sectionStatuses) {
        // Determine which sections to update based on packet round
        const sectionsToUpdate =
          packet.packetRound > 1
            ? packet.currentRoundSections || packet.sectionsIncluded || []
            : Object.keys(orderItem.sectionStatuses)

        // Statuses that should NOT be overwritten (already beyond packet verification)
        const protectedStatuses = [
          SECTION_STATUS.READY_FOR_DYEING,
          SECTION_STATUS.DYEING_ACCEPTED,
          SECTION_STATUS.DYEING_IN_PROGRESS,
          SECTION_STATUS.DYEING_COMPLETED,
          SECTION_STATUS.READY_FOR_PRODUCTION,
          SECTION_STATUS.IN_PRODUCTION,
          SECTION_STATUS.PRODUCTION_COMPLETED,
          SECTION_STATUS.QA_PENDING,
          SECTION_STATUS.QA_APPROVED,
          SECTION_STATUS.COMPLETED,
        ]

        sectionsToUpdate.forEach((section) => {
          const sectionKey = section.toLowerCase()
          if (orderItem.sectionStatuses[sectionKey]) {
            const currentStatus = orderItem.sectionStatuses[sectionKey].status
            // Only update if the section is NOT already in a protected status
            if (!protectedStatuses.includes(currentStatus)) {
              orderItem.sectionStatuses[sectionKey].status = SECTION_STATUS.READY_FOR_DYEING
              orderItem.sectionStatuses[sectionKey].updatedAt = now
            }
          }
        })
      }

      if (isReadyStock) {
        nextStatus = ORDER_ITEM_STATUS.QUALITY_ASSURANCE
        timelineMessage = "Packet approved - Moving to Quality Assurance for client photos/videos"
      } else {
        // Changed from READY_FOR_PRODUCTION to READY_FOR_DYEING
        // But we need to check if some sections are already beyond dyeing
        // to determine the correct overall status
        if (orderItem && orderItem.sectionStatuses) {
          const sectionStatuses = Object.values(orderItem.sectionStatuses)
          const hasDyeingCompleted = sectionStatuses.some(
            (s) => s.status === SECTION_STATUS.DYEING_COMPLETED
          )
          const hasInDyeing = sectionStatuses.some((s) =>
            [SECTION_STATUS.DYEING_ACCEPTED, SECTION_STATUS.DYEING_IN_PROGRESS].includes(s.status)
          )
          const hasReadyForDyeing = sectionStatuses.some(
            (s) => s.status === SECTION_STATUS.READY_FOR_DYEING
          )

          if (hasDyeingCompleted && !hasReadyForDyeing && !hasInDyeing) {
            // All sections completed dyeing
            nextStatus = ORDER_ITEM_STATUS.DYEING_COMPLETED
            timelineMessage = "Packet approved - All sections completed dyeing"
          } else if (hasInDyeing || hasDyeingCompleted) {
            // Mixed state - some in dyeing, some ready for dyeing
            nextStatus = ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING
            timelineMessage = `Packet approved for ${packet.currentRoundSections?.join(", ") || "remaining sections"}. Some sections already in/completed dyeing.`
          } else {
            nextStatus = ORDER_ITEM_STATUS.READY_FOR_DYEING
            timelineMessage = "Packet approved - Ready for dyeing"
          }
        } else {
          nextStatus = ORDER_ITEM_STATUS.READY_FOR_DYEING
          timelineMessage = "Packet approved - Ready for dyeing"
        }
      }
    }

    // Update order item status
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
    if (orderItemIndex !== -1) {
      mockOrderItems[orderItemIndex].status = nextStatus
      mockOrderItems[orderItemIndex].updatedAt = now
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: timelineMessage,
        user: user?.name || "Production Head",
        timestamp: now,
      })
    }

    addPacketTimeline(
      packet,
      "Packet approved",
      user?.name || "Production Head",
      `Verified and approved. Next: ${nextStatus}`
    )

    return HttpResponse.json({
      success: true,
      data: {
        packet,
        nextStatus,
      },
      message: `Packet approved. Moving to ${nextStatus}`,
    })
  }
)

/**
 * POST /api/order-items/:id/packet/reject
 * Production head rejects the packet
 * 
 * UPDATED: Now handles section-level rejection for partial packets (Round 2+)
 * - Only resets pickList items for current round sections
 * - Only updates section statuses for current round sections
 * - Preserves sections that have already moved to dyeing/production
 */
const rejectPacket = http.post(
  "/api/order-items/:id/packet/reject",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const data = await request.json()
    const { userId, reasonCode, reason, notes } = data

    if (!reasonCode || !reason) {
      return HttpResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Rejection reason is required",
        },
        { status: 400 }
      )
    }

    const packet = getPacketByOrderItemId(id)

    if (!packet) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No packet found for order item ${id}`,
        },
        { status: 404 }
      )
    }

    if (packet.status !== PACKET_STATUS.COMPLETED) {
      return HttpResponse.json(
        {
          success: false,
          error: "Invalid status",
          message: `Cannot reject packet in ${packet.status} status. Must be COMPLETED.`,
        },
        { status: 400 }
      )
    }

    const user = findUser(userId)
    const now = new Date().toISOString()

    // Determine which sections are being rejected
    // For Round 2+, only the currentRoundSections are being verified/rejected
    // For Round 1, all sectionsIncluded are being verified/rejected
    const sectionsBeingRejected =
      packet.packetRound > 1 && packet.currentRoundSections?.length > 0
        ? packet.currentRoundSections
        : packet.sectionsIncluded?.length > 0
          ? packet.sectionsIncluded
          : [] // Full packet - all sections

    const isPartialRejection = packet.packetRound > 1 && sectionsBeingRejected.length > 0

    console.log("[Packet Reject] Packet round:", packet.packetRound)
    console.log("[Packet Reject] Sections being rejected:", sectionsBeingRejected)
    console.log("[Packet Reject] Is partial rejection:", isPartialRejection)

    // Update packet metadata
    packet.checkedBy = userId
    packet.checkedByName = user?.name || "Production Head"
    packet.checkedAt = now
    packet.checkResult = "REJECTED"
    packet.rejectionReason = reason
    packet.rejectionReasonCode = reasonCode
    packet.rejectionNotes = notes || ""
    packet.completedAt = null // Clear completion
    packet.updatedAt = now

    if (isPartialRejection) {
      // ============================================================
      // PARTIAL REJECTION (Round 2+): Only affect current round sections
      // ============================================================

      // Reset ONLY pickList items for the sections being rejected
      const sectionsLower = sectionsBeingRejected.map((s) => s.toLowerCase())
      let resetItemCount = 0

      packet.pickList.forEach((item) => {
        const itemSection = (item.piece || "").toLowerCase()
        if (sectionsLower.includes(itemSection)) {
          item.isPicked = false
          item.pickedQty = 0
          item.pickedAt = null
          item.notes = ""
          resetItemCount++
        }
      })

      // Update pickedItems count - count items that are still picked
      packet.pickedItems = packet.pickList.filter((item) => item.isPicked).length

      // Keep packet in ASSIGNED status so fabrication user can rework only the rejected sections
      packet.status = PACKET_STATUS.ASSIGNED

      console.log("[Packet Reject] Reset", resetItemCount, "pickList items for sections:", sectionsBeingRejected)

      // Update ONLY the rejected sections' status in the order item
      const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
      if (orderItemIndex !== -1) {
        const orderItem = mockOrderItems[orderItemIndex]

        // Update section statuses for rejected sections only
        sectionsBeingRejected.forEach((section) => {
          const sectionKey = section.toLowerCase()
          if (orderItem.sectionStatuses && orderItem.sectionStatuses[sectionKey]) {
            // Reset section to CREATE_PACKET (ready for packet re-work)
            orderItem.sectionStatuses[sectionKey] = {
              ...orderItem.sectionStatuses[sectionKey],
              status: SECTION_STATUS.CREATE_PACKET,
              packetRejectedAt: now,
              packetRejectionReason: reason,
              packetRejectionNotes: notes || "",
              packetRejectedBy: user?.name || "Production Head",
              updatedAt: now,
            }
          }
        })

        // Determine overall order item status based on all section statuses
        const allSectionStatuses = Object.values(orderItem.sectionStatuses || {})
        
        // Check what states sections are in
        const hasInDyeing = allSectionStatuses.some((s) =>
          [
            SECTION_STATUS.READY_FOR_DYEING,
            SECTION_STATUS.DYEING_ACCEPTED,
            SECTION_STATUS.DYEING_IN_PROGRESS,
            SECTION_STATUS.DYEING_COMPLETED,
          ].includes(s.status)
        )
        const hasCreatePacket = allSectionStatuses.some(
          (s) => s.status === SECTION_STATUS.CREATE_PACKET
        )
        const hasReadyForProduction = allSectionStatuses.some(
          (s) => s.status === SECTION_STATUS.READY_FOR_PRODUCTION
        )

        // Set appropriate mixed status
        if (hasInDyeing && hasCreatePacket) {
          orderItem.status = ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING
        } else if (hasReadyForProduction && hasCreatePacket) {
          orderItem.status = ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION
        } else if (hasCreatePacket) {
          orderItem.status = ORDER_ITEM_STATUS.CREATE_PACKET
        }

        orderItem.updatedAt = now
        orderItem.timeline.push({
          id: `log-${Date.now()}`,
          action: `Packet rejected for sections: ${sectionsBeingRejected.join(", ")} - ${reason}`,
          user: user?.name || "Production Head",
          timestamp: now,
          details: notes || "",
        })
      }

      addPacketTimeline(
        packet,
        `Packet rejected for sections: ${sectionsBeingRejected.join(", ")}`,
        user?.name || "Production Head",
        `Reason: ${reason}${notes ? `. Notes: ${notes}` : ""}`
      )

      return HttpResponse.json({
        success: true,
        data: packet,
        message: `Packet rejected for sections: ${sectionsBeingRejected.join(", ")}. Sent back to ${packet.assignedToName} for correction.`,
      })
    } else {
      // ============================================================
      // FULL REJECTION (Round 1 or non-partial packet): Original behavior
      // ============================================================

      // Reset packet for rework
      packet.status = PACKET_STATUS.ASSIGNED // Back to assigned state

      // Reset ALL pick list items for re-verification
      packet.pickList.forEach((item) => {
        item.isPicked = false
        item.pickedQty = 0
        item.pickedAt = null
        item.notes = ""
      })
      packet.pickedItems = 0

      // Update order item back to CREATE_PACKET
      const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
      if (orderItemIndex !== -1) {
        mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.CREATE_PACKET
        mockOrderItems[orderItemIndex].updatedAt = now
        mockOrderItems[orderItemIndex].timeline.push({
          id: `log-${Date.now()}`,
          action: `Packet rejected - ${reason}`,
          user: user?.name || "Production Head",
          timestamp: now,
        })

        // Reset ALL section statuses to CREATE_PACKET
        const orderItem = mockOrderItems[orderItemIndex]
        if (orderItem.sectionStatuses) {
          Object.keys(orderItem.sectionStatuses).forEach((sectionKey) => {
            orderItem.sectionStatuses[sectionKey] = {
              ...orderItem.sectionStatuses[sectionKey],
              status: SECTION_STATUS.CREATE_PACKET,
              packetRejectedAt: now,
              packetRejectionReason: reason,
              packetRejectionNotes: notes || "",
              packetRejectedBy: user?.name || "Production Head",
              updatedAt: now,
            }
          })
        }
      }

      addPacketTimeline(
        packet,
        "Packet rejected",
        user?.name || "Production Head",
        `Reason: ${reason}${notes ? `. Notes: ${notes}` : ""}`
      )

      return HttpResponse.json({
        success: true,
        data: packet,
        message: `Packet rejected. Sent back to ${packet.assignedToName} for correction.`,
      })
    }
  }
)

/**
 * POST /api/order-items/:id/packet/approve-section
 * Approve specific sections of a partial packet (for granular control)
 */
const approveSectionPacket = http.post(
  "/api/order-items/:id/packet/approve-section",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const data = await request.json()
    const { userId, sections } = data // sections is array of section names to approve

    if (!sections || sections.length === 0) {
      return HttpResponse.json({ success: false, error: "No sections specified" }, { status: 400 })
    }

    const packet = getPacketByOrderItemId(id)
    if (!packet) {
      return HttpResponse.json({ success: false, error: "No packet found" }, { status: 404 })
    }

    const user = findUser(userId)
    const now = new Date().toISOString()

    // Update section statuses
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === id)
    if (orderItemIndex !== -1) {
      const orderItem = mockOrderItems[orderItemIndex]

      sections.forEach((section) => {
        const sectionKey = section.toLowerCase()
        if (orderItem.sectionStatuses && orderItem.sectionStatuses[sectionKey]) {
          // Set to READY_FOR_DYEING instead of PACKET_VERIFIED
          orderItem.sectionStatuses[sectionKey].status = SECTION_STATUS.READY_FOR_DYEING
          orderItem.sectionStatuses[sectionKey].updatedAt = now
        }
      })

      // Add timeline
      orderItem.timeline.push({
        id: `log-${Date.now()}`,
        action: `Partial packet verified for sections: ${sections.join(", ")}`,
        user: user?.name || "Production Head",
        timestamp: now,
      })

      orderItem.updatedAt = now
    }

    addPacketTimeline(
      packet,
      `Sections verified: ${sections.join(", ")}`,
      user?.name || "Production Head",
      `Approved by ${user?.name || "Production Head"}`
    )

    return HttpResponse.json({
      success: true,
      data: { packet, verifiedSections: sections },
      message: `Sections ${sections.join(", ")} verified successfully`,
    })
  }
)

// ============================================================================
// EXPORT
// ============================================================================

export const packetHandlers = [
  getPackets,
  getMyPacketTasks,
  getPacketCheckQueue,
  getOrderItemPacket,
  assignPacket,
  startPacket,
  pickItem,
  completePacket,
  approvePacket,
  approveSectionPacket,
  rejectPacket,
]
