import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()

  // Simulate login (we'll replace this with real login later)
  const handleTestLogin = () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "ADMIN",
      permissions: ["ORDERS_VIEW", "ORDERS_EDIT", "ADMIN_USERS"],
    }
    const mockToken = "fake-jwt-token-for-testing"

    login(mockUser, mockToken)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-slate-100">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Phase 2: Auth System Test ✨</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-slate-600">You are not logged in.</p>
                <Button onClick={handleTestLogin} className="w-full">
                  Test Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">✓ Logged in successfully!</p>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Permissions:</strong> {user.permissions.join(", ")}
                  </p>
                </div>

                <Button onClick={logout} variant="destructive" className="w-full">
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
