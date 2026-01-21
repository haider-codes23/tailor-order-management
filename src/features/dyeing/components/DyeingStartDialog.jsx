/**
 * DyeingStartDialog.jsx
 * Confirmation dialog for starting dyeing on sections
 *
 * File: src/features/dyeing/components/DyeingStartDialog.jsx
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
import { Loader2, Play, Info } from "lucide-react"

export default function DyeingStartDialog({
  open,
  onOpenChange,
  sections = [], // Array of section names that can be started
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
      setError("Please select at least one section to start")
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
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Play className="h-5 w-5" />
            Start Dyeing
          </DialogTitle>
          <DialogDescription>
            Start dyeing work on the selected sections. This indicates that dyeing has begun for
            these sections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Starting dyeing will update the section status to "Dyeing in Progress". You can
              complete the dyeing once the work is done.
            </AlertDescription>
          </Alert>

          {/* Section Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sections to Start:</Label>
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
                    id={`start-${sectionName}`}
                    checked={selectedSections.includes(sectionName)}
                    onCheckedChange={() => handleSectionToggle(sectionName)}
                  />
                  <Label
                    htmlFor={`start-${sectionName}`}
                    className="text-sm font-normal capitalize cursor-pointer flex-1"
                  >
                    {sectionName}
                  </Label>
                  <Play className="h-4 w-4 text-blue-400" />
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Dyeing ({selectedSections.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
