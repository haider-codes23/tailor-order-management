import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { httpClient } from "@/services/http/httpClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

/**
 * LoginPage Component
 *
 * This is a production-quality login form that demonstrates best practices
 * for form handling in React. The patterns you see here will be used
 * throughout the application for every form you build.
 *
 * Key features:
 * - Real-time validation with react-hook-form
 * - Loading states during API calls
 * - Comprehensive error handling
 * - Redirect to intended destination after login
 * - Accessible form structure with proper labels
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page the user was trying to access (if any)
  // This comes from the ProtectedRoute component's Navigate state
  const from = location.state?.from?.pathname || "/"

  /**
   * Set up react-hook-form for form handling and validation
   *
   * react-hook-form manages form state, handles validation, and provides
   * helpful utilities for working with forms. It's more performant than
   * managing form state manually with useState because it minimizes re-renders.
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * Handle form submission
   *
   * This function is called when the user submits the form AND validation passes.
   * If validation fails, this function never runs and errors are shown instead.
   *
   * The flow:
   * 1. Clear any previous errors
   * 2. Set loading state (disables button, shows spinner)
   * 3. Call the login API through httpClient
   * 4. On success: store auth data and redirect
   * 5. On error: display error message and re-enable form
   */
  const onSubmit = async (data) => {
    // Clear any previous error messages
    setApiError(null)

    // Set loading state - this will disable the button and show a spinner
    setIsLoading(true)

    try {
      // Make the API call through our HTTP client
      // This request will be intercepted by MSW and handled by our login handler
      const response = await httpClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      })

      // Login successful! The response contains user data and access token
      // Store them in auth context (which also stores in localStorage)
      login(response.user, response.accessToken)

      // Redirect to where they were trying to go, or dashboard if they came directly to login
      navigate(from, { replace: true })
    } catch (error) {
      // Something went wrong - could be wrong credentials, network error, or server error
      // Display a user-friendly error message

      if (error.status === 401) {
        // Invalid credentials - specific message
        setApiError("Invalid email or password. Please check your credentials and try again.")
      } else if (error.status === 400) {
        // Validation error from API - this shouldn't happen if our frontend validation is correct
        setApiError(error.message || "Please check your input and try again.")
      } else if (error.message) {
        // Other API error with a message
        setApiError(error.message)
      } else {
        // Network error or unknown error
        setApiError(
          "Unable to connect to the server. Please check your internet connection and try again."
        )
      }
    } finally {
      // Always reset loading state whether success or failure
      // This re-enables the button so user can try again if there was an error
      setIsLoading(false)
    }
  }

  /**
   * Clear error message when user starts typing
   *
   * This provides better UX - once they start correcting their mistake,
   * we don't want to keep showing them the old error message.
   */
  const handleInputChange = () => {
    if (apiError) {
      setApiError(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          API Error Display
          
          Show this alert when there's an error from the API.
          It appears above the form so users see it immediately.
        */}
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {/*
          Login Form
          
          handleSubmit is from react-hook-form and wraps our onSubmit function.
          It validates the form first, and only calls onSubmit if validation passes.
        */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
                onChange: handleInputChange, // Clear API error on input
              })}
              disabled={isLoading}
            />
            {/* Show validation error if email is invalid */}
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                onChange: handleInputChange, // Clear API error on input
              })}
              disabled={isLoading}
            />
            {/* Show validation error if password is invalid */}
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                {/* Show spinner while loading */}
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Testing Help */}
          <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Test Accounts:</p>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Admin:</strong> admin@tailor.com / admin123
              </p>
              <p>
                <strong>Sales:</strong> sales@tailor.com / sales123
              </p>
              <p>
                <strong>Supervisor:</strong> supervisor@tailor.com / super123
              </p>
              <p>
                <strong>Worker:</strong> worker@tailor.com / worker123
              </p>
              <p>
                <strong>Purchaser:</strong> purchaser@tailor.com / purchase123
              </p>
              <p>
                <strong>QA:</strong> qa@tailor.com / qa123
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
