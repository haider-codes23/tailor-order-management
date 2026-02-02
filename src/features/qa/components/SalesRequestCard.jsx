/**
 * Sales Request Card - Phase 14 Redesign
 * src/features/qa/components/SalesRequestCard.jsx
 *
 * Card displaying a re-video request from Sales
 * Shows previous video, sections to highlight, and notes
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, User, ExternalLink, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import ReVideoUploadModal from "./ReVideoUploadModal"

export default function SalesRequestCard({ request }) {
  const [showUploadModal, setShowUploadModal] = useState(false)

  const {
    orderItemId,
    orderNumber,
    customerName,
    productName,
    fwdDate,
    reVideoRequest,
    previousVideo,
  } = request

  const { requestedByName, requestedAt, sections, notes } = reVideoRequest

  return (
    <>
      <Card className="overflow-hidden border-2 border-amber-300 bg-amber-50">
        {/* Header */}
        <div className="bg-amber-100 px-3 py-2 flex justify-between items-center">
          <div>
            <span className="font-medium text-sm">{orderNumber}</span>
            <span className="text-gray-500 text-sm ml-2">• {customerName}</span>
          </div>
          <Badge className="bg-amber-200 text-amber-800 text-xs">
            Re-Video Requested
          </Badge>
        </div>

        <CardContent className="p-3 space-y-3">
          {/* Product Info */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{productName}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User className="h-3 w-3" />
              {requestedByName}
            </div>
          </div>

          {/* Previous Video */}
          {previousVideo?.youtubeUrl && (
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <div className="text-xs text-gray-500 mb-1">Previous Video:</div>
              
                href={previousVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {previousVideo.youtubeUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Sections to Highlight */}
          <div className="bg-white rounded-lg p-3 border border-amber-200">
            <div className="text-xs text-gray-500 mb-2">Sections to highlight:</div>
            <div className="space-y-2">
              {sections.map((sectionName) => (
                <div key={sectionName} className="bg-amber-50 p-2 rounded text-sm">
                  <span className="font-medium capitalize">{sectionName}:</span>
                  <span className="text-gray-600 ml-1">
                    {notes?.[sectionName] || "No specific notes"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Time */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            Requested: {format(new Date(requestedAt), "MMM dd, yyyy 'at' h:mm a")}
          </div>

          {/* Upload Button */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowUploadModal(true)}
          >
            <Video className="h-4 w-4 mr-2" />
            Upload New Video
          </Button>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <ReVideoUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        request={request}
      />
    </>
  )
}