/**
 * Shopify React Query Hooks — Phase 15
 * src/hooks/useShopify.js
 *
 * Custom hooks for Shopify integration features.
 * Uses React Query for caching, refetching, and mutations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import shopifyApi from "@/services/api/shopifyApi"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const shopifyKeys = {
  all: ["shopify"],
  settings: () => [...shopifyKeys.all, "settings"],
  orders: (params) => [...shopifyKeys.all, "orders", params],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch Shopify integration settings (admin only)
 */
export function useShopifySettings() {
  return useQuery({
    queryKey: shopifyKeys.settings(),
    queryFn: shopifyApi.getSettings,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch Shopify orders from the store
 * @param {Object} params - Filter params (limit, status, financial_status, fulfillment_status)
 */
export function useShopifyOrders(params = {}) {
  return useQuery({
    queryKey: shopifyKeys.orders(params),
    queryFn: () => shopifyApi.listShopifyOrders(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to test Shopify API connection
 */
export function useTestConnection() {
  return useMutation({
    mutationFn: shopifyApi.testConnection,
    onSuccess: (data) => {
      const shopName = data?.shop?.name || "Shopify"
      toast.success(`Connected to ${shopName}!`, {
        description: `Store: ${data?.shop?.domain || ""}`,
      })
    },
    onError: (err) => {
      toast.error("Connection failed", {
        description: err.message || "Could not connect to Shopify",
      })
    },
  })
}

/**
 * Hook to register webhooks
 */
export function useRegisterWebhooks() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (baseUrl) => shopifyApi.registerWebhooks(baseUrl),
    onSuccess: (data) => {
      toast.success(`${data?.registered || 0} webhook(s) registered`)
      qc.invalidateQueries({ queryKey: shopifyKeys.settings() })
    },
    onError: (err) => {
      toast.error("Webhook registration failed", {
        description: err.message,
      })
    },
  })
}

/**
 * Hook to sync products from Shopify
 */
export function useSyncProducts() {
  return useMutation({
    mutationFn: shopifyApi.syncProducts,
    onSuccess: (data) => {
      const s = data?.summary || {}
      toast.success("Product sync complete", {
        description: `${s.created || 0} created, ${s.linked || 0} linked, ${s.skipped || 0} skipped`,
      })
    },
    onError: (err) => {
      toast.error("Product sync failed", { description: err.message })
    },
  })
}

/**
 * Hook to import a Shopify order into the internal system
 */
export function useImportShopifyOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (shopifyOrderId) => shopifyApi.importShopifyOrder(shopifyOrderId),
    onSuccess: (data) => {
      const orderNumber = data?.order?.orderNumber || "Order"
      toast.success(`${orderNumber} imported!`, {
        description: "Shopify order has been imported into the system.",
      })

      // Invalidate both shopify orders and internal orders lists
      qc.invalidateQueries({ queryKey: shopifyKeys.all })
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err) => {
      toast.error("Import failed", { description: err.message })
    },
  })
}

/**
 * Hook to sync a manual order to Shopify
 */
export function useSyncOrderToShopify() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (orderId) => shopifyApi.syncOrderToShopify(orderId),
    onSuccess: (data) => {
      toast.success(`Synced to Shopify!`, {
        description: `Shopify order: ${data?.shopifyOrderNumber || data?.shopifyOrderId}`,
      })
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: shopifyKeys.all })
    },
    onError: (err) => {
      toast.error("Sync to Shopify failed", { description: err.message })
    },
  })
}

/**
 * Hook to sync fulfillment to Shopify
 */
export function useSyncFulfillmentToShopify() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (orderId) => shopifyApi.syncFulfillmentToShopify(orderId),
    onSuccess: (data) => {
      if (data?.alreadyFulfilled) {
        toast.info("Already fulfilled on Shopify")
      } else {
        toast.success("Fulfillment synced to Shopify!", {
          description: `${data?.courier} — ${data?.trackingNumber}`,
        })
      }
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err) => {
      toast.error("Fulfillment sync failed", { description: err.message })
    },
  })
}