import { http, HttpResponse } from "msw"
import {
  mockProcurementDemands,
  generateProcurementDemandId,
  getProcurementDemandById,
} from "../data/mockProcurementDemands"

const BASE_URL = "/api"

export const procurementHandlers = [
  // Get all procurement demands
  http.get(`${BASE_URL}/procurement-demands`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const orderId = url.searchParams.get("orderId")
    const orderItemId = url.searchParams.get("orderItemId")

    let filtered = [...mockProcurementDemands]

    if (status) {
      filtered = filtered.filter((pd) => pd.status === status)
    }
    if (orderId) {
      filtered = filtered.filter((pd) => pd.orderId === orderId)
    }
    if (orderItemId) {
      filtered = filtered.filter((pd) => pd.orderItemId === orderItemId)
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return HttpResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    })
  }),

  // IMPORTANT: Stats endpoint MUST come BEFORE :id endpoint!
  // Get procurement summary/stats
  http.get(`${BASE_URL}/procurement-demands/stats`, () => {
    const stats = {
      total: mockProcurementDemands.length,
      open: mockProcurementDemands.filter((pd) => pd.status === "OPEN").length,
      ordered: mockProcurementDemands.filter((pd) => pd.status === "ORDERED").length,
      received: mockProcurementDemands.filter((pd) => pd.status === "RECEIVED").length,
      cancelled: mockProcurementDemands.filter((pd) => pd.status === "CANCELLED").length,
    }
    return HttpResponse.json({ success: true, data: stats })
  }),

  // Get single procurement demand - MUST come AFTER /stats
  http.get(`${BASE_URL}/procurement-demands/:id`, ({ params }) => {
    const demand = getProcurementDemandById(params.id)
    if (!demand) {
      return HttpResponse.json({ error: "Procurement demand not found" }, { status: 404 })
    }
    return HttpResponse.json({ success: true, data: demand })
  }),

  // Update procurement demand status
  http.patch(`${BASE_URL}/procurement-demands/:id`, async ({ params, request }) => {
    const data = await request.json()
    const index = mockProcurementDemands.findIndex((pd) => pd.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: "Procurement demand not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    mockProcurementDemands[index] = {
      ...mockProcurementDemands[index],
      ...data,
      updatedAt: now,
    }

    return HttpResponse.json({
      success: true,
      data: mockProcurementDemands[index],
    })
  }),

  // Delete procurement demand
  http.delete(`${BASE_URL}/procurement-demands/:id`, ({ params }) => {
    const index = mockProcurementDemands.findIndex((pd) => pd.id === params.id)

    if (index === -1) {
      return HttpResponse.json({ error: "Procurement demand not found" }, { status: 404 })
    }

    mockProcurementDemands.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),
]
