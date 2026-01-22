/**
 * DyeingRejectionDialog.jsx
 * Modal for rejecting sections from dyeing with reason and notes
 *
 * File: src/features/dyeing/components/DyeingRejectionDialog.jsx
 */

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertTriangle, XCircle } from "lucide-react"
import { DYEING_REJECTION_REASONS } from "@/constants/orderConstants"

export default function DyeingRejectionDialog({
  open,
  onOpenChange,
  sections = [], // Array of section names to reject
  onConfirm,
  isLoading = false,
}) {
  const [reasonCode, setReasonCode] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedSections, setSelectedSections] = useState(sections)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setSelectedSections(sections)
      setReasonCode("")
      setNotes("")
      setError("")
    }
  }, [open, sections])

  // Reset state when dialog opens
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setSelectedSections(sections)
      setReasonCode("")
      setNotes("")
      setError("")
    }
    onOpenChange(isOpen)
  }

  const handleSectionToggle = (sectionName) => {
    setSelectedSections((prev) =>
      prev.includes(sectionName) ? prev.filter((s) => s !== sectionName) : [...prev, sectionName]
    )
  }

  const handleConfirm = () => {
    // Validate notes (required)
    if (!notes.trim()) {
      setError("Notes are required for rejection")
      return
    }

    if (selectedSections.length === 0) {
      setError("Please select at least one section to reject")
      return
    }

    setError("")
    onConfirm({
      sections: selectedSections,
      reasonCode: reasonCode || null,
      notes: notes.trim(),
    })
  }

  const rejectionReasonsList = Object.values(DYEING_REJECTION_REASONS)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Reject Section{sections.length > 1 ? "s" : ""}
          </DialogTitle>
          <DialogDescription>
            Rejecting will release inventory back to stock and send the section(s) back to inventory
            check for reassignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>This action will:</strong>
              <ul className="list-disc ml-4 mt-1 text-sm">
                <li>Release inventory back to stock</li>
                <li>Invalidate the packet for rejected sections</li>
                <li>Send sections back to Inventory Check</li>
                <li>Auto-assign to original fabrication user</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Section Selection (if multiple) */}
          {sections.length > 1 && (
            <div className="space-y-2">
              <Label>Sections to Reject:</Label>
              <div className="space-y-2 p-3 border rounded-md">
                {sections.map((sectionName) => (
                  <div key={sectionName} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${sectionName}`}
                      checked={selectedSections.includes(sectionName)}
                      onCheckedChange={() => handleSectionToggle(sectionName)}
                    />
                    <Label
                      htmlFor={`section-${sectionName}`}
                      className="text-sm font-normal capitalize cursor-pointer"
                    >
                      {sectionName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason (Optional) */}
          <div className="space-y-2">
            <Label>Rejection Reason (Optional):</Label>
            <RadioGroup value={reasonCode} onValueChange={setReasonCode}>
              <div className="grid gap-2 max-h-48 overflow-y-auto p-3 border rounded-md">
                {rejectionReasonsList.map((reason) => (
                  <div key={reason.code} className="flex items-start space-x-2">
                    <RadioGroupItem value={reason.code} id={reason.code} className="mt-0.5" />
                    <Label
                      htmlFor={reason.code}
                      className="text-sm font-normal cursor-pointer leading-tight"
                    >
                      <span className="font-medium">{reason.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {reason.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {reasonCode && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setReasonCode("")}
              >
                Clear selection
              </Button>
            )}
          </div>

          {/* Notes (Required) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Please describe the issue in detail..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Notes are required to help the fabrication team understand the issue.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || selectedSections.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Rejection
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
