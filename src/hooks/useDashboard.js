/**
 * React Query Hooks for Dashboard
 * Phase 17 — Admin Dashboard widgets
 */

import { useQuery } from "@tanstack/react-query"
import {
  getOrderFunnel,
  getProductionPipeline,
  getInventoryAlerts,
  getQAMetrics,
  getSalesSummary,
  getRecentActivity,
} from "@/services/api/dashboardApi"

// Query keys
export const dashboardKeys = {
  all: ["dashboard"],
  orderFunnel: () => [...dashboardKeys.all, "order-funnel"],
  productionPipeline: () => [...dashboardKeys.all, "production-pipeline"],
  inventoryAlerts: () => [...dashboardKeys.all, "inventory-alerts"],
  qaMetrics: () => [...dashboardKeys.all, "qa-metrics"],
  salesSummary: () => [...dashboardKeys.all, "sales-summary"],
  recentActivity: (limit) => [...dashboardKeys.all, "recent-activity", limit],
}

// Reasonably fresh — dashboard data changes constantly but we don't need to refetch on every focus
const STALE_TIME = 60 * 1000 // 1 minute

export const useOrderFunnel = () => {
  return useQuery({
    queryKey: dashboardKeys.orderFunnel(),
    queryFn: getOrderFunnel,
    staleTime: STALE_TIME,
  })
}

export const useProductionPipeline = () => {
  return useQuery({
    queryKey: dashboardKeys.productionPipeline(),
    queryFn: getProductionPipeline,
    staleTime: STALE_TIME,
  })
}

export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.inventoryAlerts(),
    queryFn: getInventoryAlerts,
    staleTime: STALE_TIME,
  })
}

export const useQAMetrics = () => {
  return useQuery({
    queryKey: dashboardKeys.qaMetrics(),
    queryFn: getQAMetrics,
    staleTime: STALE_TIME,
  })
}

export const useSalesSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.salesSummary(),
    queryFn: getSalesSummary,
    staleTime: STALE_TIME,
  })
}

export const useRecentActivity = (limit = 20) => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: () => getRecentActivity(limit),
    staleTime: STALE_TIME,
  })
}