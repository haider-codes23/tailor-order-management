/**
 * Cancellation Confirm Modal - Phase 14 Redesign
 * src/features/sales/components/CancellationConfirmModal.jsx
 *
 * Prompts for a cancellation reason when the client rejects the order.
 * AWAITING_CLIENT_APPROVAL → CANCELLED_BY_CLIENT
 *
 * Triggered from: RejectionOptionsModal → "Cancel Order"
 *
 * Props:
 *   open    — boolean
 *   order   — the order object
 *   userId  — current user's ID
 *   onClose — callback to close modal
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { XCircle, Loader2, AlertTriangle } from "lucide-react"
import { useCancelOrder } from "@/hooks/useSalesApproval"

export default function CancellationConfirmModal({ open, order, userId, onClose }) {
  const [reason, setReason] = useState("")

  const cancelMutation = useCancelOrder()

  const isValid = reason.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return

    cancelMutation.mutate(
      {
        orderId: order.id,
        reason: reason.trim(),
        cancelledBy: userId,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setReason("")
    }, 200)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order context */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div>
              <span className="text-gray-500">Order:</span>{" "}
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-500">Customer:</span>{" "}
              <span className="font-medium">{order.customerName}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              This action will permanently cancel the order. The order status will be set to{" "}
              <span className="font-medium">Cancelled by Client</span> and cannot be undone.
            </div>
          </div>

          {/* Cancellation reason */}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Why is the client cancelling this order?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
