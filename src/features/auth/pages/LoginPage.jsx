import { useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useLogin } from "@/features/auth/hooks/useAuthMutations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

/**
 * LoginPage Component
 *
 * Notice how clean this component is now. It doesn't know anything about
 * HTTP requests, API endpoints, or how authentication works under the hood.
 * It just knows:
 * - Render a form
 * - Call loginMutation.mutate when form is submitted
 * - Show loading state from loginMutation.isPending
 * - Show errors from loginMutation.error
 * - Redirect on success
 *
 * All the complexity of API calls and state management lives in the hooks,
 * keeping this component focused purely on UI concerns.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page the user was trying to access
  const from = location.state?.from?.pathname || "/"

  // Get the login mutation hook
  const loginMutation = useLogin()

  // Set up form handling
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
   * Now this is beautifully simple. We just call mutate with the form data.
   * React Query handles all the loading state, error handling, and success callbacks.
   */
  const onSubmit = async (data) => {
    loginMutation.mutate(data, {
      // onSuccess callback specific to this mutation call
      // The hook already has an onSuccess that stores auth data
      // This additional callback handles the redirect
      onSuccess: () => {
        navigate(from, { replace: true })
      },
    })
  }

  /**
   * Clear error when user starts typing
   */
  const handleInputChange = () => {
    if (loginMutation.error) {
      loginMutation.reset() // React Query's way to clear mutation state
    }
  }

  /**
   * Format error message for display
   *
   * Different error codes need different user-friendly messages
   */
  const getErrorMessage = (error) => {
    if (!error) return null

    if (error.status === 401) {
      return "Invalid email or password. Please check your credentials and try again."
    } else if (error.status === 400) {
      return error.message || "Please check your input and try again."
    } else if (error.message) {
      return error.message
    } else {
      return "Unable to connect to the server. Please check your internet connection and try again."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display error if login failed */}
        {loginMutation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{getErrorMessage(loginMutation.error)}</AlertDescription>
          </Alert>
        )}

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
                onChange: handleInputChange,
              })}
              disabled={loginMutation.isPending}
            />
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
                onChange: handleInputChange,
              })}
              disabled={loginMutation.isPending}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Test Accounts */}
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
