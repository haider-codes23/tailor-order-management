import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/navigation/Sidebar"
import Topbar from "@/components/navigation/Topbar"

/**
 * MainLayout - Used for all authenticated pages
 *
 * Manages the mobile sidebar open/close state.
 * - On desktop (lg+): Sidebar is always visible, Topbar has no hamburger
 * - On mobile (<lg): Sidebar is a Sheet drawer, Topbar shows hamburger button
 *
 * Padding is progressive: tighter on mobile, comfortable on desktop.
 */
export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar — handles both desktop (fixed) and mobile (Sheet drawer) */}
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      {/* Main content area — pushed right on desktop to make room for sidebar */}
      <div className="lg:pl-64">
        {/* Topbar — hamburger button triggers sidebar on mobile */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — progressive padding */}
        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
