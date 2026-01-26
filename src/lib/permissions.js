/**
 * Permission Definitions
 *
 * This file defines all available permissions in the system.
 * Permissions are grouped by feature/module for better organization.
 */

import { USER_ROLES } from "@/mocks/data/mockUser"

/**
 * All available permissions grouped by category
 */
export const PERMISSION_GROUPS = {
  USERS: {
    label: "User Management",
    description: "Manage system users and their permissions",
    permissions: {
      "users.view": "View users",
      "users.create": "Create new users",
      "users.edit": "Edit user details",
      "users.delete": "Deactivate users",
    },
  },

  INVENTORY: {
    label: "Inventory Management",
    description: "Manage inventory items and stock levels",
    permissions: {
      "inventory.view": "View inventory",
      "inventory.create": "Create inventory items",
      "inventory.edit": "Edit inventory items",
      "inventory.delete": "Delete inventory items",
      "inventory.stock_in": "Add stock (stock-in)",
      "inventory.stock_out": "Remove stock (stock-out)",
    },
  },

  PRODUCTS: {
    label: "Products & BOM",
    description: "Manage products and bill of materials",
    permissions: {
      "products.view": "View products",
      "products.create": "Create products",
      "products.edit": "Edit products",
      "products.delete": "Delete products",
      "products.manage_bom": "Manage Bill of Materials",
    },
  },

  MEASUREMENTS: {
    label: "Measurement Charts",
    description: "Manage standard size and height charts",
    permissions: {
      "measurements.view": "View measurement charts",
      "measurements.edit": "Edit measurement charts",
    },
  },

  ORDERS: {
    label: "Order Management",
    description: "Manage customer orders and forms",
    permissions: {
      "orders.view": "View orders",
      "orders.create": "Create new orders",
      "orders.edit": "Edit orders",
      "orders.delete": "Delete orders",
      "orders.manage_customer_forms": "Manage customer forms",
      "orders.approve_customer_forms": "Approve customer forms",
    },
  },

  FABRICATION: {
    label: "Fabrication (Bespoke)",
    description: "Create custom BOMs for custom size orders",
    permissions: {
      "fabrication.view": "View fabrication queue",
      "fabrication.create_bom": "Create custom BOMs",
      "fabrication.edit_bom": "Edit custom BOMs",
    },
  },

  PROCUREMENT: {
    label: "Procurement of Inventory Items",
    description: "Fulfill Procurement Demands",
    permissions: {
      "procurement.view": "Procurement view",
      "procurement.manage": "Procurement manage",
    },
  },

  DYEING: {
    label: "Dyeing Department",
    description: "Manage dyeing workflow for order items",
    permissions: {
      "dyeing.view": "View dyeing tasks and dashboard",
      "dyeing.accept": "Accept or reject dyeing tasks",
      "dyeing.start": "Start dyeing work on accepted tasks",
      "dyeing.complete": "Mark dyeing tasks as complete",
      "dyeing.view_all": "View all dyeing tasks (admin oversight)",
    },
  },

  PRODUCTION: {
    label: "Production Workflow",
    description: "Manage production tasks and workflows",
    permissions: {
      "production.view": "View production tasks and dashboard",
      "production.manage": "Manage production workflow",
      "production.assign_tasks": "Create and assign tasks to workers",
      "production.approve_packets": "Approve packets",
      "production.start_task": "Start assigned tasks", // NEW
      "production.complete_task": "Complete assigned tasks", // NEW
      "production.assign_head": "Assign production head to orders", // NEW (for admin)
      "production.send_to_qa": "Send completed sections to QA", // NEW
    },
  },

  QA: {
    label: "Quality Assurance",
    description: "Quality control and approval workflows",
    permissions: {
      "qa.view": "View QA tasks",
      "qa.approve": "Approve quality checks",
      "qa.request_rework": "Request rework",
    },
  },

  DISPATCH: {
    label: "Dispatch & Shipping",
    description: "Manage order dispatch and shipping",
    permissions: {
      "dispatch.view": "View dispatch tasks",
      "dispatch.manage": "Manage dispatch operations",
    },
  },

  REPORTS: {
    label: "Reports & Analytics",
    description: "Access system reports and analytics",
    permissions: {
      "reports.view": "View reports",
    },
  },
}

/**
 * Get all permissions as a flat array
 */
export function getAllPermissions() {
  const allPermissions = []

  Object.values(PERMISSION_GROUPS).forEach((group) => {
    Object.keys(group.permissions).forEach((permissionKey) => {
      allPermissions.push(permissionKey)
    })
  })

  return allPermissions
}

/**
 * Get permission label by key
 */
export function getPermissionLabel(permissionKey) {
  for (const group of Object.values(PERMISSION_GROUPS)) {
    if (group.permissions[permissionKey]) {
      return group.permissions[permissionKey]
    }
  }
  return permissionKey
}

/**
 * Role Templates - Predefined permission sets for quick assignment
 * These are starting points that admins can customize
 */
export const ROLE_TEMPLATES = {
  [USER_ROLES.ADMIN]: {
    label: "Administrator (Full Access)",
    permissions: getAllPermissions(), // All permissions
  },

  [USER_ROLES.SALES]: {
    label: "Sales Representative",
    permissions: [
      "orders.view",
      "orders.create",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      "inventory.view",
      "products.view",
    ],
  },

  [USER_ROLES.FABRICATION]: {
    label: "Fabrication (Bespoke)",
    permissions: [
      "fabrication.view",
      "fabrication.create_bom",
      "fabrication.edit_bom",
      "inventory.view",
      "products.view",
    ],
  },

  [USER_ROLES.PRODUCTION_HEAD]: {
    label: "Production Head",
    permissions: [
      "orders.view",
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      "production.send_to_qa", // NEW - Can send to QA
      "inventory.view",
      "products.view",
    ],
  },

  [USER_ROLES.PACKET_CREATOR]: {
    label: "Packet Creator",
    permissions: ["orders.view", "production.view", "inventory.view", "products.view"],
  },

  [USER_ROLES.DYEING]: {
    label: "Dyeing Department",
    permissions: [
      "dyeing.view",
      "dyeing.accept",
      "dyeing.start",
      "dyeing.complete",
      "orders.view",
      "inventory.view",
      "products.view",
    ],
  },

  [USER_ROLES.WORKER]: {
    label: "Production Worker",
    permissions: [
      "production.view",
      "production.start_task", // NEW - Can start assigned tasks
      "production.complete_task", // NEW - Can complete assigned tasks
      "orders.view",
    ],
  },

  [USER_ROLES.QA]: {
    label: "Quality Assurance",
    permissions: ["orders.view", "qa.view", "qa.approve", "qa.request_rework", "products.view"],
  },

  [USER_ROLES.PURCHASER]: {
    label: "Purchaser",
    permissions: [
      "procurement.view",
      "procurement.manage",
      "inventory.view",
      "inventory.stock_in",
      "orders.view",
    ],
  },

  [USER_ROLES.DISPATCH]: {
    label: "Dispatch Manager",
    permissions: ["orders.view", "dispatch.view", "dispatch.manage"],
  },

  [USER_ROLES.CUSTOM]: {
    label: "Custom Role (Select Permissions Manually)",
    permissions: [],
  },
}

/**
 * Get template permissions for a role
 */
export function getTemplatePermissions(role) {
  return ROLE_TEMPLATES[role]?.permissions || []
}
