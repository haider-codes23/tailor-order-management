/**
 * DyeingAvailableTasksPage.jsx
 * Page showing tasks available for dyeing (not yet accepted)
 *
 * File: src/features/dyeing/pages/DyeingAvailableTasksPage.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Droplets, ClipboardList, ArrowLeft, RefreshCcw } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useDyeingAvailableTasks, useAcceptDyeingSections, useRejectDyeingSections } from "../../../hooks/usedyeing"
import DyeingTaskCard from "../components/DyeingTaskCard"
import DyeingAcceptDialog from "../components/DyeingAcceptDialog"
import DyeingRejectionDialog from "../components/DyeingRejectionDialog"
import SortControl from "@/components/ui/SortControl"
import { applySortToTasks } from "@/utils/sortHelper"

export default function DyeingAvailableTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sortBy, setSortBy] = useState("fwd_asc")

  // Dialog states
  const [acceptDialog, setAcceptDialog] = useState({ open: false, task: null, sections: [] })
  const [rejectDialog, setRejectDialog] = useState({ open: false, task: null, sections: [] })

  // Fetch available tasks
  const { data: tasksData, isLoading, isError, error, refetch } = useDyeingAvailableTasks()

  // Mutations
  const acceptMutation = useAcceptDyeingSections()
  const rejectMutation = useRejectDyeingSections()

  const tasks = tasksData || tasksData?.data || []

  // Sort tasks
  const sortedTasks = applySortToTasks(tasks, sortBy)

  const handleAcceptAll = (task, sections) => {
    setAcceptDialog({ open: true, task, sections })
  }

  const handleConfirmAccept = (selectedSections) => {
    acceptMutation.mutate(
      {
        orderItemId: acceptDialog.task.orderItemId,
        userId: user?.id,
        sections: selectedSections,
      },
      {
        onSuccess: () => {
          setAcceptDialog({ open: false, task: null, sections: [] })
        },
      }
    )
  }

  const handleViewDetails = (task) => {
    navigate(`/dyeing/task/${task.orderItemId}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
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
          <div className="rounded-full bg-fuchsia-100 p-2">
            <ClipboardList className="h-6 w-6 text-fuchsia-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Available Tasks</h1>
            <p className="text-muted-foreground">
              Sections ready for dyeing - accept to start working
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
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks available</h3>
              <p className="text-muted-foreground">
                All sections are either being worked on or completed
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <DyeingTaskCard
              key={task.orderItemId}
              task={task}
              viewMode="available"
              onAcceptAll={handleAcceptAll}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Accept Dialog */}
      <DyeingAcceptDialog
        open={acceptDialog.open}
        onOpenChange={(open) => setAcceptDialog({ ...acceptDialog, open })}
        sections={acceptDialog.sections}
        orderNumber={acceptDialog.task?.orderNumber}
        onConfirm={handleConfirmAccept}
        isLoading={acceptMutation.isPending}
      />
    </div>
  )
}
