/**
 * DyeingMyTasksPage.jsx
 * Page showing current user's accepted dyeing tasks
 *
 * File: src/features/dyeing/pages/DyeingMyTasksPage.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, UserCheck, ArrowLeft, RefreshCcw, Droplets } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useDyeingMyTasks,
  useStartDyeing,
  useCompleteDyeing,
  useRejectDyeingSections,
} from "../../../hooks/usedyeing"
import DyeingTaskCard from "../components/DyeingTaskCard"
import DyeingFilters from "../components/DyeingFilters"
import DyeingStartDialog from "../components/DyeingStartDialog"
import DyeingCompleteDialog from "../components/DyeingCompleteDialog"
import DyeingRejectionDialog from "../components/DyeingRejectionDialog"
import { SECTION_STATUS } from "@/constants/orderConstants"
import SortControl from "@/components/ui/SortControl"
import { applySortToTasks } from "@/utils/sortHelper"

export default function DyeingMyTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sortBy, setSortBy] = useState("fwd_asc")

  // Dialog states
  const [startDialog, setStartDialog] = useState({ open: false, task: null, sections: [] })
  const [completeDialog, setCompleteDialog] = useState({ open: false, task: null, sections: [] })
  const [rejectDialog, setRejectDialog] = useState({ open: false, task: null, sections: [] })

  // Fetch my tasks
  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDyeingMyTasks(user?.id)

  // Mutations
  const startMutation = useStartDyeing()
  const completeMutation = useCompleteDyeing()
  const rejectMutation = useRejectDyeingSections()

  const tasks = tasksData || tasksData?.data || []

  // Sort tasks
  const sortedTasks = applySortToTasks(tasks, sortBy)

  const handleViewDetails = (task) => {
    navigate(`/dyeing/task/${task.orderItemId}`)
  }

  // Handle Start Dyeing
  const handleStartSections = (task, sections) => {
    const acceptedSections = sections.filter((s) => s.status === SECTION_STATUS.DYEING_ACCEPTED)
    setStartDialog({
      open: true,
      task,
      sections: acceptedSections.map((s) => s.name),
    })
  }

  const handleConfirmStart = (selectedSections) => {
    startMutation.mutate(
      {
        orderItemId: startDialog.task.orderItemId,
        userId: user?.id,
        sections: selectedSections,
      },
      {
        onSuccess: () => {
          setStartDialog({ open: false, task: null, sections: [] })
        },
      }
    )
  }

  // Handle Complete Dyeing
  const handleCompleteSections = (task, sections) => {
    const inProgressSections = sections.filter(
      (s) => s.status === SECTION_STATUS.DYEING_IN_PROGRESS
    )
    setCompleteDialog({
      open: true,
      task,
      sections: inProgressSections.map((s) => s.name),
    })
  }

  const handleConfirmComplete = (selectedSections) => {
    completeMutation.mutate(
      {
        orderItemId: completeDialog.task.orderItemId,
        userId: user?.id,
        sections: selectedSections,
      },
      {
        onSuccess: () => {
          setCompleteDialog({ open: false, task: null, sections: [] })
        },
      }
    )
  }

  // Handle Reject Sections
  const handleRejectSections = (task, sections) => {
    const rejectableSections = sections.filter((s) =>
      [SECTION_STATUS.DYEING_ACCEPTED, SECTION_STATUS.DYEING_IN_PROGRESS].includes(s.status)
    )
    setRejectDialog({
      open: true,
      task,
      sections: rejectableSections.map((s) => s.name),
    })
  }

  const handleConfirmReject = ({ sections, reasonCode, notes }) => {
    rejectMutation.mutate(
      {
        orderItemId: rejectDialog.task.orderItemId,
        userId: user?.id,
        sections,
        reasonCode,
        notes,
      },
      {
        onSuccess: () => {
          setRejectDialog({ open: false, task: null, sections: [] })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dyeing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="rounded-full bg-blue-100 p-2">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Dyeing Tasks</h1>
            <p className="text-muted-foreground">
              Tasks you have accepted - start and complete dyeing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-base px-3 py-1">
            {sortedTasks.length} tasks
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <SortControl value={sortBy} onChange={setSortBy} />

      {/* Tasks List */}
      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading tasks: {error?.message}</p>
          </CardContent>
        </Card>
      ) : sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No active tasks</h3>
              <p className="text-muted-foreground mb-4">
                You haven't accepted any dyeing tasks yet
              </p>
              <Button onClick={() => navigate("/dyeing/available")}>View Available Tasks</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const acceptedSections = task.sections.filter(
              (s) => s.status === SECTION_STATUS.DYEING_ACCEPTED
            )
            const inProgressSections = task.sections.filter(
              (s) => s.status === SECTION_STATUS.DYEING_IN_PROGRESS
            )

            return (
              <Card key={task.orderItemId} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <DyeingTaskCard
                    task={task}
                    viewMode="my-tasks"
                    onViewDetails={handleViewDetails}
                  />

                  {/* Action Buttons for this task */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-end gap-2">
                    {acceptedSections.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSections(task, task.sections)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start Dyeing ({acceptedSections.length})
                      </Button>
                    )}
                    {inProgressSections.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteSections(task, task.sections)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Complete ({inProgressSections.length})
                      </Button>
                    )}
                    {(acceptedSections.length > 0 || inProgressSections.length > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectSections(task, task.sections)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Start Dialog */}
      <DyeingStartDialog
        open={startDialog.open}
        onOpenChange={(open) => setStartDialog({ ...startDialog, open })}
        sections={startDialog.sections}
        onConfirm={handleConfirmStart}
        isLoading={startMutation.isPending}
      />

      {/* Complete Dialog */}
      <DyeingCompleteDialog
        open={completeDialog.open}
        onOpenChange={(open) => setCompleteDialog({ ...completeDialog, open })}
        sections={completeDialog.sections}
        onConfirm={handleConfirmComplete}
        isLoading={completeMutation.isPending}
      />

      {/* Reject Dialog */}
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
