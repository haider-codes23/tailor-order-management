/**
 * ProductionDashboardPage.jsx
 * Main dashboard for production module - shows different views based on user role
 *
 * File: src/features/production/pages/ProductionDashboardPage.jsx
 */

import { Card, CardContent } from "@/components/ui/card"
import { Factory, AlertCircle } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { hasPermission } from "@/lib/rbac"
import { USER_ROLES } from "@/mocks/data/mockUser"

// Import role-specific dashboards
import ProductionAdminDashboard from "../components/ProductionAdminDashboard"
import ProductionHeadDashboard from "../components/ProductionHeadDashboard"
import ProductionWorkerDashboard from "../components/ProductionWorkerDashboard"

export default function ProductionDashboardPage() {
  const { user } = useAuth()
  console.log("User: ", user)
  
  // Determine which dashboard to show based on user role/permissions
  const isAdmin = user?.role === USER_ROLES.ADMIN || hasPermission(user, "production.assign_head")
  console.log("Check Bool admin: ", isAdmin)
  const isProductionHead =
    user?.role === USER_ROLES.PRODUCTION_HEAD || hasPermission(user, "production.manage")
  console.log("Check Bool pro: ", isProductionHead)
  const isWorker = user?.role === USER_ROLES.WORKER || hasPermission(user, "production.start_task")
  console.log("Check Bool worker: ", isWorker)

  // Admin view - shows assignment panel + overview
  // Admin can also see production head view if they have both permissions
  // T ==> T             T=> F                    F
  if (isAdmin && !isWorker) {
    return <ProductionAdminDashboard />
  }

  // Production Head view - shows their assignments
  if (isProductionHead) {
    return <ProductionHeadDashboard />
  }

  // Worker view - shows their tasks
  if (isWorker) {
    return <ProductionWorkerDashboard />
  }

  // Default - no access (should rarely happen due to route protection)
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-indigo-100 p-2">
          <Factory className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production</h1>
          <p className="text-muted-foreground">Production workflow management</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Production Access</h3>
            <p className="text-muted-foreground">
              You don't have the required permissions to view production tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
