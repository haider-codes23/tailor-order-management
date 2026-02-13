/**
 * Alteration Request Modal - Phase 14 Redesign
 * src/features/sales/components/AlterationRequestModal.jsx
 *
 * Allows Sales to request alterations for specific sections across order items.
 * Selected sections go back to Production Head for rework.
 *
 * Triggered from: RejectionOptionsModal → "Request Alteration"
 * Result: Sections → PRODUCTION_COMPLETED (for rework), Order Item → ALTERATION_REQUIRED
 *
 * Props:
 *   open    — boolean
 *   order   — the order object (contains orderItems with sectionStatuses)
 *   userId  — current user's ID
 *   onClose — callback to close modal
 */

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Scissors, Loader2 } from "lucide-react"
import { useRequestAlteration } from "@/hooks/useSalesApproval"

export default function AlterationRequestModal({ open, order, userId, onClose }) {
  // sectionSelections = [{ orderItemId, sectionName, displayName, productName, checked, notes }]
  const [sectionSelections, setSectionSelections] = useState([])

  const alterationMutation = useRequestAlteration()

  const orderItems = order?.orderItems || []

  // Build flat list of all sections across all order items
  useEffect(() => {
    if (open && orderItems.length > 0) {
      const list = []
      orderItems.forEach((item) => {
        const sectionNames = Object.keys(item.sectionStatuses || {})
        sectionNames.forEach((name) => {
          list.push({
            orderItemId: item.id,
            sectionName: name,
            displayName: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
            productName: item.productName,
            checked: false,
            notes: "",
          })
        })
      })
      setSectionSelections(list)
    }
  }, [open, order?.id])

  const toggleSection = (idx) => {
    setSectionSelections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, checked: !s.checked } : s))
    )
  }

  const updateNotes = (idx, notes) => {
    setSectionSelections((prev) => prev.map((s, i) => (i === idx ? { ...s, notes } : s)))
  }

  const selectedSections = sectionSelections.filter((s) => s.checked)
  const isValid =
    selectedSections.length > 0 && selectedSections.every((s) => s.notes.trim().length > 0)

  const handleSubmit = () => {
    if (!isValid) return

    const sections = selectedSections.map((s) => ({
      orderItemId: s.orderItemId,
      sectionName: s.sectionName,
      notes: s.notes.trim(),
    }))

    alterationMutation.mutate(
      {
        orderId: order.id,
        sections,
        requestedBy: userId,
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
      setSectionSelections([])
    }, 200)
  }

  if (!order) return null

  // Group sections by order item for display
  const grouped = orderItems.map((item) => ({
    item,
    sections: sectionSelections.filter((s) => s.orderItemId === item.id),
  }))

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-orange-500" />
            Request Alteration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              ✂️ Selected sections will be sent back to Production Head for alteration. Add clear
              notes describing what the client wants changed.
            </p>
          </div>

          {/* Order context */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Order:</span>{" "}
            <span className="font-medium">{order.orderNumber}</span>
            <span className="text-gray-500 ml-2">•</span>{" "}
            <span className="text-gray-600">{order.customerName}</span>
          </div>

          {/* Sections grouped by order item */}
          <div className="space-y-4">
            {grouped.map(({ item, sections }) => (
              <div key={item.id}>
                {orderItems.length > 1 && (
                  <p className="text-sm font-medium text-gray-700 mb-2">{item.productName}</p>
                )}

                <div className="space-y-2">
                  {sections.map((sec) => {
                    const globalIdx = sectionSelections.findIndex(
                      (s) => s.orderItemId === sec.orderItemId && s.sectionName === sec.sectionName
                    )
                    return (
                      <div
                        key={`${sec.orderItemId}-${sec.sectionName}`}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={sec.checked}
                            onCheckedChange={() => toggleSection(globalIdx)}
                          />
                          <span className="text-sm font-medium">{sec.displayName}</span>
                        </label>

                        {sec.checked && (
                          <Textarea
                            placeholder={`What alteration does the client want for ${sec.displayName}?`}
                            value={sec.notes}
                            onChange={(e) => updateNotes(globalIdx, e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedSections.length > 0 && !selectedSections.every((s) => s.notes.trim()) && (
            <p className="text-xs text-red-500">
              Please add alteration notes for all selected sections
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSubmit}
            disabled={!isValid || alterationMutation.isPending}
          >
            {alterationMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send to Production"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
