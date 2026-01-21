/**
 * DyeingTaskCard.jsx
 * Card showing order item with sections ready for dyeing
 * Used in Available Tasks and My Tasks pages
 *
 * File: src/features/dyeing/components/DyeingTaskCard.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Package,
  AlertTriangle,
  Star,
  ChevronRight,
  Droplets,
} from "lucide-react"
import { format, differenceInDays, isPast } from "date-fns"
import { SECTION_STATUS, ORDER_ITEM_STATUS_CONFIG } from "@/constants/orderConstants"
import DyeingStatusBadge from "./DyeingStatusBadge"

export default function DyeingTaskCard({
  task,
  viewMode = "available", // "available" | "my-tasks" | "completed"
  onAcceptAll,
  onViewDetails,
}) {
  const navigate = useNavigate()

  const {
    orderItemId,
    orderId,
    orderNumber,
    customerName,
    productName,
    productSku,
    fwdDate,
    priority,
    sections = [],
    acceptedAt,
    completedAt,
    journey = [],
  } = task

  // Calculate urgency based on FWD date
  const daysUntilFwd = fwdDate ? differenceInDays(new Date(fwdDate), new Date()) : null
  const isUrgent = daysUntilFwd !== null && daysUntilFwd <= 3
  const isOverdue = daysUntilFwd !== null && daysUntilFwd < 0

  // Filter sections by their status for this view
  const readyForDyeingSections = sections.filter(
    (s) => s.status === SECTION_STATUS.READY_FOR_DYEING
  )
  const acceptedSections = sections.filter((s) => s.status === SECTION_STATUS.DYEING_ACCEPTED)
  const inProgressSections = sections.filter((s) => s.status === SECTION_STATUS.DYEING_IN_PROGRESS)
  const completedSections = sections.filter((s) => s.status === SECTION_STATUS.DYEING_COMPLETED)
  const otherSections = sections.filter(
    (s) =>
      ![
        SECTION_STATUS.READY_FOR_DYEING,
        SECTION_STATUS.DYEING_ACCEPTED,
        SECTION_STATUS.DYEING_IN_PROGRESS,
        SECTION_STATUS.DYEING_COMPLETED,
      ].includes(s.status)
  )

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(task)
    } else {
      navigate(`/dyeing/task/${orderItemId}`)
    }
  }

  const handleAcceptAll = () => {
    if (onAcceptAll) {
      onAcceptAll(
        task,
        readyForDyeingSections.map((s) => s.name)
      )
    }
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-300" : isUrgent ? "border-amber-300" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {(isUrgent || isOverdue) && (
                <Badge variant="destructive" className={isOverdue ? "bg-red-600" : "bg-amber-500"}>
                  {isOverdue ? "OVERDUE" : "URGENT"}
                </Badge>
              )}
              {priority && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                  High Priority
                </Badge>
              )}
              <CardTitle className="text-lg font-semibold">{orderNumber}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{productName}</p>
            {productSku && <p className="text-xs text-muted-foreground">SKU: {productSku}</p>}
          </div>
          <Badge variant="outline" className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200">
            <Droplets className="h-3 w-3 mr-1" />
            Dyeing
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer and Date Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              FWD: {fwdDate ? format(new Date(fwdDate), "MMM d, yyyy") : "Not set"}
              {daysUntilFwd !== null && (
                <span
                  className={`ml-1 ${isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  ({isOverdue ? `${Math.abs(daysUntilFwd)} days ago` : `${daysUntilFwd} days`})
                </span>
              )}
            </span>
          </div>
        </div>

        <Separator />

        {/* Sections Status Summary */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Sections:</p>
          <div className="space-y-1.5">
            {viewMode === "available" && readyForDyeingSections.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {readyForDyeingSections.map((section) => (
                  <div
                    key={section.name}
                    className="flex items-center gap-1.5 px-2 py-1 bg-fuchsia-50 rounded-md"
                  >
                    <span className="text-sm font-medium capitalize">{section.name}</span>
                    <DyeingStatusBadge status={section.status} size="sm" showIcon={false} />
                  </div>
                ))}
              </div>
            )}

            {viewMode === "my-tasks" && (
              <div className="space-y-2">
                {acceptedSections.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {acceptedSections.map((section) => (
                      <div
                        key={section.name}
                        className="flex items-center gap-1.5 px-2 py-1 bg-fuchsia-100 rounded-md"
                      >
                        <span className="text-sm font-medium capitalize">{section.name}</span>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-fuchsia-200 text-fuchsia-800"
                        >
                          Accepted
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                {inProgressSections.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {inProgressSections.map((section) => (
                      <div
                        key={section.name}
                        className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-md"
                      >
                        <span className="text-sm font-medium capitalize">{section.name}</span>
                        <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                          In Progress
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                {completedSections.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {completedSections.map((section) => (
                      <div
                        key={section.name}
                        className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md"
                      >
                        <span className="text-sm font-medium capitalize">{section.name}</span>
                        <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other sections for context */}
            {otherSections.length > 0 && viewMode === "my-tasks" && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1.5">Other sections (context):</p>
                <div className="flex flex-wrap gap-1.5">
                  {otherSections.map((section) => (
                    <div
                      key={section.name}
                      className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs"
                    >
                      <span className="capitalize">{section.name}</span>
                      <DyeingStatusBadge status={section.status} size="sm" showIcon={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Journey (for available tasks) */}
        {viewMode === "available" && journey.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Journey:</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                {journey.map((step, idx) => (
                  <span key={idx} className="flex items-center">
                    {step.completed ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    )}
                    {step.label}
                    {idx < journey.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Accepted/Completed timestamps */}
        {viewMode === "my-tasks" && acceptedAt && (
          <div className="text-xs text-muted-foreground">
            Accepted: {format(new Date(acceptedAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}
        {viewMode === "completed" && completedAt && (
          <div className="text-xs text-muted-foreground">
            Completed: {format(new Date(completedAt), "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {viewMode === "available" && readyForDyeingSections.length > 0 && (
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept All ({readyForDyeingSections.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
