/**
 * ProductionHeadDashboard.jsx
 * Production Head view - shows their assigned order items with sections
 *
 * File: src/features/production/components/ProductionHeadDashboard.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Factory,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Calendar,
  ArrowRight,
  Shirt,
  ClipboardList,
  PlayCircle,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { useMyAssignments, useSendSectionToQA } from "@/hooks/useProduction"
// import { formatDate, formatRelativeTime } from "@/lib/formatters"
import { formatDate } from "../../../utils/formatters"
import { SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import TaskTimelineView from "./TaskTimelineView"

export default function ProductionHeadDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("active")

  // Fetch assigned order items
  const { data: assignments = [], isLoading, error } = useMyAssignments()

  // Categorize assignments
  const activeAssignments = assignments.filter((a) => {
    const hasActiveWork = a.sections?.some(
      (s) =>
        s.status === "READY_FOR_PRODUCTION" ||
        s.status === "IN_PRODUCTION" ||
        s.status === "PRODUCTION_COMPLETED"
    )
    return hasActiveWork
  })

  const completedAssignments = assignments.filter((a) => {
    const allQAOrBeyond = a.sections?.every(
      (s) => s.status === "QA_PENDING" || s.status === "QA_APPROVED" || s.status === "DISPATCHED"
    )
    return allQAOrBeyond
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Assignments</h3>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Assignments"
          value={assignments.length}
          icon={ClipboardList}
          color="indigo"
        />
        <StatsCard
          title="Ready for Tasks"
          value={assignments.reduce(
            (sum, a) =>
              sum + (a.sections?.filter((s) => s.status === "READY_FOR_PRODUCTION").length || 0),
            0
          )}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="In Production"
          value={assignments.reduce(
            (sum, a) => sum + (a.sections?.filter((s) => s.status === "IN_PRODUCTION").length || 0),
            0
          )}
          icon={Factory}
          color="blue"
        />
        <StatsCard
          title="Ready for QA"
          value={assignments.reduce(
            (sum, a) =>
              sum + (a.sections?.filter((s) => s.status === "PRODUCTION_COMPLETED").length || 0),
            0
          )}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Active ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Sent to QA ({completedAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeAssignments.length === 0 ? (
            <EmptyState
              icon={Factory}
              title="No Active Assignments"
              description="You have no order items currently in production."
            />
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onNavigate={(orderItemId) => navigate(`/production/order-item/${orderItemId}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedAssignments.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Completed Items"
              description="No order items have been sent to QA yet."
            />
          ) : (
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onNavigate={(orderItemId) => navigate(`/production/order-item/${orderItemId}`)}
                  isCompleted
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Dashboard Header
function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-indigo-100 p-2">
        <Factory className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Production Assignments</h1>
        <p className="text-muted-foreground">Manage tasks and track production progress</p>
      </div>
    </div>
  )
}

// Stats Card
function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty State
function EmptyState({ icon: Icon, title, description }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Assignment Card
function AssignmentCard({ assignment, onNavigate, isCompleted = false }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const sendToQAMutation = useSendSectionToQA()

  // Group sections by status
  const sectionsByStatus = {
    readyForTasks: assignment.sections?.filter((s) => s.status === "READY_FOR_PRODUCTION") || [],
    inProduction: assignment.sections?.filter((s) => s.status === "IN_PRODUCTION") || [],
    completed: assignment.sections?.filter((s) => s.status === "PRODUCTION_COMPLETED") || [],
    sentToQA:
      assignment.sections?.filter((s) => s.status === "QA_PENDING" || s.status === "QA_APPROVED") ||
      [],
  }

  const handleSendToQA = async (sectionName) => {
    try {
      await sendToQAMutation.mutateAsync({
        orderItemId: assignment.id,
        section: sectionName,
      })
      toast.success(`${sectionName} sent to QA`, {
        description: "Quality check pending.",
      })
    } catch (error) {
      toast.error("Failed to send to QA", {
        description: error.message || "Please try again.",
      })
    }
  }

  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50/30" : "border-indigo-200"}>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {assignment.productImage ? (
                <img
                  src={assignment.productImage}
                  alt={assignment.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">{assignment.productName}</h3>
                <Badge variant="outline">{assignment.orderNumber}</Badge>
              </div>
              <p className="text-sm text-slate-500 mb-1">Customer: {assignment.customerName}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  FWD: {formatDate(assignment.fwdDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-1" />
              )}
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            <Button size="sm" onClick={() => onNavigate(assignment.id)}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>

        {/* Sections Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <SectionStatusBadge
            label="Ready for Tasks"
            count={sectionsByStatus.readyForTasks.length}
            color="amber"
          />
          <SectionStatusBadge
            label="In Production"
            count={sectionsByStatus.inProduction.length}
            color="blue"
          />
          <SectionStatusBadge
            label="Production Done"
            count={sectionsByStatus.completed.length}
            color="green"
          />
          <SectionStatusBadge
            label="Sent to QA"
            count={sectionsByStatus.sentToQA.length}
            color="purple"
          />
        </div>

        {/* Expanded Section Details */}
        {isExpanded && (
          <div className="border-t pt-4 mt-4 space-y-3">
            {assignment.sections?.map((section) => (
              <SectionRow
                key={section.name}
                section={section}
                orderItemId={assignment.id}
                onNavigate={onNavigate}
                onSendToQA={handleSendToQA}
                isSendingToQA={sendToQAMutation.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Section Status Badge
function SectionStatusBadge({ label, count, color }) {
  const colorClasses = {
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  }

  return (
    <div className={`rounded-md px-3 py-2 text-center border ${colorClasses[color]}`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs">{label}</p>
    </div>
  )
}

// Section Row
function SectionRow({ section, orderItemId, onNavigate, onSendToQA, isSendingToQA }) {
  const statusConfig = SECTION_STATUS_CONFIG[section.status] || {
    label: section.status,
    color: "bg-gray-100 text-gray-800",
  }

  const showCreateTasks = section.status === "READY_FOR_PRODUCTION"
  const showViewProgress = section.status === "IN_PRODUCTION"
  const showSendToQA = section.status === "PRODUCTION_COMPLETED"

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
      <div className="flex items-center gap-3">
        <Shirt className="h-5 w-5 text-slate-400" />
        <div>
          <p className="font-medium text-slate-900">{section.name}</p>
          {section.tasksCount !== undefined && (
            <p className="text-xs text-slate-500">
              Tasks: {section.completedTasks || 0}/{section.tasksCount || 0} completed
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>

        {showCreateTasks && (
          <Button size="sm" variant="outline" onClick={() => onNavigate(orderItemId)}>
            <ClipboardList className="h-4 w-4 mr-1" />
            Create Tasks
          </Button>
        )}

        {showViewProgress && (
          <Button size="sm" variant="outline" onClick={() => onNavigate(orderItemId)}>
            <Eye className="h-4 w-4 mr-1" />
            View Progress
          </Button>
        )}

        {showSendToQA && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onSendToQA(section.name)}
            disabled={isSendingToQA}
          >
            {isSendingToQA ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Send to QA
          </Button>
        )}
      </div>
    </div>
  )
}
