/**
 * Re-Video Request Modal - Phase 14 Redesign
 * src/features/sales/components/ReVideoRequestModal.jsx
 *
 * Allows Sales to request a new video from QA by selecting an order item,
 * choosing which sections need to be highlighted, and adding per-section notes.
 *
 * Triggered from: RejectionOptionsModal → "Request New Video"
 * Result: Order item appears in QA Dashboard Tab 2 (Sales Requests)
 *
 * Props:
 *   open    — boolean
 *   order   — the order object (contains orderItems with sections)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Video, Loader2, AlertTriangle } from "lucide-react"
import { useRequestReVideo } from "@/hooks/useSalesApproval"

export default function ReVideoRequestModal({ open, order, userId, onClose }) {
  const [selectedItemId, setSelectedItemId] = useState("")
  const [sectionSelections, setSectionSelections] = useState({})
  // sectionSelections = { sectionName: { checked: bool, notes: string } }

  const reVideoMutation = useRequestReVideo()

  const orderItems = order?.items || []

  // Get the currently selected order item
  const selectedItem = orderItems.find((i) => i.id === selectedItemId)

  // Build section names from the selected order item
  const sectionNames = selectedItem ? Object.keys(selectedItem.sectionStatuses || {}) : []

  // Auto-select the first order item when modal opens
  useEffect(() => {
    if (open && orderItems.length > 0) {
      setSelectedItemId(orderItems[0].id)
    }
  }, [open, orderItems])

  // Reset section selections when order item changes
  useEffect(() => {
    if (selectedItem) {
      const initial = {}
      sectionNames.forEach((name) => {
        initial[name] = { checked: false, notes: "" }
      })
      setSectionSelections(initial)
    }
  }, [selectedItemId])

  const toggleSection = (name) => {
    setSectionSelections((prev) => ({
      ...prev,
      [name]: { ...prev[name], checked: !prev[name]?.checked },
    }))
  }

  const updateNotes = (name, notes) => {
    setSectionSelections((prev) => ({
      ...prev,
      [name]: { ...prev[name], notes },
    }))
  }

  // Capitalize first letter helper
  const displayName = (name) => name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ")

  // Validation: at least 1 section checked with non-empty notes
  const selectedSections = Object.entries(sectionSelections).filter(([, val]) => val.checked)
  const isValid =
    selectedSections.length > 0 && selectedSections.every(([, val]) => val.notes.trim().length > 0)

  const handleSubmit = () => {
    if (!isValid || !selectedItemId) return

    const sections = selectedSections.map(([name, val]) => ({
      name,
      notes: val.notes.trim(),
    }))

    reVideoMutation.mutate(
      {
        orderId: order.orderId,
        orderItemId: selectedItemId,
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
      setSelectedItemId("")
      setSectionSelections({})
    }, 200)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-amber-500" />
            Request New Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700">
              ⚠️ Select the sections that need to be highlighted differently in a new video.
            </p>
          </div>

          {/* Order Item Selection */}
          <div className="space-y-2">
            <Label>Select Order Item:</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select order item" />
              </SelectTrigger>
              <SelectContent>
                {orderItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section checkboxes with per-section notes */}
          {selectedItem && sectionNames.length > 0 && (
            <div className="space-y-2">
              <Label>Select Sections to Highlight:</Label>
              <div className="space-y-2">
                {sectionNames.map((name) => {
                  const sel = sectionSelections[name] || {
                    checked: false,
                    notes: "",
                  }
                  return (
                    <div key={name} className="border rounded-lg p-3 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={sel.checked}
                          onCheckedChange={() => toggleSection(name)}
                        />
                        <span className="text-sm font-medium">{displayName(name)}</span>
                      </label>

                      {sel.checked && (
                        <Textarea
                          placeholder={`What should be highlighted for ${displayName(name)}?`}
                          value={sel.notes}
                          onChange={(e) => updateNotes(name, e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedSections.length > 0 &&
                !selectedSections.every(([, v]) => v.notes.trim()) && (
                  <p className="text-xs text-red-500">Please add notes for all selected sections</p>
                )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
            disabled={!isValid || reVideoMutation.isPending}
          >
            {reVideoMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Request to QA"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
