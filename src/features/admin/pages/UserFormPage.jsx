import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useUser, useCreateUser, useUpdateUser } from "@/hooks/useUsers"
import { USER_ROLES, ROLE_LABELS } from "@/mocks/data/mockUsers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save, AlertCircle, UserPlus } from "lucide-react"
import PermissionSelector from "../components/PermissionSelector"

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  // Fetch user data if editing
  const { data: userData, isLoading: isLoadingUser } = useUser(id)
  const user = userData?.data

  // Permissions state (managed separately from form)
  const [selectedPermissions, setSelectedPermissions] = useState([])

  // Mutations
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "",
      phone: "",
      is_active: true,
    },
  })

  const selectedRole = watch("role")

  // Populate form when editing
  useEffect(() => {
    if (user && isEditMode) {
      setValue("name", user.name)
      setValue("email", user.email)
      setValue("role", user.role)
      setValue("phone", user.phone || "")
      setValue("is_active", user.is_active)
      setSelectedPermissions(user.permissions || [])
    }
  }, [user, isEditMode, setValue])

  // Form submission
  const onSubmit = async (data) => {
    // Validation: Must have at least one permission
    if (selectedPermissions.length === 0) {
      alert("Please select at least one permission for this user")
      return
    }

    try {
      const userData = {
        ...data,
        permissions: selectedPermissions, // Include permissions
      }

      if (isEditMode) {
        await updateUserMutation.mutateAsync({
          userId: id,
          updates: userData,
        })
      } else {
        await createUserMutation.mutateAsync(userData)
      }

      navigate("/admin/users")
    } catch (error) {
      // Error already handled by mutation
    }
  }

  // Loading state for edit mode
  if (isEditMode && isLoadingUser) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading user...</p>
          </div>
        </div>
      </div>
    )
  }

  // User not found in edit mode
  if (isEditMode && !user) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/admin/users")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit User" : "Create New User"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditMode
            ? "Update user information and permissions"
            : "Add a new user to the system with custom permissions"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              User's personal details and role label. All fields marked with * are required.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter user's full name"
                {...register("name", { required: "Name is required" })}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Role Label */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role Label <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue("role", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role label" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
              <p className="text-sm text-muted-foreground">
                Role is just a label for categorization. Actual access is controlled by permissions
                below.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+92 300 1234567"
                {...register("phone")}
                disabled={isSubmitting}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-base">
                  Active Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Inactive users cannot log in to the system
                </p>
              </div>
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <div>
          <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
          <p className="text-muted-foreground mb-4">
            Select individual permissions or use a role template as a starting point. The user will
            only be able to access features for which they have permissions.
          </p>

          <PermissionSelector
            value={selectedPermissions}
            onChange={setSelectedPermissions}
            disabled={isSubmitting}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/users")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? "Update User" : "Create User"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}