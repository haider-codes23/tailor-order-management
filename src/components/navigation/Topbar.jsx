import { useAuth } from "@/features/auth/hooks/useAuth"
import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Topbar Component
 *
 * Displays at the top of every page in the main layout.
 * Shows:
 * - Current user info
 * - Notifications icon (placeholder for now)
 * - Logout button
 *
 * This is the user's "control panel" - always accessible, always showing
 * who they are and giving them quick access to their profile and logout.
 */
export default function Topbar() {
  const { user, logout } = useAuth()

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Left side - could add breadcrumbs or page title here later */}
        <div className="flex-1">
          {/* Empty for now - we'll add breadcrumbs in a future phase */}
        </div>

        {/* Right side - user info and actions */}
        <div className="ml-4 flex items-center gap-3">
          {/* Notifications - placeholder for future feature */}
          <button
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge - uncomment when you have real notifications */}
            {/* <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" /> */}
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            {/* User avatar placeholder */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-600">
              <User className="h-4 w-4" />
            </div>

            {/* User name and role */}
            <div className="hidden md:block text-sm">
              <div className="font-medium text-slate-900">{user?.name || "User"}</div>
              <div className="text-slate-500">{user?.role || "Role"}</div>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
