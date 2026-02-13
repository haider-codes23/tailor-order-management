/**
 * QA Order Item Card - Phase 14 Redesign
 * src/features/qa/components/QAOrderItemCard.jsx
 *
 * Displays an order item with all its sections for QA review
 * Three states:
 * - pending-review: Shows approve/reject buttons for each pending section
 * - ready-for-video: Shows "Upload Video" button when all sections approved
 * - video-uploaded: Shows "Send to Sales" button when video is uploaded
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, User, Send, CheckCircle2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import QASectionRow from "./QASectionRow"
import YouTubeUploadModal from "./YouTubeUploadModal"
import RoundBadge from "./RoundBadge"
import { useSendOrderToSales } from "@/hooks/useQA"
import { useAuth } from "@/features/auth/hooks/useAuth"

export default function QAOrderItemCard({ orderItem, variant = "pending-review" }) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const sendToSalesMutation = useSendOrderToSales()
  const { user } = useAuth()

  const {
    orderItemId,
    orderId,
    orderNumber,
    customerName,
    productName,
    fwdDate,
    totalSections,
    pendingSections = [],
    approvedSections = [],
    allSectionsApproved,
    hasVideo,
    videoData,
    // NEW fields from handler
    orderStatus,
    allOrderItemsHaveVideos,
  } = orderItem

  const isReadyForVideo = variant === "ready-for-video" || (allSectionsApproved && !hasVideo)
  const isVideoUploaded = allSectionsApproved && hasVideo

  // Calculate pending count for badge
  const pendingCount = pendingSections.length
  const approvedCount = approvedSections.length

  const handleSendToSales = () => {
    sendToSalesMutation.mutate({
      orderId,
      sentBy: user?.id,
    })
  }

  // Determine card styling based on state
  const getCardStyle = () => {
    if (isVideoUploaded) return "border-2 border-blue-300 bg-blue-50"
    if (isReadyForVideo) return "border-2 border-green-300 bg-green-50"
    return "border"
  }

  const getHeaderStyle = () => {
    if (isVideoUploaded) return "bg-blue-100"
    if (isReadyForVideo) return "bg-green-100"
    return "bg-gray-50"
  }

  return (
    <>
      <Card className={`overflow-hidden ${getCardStyle()}`}>
        {/* Header */}
        <div className={`px-3 py-2 flex justify-between items-center ${getHeaderStyle()}`}>
          <div>
            <span className="font-medium text-sm">{orderNumber}</span>
            <span className="text-gray-500 text-sm ml-2">• {customerName}</span>
          </div>
          {isVideoUploaded ? (
            <Badge className="bg-blue-200 text-blue-800 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Video Uploaded
            </Badge>
          ) : isReadyForVideo ? (
            <Badge className="bg-green-200 text-green-800 text-xs">All Approved ✓</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              {pendingCount}/{totalSections} Pending
            </Badge>
          )}
        </div>

        <CardContent className="p-3">
          {/* Product Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              {productName} • {totalSections} sections
            </div>
            {fwdDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {format(new Date(fwdDate), "MMM dd")}
              </div>
            )}
          </div>

          {/* Sections List */}
          <div className="space-y-1 mb-3">
            {/* Approved sections */}
            {approvedSections.map((section) => (
              <QASectionRow
                key={section.name}
                orderItemId={orderItemId}
                section={section}
                status="approved"
              />
            ))}

            {/* Pending sections */}
            {pendingSections.map((section) => (
              <QASectionRow
                key={section.name}
                orderItemId={orderItemId}
                section={section}
                status="pending"
              />
            ))}
          </div>

          {/* Upload Video Button (when all sections approved but no video) */}
          {isReadyForVideo && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowUploadModal(true)}
            >
              <Video className="h-4 w-4 mr-2" />
              Upload Video to YouTube
            </Button>
          )}

          {/* Send to Sales Button (when video is uploaded) */}
          {isVideoUploaded && (
            <div className="space-y-2">
              {/* Video info */}
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1.5">
                <Video className="h-3.5 w-3.5" />
                <span className="truncate">{videoData?.originalFileName || "Video uploaded"}</span>
                <span className="text-blue-500 ml-auto">
                  {videoData?.uploadedAt
                    ? format(new Date(videoData.uploadedAt), "MMM dd, h:mm a")
                    : ""}
                </span>
              </div>

              {/* Send to Sales button — only show if ALL order items have videos */}
              {allOrderItemsHaveVideos ? (
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleSendToSales}
                  disabled={sendToSalesMutation.isPending}
                >
                  {sendToSalesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending to Sales...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Order to Sales
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 text-center">
                  ⏳ Waiting for other items in this order to have videos uploaded
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <YouTubeUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        orderItem={orderItem}
      />
    </>
  )
}
