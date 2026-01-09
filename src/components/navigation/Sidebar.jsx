import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Factory,
  CheckCircle,
  Truck,
  Users,
  ShoppingBag,
  AlertTriangle,
  Ruler,
  Box,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { filterNavigationByPermissions } from "@/lib/rbac"

/**
 * Sidebar Navigation Component - Permission-Based
 */

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredPermissions: [],
    iconColor: "text-blue-600",
    iconBgColor: "bg-blue-100",
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    requiredPermissions: ["orders.view"],
    iconColor: "text-violet-600",
    iconBgColor: "bg-violet-100",
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    requiredPermissions: ["inventory.view"],
    iconColor: "text-emerald-600",
    iconBgColor: "bg-emerald-100",
  },
  {
    name: "Products",
    href: "/products",
    icon: Box,
    requiredPermissions: ["products.view"],
    iconColor: "text-orange-600",
    iconBgColor: "bg-orange-100",
  },
  {
    name: "Low Stock Alerts",
    href: "/inventory/alerts/low-stock",
    icon: AlertTriangle,
    requiredPermissions: ["inventory.view"],
    iconColor: "text-red-600",
    iconBgColor: "bg-red-100",
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
    requiredPermissions: ["production.view"],
    iconColor: "text-indigo-600",
    iconBgColor: "bg-indigo-100",
  },
  {
    name: "QA",
    href: "/qa",
    icon: CheckCircle,
    requiredPermissions: ["qa.view"],
    iconColor: "text-teal-600",
    iconBgColor: "bg-teal-100",
  },
  {
    name: "Dispatch",
    href: "/dispatch",
    icon: Truck,
    requiredPermissions: ["dispatch.view"],
    iconColor: "text-sky-600",
    iconBgColor: "bg-sky-100",
  },
  {
    name: "Shopify",
    href: "/shopify",
    icon: ShoppingBag,
    requiredPermissions: ["orders.view"],
    iconColor: "text-pink-600",
    iconBgColor: "bg-pink-100",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    requiredPermissions: ["users.view"],
    iconColor: "text-slate-600",
    iconBgColor: "bg-slate-100",
  },
  {
    name: "Measurement Charts",
    href: "/admin/measurements",
    icon: Ruler,
    requiredPermissions: ["measurements.view"],
    iconColor: "text-amber-600",
    iconBgColor: "bg-amber-100",
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(href)
  }

  const visibleNavItems = filterNavigationByPermissions(navItems, user)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-md font-bold text-slate-900">
              Orders & Inventory Management System
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {visibleNavItems.length > 0 ? (
              visibleNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${
                        active
                          ? "bg-violet-400 text-stone-100"
                          : "text-slate-800 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center rounded-xl p-1.5 mr-3 transition-all
                        ${active ? item.iconBgColor : "bg-slate-50"}
                      `}
                    >
                      <Icon className={`h-4 w-4 transition-colors ${item.iconColor}`} />
                    </div>
                    {item.name}
                    {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-accent animate-bounce" />
                  )}
                  </Link>
                )
              })
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-slate-500">
                  No accessible pages. Contact your administrator for permissions.
                </p>
              </div>
            )}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 border-t border-slate-200">
            <div className="p-4">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                {user?.permissions?.length || 0} permissions
              </p>
            </div>
            <div className="px-4 pb-4">
              <div className="text-xs text-slate-400">v1.0.0 - Phase 9</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}