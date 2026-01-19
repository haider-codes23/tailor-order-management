/**
 * Mock Procurement Demands Data
 * Stores material shortages that need to be procured
 */

/**
 * Procurement Demand Structure:
 * {
 *   id: string,
 *   orderId: string,
 *   orderItemId: string,
 *   inventoryItemId: number,
 *   inventoryItemName: string,
 *   inventoryItemSku: string,
 *   requiredQty: number,
 *   availableQty: number,
 *   shortageQty: number,
 *   unit: string,
 *   affectedSection: string,  // NEW - Which section this shortage affects (e.g., "Dupatta")
 *   status: "OPEN" | "ORDERED" | "RECEIVED" | "CANCELLED",
 *   createdAt: string,
 *   updatedAt: string,
 *   notes: string,
 * }
 */

export let mockProcurementDemands = []

// Helper functions
export const generateProcurementDemandId = () =>
  `pd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const getProcurementDemandById = (id) => mockProcurementDemands.find((pd) => pd.id === id)

export const getProcurementDemandsByOrderItem = (orderItemId) =>
  mockProcurementDemands.filter((pd) => pd.orderItemId === orderItemId)

export const getProcurementDemandsByStatus = (status) =>
  mockProcurementDemands.filter((pd) => pd.status === status)

export const addProcurementDemand = (demand) => {
  mockProcurementDemands.push(demand)
  return demand
}

export const updateProcurementDemand = (id, updates) => {
  const index = mockProcurementDemands.findIndex((pd) => pd.id === id)
  if (index !== -1) {
    mockProcurementDemands[index] = { ...mockProcurementDemands[index], ...updates }
    return mockProcurementDemands[index]
  }
  return null
}

export const deleteProcurementDemandsByOrderItem = (orderItemId) => {
  mockProcurementDemands = mockProcurementDemands.filter((pd) => pd.orderItemId !== orderItemId)
}
