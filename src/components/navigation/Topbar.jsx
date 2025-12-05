import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useLogout } from "@/features/auth/hooks/useAuthMutations"
import { Bell, LogOut, User } from "lucide-react"
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
 * Enhanced with logout confirmation dialog and React Query mutation.
 * 
 * The logout flow now works like this:
 * 1. User clicks logout button
 * 2. Confirmation dialog appears asking "Are you sure?"
 * 3. If user clicks Cancel, dialog closes and nothing happens
 * 4. If user clicks Logout, the logout mutation is triggered
 * 5. The mutation calls the API, clears local state, and redirects to login
 * 
 * This pattern of confirmation dialogs for destructive actions will be used
 * throughout the app for things like deleting orders, canceling production, etc.
 */
export default function Topbar() {
  const { user } = useAuth()
  const logoutMutation = useLogout()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  /**
   * Handle logout button click
   * 
   * Instead of logging out immediately, we show a confirmation dialog.
   * This prevents accidental logouts from misclicks.
   */
  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  /**
   * Handle confirmed logout
   * 
   * This is called when the user clicks "Logout" in the confirmation dialog.
   * The mutation will call the API, clear auth state, and redirect to login.
   */
  const handleConfirmedLogout = () => {
    logoutMutation.mutate()
    // The mutation's onSuccess callback (defined in useLogout hook) will
    // clear auth data and redirect to login, so we don't need to do it here
  }

  return (
    <>
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

              {/* Logout button - now triggers confirmation dialog */}
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