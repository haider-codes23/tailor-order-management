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
  Settings,
  AlertTriangle,
  Ruler, // New icon for measurement charts
  Box
} from "lucide-react"

/**
 * Sidebar Navigation Component
 *
 * This is your main navigation menu. Each nav item is a link that highlights
 * when you're on that route (using useLocation to check current path).
 *
 * The menu structure matches your user roles:
 * - Dashboard (everyone)
 * - Orders (Sales, Admin)
 * - Inventory (Purchaser, Admin)
 * - Production (Supervisor, Workers, Admin)
 * - QA (QA team, Admin)
 * - Dispatch (Sales, Admin)
 * - Shopify (Admin)
 * - Users (Admin only)
 * - Settings (Admin only)
 *
 * Later, we'll add permission checks to hide items users can't access.
 */

// Navigation items configuration
const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Products",
    href: "/products",
    icon: Box,
  },
  {
    name: "Low Stock Alerts",
    href: "/inventory/alerts/low-stock",
    icon: AlertTriangle,
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
  },
  {
    name: "QA",
    href: "/qa",
    icon: CheckCircle,
  },
  {
    name: "Dispatch",
    href: "/dispatch",
    icon: Truck,
  },
  {
    name: "Shopify",
    href: "/shopify",
    icon: ShoppingBag,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Measurement Charts",
    href: "/settings/measurement-charts",
    icon: Ruler, // Using Ruler icon to represent measurements
  },
]

export default function Sidebar() {
  const location = useLocation()

  /**
   * Check if the current route matches this nav item
   * For the dashboard ("/"), we need exact match
   * For other routes, we check if the path starts with the href
   */
  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile, fixed on larger screens */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold text-slate-900">Tailor Order System</h1>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
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
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors
                      ${active ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}
                    `}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer info */}
          <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
            <div className="text-xs text-slate-500">v1.0.0 - Phase 5</div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar - we'll enhance this later with a slide-out drawer */}
      {/* For now, we'll just hide it on mobile and show the menu in Topbar */}
    </>
  )
}