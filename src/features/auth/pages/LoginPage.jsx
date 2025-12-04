import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * LoginPage
 *
 * Simple login form that simulates authentication.
 * In a real app, this would call your backend API.
 *
 * For now, it accepts any email/password and creates a mock user.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page the user was trying to access (if any)
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = (e) => {
    e.preventDefault()

    // Mock authentication - accepts any credentials
    const mockUser = {
      id: 1,
      name: email.split("@")[0], // Use part before @ as name
      email: email,
      role: "ADMIN",
      permissions: [
        "ORDERS_VIEW",
        "ORDERS_EDIT",
        "ORDERS_CREATE",
        "INVENTORY_VIEW",
        "PRODUCTION_VIEW",
        "ADMIN_USERS",
      ],
    }
    const mockToken = "fake-jwt-token-" + Date.now()

    // Login and redirect to where they were trying to go
    login(mockUser, mockToken)
    navigate(from, { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>

          <p className="text-xs text-center text-slate-500 mt-4">
            For testing: Use any email and password
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
