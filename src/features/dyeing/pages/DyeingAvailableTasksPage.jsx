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
import DyeingFilters from "../components/DyeingFilters"
import DyeingAcceptDialog from "../components/DyeingAcceptDialog"
import DyeingRejectionDialog from "../components/DyeingRejectionDialog"

export default function DyeingAvailableTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "fwd_asc",
    priority: null,
  })

  // Dialog states
  const [acceptDialog, setAcceptDialog] = useState({ open: false, task: null, sections: [] })
  const [rejectDialog, setRejectDialog] = useState({ open: false, task: null, sections: [] })

  // Fetch available tasks
  const { data: tasksData, isLoading, isError, error, refetch } = useDyeingAvailableTasks(filters)

  // Mutations
  const acceptMutation = useAcceptDyeingSections()
  const rejectMutation = useRejectDyeingSections()

  const tasks = tasksData || tasksData?.data || []

  // Filter and sort tasks client-side (for now)
  const filteredTasks = tasks.filter((task) => {
    if (!filters.search) return true
    const search = filters.search.toLowerCase()
    return (
      task.orderNumber?.toLowerCase().includes(search) ||
      task.customerName?.toLowerCase().includes(search) ||
      task.productName?.toLowerCase().includes(search)
    )
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (filters.sortBy) {
      case "fwd_asc":
        return new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0)
      case "fwd_desc":
        return new Date(b.fwdDate || 0) - new Date(a.fwdDate || 0)
      case "priority_desc":
        return (b.priority ? 1 : 0) - (a.priority ? 1 : 0)
      default:
        return 0
    }
  })

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
      <DyeingFilters
        filters={filters}
        onFiltersChange={setFilters}
        sortOptions={[
          { value: "fwd_asc", label: "FWD Date (Earliest First)" },
          { value: "fwd_desc", label: "FWD Date (Latest First)" },
          { value: "priority_desc", label: "Priority (High First)" },
        ]}
      />

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
                {filters.search
                  ? "No tasks match your search criteria"
                  : "All sections are either being worked on or completed"}
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
