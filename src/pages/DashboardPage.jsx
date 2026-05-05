import { useAuth } from "@/features/auth/hooks/useAuth"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  Camera,
  CheckCircle2,
  Truck,
  Droplets,
  ClipboardList,
} from "lucide-react"

// Dashboard widgets (Phase 17)
import OrderFunnelWidget from "@/features/dashboard/components/OrderFunnelWidget"
import ProductionPipelineWidget from "@/features/dashboard/components/ProductionPipelineWidget"
import InventoryAlertsWidget from "@/features/dashboard/components/InventoryAlertsWidget"
import QAMetricsWidget from "@/features/dashboard/components/QAMetricsWidget"
import SalesSummaryWidget from "@/features/dashboard/components/SalesSummaryWidget"
import RecentActivityWidget from "@/features/dashboard/components/RecentActivityWidget"

// Role-based quick links for users without reports.view
const ROLE_LINKS = {
  SALES: [
    { label: "Sales Approval", to: "/sales", icon: CheckCircle2, perm: "sales.view_approval_queue" },
    { label: "Orders", to: "/orders", icon: ShoppingCart, perm: "orders.view" },
    { label: "Create Order", to: "/orders/new", icon: ClipboardList, perm: "orders.create" },
  ],
  PRODUCTION_HEAD: [
    { label: "Production", to: "/production", icon: Factory, perm: "production.view" },
    { label: "Orders", to: "/orders", icon: ShoppingCart, perm: "orders.view" },
  ],
  PRODUCTION_WORKER: [
    { label: "My Tasks", to: "/production", icon: Factory, perm: "production.view" },
  ],
  QA: [
    { label: "QA Queue", to: "/qa", icon: Camera, perm: "qa.view" },
  ],
  DISPATCH: [
    { label: "Dispatch Queue", to: "/dispatch", icon: Truck, perm: "dispatch.view" },
  ],
  DYEING: [
    { label: "Dyeing Tasks", to: "/dyeing", icon: Droplets, perm: "dyeing.view" },
  ],
  PURCHASER: [
    { label: "Procurement", to: "/procurement", icon: Package, perm: "inventory.view" },
  ],
  FABRICATION: [
    { label: "Fabrication Queue", to: "/fabrication", icon: Factory, perm: "fabrication.view" },
  ],
}

function MyWorkLanding({ user }) {
  const userPerms = user?.permissions || []
  const roleLinks = ROLE_LINKS[user?.role] || []
  const visibleLinks = roleLinks.filter((l) => !l.perm || userPerms.includes(l.perm))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-600 mt-2">Here's where you can pick up where you left off.</p>
      </div>

      {visibleLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-slate-100"
              >
                <div className="inline-flex p-3 rounded-lg bg-blue-50 text-blue-600 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{link.label}</h3>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
          <LayoutDashboard className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p>No quick links available for your role yet.</p>
          <p className="text-sm mt-1">Use the side menu to navigate.</p>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const userPerms = user?.permissions || []
  const canViewReports = userPerms.includes("reports.view")

  // Users without reports.view see a role-based "My Work" landing
  if (!canViewReports) {
    return <MyWorkLanding user={user} />
  }

  // Admin / Sales with reports.view see the full dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back, {user?.name} • Live operational overview
        </p>
      </div>

      {/* Top row: Order Funnel (full width) */}
      <OrderFunnelWidget />

      {/* Production pipeline (full width) */}
      <ProductionPipelineWidget />

      {/* Two-column row: Inventory Alerts + QA Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryAlertsWidget />
        <QAMetricsWidget />
      </div>

      {/* Two-column row: Sales Summary + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesSummaryWidget />
        <RecentActivityWidget />
      </div>
    </div>
  )
}