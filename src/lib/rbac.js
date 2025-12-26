/**
 * Role-Based Access Control (RBAC) Utilities - Permission-Based System
 *
 * These helper functions determine what actions users can perform
 * based on their PERMISSIONS (not roles). Roles are just labels now.
 */

import { USER_ROLES } from "../mocks/data/mockUsers"

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with 'permissions' array
 * @param {string} permission - Permission to check (e.g., 'orders.view')
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false
  return user.permissions.includes(permission)
}

/**
 * Check if user has ANY of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !user.permissions) return false
  return permissions.some((permission) => user.permissions.includes(permission))
}

/**
 * Check if user has ALL of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !user.permissions) return false
  return permissions.every((permission) => user.permissions.includes(permission))
}

/**
 * Check if a user has a specific role (for display purposes)
 * Note: This is now just for categorization, not access control
 * @param {Object} user - User object with 'role' property
 * @param {string} role - Role to check against
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !user.role) return false
  return user.role === role
}

/**
 * Check if user is admin (has admin role label)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isAdmin(user) {
  return hasRole(user, USER_ROLES.ADMIN)
}

/**
 * Check if user can access a specific page/route
 * @param {Object} user - User object
 * @param {Array<string>} requiredPermissions - Permissions needed to access
 * @returns {boolean}
 */
export function canAccessRoute(user, requiredPermissions = []) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true
  return hasAnyPermission(user, requiredPermissions)
}

/**
 * Filter navigation items based on user permissions
 * @param {Array} items - Array of nav items with 'requiredPermissions' property
 * @param {Object} user - User object
 * @returns {Array} Filtered items user can access
 */
export function filterNavigationByPermissions(items, user) {
  if (!user) return []

  return items.filter((item) => {
    // If no permissions required, show to everyone
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true
    }
    
    // Check if user has ANY of the required permissions
    return hasAnyPermission(user, item.requiredPermissions)
  })
}

/**
 * Get user's permission count (for display)
 * @param {Object} user - User object
 * @returns {number}
 */
export function getUserPermissionCount(user) {
  if (!user || !user.permissions) return 0
  return user.permissions.length
}

/**
 * Check if user can perform a specific action
 * Alias for hasPermission for backward compatibility
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function canUser(user, permission) {
  return hasPermission(user, permission)
}

/**
 * Higher-order access check function
 * @param {Object} user - User object
 * @param {Object} requirements - { permissions?: [], requireAll?: boolean }
 * @returns {boolean}
 */
export function checkAccess(user, requirements = {}) {
  if (!user) return false

  const { permissions = [], requireAll = false } = requirements

  if (!permissions || permissions.length === 0) return true

  if (requireAll) {
    return hasAllPermissions(user, permissions)
  } else {
    return hasAnyPermission(user, permissions)
  }
}