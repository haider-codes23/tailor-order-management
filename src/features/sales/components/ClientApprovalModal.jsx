/**
 * Client Approval Modal - Phase 14 Redesign
 * src/features/sales/components/ClientApprovalModal.jsx
 *
 * Modal for recording client approval with screenshot proof upload.
 * Triggered from Tab 2 (Awaiting Response) when Sales clicks "✓ Client Approved".
 *
 * Features:
 * - Multi-file screenshot upload (min 1, max 10)
 * - Drag & drop support
 * - Image preview with remove
 * - Optional notes
 * - File-to-base64 conversion for MSW simulation
 *
 * Props:
 *   open    — boolean, controls dialog visibility
 *   order   — the order object from the awaiting-response list
 *   userId  — current logged-in user's ID
 *   onClose — callback to close the modal
 */

import { useState, useRef, useCallback } from "react"
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
import { CheckCircle, Loader2, Upload, X, ImageIcon } from "lucide-react"
import { useMarkClientApproved } from "@/hooks/useSalesApproval"

const MAX_FILES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

export default function ClientApprovalModal({ open, order, userId, onClose }) {
  const fileInputRef = useRef(null)
  const [screenshots, setScreenshots] = useState([]) // { id, name, dataUrl, file }
  const [notes, setNotes] = useState("")
  const [fileError, setFileError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const approvedMutation = useMarkClientApproved()

  // ── File helpers ─────────────────────────────────────────────────────
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PNG, JPG, and WebP images are allowed"
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 5MB limit`
    }
    return null
  }

  const addFiles = useCallback(
    async (files) => {
      setFileError("")

      const remaining = MAX_FILES - screenshots.length
      if (remaining <= 0) {
        setFileError(`Maximum ${MAX_FILES} screenshots allowed`)
        return
      }

      const filesToAdd = Array.from(files).slice(0, remaining)

      for (const file of filesToAdd) {
        const error = validateFile(file)
        if (error) {
          setFileError(error)
          return
        }
      }

      try {
        const newScreenshots = await Promise.all(
          filesToAdd.map(async (file) => {
            const dataUrl = await fileToBase64(file)
            return {
              id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              dataUrl,
              file,
            }
          })
        )
        setScreenshots((prev) => [...prev, ...newScreenshots])
      } catch {
        setFileError("Failed to process one or more files")
      }
    },
    [screenshots.length]
  )

  const removeScreenshot = (id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id))
    setFileError("")
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files?.length) addFiles(files)
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    if (files?.length) addFiles(files)
    e.target.value = ""
  }

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (screenshots.length === 0) {
      setFileError("At least 1 screenshot is required")
      return
    }

    approvedMutation.mutate(
      {
        orderId: order.id,
        screenshots: screenshots.map((s) => ({ name: s.name, dataUrl: s.dataUrl })),
        notes: notes.trim() || null,
        approvedBy: userId,
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
    // Reset after animation
    setTimeout(() => {
      setScreenshots([])
      setNotes("")
      setFileError("")
    }, 200)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Client Approved
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✓ Great! Please upload screenshot(s) of the client's approval message.
            </p>
          </div>

          {/* Order info */}
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

          {/* Screenshot upload area */}
          <div className="space-y-2">
            <Label>
              Approval Screenshots *{" "}
              <span className="text-gray-400 font-normal">
                ({screenshots.length}/{MAX_FILES})
              </span>
            </Label>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drop files or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP • Max 5MB each</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />

            {fileError && <p className="text-xs text-red-600">{fileError}</p>}

            {/* Preview thumbnails */}
            {screenshots.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {screenshots.map((ss) => (
                  <div
                    key={ss.id}
                    className="relative w-16 h-16 rounded border bg-gray-100 overflow-hidden group"
                  >
                    <img src={ss.dataUrl} alt={ss.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeScreenshot(ss.id)
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1">
                      <span className="text-[9px] text-white truncate block">{ss.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval-notes">Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Any notes about the approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={screenshots.length === 0 || approvedMutation.isPending}
          >
            {approvedMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Client Approval"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
