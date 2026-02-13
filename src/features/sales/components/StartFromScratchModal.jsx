/**
 * Start from Scratch Modal - Phase 14 Redesign
 * src/features/sales/components/StartFromScratchModal.jsx
 *
 * Confirmation modal with warning that resetting the order will restart
 * the entire production cycle: Inventory → Packet → Dyeing → Production → QA → Sales.
 *
 * Triggered from: RejectionOptionsModal → "Start from Scratch"
 * Result: Order → INVENTORY_CHECK, all items/sections reset
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
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react"
import { useStartFromScratch } from "@/hooks/useSalesApproval"

export default function StartFromScratchModal({ open, order, userId, onClose }) {
  const [reason, setReason] = useState("")

  const scratchMutation = useStartFromScratch()

  const handleSubmit = () => {
    scratchMutation.mutate(
      {
        orderId: order.orderId,
        confirmedBy: userId,
        reason: reason.trim() || "Client wants redo",
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
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Start from Scratch
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-2">
              <p className="font-medium">⚠️ This will reset the entire order!</p>
              <p>
                The order will go back to Inventory Check and the full production cycle will
                restart:
              </p>
              <p className="font-mono text-xs bg-amber-100 rounded px-2 py-1">
                Inventory Check → Packet → Dyeing → Production → QA → Sales
              </p>
              <p className="text-xs text-amber-600">
                Note: Existing inventory allocations remain used. New inventory check will allocate
                additional materials.
              </p>
            </div>
          </div>

          {/* Optional reason */}
          <div className="space-y-2">
            <Label htmlFor="scratch-reason">
              Reason <span className="text-gray-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="scratch-reason"
              placeholder="Why does the client want to redo everything?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Go Back
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={scratchMutation.isPending}
          >
            {scratchMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              "Confirm Reset"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
