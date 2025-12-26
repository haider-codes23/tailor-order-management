import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { canAccessRoute } from "../lib/rbac"
import { Alert, AlertDescription } from "./ui/alert"
import { Button } from "./ui/button"
import { ShieldAlert, ArrowLeft } from "lucide-react"

/**
 * Protected Route Component
 *
 * Wraps routes that require specific permissions.
 * If user lacks required permissions, shows an access denied page.
 *
 * Usage:
 * <Route path="/admin/users" element={
 *   <ProtectedRoute requiredPermissions={["users.view"]}>
 *     <UsersListPage />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({ children, requiredPermissions = [] }) {
  const { user } = useAuth()

  // If no permissions required, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return children
  }

  // Check if user has required permissions
  const hasAccess = canAccessRoute(user, requiredPermissions)

  // If user has access, render the component
  if (hasAccess) {
    return children
  }

  // Access denied - show error page
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            You don't have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            This page requires one of the following permissions:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {requiredPermissions.map((permission) => (
              <code key={permission} className="bg-muted px-3 py-1 rounded text-sm">
                {permission}
              </code>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}