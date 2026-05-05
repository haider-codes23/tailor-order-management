import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useAuthMutations"
import { LogOut, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/**
 * Topbar Component
 *
 * Props:
 * - onMenuClick: () => void — triggers mobile sidebar drawer open
 *
 * The hamburger (Menu) icon is only visible below the lg breakpoint.
 * On desktop (lg+), it's hidden because the sidebar is always visible.
 */

import NotificationBell from "@/features/notifications/components/NotificationBell"

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const logoutMutation = useLogout()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleConfirmedLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-14 sm:h-16 bg-white border-b border-slate-200">
        <div className="flex-1 px-3 sm:px-4 flex justify-between items-center">
          {/* Left side — Hamburger on mobile + breadcrumbs area */}
          <div className="flex items-center gap-2">
            {/* Hamburger menu — visible only on mobile (below lg) */}
            <button
              type="button"
              className="lg:hidden -ml-1 p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs / page title area — empty for now */}
            <div className="flex-1" />
          </div>

          {/* Right side - user info and actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <NotificationBell />

            {/* User info */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              {/* User avatar */}
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-600">
                <User className="h-4 w-4" />
              </div>

              {/* User name and role — hidden on small mobile to save space */}
              <div className="hidden sm:block text-sm">
                <div className="font-medium text-slate-900">{user?.name || "User"}</div>
                <div className="text-slate-500">{user?.role || "Role"}</div>
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogoutClick}
                className="text-slate-600 hover:text-red-600"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to log in again to continue using the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedLogout}
              className="bg-red-600 hover:bg-red-700"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
