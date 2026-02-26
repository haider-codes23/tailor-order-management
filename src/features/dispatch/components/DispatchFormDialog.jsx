/**
 * Dispatch Form Dialog - Phase 15
 * src/features/dispatch/components/DispatchFormDialog.jsx
 *
 * Modal form to capture shipping details:
 * - Courier service (dropdown)
 * - Tracking number
 * - Dispatch date
 * - Notes (optional)
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Truck, MapPin, Package, User } from "lucide-react"

const COURIER_OPTIONS = [
  { value: "TCS", label: "TCS" },
  { value: "Leopards", label: "Leopards Courier" },
  { value: "DHL", label: "DHL" },
  { value: "FedEx", label: "FedEx" },
  { value: "Pak Post", label: "Pakistan Post" },
  { value: "Self-Pickup", label: "Self-Pickup" },
  { value: "Other", label: "Other" },
]

export default function DispatchFormDialog({ open, onOpenChange, order, onSubmit, isLoading }) {
  const [courier, setCourier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const canSubmit = courier && trackingNumber.trim().length >= 3 && dispatchDate && !isLoading

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      courier,
      trackingNumber: trackingNumber.trim(),
      dispatchDate,
      notes: notes.trim(),
    })
  }

  const handleClose = (val) => {
    if (!isLoading) {
      // Reset form on close
      setCourier("")
      setTrackingNumber("")
      setDispatchDate(new Date().toISOString().split("T")[0])
      setNotes("")
      onOpenChange(val)
    }
  }

  if (!order) return null

  const address = order.shippingAddress

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-sky-600" />
            Dispatch: {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Enter shipping details to dispatch this order.
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Order Summary</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Customer:</span>
            </div>
            <span className="font-medium">{order.customerName}</span>

            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Destination:</span>
            </div>
            <span className="font-medium">{order.destination}</span>

            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Items:</span>
            </div>
            <span className="font-medium">{order.itemCount} item(s)</span>
          </div>

          {address && (
            <div className="text-xs text-slate-500 border-t pt-2 mt-2">
              <span className="font-medium">Ship to: </span>
              {[address.street1, address.street2, address.city, address.state, address.postalCode, address.country]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}

          {/* Items list */}
          <div className="border-t pt-2 mt-2 space-y-1">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-slate-600">
                  {item.productName} ({item.size}) × {item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Details Form */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700">Shipping Details</h4>

          {/* Courier Service */}
          <div className="space-y-1.5">
            <Label htmlFor="courier">
              Courier Service <span className="text-red-500">*</span>
            </Label>
            <Select value={courier} onValueChange={setCourier}>
              <SelectTrigger id="courier">
                <SelectValue placeholder="Select courier..." />
              </SelectTrigger>
              <SelectContent>
                {COURIER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Number */}
          <div className="space-y-1.5">
            <Label htmlFor="tracking">
              Tracking Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tracking"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          {/* Dispatch Date */}
          <div className="space-y-1.5">
            <Label htmlFor="dispatchDate">
              Dispatch Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dispatchDate"
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any shipping notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right">{notes.length}/500</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Confirm Dispatch
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
