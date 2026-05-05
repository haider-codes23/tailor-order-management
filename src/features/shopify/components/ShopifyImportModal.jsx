/**
 * Shopify Import Modal — Phase 15
 * src/features/shopify/components/ShopifyImportModal.jsx
 *
 * Confirmation dialog before importing a Shopify order.
 * Shows order summary and warns about the action.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Loader2, AlertTriangle } from "lucide-react"

export default function ShopifyImportModal({ open, onOpenChange, order, onConfirm, isPending }) {
  if (!order) return null

  const formatCurrency = (amount, currency = "PKR") => {
    if (!amount) return "—"
    return `${currency} ${parseFloat(amount).toLocaleString()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-pink-600" />
            Import Shopify Order
          </DialogTitle>
          <DialogDescription>
            This will create an internal order from the Shopify order below.
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shopify Order:</span>
            <span className="font-medium text-gray-900">{order.orderNumber || `#${order.shopifyOrderId}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Customer:</span>
            <span className="text-gray-700">{order.customerName || "Unknown"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total:</span>
            <span className="text-gray-700">{formatCurrency(order.totalPrice, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items:</span>
            <span className="text-gray-700">{order.lineItemCount || 0} item(s)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment:</span>
            <span className="text-gray-700 capitalize">{order.financialStatus || "—"}</span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Importing will create an internal order in RECEIVED status and run an automatic
            inventory check. Products will be matched or created as needed.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5" />
                Import Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
