/**
 * DyeingAcceptDialog.jsx
 * Confirmation dialog for accepting sections for dyeing
 *
 * File: src/features/dyeing/components/DyeingAcceptDialog.jsx
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
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserCheck, Info, Droplets } from "lucide-react"

export default function DyeingAcceptDialog({
  open,
  onOpenChange,
  sections = [], // Array of section names that can be accepted
  orderNumber,
  onConfirm,
  isLoading = false,
}) {
  const [selectedSections, setSelectedSections] = useState([])
  const [error, setError] = useState("")

  // Sync selectedSections when dialog opens or sections prop changes
  useEffect(() => {
    if (open) {
      setSelectedSections(sections)
      setError("")
    }
  }, [open, sections])

  // Handle dialog close
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setError("")
    }
    onOpenChange(isOpen)
  }

  const handleSectionToggle = (sectionName) => {
    setSelectedSections((prev) =>
      prev.includes(sectionName) ? prev.filter((s) => s !== sectionName) : [...prev, sectionName]
    )
  }

  const handleSelectAll = () => {
    if (selectedSections.length === sections.length) {
      setSelectedSections([])
    } else {
      setSelectedSections([...sections])
    }
  }

  const handleConfirm = () => {
    if (selectedSections.length === 0) {
      setError("Please select at least one section to accept")
      return
    }

    setError("")
    onConfirm(selectedSections)
  }

  const allSelected = selectedSections.length === sections.length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-fuchsia-600">
            <UserCheck className="h-5 w-5" />
            Accept Dyeing Task
          </DialogTitle>
          <DialogDescription>
            Accept these sections for dyeing. You will be responsible for completing the dyeing work
            for all accepted sections.
            {orderNumber && <span className="block mt-1 font-medium">Order: {orderNumber}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <Alert className="border-fuchsia-200 bg-fuchsia-50">
            <Info className="h-4 w-4 text-fuchsia-600" />
            <AlertDescription className="text-fuchsia-800 text-sm">
              <strong>Note:</strong> Only one user can accept tasks for an order item. Once
              accepted, you must complete or reject these sections.
            </AlertDescription>
          </Alert>

          {/* Section Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sections to Accept:</Label>
              {sections.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={handleSelectAll}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>
            <div className="space-y-2 p-3 border rounded-md">
              {sections.map((sectionName) => (
                <div key={sectionName} className="flex items-center space-x-3">
                  <Checkbox
                    id={`accept-${sectionName}`}
                    checked={selectedSections.includes(sectionName)}
                    onCheckedChange={() => handleSectionToggle(sectionName)}
                  />
                  <Label
                    htmlFor={`accept-${sectionName}`}
                    className="text-sm font-normal capitalize cursor-pointer flex-1"
                  >
                    {sectionName}
                  </Label>
                  <Droplets className="h-4 w-4 text-fuchsia-400" />
                </div>
              ))}
            </div>
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
            onClick={handleConfirm}
            disabled={isLoading || selectedSections.length === 0}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Accept ({selectedSections.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
