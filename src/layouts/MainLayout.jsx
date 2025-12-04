import { Outlet } from "react-router-dom"
import Sidebar from "@/components/navigation/Sidebar"
import Topbar from "@/components/navigation/Topbar"

/**
 * MainLayout - Used for all authenticated pages
 *
 * This is your main application shell with:
 * - Sidebar navigation on the left
 * - Topbar with user info at the top
 * - Main content area where pages render
 *
 * This layout creates the "logged in" experience with full navigation.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar - fixed on the left */}
      <Sidebar />

      {/* Main content area - pushed right to make room for sidebar */}
      <div className="lg:pl-64">
        {/* Topbar - sticky at the top */}
        <Topbar />

        {/* Page content renders here */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
