/**
 * Re-Video Upload Modal - Phase 14 Redesign
 * src/features/qa/components/ReVideoUploadModal.jsx
 *
 * Modal for uploading a new video for a Sales re-video request
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
import { Input } from "@/components/ui/input"
import { Video, Upload, Loader2, Info, RefreshCw } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useUploadReVideo } from "@/hooks/useQA"
import { qaApi } from "@/services/api/qaApi"

export default function ReVideoUploadModal({ open, onOpenChange, request }) {
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  const uploadMutation = useUploadReVideo()

  const {
    orderItemId,
    orderNumber,
    productName,
    reVideoRequest,
  } = request

  const { sections, notes, requestedByName } = reVideoRequest

  const validateUrl = (url) => {
    if (!url.trim()) {
      setUrlError("")
      return false
    }
    if (!qaApi.isValidYouTubeUrl(url)) {
      setUrlError("Please enter a valid YouTube URL")
      return false
    }
    setUrlError("")
    return true
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setYoutubeUrl(url)
    if (url.trim()) {
      validateUrl(url)
    } else {
      setUrlError("")
    }
  }

  const handleSubmit = () => {
    if (!validateUrl(youtubeUrl)) return

    uploadMutation.mutate(
      {
        orderItemId,
        youtubeUrl: youtubeUrl.trim(),
        uploadedBy: user?.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setYoutubeUrl("")
          setUrlError("")
        },
      }
    )
  }

  const handleClose = () => {
    onOpenChange(false)
    setYoutubeUrl("")
    setUrlError("")
  }

  const isValid = youtubeUrl.trim() && !urlError

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

          {/* YouTube URL Input */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">New YouTube Video URL *</Label>
            <Input
              id="youtubeUrl"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={handleUrlChange}
              className={urlError ? "border-red-500" : ""}
            />
            {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Upload the new video to YouTube highlighting the requested sections,
              then paste the link here. This will replace the previous video.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
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
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save New Video
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}