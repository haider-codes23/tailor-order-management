/**
 * Order Item Approval Card Component
 * src/features/sales/components/OrderItemApprovalCard.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Card showing an order item with its sections for approval workflow
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Clock,
  CheckCircle,
  User,
  Calendar,
  Package,
  Video,
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { SECTION_STATUS, SECTION_STATUS_CONFIG } from "@/constants/orderConstants"

export default function OrderItemApprovalCard({
  orderItem,
  mode = "ready", // "ready" | "awaiting"
  onSendAll,
  onApproveAll,
  onViewDetails,
  isLoading = false,
}) {
  const {
    orderItemId,
    orderNumber,
    customerName,
    customerPhone,
    productName,
    fwdDate,
    sections = [],
  } = orderItem

  // Calculate urgency
  const daysUntilFwd = fwdDate ? differenceInDays(new Date(fwdDate), new Date()) : null
  const isUrgent = daysUntilFwd !== null && daysUntilFwd <= 3
  const isOverdue = daysUntilFwd !== null && daysUntilFwd < 0

  // Count sections
  const totalSections = sections.length

  return (
    <Card
      className={`overflow-hidden ${
        isOverdue ? "border-red-300" : isUrgent ? "border-amber-300" : ""
      }`}
    >
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{orderNumber}</span>
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
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <User className="h-3.5 w-3.5" />
              <span>{customerName}</span>
              {customerPhone && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{customerPhone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Package className="h-3 w-3" />
            <span>{productName}</span>
          </div>
          {fwdDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Calendar className="h-3 w-3" />
              <span>FWD: {format(new Date(fwdDate), "MMM d")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sections List */}
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          {sections.map((section) => {
            const statusConfig = SECTION_STATUS_CONFIG[section.status] || {
              label: section.status,
              color: "bg-gray-100 text-gray-800",
            }

            return (
              <div
                key={section.sectionName}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{section.sectionDisplayName}</span>
                  <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {section.qaData?.youtubeUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(section.qaData.youtubeUrl, "_blank")
                      }}
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mode === "ready" && (
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={onSendAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send All to Client ({totalSections})
            </Button>
          )}

          {mode === "awaiting" && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={onApproveAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Mark All Approved ({totalSections})
            </Button>
          )}

          <Button variant="outline" onClick={onViewDetails}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
