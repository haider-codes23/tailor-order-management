/**
 * QA Section Card Component
 * src/features/qa/components/QASectionCard.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Card component for displaying a section in the QA queue
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Camera,
  Video,
  Calendar,
  User,
  Package,
  ChevronRight,
  ExternalLink,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { SECTION_STATUS_CONFIG } from "@/constants/orderConstants"

export default function QASectionCard({
  section,
  onClick,
  showVideoButton = false,
  showVideoLink = false,
}) {
  const {
    orderNumber,
    customerName,
    productName,
    sectionDisplayName,
    status,
    fwdDate,
    sentToQAAt,
    qaData,
  } = section

  // Calculate urgency
  const daysUntilFwd = fwdDate ? differenceInDays(new Date(fwdDate), new Date()) : null
  const isUrgent = daysUntilFwd !== null && daysUntilFwd <= 3
  const isOverdue = daysUntilFwd !== null && daysUntilFwd < 0

  const statusConfig = SECTION_STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
  }

  const handleVideoLinkClick = (e) => {
    e.stopPropagation()
    if (qaData?.youtubeUrl) {
      window.open(qaData.youtubeUrl, "_blank")
    }
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue
          ? "border-red-300 bg-red-50/50"
          : isUrgent
            ? "border-amber-300 bg-amber-50/50"
            : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Left side - Info */}
          <div className="flex-1 min-w-0">
            {/* Order Number & Status */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-gray-900">{orderNumber}</span>
              <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isUrgent && !isOverdue && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>

            {/* Customer */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
              <User className="h-3.5 w-3.5" />
              <span>{customerName}</span>
            </div>

            {/* Product & Section */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Package className="h-3.5 w-3.5" />
              <span>{productName}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium text-violet-600">{sectionDisplayName}</span>
            </div>

            {/* FWD Date */}
            {fwdDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <Calendar className="h-3 w-3" />
                <span>FWD: {format(new Date(fwdDate), "MMM d, yyyy")}</span>
                {daysUntilFwd !== null && (
                  <span
                    className={
                      isOverdue
                        ? "text-red-600 font-medium"
                        : isUrgent
                          ? "text-amber-600 font-medium"
                          : ""
                    }
                  >
                    (
                    {daysUntilFwd < 0
                      ? `${Math.abs(daysUntilFwd)}d overdue`
                      : `${daysUntilFwd}d left`}
                    )
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col items-end gap-2 ml-4">
            {showVideoButton && (
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.()
                }}
              >
                <Video className="h-4 w-4 mr-1" />
                Add Video
              </Button>
            )}

            {showVideoLink && qaData?.youtubeUrl && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-300"
                onClick={handleVideoLinkClick}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Video
              </Button>
            )}

            {!showVideoButton && !showVideoLink && (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
