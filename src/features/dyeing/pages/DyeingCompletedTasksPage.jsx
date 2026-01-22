/**
 * DyeingCompletedTasksPage.jsx
 * Page showing completed dyeing tasks with filters and pagination
 *
 * File: src/features/dyeing/pages/DyeingCompletedTasksPage.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  RefreshCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useDyeingCompletedTasks } from "../../../hooks/usedyeing"
import DyeingFilters from "../components/DyeingFilters"

export default function DyeingCompletedTasksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "completed_desc",
    priority: null,
    dateFrom: null,
    dateTo: null,
  })

  const [page, setPage] = useState(1)
  const pageSize = 10

  // Fetch completed tasks
  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDyeingCompletedTasks({
    userId: user?.id,
    ...filters,
    page,
    limit: pageSize,
  })

  // Handle both wrapped and unwrapped responses
  // API might return { tasks: [...], meta: {...} } or just [...]
  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || tasksData?.data || []
  const totalCount = tasksData?.meta?.total || tasks.length
  const totalPages = tasksData?.meta?.totalPages || Math.ceil(totalCount / pageSize)

  // Format duration from milliseconds
  const formatDuration = (durationMs) => {
    if (!durationMs) return "—"
    const totalMinutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Get average duration for a task
  const getAverageDuration = (completedSections) => {
    if (!completedSections || completedSections.length === 0) return "—"
    const validDurations = completedSections.filter((s) => s.duration).map((s) => s.duration)
    if (validDurations.length === 0) return "—"
    const avgMs = validDurations.reduce((a, b) => a + b, 0) / validDurations.length
    return formatDuration(avgMs)
  }

  const handleViewDetails = (task) => {
    navigate(`/orders/${task.orderId}/items/${task.orderItemId}`)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Completed Tasks</h1>
            <p className="text-muted-foreground">History of your completed dyeing work</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Badge variant="outline" className="text-base px-3 py-1">
            {totalCount} total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <DyeingFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1) // Reset to first page when filters change
        }}
        showDateRange={true}
        sortOptions={[
          { value: "completed_desc", label: "Date Completed (Recent First)" },
          { value: "completed_asc", label: "Date Completed (Oldest First)" },
          { value: "fwd_asc", label: "FWD Date (Earliest First)" },
          { value: "fwd_desc", label: "FWD Date (Latest First)" },
        ]}
      />

      {/* Tasks Table */}
      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading tasks: {error?.message}</p>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No completed tasks</h3>
              <p className="text-muted-foreground">
                {filters.search || filters.dateFrom || filters.dateTo
                  ? "No tasks match your filter criteria"
                  : "You haven't completed any dyeing tasks yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed Dyeing Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Avg Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={`${task.orderItemId}-${task.completedAt || index}`}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{task.orderNumber}</span>
                        <span className="text-xs text-muted-foreground block">
                          {task.customerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span>{task.productName}</span>
                        {task.productSku && (
                          <span className="text-xs text-muted-foreground block">
                            {task.productSku}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.completedSections && task.completedSections.length > 0 ? (
                          task.completedSections.map((section) => (
                            <Badge
                              key={section.name}
                              variant="secondary"
                              className="bg-green-100 text-green-800 capitalize"
                            >
                              {section.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.completedAt
                        ? format(new Date(task.completedAt), "MMM d, yyyy h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell>{getAverageDuration(task.completedSections)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(task)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
                  {totalCount} tasks
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
