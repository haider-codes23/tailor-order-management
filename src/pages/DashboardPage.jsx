import { useState } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { httpClient } from "@/services/http/httpClient"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [testState, setTestState] = useState({
    isLoading: false,
    result: null,
    error: null,
  })

  /**
   * Test the automatic token refresh mechanism
   *
   * This function calls a special test endpoint that simulates token expiration.
   * The test flow:
   * 1. Call /test/protected endpoint
   * 2. Endpoint returns 401 (simulating expired token)
   * 3. httpClient automatically calls /auth/refresh
   * 4. httpClient retries /test/protected with new token
   * 5. Endpoint returns success
   * 6. We display the result to confirm it all worked
   *
   * If you see a success message, your token refresh mechanism is working!
   * If you see an error, there's a problem with the refresh logic.
   */
  const testTokenRefresh = async () => {
    setTestState({ isLoading: true, result: null, error: null })

    try {
      // Call the test endpoint through httpClient
      // This will trigger the 401 -> refresh -> retry flow
      const response = await httpClient.get("/test/protected")

      // If we get here, the refresh worked!
      setTestState({
        isLoading: false,
        result: response.message,
        error: null,
      })
    } catch (error) {
      // If we get here, something went wrong with the refresh
      setTestState({
        isLoading: false,
        result: null,
        error: error.message || "Token refresh test failed",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Token Refresh Test Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔧 Token Refresh Test</h2>
        <p className="text-slate-600 mb-4">
          This test verifies that your authentication system properly handles expired tokens. When
          you click the button, we'll simulate a token expiration and verify that the system
          automatically refreshes your token and retries the failed request without any manual
          intervention needed.
        </p>

        <Button onClick={testTokenRefresh} disabled={testState.isLoading} className="mb-4">
          {testState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Token Refresh...
            </>
          ) : (
            "Test Token Refresh"
          )}
        </Button>

        {/* Success Result */}
        {testState.result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>✓ Success!</strong> {testState.result}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Result */}
        {testState.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>✗ Failed:</strong> {testState.error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Dashboard Stats - Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="text-3xl font-bold mt-2">42</div>
          <div className="text-xs text-slate-500 mt-1">Mock data for now</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">In Production</div>
          <div className="text-3xl font-bold mt-2">12</div>
          <div className="text-xs text-slate-500 mt-1">Mock data for now</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Awaiting QA</div>
          <div className="text-3xl font-bold mt-2">5</div>
          <div className="text-xs text-slate-500 mt-1">Mock data for now</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Low Stock Items</div>
          <div className="text-3xl font-bold mt-2">8</div>
          <div className="text-xs text-slate-500 mt-1">Mock data for now</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-slate-600">Activity feed will appear here in future phases...</p>
      </div>

      {/* User Info Display */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold mb-3">Your Account Info</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Permissions:</strong> {user?.permissions?.length || 0} permissions
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
              View all permissions
            </summary>
            <ul className="mt-2 ml-4 space-y-1 text-slate-600">
              {user?.permissions?.map((permission) => (
                <li key={permission}>• {permission}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  )
}
