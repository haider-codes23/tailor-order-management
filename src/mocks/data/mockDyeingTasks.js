/**
 * Mock Dyeing Tasks Data
 * src/mocks/data/mockDyeingTasks.js
 *
 * Phase 12.5: Dyeing Department
 *
 * This file contains mock data and helper functions for dyeing tasks.
 * Dyeing tasks are created when sections move from PACKET_VERIFIED to READY_FOR_DYEING.
 */

import { SECTION_STATUS } from "../../constants/orderConstants"

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

/**
 * Mock dyeing tasks array
 * Each task represents an order item that has sections ready for dyeing
 */
export const mockDyeingTasks = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique dyeing task ID
 */
export const generateDyeingTaskId = () => {
  return `dye-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new dyeing task for an order item
 * Called when sections transition from PACKET_VERIFIED to READY_FOR_DYEING
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} orderId - The parent order ID
 * @param {Array} sections - Array of section names that are ready for dyeing
 * @param {Object} orderItemDetails - Additional order item details for display
 * @returns {Object} - The created dyeing task
 */
export const createDyeingTask = (orderItemId, orderId, sections, orderItemDetails = {}) => {
  const now = new Date().toISOString()

  const task = {
    id: generateDyeingTaskId(),
    orderItemId,
    orderId,

    // Order item details for display
    productName: orderItemDetails.productName || "Unknown Product",
    productSku: orderItemDetails.productSku || "",
    productImage: orderItemDetails.productImage || null,
    customerName: orderItemDetails.customerName || "Unknown Customer",
    size: orderItemDetails.size || "",
    quantity: orderItemDetails.quantity || 1,
    fwdDate: orderItemDetails.fwdDate || null,
    orderNumber: orderItemDetails.orderNumber || "",

    // Priority (can be set by admin)
    priority: orderItemDetails.priority || null, // null, "LOW", "NORMAL", "HIGH", "URGENT"

    // Sections with individual tracking
    sections: sections.map((sectionName) => ({
      name: sectionName,
      status: SECTION_STATUS.READY_FOR_DYEING,
      round: 1,

      // Acceptance tracking
      acceptedAt: null,
      acceptedBy: null,
      acceptedByName: null,

      // Progress tracking
      startedAt: null,
      completedAt: null,

      // Rejection tracking
      rejectedAt: null,
      rejectedBy: null,
      rejectedByName: null,
      rejectionReasonCode: null,
      rejectionReason: null,
      rejectionNotes: null,

      // Reassignment tracking (for rejected sections that come back)
      previousFabricationUserId: null,
      previousFabricationUserName: null,
    })),

    // Task assignment
    assignedTo: null,
    assignedToName: null,
    assignedAt: null,

    // Timestamps
    createdAt: now,
    updatedAt: now,

    // Timeline for audit trail
    timeline: [
      {
        id: `timeline-${Date.now()}`,
        action: "TASK_CREATED",
        message: `Dyeing task created for sections: ${sections.join(", ")}`,
        user: "System",
        timestamp: now,
      },
    ],
  }

  return task
}

/**
 * Get dyeing task by order item ID
 */
export const getDyeingTaskByOrderItemId = (orderItemId) => {
  return mockDyeingTasks.find((task) => task.orderItemId === orderItemId)
}

/**
 * Get all available tasks (not yet accepted, with sections in READY_FOR_DYEING)
 */
export const getAvailableDyeingTasks = () => {
  return mockDyeingTasks.filter((task) => {
    // Task is available if it has any sections in READY_FOR_DYEING status
    return task.sections.some((s) => s.status === SECTION_STATUS.READY_FOR_DYEING)
  })
}

/**
 * Get tasks assigned to a specific user
 */
export const getDyeingTasksByUserId = (userId) => {
  return mockDyeingTasks.filter((task) => {
    return task.assignedTo === userId || task.assignedTo === String(userId)
  })
}

/**
 * Get completed tasks (all sections in DYEING_COMPLETED or READY_FOR_PRODUCTION)
 */
export const getCompletedDyeingTasks = (userId = null) => {
  return mockDyeingTasks.filter((task) => {
    // If userId provided, filter by user
    if (userId && task.assignedTo !== userId && task.assignedTo !== String(userId)) {
      return false
    }

    // Check if all sections that were accepted are now completed
    const acceptedSections = task.sections.filter(
      (s) => s.acceptedBy !== null && s.status !== SECTION_STATUS.DYEING_REJECTED
    )

    if (acceptedSections.length === 0) return false

    return acceptedSections.every(
      (s) =>
        s.status === SECTION_STATUS.DYEING_COMPLETED ||
        s.status === SECTION_STATUS.READY_FOR_PRODUCTION
    )
  })
}

/**
 * Add timeline entry to a dyeing task
 */
export const addDyeingTaskTimeline = (task, action, message, user = "System", details = {}) => {
  task.timeline.push({
    id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    message,
    user,
    timestamp: new Date().toISOString(),
    ...details,
  })
  task.updatedAt = new Date().toISOString()
}

/**
 * Add sections to existing task (for Round 2+ when rejected sections come back)
 */
export const addSectionsToDyeingTask = (task, newSections, previousFabricationUser = null) => {
  const now = new Date().toISOString()

  newSections.forEach((sectionName) => {
    // Check if section already exists in task
    const existingSection = task.sections.find(
      (s) => s.name.toLowerCase() === sectionName.toLowerCase()
    )

    if (existingSection) {
      // Update existing section for a new round
      existingSection.status = SECTION_STATUS.READY_FOR_DYEING
      existingSection.round = (existingSection.round || 1) + 1
      existingSection.acceptedAt = null
      existingSection.acceptedBy = null
      existingSection.acceptedByName = null
      existingSection.startedAt = null
      existingSection.completedAt = null
      existingSection.rejectedAt = null
      existingSection.rejectedBy = null
      existingSection.rejectedByName = null
      existingSection.rejectionReasonCode = null
      existingSection.rejectionReason = null
      existingSection.rejectionNotes = null
      existingSection.previousFabricationUserId = previousFabricationUser?.id || null
      existingSection.previousFabricationUserName = previousFabricationUser?.name || null
    } else {
      // Add new section
      task.sections.push({
        name: sectionName,
        status: SECTION_STATUS.READY_FOR_DYEING,
        round: 1,
        acceptedAt: null,
        acceptedBy: null,
        acceptedByName: null,
        startedAt: null,
        completedAt: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectedByName: null,
        rejectionReasonCode: null,
        rejectionReason: null,
        rejectionNotes: null,
        previousFabricationUserId: previousFabricationUser?.id || null,
        previousFabricationUserName: previousFabricationUser?.name || null,
      })
    }
  })

  addDyeingTaskTimeline(
    task,
    "SECTIONS_ADDED",
    `Sections added to dyeing task: ${newSections.join(", ")} (Round ${task.sections[0]?.round || 1})`,
    "System"
  )

  task.updatedAt = now
}

/**
 * Check if user should be auto-assigned (Round 2+ scenarios)
 * Returns the user ID to auto-assign to, or null if no auto-assignment needed
 */
export const getAutoAssignUserId = (task, activeUserIds = []) => {
  // If task already has an assigned user and they're active, auto-assign to them
  if (task.assignedTo && activeUserIds.includes(String(task.assignedTo))) {
    return task.assignedTo
  }

  // If assigned user is not active, return null (task goes to available pool)
  return null
}

/**
 * Calculate task statistics
 */
export const getDyeingTaskStats = (userId = null) => {
  const tasks = userId ? getDyeingTasksByUserId(userId) : mockDyeingTasks

  let availableCount = 0
  let acceptedCount = 0
  let inProgressCount = 0
  let completedCount = 0

  mockDyeingTasks.forEach((task) => {
    task.sections.forEach((section) => {
      switch (section.status) {
        case SECTION_STATUS.READY_FOR_DYEING:
          availableCount++
          break
        case SECTION_STATUS.DYEING_ACCEPTED:
          acceptedCount++
          break
        case SECTION_STATUS.DYEING_IN_PROGRESS:
          inProgressCount++
          break
        case SECTION_STATUS.DYEING_COMPLETED:
          completedCount++
          break
        default:
          break
      }
    })
  })

  return {
    availableCount,
    acceptedCount,
    inProgressCount,
    completedCount,
    totalTasks: mockDyeingTasks.length,
  }
}
