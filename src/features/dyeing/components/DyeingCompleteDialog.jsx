/**
 * DyeingCompleteDialog.jsx
 * Confirmation dialog for completing dyeing on sections
 *
 * File: src/features/dyeing/components/DyeingCompleteDialog.jsx
 */

import { useState } from "react"
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
import { Loader2, CheckCircle, Info, Factory } from "lucide-react"

export default function DyeingCompleteDialog({
  open,
  onOpenChange,
  sections = [], // Array of section names that can be completed
  onConfirm,
  isLoading = false,
}) {
  const [selectedSections, setSelectedSections] = useState(sections)
  const [error, setError] = useState("")

  // Reset state when dialog opens
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setSelectedSections(sections)
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
      setError("Please select at least one section to complete")
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
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Complete Dyeing
          </DialogTitle>
          <DialogDescription>
            Mark the selected sections as dyeing completed. They will move to "Ready for Production"
            status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <div className="flex items-center gap-2">
                <span>These sections will move to</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded font-medium">
                  <Factory className="h-3 w-3" />
                  Ready for Production
                </span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Section Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sections to Complete:</Label>
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
                    id={`complete-${sectionName}`}
                    checked={selectedSections.includes(sectionName)}
                    onCheckedChange={() => handleSectionToggle(sectionName)}
                  />
                  <Label
                    htmlFor={`complete-${sectionName}`}
                    className="text-sm font-normal capitalize cursor-pointer flex-1"
                  >
                    {sectionName}
                  </Label>
                  <CheckCircle className="h-4 w-4 text-green-500" />
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
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Complete ({selectedSections.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
