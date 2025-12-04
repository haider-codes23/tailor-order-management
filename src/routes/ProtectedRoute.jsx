import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/hooks/useAuth"

/**
 * ProtectedRoute Component
 *
 * This is a route guard that protects pages from unauthenticated access.
 *
 * How it works:
 * 1. Check if user is authenticated using the useAuth hook
 * 2. If authenticated, render the child component (the page they want to see)
 * 3. If not authenticated, redirect to login
 *
 * The clever part: We save the current location in state so after login,
 * we can redirect the user back to where they were trying to go.
 *
 * Example: User tries to access /orders without logging in
 * -> Redirected to /login with state: { from: "/orders" }
 * -> After successful login, redirect back to /orders
 *
 * This is much better UX than always sending them to the dashboard after login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // While checking authentication status, show a loading state
  // This prevents a flash of the login page before auth state is determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  // Save the current location so we can redirect back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render the protected component
  return children
}
