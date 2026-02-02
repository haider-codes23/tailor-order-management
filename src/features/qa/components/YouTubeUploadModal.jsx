/**
 * YouTube Upload Modal - Phase 14 Redesign
 * src/features/qa/components/YouTubeUploadModal.jsx
 *
 * Modal for uploading video to YouTube for an order item
 * For MSW simulation, accepts YouTube URL directly
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
import { Video, Upload, Loader2, Info, ExternalLink } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useUploadOrderItemVideo } from "@/hooks/useQA"
import { qaApi } from "@/services/api/qaApi"

export default function YouTubeUploadModal({ open, onOpenChange, orderItem }) {
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [urlError, setUrlError] = useState("")

  const uploadMutation = useUploadOrderItemVideo()

  const { orderItemId, orderNumber, productName, approvedSections = [] } = orderItem

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
            <Video className="h-5 w-5 text-blue-600" />
            Upload Video to YouTube
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
              <span className="text-gray-500">Sections:</span>{" "}
              {approvedSections.map((s) => s.displayName).join(", ")}
            </div>
          </div>

          {/* YouTube URL Input */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube Video URL *</Label>
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
              Upload the video to YouTube first (as "Unlisted"), then paste the
              link here. The link will be shared with the Sales team for client
              approval.
            </p>
          </div>

          {/* Supported Formats */}
          <div className="text-xs text-gray-500">
            Supported formats:
            <ul className="mt-1 ml-4 list-disc">
              <li>youtube.com/watch?v=VIDEO_ID</li>
              <li>youtu.be/VIDEO_ID</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || uploadMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save Video Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}