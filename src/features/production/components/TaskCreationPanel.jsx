/**
 * TaskCreationPanel.jsx
 * Bulk task creation UI for production head - includes predefined + custom tasks
 *
 * File: src/features/production/components/TaskCreationPanel.jsx
 */

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Plus,
  X,
  GripVertical,
  Scissors,
  Hammer,
  Flame,
  Sparkles,
  Ruler,
  Palette,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  PlayCircle,
} from "lucide-react"
import { toast } from "sonner"
import { PRODUCTION_TASK_TYPES, PRODUCTION_TASK_TYPE_CONFIG } from "@/constants/orderConstants"
import {
  useCreateSectionTasks,
  useStartSectionProduction,
  useProductionWorkers,
} from "@/hooks/useProduction"

// Icon mapping for task types
const TASK_ICONS = {
  ADDA_WORK: Hammer,
  CUTTING_WORK: Scissors,
  IRON_WORK: Flame,
  TASSELS_WORK: Sparkles,
  ALTERATION_WORK: Ruler,
  EMBROIDERY_WORK: Palette,
  CUSTOM: ClipboardList,
}

export default function TaskCreationPanel({ orderItemId, sectionName, onClose, onSuccess }) {
  // State for selected predefined tasks
  const [selectedTasks, setSelectedTasks] = useState({})
  // State for custom tasks
  const [customTasks, setCustomTasks] = useState([])
  // State for new custom task input
  const [newCustomTaskName, setNewCustomTaskName] = useState("")
  const [newCustomTaskWorker, setNewCustomTaskWorker] = useState("")
  // State for global notes
  const [notes, setNotes] = useState("")
  // State for task sequence (ordered array of task keys)
  const [taskSequence, setTaskSequence] = useState([])

  // Fetch workers for assignment dropdowns
  const { data: workers = [], isLoading: isLoadingWorkers } = useProductionWorkers()

  // Mutations
  const createTasksMutation = useCreateSectionTasks()
  const startProductionMutation = useStartSectionProduction()

  // Get predefined task types
  const predefinedTaskTypes = Object.entries(PRODUCTION_TASK_TYPES)
    .filter(([key]) => key !== "CUSTOM")
    .map(([key, value]) => ({
      key,
      value,
      ...PRODUCTION_TASK_TYPE_CONFIG[key],
      Icon: TASK_ICONS[key],
    }))

  // Handle predefined task selection
  const handleTaskToggle = (taskKey) => {
    setSelectedTasks((prev) => {
      const isSelected = !!prev[taskKey]
      const nextSelected = { ...prev }

      if (isSelected) {
        delete nextSelected[taskKey]
      } else {
        nextSelected[taskKey] = { workerId: "", notes: "" }
      }

      return nextSelected
    })

    setTaskSequence((seq) => {
      if (seq.includes(taskKey)) {
        return seq.filter((k) => k !== taskKey)
      }
      return [...seq, taskKey]
    })
  }

  // Handle worker assignment for predefined task
  const handleWorkerChange = (taskKey, workerId) => {
    setSelectedTasks((prev) => ({
      ...prev,
      [taskKey]: { ...prev[taskKey], workerId },
    }))
  }

  // Add custom task
  const handleAddCustomTask = () => {
    if (!newCustomTaskName.trim()) {
      toast.error("Please enter a task name")
      return
    }
    if (!newCustomTaskWorker) {
      toast.error("Please select a worker")
      return
    }

    const customTaskKey = `CUSTOM_${Date.now()}`
    const newTask = {
      key: customTaskKey,
      name: newCustomTaskName.trim(),
      workerId: newCustomTaskWorker,
    }

    setCustomTasks((prev) => [...prev, newTask])
    setTaskSequence((seq) => [...seq, customTaskKey])
    setNewCustomTaskName("")
    setNewCustomTaskWorker("")
  }

  // Remove custom task
  const handleRemoveCustomTask = (taskKey) => {
    setCustomTasks((prev) => prev.filter((t) => t.key !== taskKey))
    setTaskSequence((seq) => seq.filter((k) => k !== taskKey))
  }

  // Move task in sequence
  const moveTask = (index, direction) => {
    const newSequence = [...taskSequence]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= newSequence.length) return // Swap
    ;[newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]]
    setTaskSequence(newSequence)
  }

  // Build tasks array for submission
  const buildTasksArray = () => {
    return taskSequence.map((taskKey, index) => {
      if (taskKey.startsWith("CUSTOM_")) {
        const customTask = customTasks.find((t) => t.key === taskKey)
        return {
          taskType: "CUSTOM",
          customTaskName: customTask.name,
          workerId: customTask.workerId,
          sequenceOrder: index + 1,
        }
      } else {
        const task = selectedTasks[taskKey]
        return {
          taskType: taskKey,
          customTaskName: null,
          workerId: task.workerId,
          sequenceOrder: index + 1,
        }
      }
    })
  }

  // Validate before submission
  const validateTasks = () => {
    if (taskSequence.length === 0) {
      toast.error("Please select at least one task")
      return false
    }

    // Check all tasks have workers assigned
    for (const taskKey of taskSequence) {
      if (taskKey.startsWith("CUSTOM_")) {
        const customTask = customTasks.find((t) => t.key === taskKey)
        if (!customTask?.workerId) {
          toast.error(`Please assign a worker to "${customTask?.name}"`)
          return false
        }
      } else {
        if (!selectedTasks[taskKey]?.workerId) {
          toast.error(`Please assign a worker to "${PRODUCTION_TASK_TYPE_CONFIG[taskKey]?.label}"`)
          return false
        }
      }
    }

    return true
  }

  // Handle submit - Create tasks and start production
  const handleSubmit = async () => {
    if (!validateTasks()) return

    try {
      const tasks = buildTasksArray()

      // Create tasks
      await createTasksMutation.mutateAsync({
        orderItemId,
        section: sectionName,
        tasks,
        notes,
      })

      // Start production
      await startProductionMutation.mutateAsync({
        orderItemId,
        section: sectionName,
      })

      toast.success("Tasks created and production started!", {
        description: `${tasks.length} tasks created for ${sectionName} section.`,
      })

      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create tasks", {
        description: error?.message || "Please try again.",
      })
    }
  }

  const isSubmitting = createTasksMutation.isPending || startProductionMutation.isPending

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
          Create Tasks for {sectionName} Section
        </CardTitle>
        <CardDescription>
          Select tasks, assign workers, and set the execution sequence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predefined Tasks */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Tasks</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedTaskTypes.map(({ key, label, Icon }) => (
              <div
                key={key}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${
                    selectedTasks[key]
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }
                `}
                onClick={() => handleTaskToggle(key)}
              >
                <Checkbox
                  checked={!!selectedTasks[key]}
                  onCheckedChange={() => handleTaskToggle(key)}
                />
                <Icon className="h-5 w-5 text-slate-500" />
                <span className="flex-1 font-medium">{label}</span>

                {selectedTasks[key] && (
                  <Select
                    value={selectedTasks[key].workerId}
                    onValueChange={(v) => handleWorkerChange(key, v)}
                  >
                    <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Assign worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={String(worker.id)}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Task */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Add Custom Task</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Task name (e.g., Hand beading work)"
              value={newCustomTaskName}
              onChange={(e) => setNewCustomTaskName(e.target.value)}
              className="flex-1"
            />
            <Select value={newCustomTaskWorker} onValueChange={setNewCustomTaskWorker}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={String(worker.id)}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleAddCustomTask}
              disabled={!newCustomTaskName.trim() || !newCustomTaskWorker}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Custom Tasks List */}
          {customTasks.length > 0 && (
            <div className="space-y-2">
              {customTasks.map((task) => {
                const worker = workers.find((w) => String(w.id) === task.workerId)
                return (
                  <div key={task.key} className="flex items-center gap-2 p-2 rounded bg-slate-50">
                    <ClipboardList className="h-4 w-4 text-slate-400" />
                    <span className="flex-1">{task.name}</span>
                    <Badge variant="outline">{worker?.name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCustomTask(task.key)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Task Sequence */}
        {taskSequence.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Task Sequence (Drag to Reorder)</Label>
            <p className="text-sm text-slate-500">
              Tasks will be executed in this order. Workers cannot start a task until the previous
              one is complete.
            </p>
            <div className="space-y-2">
              {taskSequence.map((taskKey, index) => {
                const isCustom = taskKey.startsWith("CUSTOM_")
                const taskName = isCustom
                  ? customTasks.find((t) => t.key === taskKey)?.name
                  : PRODUCTION_TASK_TYPE_CONFIG[taskKey]?.label
                const workerId = isCustom
                  ? customTasks.find((t) => t.key === taskKey)?.workerId
                  : selectedTasks[taskKey]?.workerId
                const worker = workers.find((w) => String(w.id) === workerId)
                const Icon = isCustom ? ClipboardList : TASK_ICONS[taskKey]

                return (
                  <div
                    key={taskKey}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-white"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveTask(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveTask(index, "down")}
                        disabled={index === taskSequence.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Badge variant="outline" className="w-8 justify-center">
                      {index + 1}
                    </Badge>
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span className="flex-1 font-medium">{taskName}</span>
                    <Badge variant="secondary">{worker?.name || "Unassigned"}</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any special instructions for production..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || taskSequence.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Create Tasks & Start Production
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
