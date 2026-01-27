/**
 * ProductionWorkerDashboard.jsx
 * Worker view - shows their assigned tasks grouped by status
 *
 * File: src/features/production/components/ProductionWorkerDashboard.jsx
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2,
  Factory,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  Calendar,
  PlayCircle,
  Timer,
  User,
  Shirt,
  Eye,
  Hammer,
  Scissors,
  Flame,
  Sparkles,
  Ruler,
  Palette,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import {
  useWorkerTasks,
  useStartTask,
  useCompleteTask,
  useSectionTimeline,
} from "@/hooks/useProduction"
// import { formatDate, formatRelativeTime } from "@/lib/formatters"
import { formatDate } from "../../../utils/formatters"
import {
  PRODUCTION_TASK_STATUS,
  PRODUCTION_TASK_STATUS_CONFIG,
  PRODUCTION_TASK_TYPE_CONFIG,
} from "@/constants/orderConstants"
import TaskTimelineView from "./TaskTimelineView"

// Icon mapping
const TASK_ICONS = {
  ADDA_WORK: Hammer,
  CUTTING_WORK: Scissors,
  IRON_WORK: Flame,
  TASSELS_WORK: Sparkles,
  ALTERATION_WORK: Ruler,
  EMBROIDERY_WORK: Palette,
  CUSTOM: ClipboardList,
}

export default function ProductionWorkerDashboard() {
  const [activeTab, setActiveTab] = useState("ready")
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)

  // Fetch worker's tasks
  const { data: allTasks = [], isLoading, error } = useWorkerTasks()

  // Mutations
  const startTaskMutation = useStartTask()
  const completeTaskMutation = useCompleteTask()

  // Categorize tasks
  const tasksByStatus = {
    ready: allTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.READY),
    waiting: allTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.PENDING),
    inProgress: allTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.IN_PROGRESS),
    completed: allTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED),
  }

  // Handle start task
  const handleStartTask = async (taskId) => {
    try {
      await startTaskMutation.mutateAsync({ taskId })
      toast.success("Task started!", {
        description: "You can now work on this task.",
      })
    } catch (error) {
      toast.error("Failed to start task", {
        description: error.message || "Please try again.",
      })
    }
  }

  // Handle complete task
  const handleCompleteTask = async (taskId) => {
    try {
      await completeTaskMutation.mutateAsync({ taskId })
      toast.success("Task completed!", {
        description: "Great work! The next task is now ready.",
      })
    } catch (error) {
      toast.error("Failed to complete task", {
        description: error.message || "Please try again.",
      })
    }
  }

  // Handle view timeline
  const handleViewTimeline = (task) => {
    setSelectedTask(task)
    setShowTimelineDialog(true)
  }

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
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Tasks</h3>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Ready to Start"
          value={tasksByStatus.ready.length}
          icon={PlayCircle}
          color="blue"
        />
        <StatsCard
          title="Waiting"
          value={tasksByStatus.waiting.length}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="In Progress"
          value={tasksByStatus.inProgress.length}
          icon={Factory}
          color="indigo"
        />
        <StatsCard
          title="Completed"
          value={tasksByStatus.completed.length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Ready ({tasksByStatus.ready.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            In Progress ({tasksByStatus.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Waiting ({tasksByStatus.waiting.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({tasksByStatus.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready" className="mt-4">
          {tasksByStatus.ready.length === 0 ? (
            <EmptyState
              icon={PlayCircle}
              title="No Tasks Ready"
              description="You have no tasks ready to start at the moment."
            />
          ) : (
            <div className="space-y-4">
              {tasksByStatus.ready.map((task) => (
                <WorkerTaskCard
                  key={task.id}
                  task={task}
                  onStart={handleStartTask}
                  onViewTimeline={handleViewTimeline}
                  isStarting={startTaskMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-4">
          {tasksByStatus.inProgress.length === 0 ? (
            <EmptyState
              icon={Factory}
              title="No Tasks In Progress"
              description="You don't have any tasks currently in progress."
            />
          ) : (
            <div className="space-y-4">
              {tasksByStatus.inProgress.map((task) => (
                <WorkerTaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onViewTimeline={handleViewTimeline}
                  isCompleting={completeTaskMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="waiting" className="mt-4">
          {tasksByStatus.waiting.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Waiting Tasks"
              description="All your tasks are either ready or completed."
            />
          ) : (
            <div className="space-y-4">
              {tasksByStatus.waiting.map((task) => (
                <WorkerTaskCard
                  key={task.id}
                  task={task}
                  onViewTimeline={handleViewTimeline}
                  isWaiting
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {tasksByStatus.completed.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No Completed Tasks"
              description="You haven't completed any tasks yet."
            />
          ) : (
            <div className="space-y-4">
              {tasksByStatus.completed.map((task) => (
                <WorkerTaskCard
                  key={task.id}
                  task={task}
                  onViewTimeline={handleViewTimeline}
                  isCompleted
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Timeline Dialog */}
      <TimelineDialog
        task={selectedTask}
        open={showTimelineDialog}
        onOpenChange={setShowTimelineDialog}
      />
    </div>
  )
}

