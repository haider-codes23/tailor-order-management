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

  // Get the page the user was trying to access, default to /dashboard
  const from = location.state?.from?.pathname || "/dashboard"

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

  const errorMessage = getErrorMessage(loginMutation.error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to your Tailor Order Management account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tailor.com"
                disabled={loginMutation.isPending}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              size="lg"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Development Credentials Hint */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3 text-center">
              🔐 Demo Test Accounts
            </p>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium text-slate-700">Email</div>
                <div className="font-medium text-slate-700">Password</div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">Admin User</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>admin@tailor.com</div>
                  <div>admin123</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">Sales Rep</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>sales@tailor.com</div>
                  <div>sales123</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">Supervisor</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>supervisor@tailor.com</div>
                  <div>super123</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">Worker</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>worker@tailor.com</div>
                  <div>worker123</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">Purchaser</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>purchaser@tailor.com</div>
                  <div>purchase123</div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="font-medium">QA Manager</div>
                  <div></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div>qa@tailor.com</div>
                  <div>qa123</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}