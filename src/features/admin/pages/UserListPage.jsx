import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUsers, useDeleteUser, useActivateUser } from "@/hooks/useUsers"
import { USER_ROLES, ROLE_LABELS } from "@/mocks/data/mockUsers"
import { getUserPermissionCount } from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Loader2, Plus, Edit, UserX, UserCheck, AlertCircle, Users, Shield } from "lucide-react"

export default function UsersListPage() {
  const navigate = useNavigate()

  // Filters state
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Deletion/Activation state
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToActivate, setUserToActivate] = useState(null)

  // Build filters object
  const filters = {}
  if (roleFilter) filters.role = roleFilter
  if (statusFilter) filters.is_active = statusFilter === "active"
  if (searchQuery) filters.search = searchQuery

  // Fetch users with filters
  const { data, isLoading, isError, error } = useUsers(filters)

  // Mutations
  const deleteUserMutation = useDeleteUser()
  const activateUserMutation = useActivateUser()

  // Handlers
  const handleCreateNew = () => {
    navigate("/admin/users/new")
  }

  const handleEdit = (userId) => {
    navigate(`/admin/users/${userId}/edit`)
  }

  const handleDeactivate = async () => {
    if (!userToDelete) return

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id)
      setUserToDelete(null)
    } catch (error) {
      // Error already handled by mutation
    }
  }

  const handleActivate = async () => {
    if (!userToActivate) return

    try {
      await activateUserMutation.mutateAsync(userToActivate.id)
      setUserToActivate(null)
    } catch (error) {
      // Error already handled by mutation
    }
  }

  const clearFilters = () => {
    setRoleFilter("")
    setStatusFilter("")
    setSearchQuery("")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users: {error?.message || "Unknown error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const users = data?.data || []
  const hasActiveFilters = roleFilter || statusFilter || searchQuery

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage system users and assign custom permissions
          </p>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter users by role, status, or name/email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({users.length})
                </div>
              </CardTitle>
              <CardDescription className="mt-2">
                {hasActiveFilters ? "Filtered results" : "All system users"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Get started by creating your first user"}
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role Label</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const permissionCount = getUserPermissionCount(user)

                    return (
                      <TableRow key={user.id}>
                        {/* Name */}
                        <TableCell className="font-medium">{user.name}</TableCell>

                        {/* Email */}
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>

                        {/* Role Label */}
                        <TableCell>
                          <Badge variant="outline">{ROLE_LABELS[user.role] || user.role}</Badge>
                        </TableCell>

                        {/* Permissions Count */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {permissionCount} permission{permissionCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {user.is_active ? (
                            <Badge variant="default" className="bg-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>

                            {user.is_active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUserToDelete(user)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUserToActivate(user)}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivate User Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{userToDelete?.name}</strong>? They will
              no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate User Dialog */}
      <AlertDialog open={!!userToActivate} onOpenChange={() => setUserToActivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate <strong>{userToActivate?.name}</strong>? They will
              regain access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>Activate User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}