// Dashboard Header
function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-indigo-100 p-2">
        <ClipboardList className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
        <p className="text-muted-foreground">Your assigned production tasks</p>
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

// Worker Task Card
function WorkerTaskCard({
  task,
  onStart,
  onComplete,
  onViewTimeline,
  isStarting,
  isCompleting,
  isWaiting,
  isCompleted,
}) {
  const TaskIcon =
    task.taskType === "CUSTOM" ? ClipboardList : TASK_ICONS[task.taskType] || ClipboardList

  const taskName =
    task.taskType === "CUSTOM"
      ? task.customTaskName
      : PRODUCTION_TASK_TYPE_CONFIG[task.taskType]?.label || task.taskType

  const statusConfig = PRODUCTION_TASK_STATUS_CONFIG[task.status] || {}

  // Calculate time elapsed if in progress
  const getTimeElapsed = () => {
    if (!task.startedAt) return null
    const start = new Date(task.startedAt)
    const now = new Date()
    const diffMs = now - start
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const cardBorderColor = isWaiting
    ? "border-amber-200"
    : isCompleted
      ? "border-green-200"
      : task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS
        ? "border-indigo-200"
        : "border-blue-200"

  return (
    <Card className={cardBorderColor}>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Task Info */}
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`
              rounded-full p-3
              ${isWaiting ? "bg-amber-100" : ""}
              ${isCompleted ? "bg-green-100" : ""}
              ${task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS ? "bg-indigo-100" : ""}
              ${task.status === PRODUCTION_TASK_STATUS.READY ? "bg-blue-100" : ""}
            `}
            >
              <TaskIcon
                className={`
                h-6 w-6
                ${isWaiting ? "text-amber-600" : ""}
                ${isCompleted ? "text-green-600" : ""}
                ${task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS ? "text-indigo-600" : ""}
                ${task.status === PRODUCTION_TASK_STATUS.READY ? "text-blue-600" : ""}
              `}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">{taskName}</h3>
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </div>

              {/* Order Info */}
              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <span className="text-slate-400">Order:</span> {task.orderNumber} -{" "}
                  {task.productName}
                </p>
                <div className="flex items-center gap-1">
                  <Shirt className="h-4 w-4 text-slate-400" />
                  <span>Section: {task.sectionName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>FWD: {formatDate(task.fwdDate)}</span>
                </div>
              </div>

              {/* Time Info */}
              {task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Timer className="h-4 w-4 text-indigo-500 animate-pulse" />
                  <span className="text-indigo-600 font-medium">
                    In progress: {getTimeElapsed()}
                  </span>
                </div>
              )}

              {isCompleted && task.duration && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Timer className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">Completed in: {task.duration}</span>
                </div>
              )}

              {/* Blocking reason for waiting tasks */}
              {isWaiting && task.blockingTask && (
                <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Waiting for: <strong>{task.blockingTask.taskName}</strong>
                      <span className="text-amber-600"> ({task.blockingTask.status})</span>
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Assigned to: {task.blockingTask.workerName}
                  </p>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div className="mt-2 p-2 rounded bg-slate-50 text-sm">
                  <span className="font-medium text-slate-700">Notes:</span>{" "}
                  <span className="text-slate-600">{task.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewTimeline(task)}>
              <Eye className="h-4 w-4 mr-1" />
              View Timeline
            </Button>

            {task.status === PRODUCTION_TASK_STATUS.READY && onStart && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => onStart(task.id)}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-1" />
                )}
                Start Task
              </Button>
            )}

            {task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS && onComplete && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onComplete(task.id)}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Complete Task
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Timeline Dialog
function TimelineDialog({ task, open, onOpenChange }) {
  const { data: timelineData, isLoading } = useSectionTimeline(
    task?.orderItemId,
    task?.sectionName,
    { enabled: open && !!task }
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-indigo-600" />
            Production Timeline
          </DialogTitle>
          <DialogDescription>
            {task?.orderNumber} - {task?.sectionName} Section
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TaskTimelineView
            tasks={timelineData?.tasks || []}
            sectionName={task?.sectionName}
            highlightTaskId={task?.id}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
