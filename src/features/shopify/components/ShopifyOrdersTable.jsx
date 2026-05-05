/**
 * Shopify Orders Table — Phase 15
 * src/features/shopify/components/ShopifyOrdersTable.jsx
 *
 * Displays Shopify orders from the store with:
 *   - Filters (financial status, fulfillment status)
 *   - Import button for un-imported orders
 *   - Link to internal order for already-imported ones
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import {
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopifyOrders, useImportShopifyOrder } from "@/hooks/useShopify"
import ShopifyImportModal from "./ShopifyImportModal"

const FINANCIAL_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_paid", label: "Partially Paid" },
]

const FULFILLMENT_STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "partial", label: "Partially Fulfilled" },
]

export default function ShopifyOrdersTable() {
  const [filters, setFilters] = useState({
    financial_status: "",
    fulfillment_status: "",
    limit: 50,
  })
  const [importTarget, setImportTarget] = useState(null)

  // Build query params (remove empty values)
  const queryParams = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "")
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useShopifyOrders(queryParams)
  const importMutation = useImportShopifyOrder()

  const orders = data?.orders || []

  const handleImportConfirm = () => {
    if (!importTarget) return
    importMutation.mutate(importTarget.shopifyOrderId, {
      onSuccess: () => {
        setImportTarget(null)
        refetch()
      },
      onSettled: () => {
        // Keep modal open on error so user sees the error toast
      },
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount, currency = "PKR") => {
    if (!amount) return "—"
    return `${currency} ${parseFloat(amount).toLocaleString()}`
  }

  return (
    <div>
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <select
          className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          value={filters.financial_status}
          onChange={(e) => setFilters((f) => ({ ...f, financial_status: e.target.value }))}
        >
          {FINANCIAL_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Payment: {opt.label}
            </option>
          ))}
        </select>

        <select
          className="text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          value={filters.fulfillment_status}
          onChange={(e) => setFilters((f) => ({ ...f, fulfillment_status: e.target.value }))}
        >
          {FULFILLMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Fulfillment: {opt.label}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-pink-600 mr-2" />
          <span className="text-gray-500">Loading Shopify orders...</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Failed to load Shopify orders</p>
            <p className="mt-1">{error?.message || "Check your Shopify connection settings"}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <>
          <div className="text-xs text-gray-500 mb-2">
            Showing {orders.length} order{orders.length !== 1 ? "s" : ""} from Shopify
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Shopify Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fulfillment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">
                        No Shopify orders found with the current filters
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.shopifyOrderId} className="hover:bg-gray-50 transition-colors">
                        {/* Shopify Order # */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {order.orderNumber || `#${order.shopifyOrderId}`}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.customerName || "—"}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatCurrency(order.totalPrice, order.currency)}
                        </td>

                        {/* Financial Status */}
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={order.financialStatus}
                            colorMap={{
                              paid: "bg-green-100 text-green-800",
                              pending: "bg-yellow-100 text-yellow-800",
                              refunded: "bg-red-100 text-red-800",
                              partially_paid: "bg-orange-100 text-orange-800",
                            }}
                          />
                        </td>

                        {/* Fulfillment Status */}
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={order.fulfillmentStatus || "unfulfilled"}
                            colorMap={{
                              fulfilled: "bg-green-100 text-green-800",
                              unfulfilled: "bg-gray-100 text-gray-700",
                              partial: "bg-yellow-100 text-yellow-800",
                            }}
                          />
                        </td>

                        {/* Line Items */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.lineItemCount || 0}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>

                        {/* Import Status */}
                        <td className="px-4 py-3">
                          {order.imported ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Imported
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not imported</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          {order.imported ? (
                            <Link
                              to={`/orders/${order.internalOrderId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              {order.internalOrderNumber}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-pink-600 hover:bg-pink-700 text-white"
                              onClick={() => setImportTarget(order)}
                              disabled={importMutation.isPending}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Import
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Import Confirmation Modal */}
      <ShopifyImportModal
        open={!!importTarget}
        onOpenChange={(open) => !open && setImportTarget(null)}
        order={importTarget}
        onConfirm={handleImportConfirm}
        isPending={importMutation.isPending}
      />
    </div>
  )
}

// ─── Helper: Status Badge ──────────────────────────────────────────────

function StatusBadge({ status, colorMap }) {
  const label = (status || "unknown").replace(/_/g, " ")
  const color = colorMap?.[status] || "bg-gray-100 text-gray-600"

  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full capitalize ${color}`}
    >
      {label}
    </span>
  )
}