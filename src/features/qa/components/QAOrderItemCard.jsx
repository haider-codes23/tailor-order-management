/**
 * QA Order Item Card - Phase 14 Redesign
 * src/features/qa/components/QAOrderItemCard.jsx
 *
 * Displays an order item with all its sections for QA review
 * Two variants:
 * - pending-review: Shows approve/reject buttons for each pending section
 * - ready-for-video: Shows "Upload Video" button when all sections approved
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import QASectionRow from "./QASectionRow"
import YouTubeUploadModal from "./YouTubeUploadModal"
import RoundBadge from "./RoundBadge"

export default function QAOrderItemCard({ orderItem, variant = "pending-review" }) {
  const [showUploadModal, setShowUploadModal] = useState(false)

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
  } = orderItem

  const isReadyForVideo = variant === "ready-for-video" || (allSectionsApproved && !hasVideo)

  // Calculate pending count for badge
  const pendingCount = pendingSections.length
  const approvedCount = approvedSections.length

  return (
    <>
      <Card
        className={`overflow-hidden ${
          isReadyForVideo
            ? "border-2 border-green-300 bg-green-50"
            : "border"
        }`}
      >
        {/* Header */}
        <div
          className={`px-3 py-2 flex justify-between items-center ${
            isReadyForVideo ? "bg-green-100" : "bg-gray-50"
          }`}
        >
          <div>
            <span className="font-medium text-sm">{orderNumber}</span>
            <span className="text-gray-500 text-sm ml-2">• {customerName}</span>
          </div>
          {isReadyForVideo ? (
            <Badge className="bg-green-200 text-green-800 text-xs">
              All Approved ✓
            </Badge>
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

          {/* Upload Video Button (when all sections approved) */}
          {isReadyForVideo && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowUploadModal(true)}
            >
              <Video className="h-4 w-4 mr-2" />
              Upload Video to YouTube
            </Button>
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