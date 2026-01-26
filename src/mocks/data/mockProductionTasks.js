/**
 * Mock Production Tasks Data
 * src/mocks/data/mockProductionTasks.js
 *
 * Phase 13: Production Workflow
 * Contains mock data for production tasks, assignments, and round-robin state
 */

import { PRODUCTION_TASK_TYPES, PRODUCTION_TASK_STATUS } from "@/constants/orderConstants"

// ============================================================================
// ROUND ROBIN STATE
// ============================================================================

/**
 * Global round-robin state for production head assignment
 * Cycles through active production heads
 */
export let roundRobinState = {
  lastAssignedIndex: -1, // Start at -1 so first assignment goes to index 0
  // Production head IDs in order (Mike=3, Bilal=11, Hira=12)
  productionHeadIds: [3, 11, 12],
  updatedAt: new Date().toISOString(),
}

/**
 * Get next production head ID using round-robin
 * @returns {number} Next production head user ID
 */
export const getNextProductionHeadId = () => {
  const nextIndex =
    (roundRobinState.lastAssignedIndex + 1) % roundRobinState.productionHeadIds.length
  return roundRobinState.productionHeadIds[nextIndex]
}

/**
 * Advance round-robin to next production head
 * @returns {number} The assigned production head ID
 */
export const advanceRoundRobin = () => {
  roundRobinState.lastAssignedIndex =
    (roundRobinState.lastAssignedIndex + 1) % roundRobinState.productionHeadIds.length
  roundRobinState.updatedAt = new Date().toISOString()
  return roundRobinState.productionHeadIds[roundRobinState.lastAssignedIndex]
}

/**
 * Reset round-robin state (for testing)
 */
export const resetRoundRobin = () => {
  roundRobinState.lastAssignedIndex = -1
  roundRobinState.updatedAt = new Date().toISOString()
}

// ============================================================================
// PRODUCTION ASSIGNMENTS
// ============================================================================

/**
 * Tracks which production head is assigned to which order item
 */
export let mockProductionAssignments = [
  // Example assignment (can be empty initially)
  // {
  //   id: "assign-001",
  //   orderItemId: "item-001",
  //   productionHeadId: 3,
  //   productionHeadName: "Mike Supervisor",
  //   assignedAt: "2025-01-25T10:00:00Z",
  //   assignedBy: 1,
  //   assignedByName: "Admin User",
  // },
]

/**
 * Get assignment for an order item
 */
export const getAssignmentByOrderItemId = (orderItemId) => {
  return mockProductionAssignments.find(
    (a) => a.orderItemId === orderItemId || a.orderItemId === String(orderItemId)
  )
}

/**
 * Get all assignments for a production head
 */
export const getAssignmentsByProductionHeadId = (productionHeadId) => {
  return mockProductionAssignments.filter(
    (a) =>
      a.productionHeadId === productionHeadId || a.productionHeadId === parseInt(productionHeadId)
  )
}

/**
 * Create a new production assignment
 */
export const createProductionAssignment = (assignment) => {
  const newAssignment = {
    id: `assign-${Date.now()}`,
    ...assignment,
    assignedAt: new Date().toISOString(),
  }
  mockProductionAssignments.push(newAssignment)
  return newAssignment
}

// ============================================================================
// PRODUCTION TASKS
// ============================================================================

/**
 * All production tasks across all order items/sections
 */
export let mockProductionTasks = [
  // Example tasks (can be empty initially, or add sample data)
  // {
  //   id: "task-001",
  //   orderItemId: "item-001",
  //   sectionName: "Shirt",
  //   taskType: PRODUCTION_TASK_TYPES.CUTTING_WORK,
  //   customTaskName: null,
  //   sequenceOrder: 1,
  //   notes: "Handle with care",
  //   assignedToId: 4,
  //   assignedToName: "John Worker",
  //   assignedAt: "2025-01-25T10:00:00Z",
  //   assignedBy: 3,
  //   assignedByName: "Mike Supervisor",
  //   status: PRODUCTION_TASK_STATUS.COMPLETED,
  //   startedAt: "2025-01-25T10:30:00Z",
  //   completedAt: "2025-01-25T11:45:00Z",
  //   duration: 75, // minutes
  //   createdAt: "2025-01-25T10:00:00Z",
  //   updatedAt: "2025-01-25T11:45:00Z",
  // },
]

// ============================================================================
// TASK HELPER FUNCTIONS
// ============================================================================

/**
 * Get all tasks for an order item
 */
export const getTasksByOrderItemId = (orderItemId) => {
  return mockProductionTasks.filter(
    (t) => t.orderItemId === orderItemId || t.orderItemId === String(orderItemId)
  )
}

/**
 * Get all tasks for a specific section of an order item
 */
export const getTasksBySection = (orderItemId, sectionName) => {
  return mockProductionTasks
    .filter(
      (t) =>
        (t.orderItemId === orderItemId || t.orderItemId === String(orderItemId)) &&
        t.sectionName.toLowerCase() === sectionName.toLowerCase()
    )
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
}

/**
 * Get all tasks assigned to a worker
 */
export const getTasksByWorkerId = (workerId) => {
  return mockProductionTasks.filter(
    (t) => t.assignedToId === workerId || t.assignedToId === parseInt(workerId)
  )
}

/**
 * Get a specific task by ID
 */
export const getTaskById = (taskId) => {
  return mockProductionTasks.find((t) => t.id === taskId || t.id === String(taskId))
}

/**
 * Create new tasks for a section (bulk creation)
 * @param {string} orderItemId
 * @param {string} sectionName
 * @param {Array} tasks - Array of task objects with taskType, customTaskName, assignedToId, notes
 * @param {Object} assignedBy - User creating the tasks
 * @returns {Array} Created tasks
 */
