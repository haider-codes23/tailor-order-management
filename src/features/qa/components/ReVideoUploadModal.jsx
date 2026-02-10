/**
 * Re-Video Upload Modal - Phase 14 Redesign (Corrected)
 * src/features/qa/components/ReVideoUploadModal.jsx
 *
 * Modal for uploading a NEW video file for a Sales re-video request.
 * Shows the sections to highlight and previous video context.
 * File-based upload (same pattern as YouTubeUploadModal).
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
import { Progress } from "@/components/ui/progress"
import { Upload, Loader2, Info, X, FileVideo, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useUploadReVideo } from "@/hooks/useQA"
import { qaApi } from "@/services/api/qaApi"

const ACCEPTED_TYPES = ".mp4,.mov,.avi,.webm"

export default function ReVideoUploadModal({ open, onOpenChange, request }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const uploadMutation = useUploadReVideo()

  const { orderItemId, orderNumber, productName, reVideoRequest } = request
  const { sections, notes, requestedByName } = reVideoRequest

  // ── File selection & validation ──────────────────────────────────────────
  const handleFileSelect = useCallback((file) => {
    setFileError("")

    if (!file) return

    const validation = qaApi.validateVideoFile(file)
    if (!validation.valid) {
      setFileError(validation.error)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }, [])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    handleFileSelect(file)
    e.target.value = ""
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileError("")
  }

  // ── Drag & Drop ──────────────────────────────────────────────────────────
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

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!selectedFile) return

    uploadMutation.mutate(
      {
        orderItemId,
        videoFile: selectedFile,
        uploadedBy: user?.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedFile(null)
          setFileError("")
        },
      }
    )
  }

  const handleClose = () => {
    if (uploadMutation.isPending) return
    onOpenChange(false)
    setSelectedFile(null)
    setFileError("")
  }

  const isValid = selectedFile && !fileError

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            Upload New Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
            <div>
              <span className="text-gray-500">Order:</span> {orderNumber}
            </div>
            <div>
              <span className="text-gray-500">Product:</span> {productName}
            </div>
            <div>
              <span className="text-gray-500">Requested by:</span> {requestedByName}
            </div>
          </div>

          {/* Sections to Highlight Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xs font-medium text-amber-700 mb-2">
              Sections to highlight in new video:
            </div>
            <div className="space-y-1">
              {sections.map((sectionName) => (
                <div key={sectionName} className="text-xs text-amber-700">
                  <span className="font-medium capitalize">• {sectionName}:</span>{" "}
                  {notes?.[sectionName] || "No specific notes"}
                </div>
              ))}
            </div>
          </div>

          {/* File Drop Zone / Selected File */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-amber-500 bg-amber-50"
                  : fileError
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={handleChooseFile}
            >
              <FileVideo className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600 mb-2">
                {isDragging ? "Drop video file here" : "Select new video file to upload"}
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={(e) => {
                  e.stopPropagation()
                  handleChooseFile()
                }}
              >
                Choose File
              </Button>
              <div className="text-xs text-gray-400 mt-2">MP4, MOV, AVI, WebM • Max 2GB</div>
            </div>
          ) : (
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileVideo className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{selectedFile.name}</div>
                    <div className="text-xs text-gray-500">
                      {qaApi.formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
                {!uploadMutation.isPending && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Upload progress */}
              {uploadMutation.isPending && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Uploading to YouTube...</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <Progress value={undefined} className="h-1.5" />
                </div>
              )}
            </div>
          )}

          {/* File error */}
          {fileError && <p className="text-xs text-red-500">{fileError}</p>}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Upload the new video highlighting the requested sections. This will replace the
              previous video. The new link will be shared with the Sales team.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || uploadMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading to YouTube...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Video
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
