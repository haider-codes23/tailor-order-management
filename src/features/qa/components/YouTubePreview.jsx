/**
 * YouTube Preview Component
 * src/features/qa/components/YouTubePreview.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Displays a YouTube video embed preview
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, AlertCircle } from "lucide-react"
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@/services/api/qaApi"

export default function YouTubePreview({ url, autoPlay = false }) {
  const [showEmbed, setShowEmbed] = useState(autoPlay)

  const videoId = extractYouTubeVideoId(url)
  const embedUrl = getYouTubeEmbedUrl(url)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

  if (!videoId) {
    return (
      <Card className="p-4 bg-gray-50 border-dashed">
        <div className="flex items-center gap-2 text-gray-500 justify-center">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Invalid YouTube URL</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {/* Video Player / Thumbnail */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {showEmbed ? (
          <iframe
            src={`${embedUrl}?autoplay=0&rel=0`}
            title="YouTube video preview"
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {/* Thumbnail */}
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-16 h-16 p-0"
                onClick={() => setShowEmbed(true)}
              >
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Video URL Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate flex-1 mr-2">Video ID: {videoId}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => window.open(url, "_blank")}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open
        </Button>
      </div>
    </div>
  )
}

/**
 * Compact YouTube Preview (for lists/cards)
 */
export function YouTubePreviewCompact({ url, onClick }) {
  const videoId = extractYouTubeVideoId(url)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

  if (!videoId) return null

  return (
    <div
      className="relative w-24 h-16 bg-gray-900 rounded overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = "none"
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
        <Play className="h-6 w-6 text-white" fill="white" />
      </div>
    </div>
  )
}