export const createTasksForSection = (orderItemId, sectionName, tasks, assignedBy) => {
  const now = new Date().toISOString()
  const createdTasks = []

  tasks.forEach((task, index) => {
    const newTask = {
      id: `task-${Date.now()}-${index}`,
      orderItemId: String(orderItemId),
      sectionName: sectionName,
      taskType: task.taskType,
      customTaskName: task.taskType === PRODUCTION_TASK_TYPES.CUSTOM ? task.customTaskName : null,
      sequenceOrder: index + 1, // 1-based sequence
      notes: task.notes || null,
      assignedToId: task.assignedToId,
      assignedToName: task.assignedToName,
      assignedAt: now,
      assignedBy: assignedBy.id,
      assignedByName: assignedBy.name,
      // First task is READY, others are PENDING
      status: index === 0 ? PRODUCTION_TASK_STATUS.READY : PRODUCTION_TASK_STATUS.PENDING,
      startedAt: null,
      completedAt: null,
      duration: null,
      createdAt: now,
      updatedAt: now,
    }
    mockProductionTasks.push(newTask)
    createdTasks.push(newTask)
  })

  return createdTasks
}

/**
 * Start a task
 * @param {string} taskId
 * @returns {Object} Updated task
 */
export const startTask = (taskId) => {
  const taskIndex = mockProductionTasks.findIndex((t) => t.id === taskId || t.id === String(taskId))

  if (taskIndex === -1) return null

  const now = new Date().toISOString()
  mockProductionTasks[taskIndex] = {
    ...mockProductionTasks[taskIndex],
    status: PRODUCTION_TASK_STATUS.IN_PROGRESS,
    startedAt: now,
    updatedAt: now,
  }

  return mockProductionTasks[taskIndex]
}

/**
 * Complete a task and make the next task READY
 * @param {string} taskId
 * @returns {Object} { completedTask, nextTask, allTasksComplete }
 */
export const completeTask = (taskId) => {
  const taskIndex = mockProductionTasks.findIndex((t) => t.id === taskId || t.id === String(taskId))

  if (taskIndex === -1) return null

  const now = new Date().toISOString()
  const task = mockProductionTasks[taskIndex]

  // Calculate duration in minutes
  const startTime = new Date(task.startedAt)
  const endTime = new Date(now)
  const durationMinutes = Math.round((endTime - startTime) / (1000 * 60))

  // Complete the task
  mockProductionTasks[taskIndex] = {
    ...task,
    status: PRODUCTION_TASK_STATUS.COMPLETED,
    completedAt: now,
    duration: durationMinutes,
    updatedAt: now,
  }

  const completedTask = mockProductionTasks[taskIndex]

  // Find and update the next task in sequence (if any)
  const sectionTasks = getTasksBySection(task.orderItemId, task.sectionName)
  const nextTask = sectionTasks.find(
    (t) => t.sequenceOrder === task.sequenceOrder + 1 && t.status === PRODUCTION_TASK_STATUS.PENDING
  )

  if (nextTask) {
    const nextTaskIndex = mockProductionTasks.findIndex((t) => t.id === nextTask.id)
    mockProductionTasks[nextTaskIndex] = {
      ...mockProductionTasks[nextTaskIndex],
      status: PRODUCTION_TASK_STATUS.READY,
      updatedAt: now,
    }
  }

  // Check if all tasks for this section are complete
  const allTasksComplete = sectionTasks.every((t) =>
    t.id === taskId
      ? true // The task we just completed
      : t.status === PRODUCTION_TASK_STATUS.COMPLETED
  )

  return {
    completedTask,
    nextTask: nextTask ? mockProductionTasks.find((t) => t.id === nextTask.id) : null,
    allTasksComplete,
  }
}

/**
 * Update task (notes only, if not started)
 */
export const updateTask = (taskId, updates) => {
  const taskIndex = mockProductionTasks.findIndex((t) => t.id === taskId || t.id === String(taskId))

  if (taskIndex === -1) return null

  const task = mockProductionTasks[taskIndex]

  // Can only update notes if task hasn't started
  if (
    task.status !== PRODUCTION_TASK_STATUS.PENDING &&
    task.status !== PRODUCTION_TASK_STATUS.READY
  ) {
    return { error: "Cannot update task that has already started" }
  }

  mockProductionTasks[taskIndex] = {
    ...task,
    notes: updates.notes !== undefined ? updates.notes : task.notes,
    updatedAt: new Date().toISOString(),
  }

  return mockProductionTasks[taskIndex]
}

/**
 * Check if a section has all tasks completed
 */
export const isSectionProductionComplete = (orderItemId, sectionName) => {
  const tasks = getTasksBySection(orderItemId, sectionName)
  if (tasks.length === 0) return false
  return tasks.every((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED)
}

/**
 * Get task display name (handles custom tasks)
 */
export const getTaskDisplayName = (task) => {
  if (task.taskType === PRODUCTION_TASK_TYPES.CUSTOM) {
    return task.customTaskName || "Custom Task"
  }
  // Import config for label, or return formatted type
  return task.taskType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Format duration for display
 */
export const formatDuration = (minutes) => {
  if (!minutes) return "—"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Round Robin
  roundRobinState,
  getNextProductionHeadId,
  advanceRoundRobin,
  resetRoundRobin,

  // Assignments
  mockProductionAssignments,
  getAssignmentByOrderItemId,
  getAssignmentsByProductionHeadId,
  createProductionAssignment,

  // Tasks
  mockProductionTasks,
  getTasksByOrderItemId,
  getTasksBySection,
  getTasksByWorkerId,
  getTaskById,
  createTasksForSection,
  startTask,
  completeTask,
  updateTask,
  isSectionProductionComplete,
  getTaskDisplayName,
  formatDuration,
}
