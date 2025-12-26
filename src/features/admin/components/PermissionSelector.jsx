import { useState, useEffect } from "react"
import { PERMISSION_GROUPS, ROLE_TEMPLATES, getTemplatePermissions } from "@/lib/permissions"
// import { USER_ROLES, ROLE_LABELS } from "@/mocks/data/mockUsers"
import { USER_ROLES, ROLE_LABELS } from "@/mocks/data/mockUser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckSquare, Square } from "lucide-react"

/**
 * Permission Selector Component
 * 
 * Allows admins to select individual permissions for a user.
 * Includes role templates as starting points.
 */
export default function PermissionSelector({ value = [], onChange, disabled = false }) {
  const [selectedPermissions, setSelectedPermissions] = useState(value)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  // Sync with parent when value changes externally
  useEffect(() => {
    setSelectedPermissions(value)
  }, [value])

  // Handle individual permission toggle
  const togglePermission = (permissionKey) => {
    const newPermissions = selectedPermissions.includes(permissionKey)
      ? selectedPermissions.filter((p) => p !== permissionKey)
      : [...selectedPermissions, permissionKey]

    setSelectedPermissions(newPermissions)
    onChange(newPermissions)
  }

  // Handle "Select All" for a group
  const toggleGroupAll = (groupPermissions) => {
    const groupKeys = Object.keys(groupPermissions)
    const allSelected = groupKeys.every((key) => selectedPermissions.includes(key))

    let newPermissions
    if (allSelected) {
      // Deselect all in this group
      newPermissions = selectedPermissions.filter((p) => !groupKeys.includes(p))
    } else {
      // Select all in this group
      const toAdd = groupKeys.filter((key) => !selectedPermissions.includes(key))
      newPermissions = [...selectedPermissions, ...toAdd]
    }

    setSelectedPermissions(newPermissions)
    onChange(newPermissions)
  }

  // Apply role template
  const applyTemplate = (role) => {
    if (!role) {
      setSelectedPermissions([])
      onChange([])
      setSelectedTemplate("")
      return
    }

    const templatePermissions = getTemplatePermissions(role)
    setSelectedPermissions(templatePermissions)
    onChange(templatePermissions)
    setSelectedTemplate(role)
  }

  // Clear all permissions
  const clearAll = () => {
    setSelectedPermissions([])
    onChange([])
    setSelectedTemplate("")
  }

  // Select all permissions
  const selectAll = () => {
    const allPermissions = []
    Object.values(PERMISSION_GROUPS).forEach((group) => {
      Object.keys(group.permissions).forEach((key) => {
        allPermissions.push(key)
      })
    })
    setSelectedPermissions(allPermissions)
    onChange(allPermissions)
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start with Role Templates</CardTitle>
          <CardDescription>
            Select a role template to auto-fill permissions, then customize as needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={selectedTemplate} onValueChange={applyTemplate} disabled={disabled}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a role template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_TEMPLATES).map(([role, template]) => (
                  <SelectItem key={role} value={role}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={disabled || selectedPermissions.length === 0}
            >
              Clear All
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={disabled}
            >
              Select All
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{selectedPermissions.length} permissions selected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Permission Groups */}
      <div className="space-y-4">
        {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
          const groupPermissionKeys = Object.keys(group.permissions)
          const selectedCount = groupPermissionKeys.filter((key) =>
            selectedPermissions.includes(key)
          ).length
          const allSelected = selectedCount === groupPermissionKeys.length
          const someSelected = selectedCount > 0 && !allSelected

          return (
            <Card key={groupKey}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {group.label}
                      <Badge variant="outline" className="font-normal">
                        {selectedCount} / {groupPermissionKeys.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {group.description}
                    </CardDescription>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupAll(group.permissions)}
                    disabled={disabled}
                    className="ml-4"
                  >
                    {allSelected ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(group.permissions).map(([permissionKey, permissionLabel]) => {
                    const isChecked = selectedPermissions.includes(permissionKey)

                    return (
                      <div
                        key={permissionKey}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={permissionKey}
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(permissionKey)}
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={permissionKey}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {permissionLabel}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}