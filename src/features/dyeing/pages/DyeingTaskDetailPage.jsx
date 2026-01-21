/**
 * DyeingTaskDetailPage.jsx
 * Detailed view for a specific dyeing task with section-level actions
 *
 * File: src/features/dyeing/pages/DyeingTaskDetailPage.jsx
 */

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  ArrowLeft,
  Droplets,
  User,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  RefreshCcw,
  Play,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useDyeingTaskDetails,
  useAcceptDyeingSections,
  useStartDyeing,
  useCompleteDyeing,
  useRejectDyeingSections,
} from "../../../hooks/usedyeing"
import { SECTION_STATUS, ORDER_ITEM_STATUS_CONFIG } from "@/constants/orderConstants"
import DyeingStatusBadge from "../components/DyeingStatusBadge"
import DyeingSectionCard from "../components/DyeingSectionCard"
import DyeingAcceptDialog from "../components/DyeingAcceptDialog"
import DyeingStartDialog from "../components/DyeingStartDialog"
import DyeingCompleteDialog from "../components/DyeingCompleteDialog"
import DyeingRejectionDialog from "../components/DyeingRejectionDialog"

export default function DyeingTaskDetailPage() {
  const { orderItemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Dialog states
  const [acceptDialog, setAcceptDialog] = useState({ open: false, sections: [] })
  const [startDialog, setStartDialog] = useState({ open: false, sections: [] })
  const [completeDialog, setCompleteDialog] = useState({ open: false, sections: [] })
  const [rejectDialog, setRejectDialog] = useState({ open: false, sections: [] })

  // Fetch task details
  const { data: taskData, isLoading, isError, error, refetch } = useDyeingTaskDetails(orderItemId)

  // Mutations
  const acceptMutation = useAcceptDyeingSections()
  const startMutation = useStartDyeing()
  const completeMutation = useCompleteDyeing()
  const rejectMutation = useRejectDyeingSections()

  const task = taskData?.data

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
      </div>
    )
  }

  if (isError || !task) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              {error?.message || "Task not found or you don't have access to it."}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dyeing/available")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Available Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    orderNumber,
    orderId,
    customerName,
    productName,
    productSku,
    productImage,
    fwdDate,
    priority,
    status,
    sections = [],
    journey = [],
    assignedTo,
    assignedToName,
  } = task

  // Calculate urgency
  const daysUntilFwd = fwdDate ? differenceInDays(new Date(fwdDate), new Date()) : null
  const isUrgent = daysUntilFwd !== null && daysUntilFwd <= 3
  const isOverdue = daysUntilFwd !== null && daysUntilFwd < 0

  // Check if current user is assigned to this task
  const isAssignedToMe = assignedTo === user?.id || assignedTo === String(user?.id)

  // Group sections by status
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

  // Handlers
  const handleAcceptAll = () => {
    setAcceptDialog({
      open: true,
      sections: readyForDyeingSections.map((s) => s.name),
    })
  }

  const handleAcceptSection = (sectionName) => {
    setAcceptDialog({ open: true, sections: [sectionName] })
  }

  const handleConfirmAccept = (selectedSections) => {
    acceptMutation.mutate(
      { orderItemId, userId: user?.id, sections: selectedSections },
      { onSuccess: () => setAcceptDialog({ open: false, sections: [] }) }
    )
  }

  const handleStartSection = (sectionName) => {
    setStartDialog({ open: true, sections: [sectionName] })
  }

  const handleStartAll = () => {
    setStartDialog({ open: true, sections: acceptedSections.map((s) => s.name) })
  }

  const handleConfirmStart = (selectedSections) => {
    startMutation.mutate(
      { orderItemId, userId: user?.id, sections: selectedSections },
      { onSuccess: () => setStartDialog({ open: false, sections: [] }) }
    )
  }

  const handleCompleteSection = (sectionName) => {
    setCompleteDialog({ open: true, sections: [sectionName] })
  }

  const handleCompleteAll = () => {
    setCompleteDialog({ open: true, sections: inProgressSections.map((s) => s.name) })
  }

  const handleConfirmComplete = (selectedSections) => {
    completeMutation.mutate(
      { orderItemId, userId: user?.id, sections: selectedSections },
      { onSuccess: () => setCompleteDialog({ open: false, sections: [] }) }
    )
  }

  const handleRejectSection = (sectionName) => {
    setRejectDialog({ open: true, sections: [sectionName] })
  }

  const handleConfirmReject = ({ sections: selectedSections, reasonCode, notes }) => {
    rejectMutation.mutate(
      { orderItemId, userId: user?.id, sections: selectedSections, reasonCode, notes },
      { onSuccess: () => setRejectDialog({ open: false, sections: [] }) }
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-muted-foreground">Back</span>
      </div>

      {/* Order Item Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {(isUrgent || isOverdue) && (
                  <Badge
                    variant="destructive"
                    className={isOverdue ? "bg-red-600" : "bg-amber-500"}
                  >
                    {isOverdue ? "OVERDUE" : "URGENT"}
                  </Badge>
                )}
                {priority && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-300"
                  >
                    <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                    High Priority
                  </Badge>
                )}
                <CardTitle className="text-xl">{orderNumber}</CardTitle>
              </div>
              <p className="text-lg text-muted-foreground">{productName}</p>
              {productSku && <p className="text-sm text-muted-foreground">SKU: {productSku}</p>}
            </div>
            <Badge variant="outline" className="bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200">
              <Droplets className="h-3 w-3 mr-1" />
              {ORDER_ITEM_STATUS_CONFIG[status]?.label || status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>FWD: {fwdDate ? format(new Date(fwdDate), "MMM d, yyyy") : "Not set"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{sections.length} sections</span>
            </div>
            {assignedToName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Assigned: {assignedToName}</span>
              </div>
            )}
          </div>

          {/* Journey */}
          {journey.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Order Journey:</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                  {journey.map((step, idx) => (
                    <span key={idx} className="flex items-center">
                      {step.completed ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      ) : step.current ? (
                        <Droplets className="h-3 w-3 text-fuchsia-500 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      )}
                      <span className={step.current ? "font-medium text-fuchsia-600" : ""}>
                        {step.label}
                      </span>
                      {idx < journey.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {(readyForDyeingSections.length > 0 ||
        acceptedSections.length > 0 ||
        inProgressSections.length > 0) && (
        <Card className="border-fuchsia-200 bg-fuchsia-50/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium">Bulk Actions:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {readyForDyeingSections.length > 0 && !assignedTo && (
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="bg-fuchsia-600 hover:bg-fuchsia-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept All ({readyForDyeingSections.length})
                  </Button>
                )}
                {acceptedSections.length > 0 && isAssignedToMe && (
                  <Button
                    size="sm"
                    onClick={handleStartAll}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start All ({acceptedSections.length})
                  </Button>
                )}
                {inProgressSections.length > 0 && isAssignedToMe && (
                  <Button
                    size="sm"
                    onClick={handleCompleteAll}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete All ({inProgressSections.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sections</h2>

        {/* Ready for Dyeing */}
        {readyForDyeingSections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-fuchsia-600 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Ready for Dyeing ({readyForDyeingSections.length})
            </h3>
            {readyForDyeingSections.map((section) => (
              <DyeingSectionCard
                key={section.name}
                sectionName={section.name}
                sectionData={section}
                materials={section.materials || []}
                showActions={!assignedTo}
                viewMode="available"
                onAccept={handleAcceptSection}
                onReject={handleRejectSection}
              />
            ))}
          </div>
        )}

        {/* Accepted (waiting to start) */}
        {acceptedSections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Accepted - Waiting to Start ({acceptedSections.length})
            </h3>
            {acceptedSections.map((section) => (
              <DyeingSectionCard
                key={section.name}
                sectionName={section.name}
                sectionData={section}
                materials={section.materials || []}
                showActions={isAssignedToMe}
                viewMode="my-tasks"
                onStart={handleStartSection}
                onReject={handleRejectSection}
              />
            ))}
          </div>
        )}

        {/* In Progress */}
        {inProgressSections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Dyeing in Progress ({inProgressSections.length})
            </h3>
            {inProgressSections.map((section) => (
              <DyeingSectionCard
                key={section.name}
                sectionName={section.name}
                sectionData={section}
                materials={section.materials || []}
                showActions={isAssignedToMe}
                viewMode="my-tasks"
                onComplete={handleCompleteSection}
                onReject={handleRejectSection}
              />
            ))}
          </div>
        )}

        {/* Completed */}
        {completedSections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Dyeing Completed ({completedSections.length})
            </h3>
            {completedSections.map((section) => (
              <DyeingSectionCard
                key={section.name}
                sectionName={section.name}
                sectionData={section}
                materials={section.materials || []}
                showActions={false}
                viewMode="detail"
              />
            ))}
          </div>
        )}

        {/* Other sections (context) */}
        {otherSections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Other Sections (Context)
            </h3>
            <Alert className="border-gray-200 bg-gray-50">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <AlertDescription className="text-gray-600">
                These sections are not yet ready for dyeing or are in other workflow stages.
              </AlertDescription>
            </Alert>
            {otherSections.map((section) => (
              <DyeingSectionCard
                key={section.name}
                sectionName={section.name}
                sectionData={section}
                materials={section.materials || []}
                showActions={false}
                viewMode="detail"
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DyeingAcceptDialog
        open={acceptDialog.open}
        onOpenChange={(open) => setAcceptDialog({ ...acceptDialog, open })}
        sections={acceptDialog.sections}
        orderNumber={orderNumber}
        onConfirm={handleConfirmAccept}
        isLoading={acceptMutation.isPending}
      />

      <DyeingStartDialog
        open={startDialog.open}
        onOpenChange={(open) => setStartDialog({ ...startDialog, open })}
        sections={startDialog.sections}
        onConfirm={handleConfirmStart}
        isLoading={startMutation.isPending}
      />

      <DyeingCompleteDialog
        open={completeDialog.open}
        onOpenChange={(open) => setCompleteDialog({ ...completeDialog, open })}
        sections={completeDialog.sections}
        onConfirm={handleConfirmComplete}
        isLoading={completeMutation.isPending}
      />

      <DyeingRejectionDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
        sections={rejectDialog.sections}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}
