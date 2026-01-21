/**
 * DyeingDashboardPage.jsx
 * Main dashboard for dyeing department
 *
 * File: src/features/dyeing/pages/DyeingDashboardPage.jsx
 */

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Droplets,
  ClipboardList,
  UserCheck,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useDyeingStats } from "../../../hooks/usedyeing"

export default function DyeingDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: statsData, isLoading, isError } = useDyeingStats(user?.id)

  const stats = statsData || {
    availableCount: 0,
    acceptedCount: 0,
    inProgressCount: 0,
    completedTodayCount: 0,
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
          <div className="rounded-full bg-fuchsia-100 p-2">
            <Droplets className="h-6 w-6 text-fuchsia-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dyeing Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Tasks */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-fuchsia-200 bg-fuchsia-50/50"
          onClick={() => navigate("/dyeing/available")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-fuchsia-600 font-medium">Available Tasks</p>
                <p className="text-3xl font-bold text-fuchsia-700">{stats.availableCount}</p>
                <p className="text-xs text-fuchsia-500 mt-1">Ready for dyeing</p>
              </div>
              <div className="rounded-full bg-fuchsia-100 p-3">
                <ClipboardList className="h-6 w-6 text-fuchsia-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Accepted Tasks */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50/50"
          onClick={() => navigate("/dyeing/my-tasks")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Accepted</p>
                <p className="text-3xl font-bold text-blue-700">{stats.acceptedCount}</p>
                <p className="text-xs text-blue-500 mt-1">Waiting to start</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-amber-200 bg-amber-50/50"
          onClick={() => navigate("/dyeing/my-tasks")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-amber-700">{stats.inProgressCount}</p>
                <p className="text-xs text-amber-500 mt-1">Dyeing in progress</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50/50"
          onClick={() => navigate("/dyeing/completed")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed Today</p>
                <p className="text-3xl font-bold text-green-700">{stats.completedTodayCount}</p>
                <p className="text-xs text-green-500 mt-1">Sections completed</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-fuchsia-50 hover:border-fuchsia-300"
              onClick={() => navigate("/dyeing/available")}
            >
              <ClipboardList className="h-6 w-6 text-fuchsia-600" />
              <span>View Available Tasks</span>
              {stats.availableCount > 0 && (
                <Badge className="bg-fuchsia-600">{stats.availableCount} new</Badge>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => navigate("/dyeing/my-tasks")}
            >
              <UserCheck className="h-6 w-6 text-blue-600" />
              <span>View My Tasks</span>
              {stats.acceptedCount + stats.inProgressCount > 0 && (
                <Badge className="bg-blue-600">
                  {stats.acceptedCount + stats.inProgressCount} active
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
              onClick={() => navigate("/dyeing/completed")}
            >
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>View Completed</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Activity tracking will be implemented with backend integration.</p>
            <p className="text-sm mt-2">For now, check your tasks in the respective sections.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
