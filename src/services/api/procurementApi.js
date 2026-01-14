import { httpClient } from "@/services/http/httpClient"

// Get all procurement demands
export const fetchProcurementDemands = (params = {}) => {
  return httpClient.get("/procurement-demands", { params })
}

// Get single procurement demand
export const fetchProcurementDemandById = (id) => {
  return httpClient.get(`/procurement-demands/${id}`)
}

// Update procurement demand (status, notes, etc.)
export const updateProcurementDemand = (id, data) => {
  return httpClient.patch(`/procurement-demands/${id}`, data)
}

// Delete procurement demand
export const deleteProcurementDemand = (id) => {
  return httpClient.delete(`/procurement-demands/${id}`)
}

// Get procurement stats
export const fetchProcurementStats = () => {
  return httpClient.get("/procurement-demands/stats")
}

// Run inventory check on an order item
export const runInventoryCheck = (orderItemId, data = {}) => {
  return httpClient.post(`/order-items/${orderItemId}/inventory-check`, data)
}
