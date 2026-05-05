/**
 * TaskTimelineView.jsx
 * Visual timeline showing task progress for a section.
 * Shared between Production Head Dashboard and Worker Task View.
 *
 * File: src/features/production/components/TaskTimelineView.jsx
 *
 * Production heads can opt in to task reassignment by passing `canReassign={true}`.
 * Workers should NEVER receive canReassign=true (leave it defaulted to false).
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  CheckCircle,
  Clock,
  PlayCircle,
  Circle,
  User,
  Timer,
  AlertCircle,
  Scissors,
  Hammer,
  Flame,
  Sparkles,
  Ruler,
  Palette,
  ClipboardList,
  UserCog,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "../../../utils/formatters"
import {
  PRODUCTION_TASK_STATUS,
  PRODUCTION_TASK_STATUS_CONFIG,
  PRODUCTION_TASK_TYPE_CONFIG,
} from "@/constants/orderConstants"
import { useReassignTask, useProductionWorkers } from "@/hooks/useProduction"

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

// Status icons
const STATUS_ICONS = {
  PENDING: Clock,
  READY: PlayCircle,
  IN_PROGRESS: Loader2,
  COMPLETED: CheckCircle,
}

export default function TaskTimelineView({
  tasks = [],
  sectionName,
  compact = false,
  highlightTaskId = null,
  canReassign = false,
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tasks created yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort tasks by sequence order
  const sortedTasks = [...tasks].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  // Find current task (first non-completed task)
  const currentTaskIndex = sortedTasks.findIndex(
    (t) => t.status !== PRODUCTION_TASK_STATUS.COMPLETED
  )

  return (
    <Card className={highlightTaskId ? "border-indigo-200" : ""}>
      {!compact && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-indigo-600" />
            {sectionName} Section - Production Timeline
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "pt-4" : ""}>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {sortedTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED).length} /{" "}
              {sortedTasks.length} completed
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              style={{
                width: `${(sortedTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED).length / sortedTasks.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

          {/* Tasks */}
          <div className="space-y-4">
            {sortedTasks.map((task, index) => {
              const isHighlighted = task.id === highlightTaskId
              const isCurrent = index === currentTaskIndex
              const TaskIcon =
                task.taskType === "CUSTOM"
                  ? ClipboardList
                  : TASK_ICONS[task.taskType] || ClipboardList
              const StatusIcon = STATUS_ICONS[task.status] || Circle
              const statusConfig = PRODUCTION_TASK_STATUS_CONFIG[task.status] || {}

              return (
                <TaskTimelineItem
                  key={task.id}
                  task={task}
                  index={index}
                  TaskIcon={TaskIcon}
                  StatusIcon={StatusIcon}
                  statusConfig={statusConfig}
                  isHighlighted={isHighlighted}
                  isCurrent={isCurrent}
                  compact={compact}
                  canReassign={canReassign}
                />
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Individual Timeline Item
function TaskTimelineItem({
  task,
  index,
  TaskIcon,
  StatusIcon,
  statusConfig,
  isHighlighted,
  isCurrent,
  compact,
  canReassign,
}) {
  const [isReassignOpen, setIsReassignOpen] = useState(false)

  const taskName =
    task.taskType === "CUSTOM"
      ? task.customTaskName
      : PRODUCTION_TASK_TYPE_CONFIG[task.taskType]?.label || task.taskType

  // Calculate duration if completed
  const duration =
    task.startedAt && task.completedAt ? calculateDuration(task.startedAt, task.completedAt) : null

  // A task is reassignable only if caller allows it AND status is PENDING/READY/IN_PROGRESS
  const isReassignable =
    canReassign &&
    [
      PRODUCTION_TASK_STATUS.PENDING,
      PRODUCTION_TASK_STATUS.READY,
      PRODUCTION_TASK_STATUS.IN_PROGRESS,
    ].includes(task.status)

  // Get status-based styling
  const getStatusStyles = () => {
    switch (task.status) {
      case PRODUCTION_TASK_STATUS.COMPLETED:
        return {
          dot: "bg-green-500 border-green-200",
          card: "border-green-200 bg-green-50/50",
          icon: "text-green-600",
        }
      case PRODUCTION_TASK_STATUS.IN_PROGRESS:
        return {
          dot: "bg-amber-500 border-amber-200 animate-pulse",
          card: "border-amber-200 bg-amber-50/50",
          icon: "text-amber-600",
        }
      case PRODUCTION_TASK_STATUS.READY:
        return {
          dot: "bg-blue-500 border-blue-200",
          card: "border-blue-200 bg-blue-50/50",
          icon: "text-blue-600",
        }
      default:
        return {
          dot: "bg-slate-300 border-slate-200",
          card: "border-slate-200 bg-slate-50/50",
          icon: "text-slate-400",
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <div
      className={`
        relative flex items-start gap-4 pl-10
        ${isHighlighted ? "ring-2 ring-indigo-500 ring-offset-2 rounded-lg" : ""}
      `}
    >
      {/* Timeline dot */}
      <div
        className={`
          absolute left-2 w-5 h-5 rounded-full border-4 bg-white flex items-center justify-center
          ${styles.dot}
        `}
      >
        {task.status === PRODUCTION_TASK_STATUS.COMPLETED && (
          <CheckCircle className="h-3 w-3 text-white" />
        )}
      </div>

      {/* Task Card */}
      <div className={`flex-1 rounded-lg border p-3 ${styles.card}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {index + 1}
            </Badge>
            <TaskIcon className={`h-4 w-4 ${styles.icon}`} />
            <span className="font-medium text-slate-900">{taskName}</span>
            {isCurrent && <Badge className="bg-amber-100 text-amber-700 text-xs">Current</Badge>}
          </div>
          <Badge className={statusConfig.color || "bg-slate-100 text-slate-600"}>
            <StatusIcon
              className={`h-3 w-3 mr-1 ${task.status === "IN_PROGRESS" ? "animate-spin" : ""}`}
            />
            {statusConfig.label}
          </Badge>
        </div>

        {!compact && (
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            {/* Worker */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span>Assigned to: {task.assignedToName || "Unknown"}</span>
            </div>

            {/* Timestamps */}
            {task.assignedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Assigned: {formatDate(task.assignedAt)}</span>
              </div>
            )}

            {task.startedAt && (
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-slate-400" />
                <span>Started: {formatDate(task.startedAt)}</span>
              </div>
            )}

            {task.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Completed: {formatDate(task.completedAt)}</span>
              </div>
            )}

            {/* Duration */}
            {duration && (
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-indigo-600">Duration: {duration}</span>
              </div>
            )}

            {/* Blocking reason for pending tasks */}
            {task.status === PRODUCTION_TASK_STATUS.PENDING && index > 0 && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded bg-slate-100">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-700">
                  Waiting for previous task to complete
                </span>
              </div>
            )}

            {/* Notes — reassignment reason will appear here because reassignTask appends it */}
            {task.notes && (
              <div className="mt-2 p-2 rounded bg-white border text-xs whitespace-pre-wrap">
                <span className="font-medium">Notes:</span> {task.notes}
              </div>
            )}
          </div>
        )}

        {/* Reassign button — shown in BOTH compact and full mode for production heads */}
        {isReassignable && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsReassignOpen(true)}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <UserCog className="h-3.5 w-3.5 mr-1.5" />
              Reassign
            </Button>
          </div>
        )}
      </div>

      {isReassignable && (
        <ReassignTaskDialog
          open={isReassignOpen}
          onOpenChange={setIsReassignOpen}
          task={task}
        />
      )}
    </div>
  )
}

// Reassignment Dialog
function ReassignTaskDialog({ open, onOpenChange, task }) {
  const [newWorkerId, setNewWorkerId] = useState("")
  const [reason, setReason] = useState("")

  const { data: workers = [], isLoading: isLoadingWorkers } = useProductionWorkers()
  const reassignMutation = useReassignTask()

  const taskName =
    task.taskType === "CUSTOM"
      ? task.customTaskName
      : PRODUCTION_TASK_TYPE_CONFIG[task.taskType]?.label || task.taskType

  // Exclude the currently-assigned worker from the dropdown
  const availableWorkers = workers.filter(
    (w) => String(w.id) !== String(task.assignedToId)
  )

  const handleSubmit = async () => {
    if (!newWorkerId) {
      toast.error("Please select a worker")
      return
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for reassignment")
      return
    }

    try {
      await reassignMutation.mutateAsync({
        taskId: task.id,
        newWorkerId,
        reason: reason.trim(),
      })
      toast.success("Task reassigned successfully")
      setNewWorkerId("")
      setReason("")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to reassign task", {
        description: error?.message || "Please try again.",
      })
    }
  }

  const handleClose = (nextOpen) => {
    if (reassignMutation.isPending) return
    if (!nextOpen) {
      setNewWorkerId("")
      setReason("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Reassign Task
          </DialogTitle>
          <DialogDescription>
            Reassign <span className="font-semibold">{taskName}</span> from{" "}
            <span className="font-semibold">{task.assignedToName || "current worker"}</span> to a
            different worker.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-worker">New Worker</Label>
            <Select
              value={newWorkerId}
              onValueChange={setNewWorkerId}
              disabled={isLoadingWorkers || reassignMutation.isPending}
            >
              <SelectTrigger id="new-worker">
                <SelectValue
                  placeholder={isLoadingWorkers ? "Loading..." : "Select a worker"}
                />
              </SelectTrigger>
              <SelectContent>
                {availableWorkers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-slate-500">
                    No other workers available
                  </div>
                ) : (
                  availableWorkers.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Original worker is sick and unavailable for several days"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={reassignMutation.isPending}
            />
            <p className="text-xs text-slate-500">
              This reason will be shown in the task notes and activity log.
            </p>
          </div>

          {task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This task is currently in progress. Reassigning will reset it to Ready — the new
                worker will need to click Start.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={reassignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              reassignMutation.isPending || !newWorkerId || !reason.trim() || isLoadingWorkers
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {reassignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserCog className="h-4 w-4 mr-2" />
                Reassign Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to calculate duration
function calculateDuration(startedAt, completedAt) {
  const start = new Date(startedAt)
  const end = new Date(completedAt)
  const diffMs = end - start

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes}m`
  }
  return `${hours}h ${minutes}m`
}

// Mini version for compact displays
export function TaskTimelineMini({ tasks = [], currentTaskId }) {
  if (!tasks || tasks.length === 0) return null

  const sortedTasks = [...tasks].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
  const completedCount = sortedTasks.filter(
    (t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED
  ).length

  return (
    <div className="flex items-center gap-2">
      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {sortedTasks.map((task, index) => {
          const isCompleted = task.status === PRODUCTION_TASK_STATUS.COMPLETED
          const isInProgress = task.status === PRODUCTION_TASK_STATUS.IN_PROGRESS
          const isCurrent = task.id === currentTaskId

          return (
            <div
              key={task.id}
              className={`
                w-2 h-2 rounded-full transition-all
                ${isCompleted ? "bg-green-500" : ""}
                ${isInProgress ? "bg-amber-500 animate-pulse" : ""}
                ${!isCompleted && !isInProgress ? "bg-slate-300" : ""}
                ${isCurrent ? "ring-2 ring-indigo-500 ring-offset-1" : ""}
              `}
              title={
                task.taskType === "CUSTOM"
                  ? task.customTaskName
                  : PRODUCTION_TASK_TYPE_CONFIG[task.taskType]?.label
              }
            />
          )
        })}
      </div>
      <span className="text-xs text-slate-500">
        {completedCount}/{sortedTasks.length}
      </span>
    </div>
  )
}