/**
 * Shopify Sync Panel — Phase 15
 * src/features/shopify/components/ShopifySyncPanel.jsx
 *
 * Embedded panel for the Order Detail page.
 * Shows Shopify sync status and provides action buttons:
 *   - "Sync to Shopify" for manual orders not yet synced
 *   - "Sync Fulfillment" for dispatched orders with a shopify_order_id
 *   - Shopify admin link for synced orders
 */

import {
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSyncOrderToShopify, useSyncFulfillmentToShopify } from "@/hooks/useShopify"

export default function ShopifySyncPanel({ order }) {
  const syncToShopifyMutation = useSyncOrderToShopify()
  const syncFulfillmentMutation = useSyncFulfillmentToShopify()

  if (!order) return null

  const {
    id: orderId,
    source,
    shopifyOrderId,
    shopifyOrderNumber,
    shopifySyncStatus,
    shopifyLastSyncedAt,
  } = order

  // Determine the Shopify store URL from the order or use a default
  const storeUrl = "auiya1-6i.myshopify.com"
  const shopifyAdminUrl = shopifyOrderId
    ? `https://${storeUrl}/admin/orders/${shopifyOrderId}`
    : null

  const isShopifySource = source === "SHOPIFY"
  const isSynced = !!shopifyOrderId
  const isDispatched = order.status === "DISPATCHED" || order.status === "COMPLETED"

  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleString("en-PK", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSyncStatusBadge = () => {
    if (!shopifySyncStatus || shopifySyncStatus === "NOT_SYNCED") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          <AlertCircle className="h-3 w-3" />
          Not Synced
        </span>
      )
    }
    if (shopifySyncStatus === "SYNCED") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          <CheckCircle className="h-3 w-3" />
          Synced
        </span>
      )
    }
    if (shopifySyncStatus === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
        <Clock className="h-3 w-3" />
        {shopifySyncStatus}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-pink-600" />
        Shopify Integration
      </h3>

      <div className="space-y-3">
        {/* Source */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Source</span>
          <span className="font-medium">
            {isShopifySource ? (
              <span className="text-green-700">Shopify</span>
            ) : (
              <span className="text-blue-700">Manual</span>
            )}
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Sync Status</span>
          {getSyncStatusBadge()}
        </div>

        {/* Shopify Order ID */}
        {isSynced && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Shopify Order</span>
            <a
              href={shopifyAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pink-600 hover:text-pink-800 inline-flex items-center gap-1"
            >
              {shopifyOrderNumber || `#${shopifyOrderId}`}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Last Synced */}
        {shopifyLastSyncedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Last Synced</span>
            <span className="text-slate-700">{formatDate(shopifyLastSyncedAt)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        {/* Sync to Shopify — for manual orders not yet synced */}
        {!isShopifySource && !isSynced && (
          <Button
            size="sm"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => syncToShopifyMutation.mutate(orderId)}
            disabled={syncToShopifyMutation.isPending}
          >
            {syncToShopifyMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Sync to Shopify
          </Button>
        )}

        {/* Retry sync — for failed syncs */}
        {!isShopifySource && !isSynced && shopifySyncStatus === "FAILED" && (
          <p className="text-xs text-red-600 text-center">
            Previous sync failed. Click above to retry.
          </p>
        )}

        {/* Sync Fulfillment — for dispatched orders that are synced to Shopify */}
        {isSynced && isDispatched && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => syncFulfillmentMutation.mutate(orderId)}
            disabled={syncFulfillmentMutation.isPending}
          >
            {syncFulfillmentMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 mr-1.5" />
            )}
            Sync Fulfillment to Shopify
          </Button>
        )}

        {/* Shopify Admin Link */}
        {isSynced && shopifyAdminUrl && (
          <a
            href={shopifyAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button size="sm" variant="ghost" className="w-full text-pink-600 hover:text-pink-800">
              <ExternalLink className="h-4 w-4 mr-1.5" />
              View in Shopify Admin
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}
