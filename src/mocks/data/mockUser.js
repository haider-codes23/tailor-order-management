/**
 * Mock Users Database - MERGED VERSION
 *
 * This file serves TWO purposes:
 * 1. Authentication: Users who can log in (includes passwords)
 * 2. User Management: Users that admins can manage in the system
 *
 * Each user now has a custom permissions array instead of role-based permissions.
 */

/**
 * User Role Labels (now just templates/categories)
 */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  SALES: "SALES",
  PRODUCTION_HEAD: "PRODUCTION_HEAD",
  PACKET_CREATOR: "PACKET_CREATOR",
  DYEING: "DYEING", // NEW - Phase 12.5
  WORKER: "WORKER",
  QA: "QA",
  PURCHASER: "PURCHASER",
  FABRICATION: "FABRICATION",
  DISPATCH: "DISPATCH",
  CUSTOM: "CUSTOM",
}

export const ROLE_LABELS = {
  ADMIN: "Administrator",
  SALES: "Sales Representative",
  FABRICATION_BESPOKE: "Custom BOM Creator",
  PRODUCTION_HEAD: "Production Head",
  PACKET_CREATOR: "Packet Creator",
  DYEING: "Dyeing Department", // NEW - Phase 12.5
  WORKER: "Production Worker",
  QA: "Quality Assurance",
  PURCHASER: "Purchaser",
  DISPATCH: "Dispatch Manager",
  FABRICATION: "Fabrication (Bespoke)",
  CUSTOM: "Custom Role",
}

/**
 * Mock Users with Custom Permissions
 *
 * NOTE: Passwords are included for authentication.
 * In production, these would be hashed.
 */
export const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@tailor.com", // Kept your existing email
    password: "admin123", // For authentication
    role: USER_ROLES.ADMIN,
    phone: "+92 300 1234567",
    is_active: true,
    // Admin has ALL permissions
    permissions: [
      // User Management
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      // Inventory Management
      "inventory.view",
      "inventory.create",
      "inventory.edit",
      "inventory.delete",
      "inventory.stock_in",
      "inventory.stock_out",
      // Products & BOMhttps://docs.google.com/spreadsheets/d/1jr4dSwP4UM97H0q6BRL1XSbj-5S-gTthBooGTN0gdfw/edit?usp=sharing
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.manage_bom",
      // Measurements
      "measurements.view",
      "measurements.edit",
      // Orders
      "orders.view",
      "orders.create",
      "orders.edit",
      "orders.delete",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      // Production
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      // Procurement
      "procurement.view",
      "procurement.manage",
      // QA
      "qa.view",
      "qa.approve",
      "qa.request_rework",
      // Dispatch
      "dispatch.view",
      "dispatch.manage",
      // Reports
      "reports.view",
      "fabrication.view",
      "fabrication.create_bom",
      "fabrication.edit_bom",
      // Dyeing
      "dyeing.view",
      "dyeing.accept",
      "dyeing.start",
      "dyeing.complete",
      "dyeing.view_all",
      // Production
      "production.assign_head",
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      "production.send_to_qa", // NEW - Can send to QA
      "sales.view_approval_queue", // NEW
      "sales.send_to_client", // NEW
      "sales.mark_client_approved",
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Sarah Sales",
    email: "sales@tailor.com", // Kept your existing email
    password: "sales123", // For authentication
    role: USER_ROLES.SALES,
    phone: "+92 300 2234567",
    is_active: true,
    permissions: [
      "orders.view",
      "orders.create",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      "inventory.view",
      "products.view",
      "sales.view_approval_queue", // NEW
      "sales.send_to_client", // NEW
      "sales.mark_client_approved",
    ],
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: 3,
    name: "Mike Supervisor",
    email: "supervisor@tailor.com", // Kept your existing email
    password: "super123", // For authentication
    role: USER_ROLES.PRODUCTION_HEAD,
    phone: "+92 300 3234567",
    is_active: true,
    permissions: [
      "orders.view",
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      "production.send_to_qa",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: 4,
    name: "John Worker",
    email: "john_worker@tailor.com", // Kept your existing email
    password: "worker123", // For authentication
    role: USER_ROLES.WORKER,
    phone: "+92 300 4234567",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task", // NEW
      "production.complete_task", // NEW
      "orders.view",
    ],
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Lisa Purchaser",
    email: "purchaser@tailor.com", // Kept your existing email
    password: "purchase123", // For authentication
    role: USER_ROLES.PURCHASER,
    phone: "+92 300 5234567",
    is_active: true,
    permissions: [
      "procurement.view",
      "procurement.manage",
      "inventory.view",
      "inventory.stock_in",
      "orders.view",
    ],
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  },
  {
    id: 6,
    name: "David QA",
    email: "qa@tailor.com", // Kept your existing email
    password: "qa1234", // For authentication
    role: USER_ROLES.QA,
    phone: "+92 300 6234567",
    is_active: true,
    permissions: [
      "orders.view",
      "qa.view",
      "qa.approve",
      "qa.request_rework",
      "products.view",
      "qa.add_video_link",
    ],
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
  {
    id: 7,
    name: "Micheal",
    email: "micheal_worker@tailor.com",
    password: "worker123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 0000000",
    is_active: false,
    permissions: ["production.view"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
  {
    id: 8,
    name: "Fatima Khan",
    email: "fatima@tailor.com",
    password: "fatima123",
    role: USER_ROLES.SALES,
    phone: "+92 300 8234567",
    is_active: true,
    permissions: [
      "orders.view",
      "orders.create",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
  {
    id: 9,
    name: "Ali Hassan",
    email: "ali@tailor.com",
    password: "ali123",
    role: USER_ROLES.SALES,
    phone: "+92 300 9234567",
    is_active: true,
    permissions: [
      "orders.view",
      "orders.create",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-03-20T00:00:00Z",
    updated_at: "2024-03-20T00:00:00Z",
  },
  {
    id: 10,
    name: "Zainab Ahmed",
    email: "zainab@tailor.com",
    password: "zainab123",
    role: USER_ROLES.SALES,
    phone: "+92 300 1034567",
    is_active: true,
    permissions: [
      "orders.view",
      "orders.create",
      "orders.manage_customer_forms",
      "orders.approve_customer_forms",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-04-01T00:00:00Z",
  },

  // Additional Production Heads
  {
    id: 11,
    name: "Bilal Sheikh",
    email: "bilal@tailor.com",
    password: "bilal123",
    role: USER_ROLES.PRODUCTION_HEAD,
    phone: "+92 300 1134567",
    is_active: true,
    permissions: [
      "orders.view",
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      "production.send_to_qa",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-04-10T00:00:00Z",
    updated_at: "2024-04-10T00:00:00Z",
  },
  {
    id: 12,
    name: "Hira Malik",
    email: "hira@tailor.com",
    password: "hira123",
    role: USER_ROLES.PRODUCTION_HEAD,
    phone: "+92 300 1234568",
    is_active: true,
    permissions: [
      "orders.view",
      "production.view",
      "production.manage",
      "production.assign_tasks",
      "production.approve_packets",
      "production.send_to_qa",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-04-15T00:00:00Z",
    updated_at: "2024-04-15T00:00:00Z",
  },
  {
    id: 13,
    name: "Ahmad Fabrication",
    email: "fabrication@tailor.com",
    password: "fabric123",
    role: USER_ROLES.FABRICATION,
    phone: "+92 300 1334567",
    is_active: true,
    permissions: [
      "fabrication.view",
      "fabrication.create_bom",
      "fabrication.edit_bom",
      "inventory.view",
      "products.view",
    ],
    created_at: "2024-04-20T00:00:00Z",
    updated_at: "2024-04-20T00:00:00Z",
  },
  {
    id: 14, // Adjust ID based on your existing users
    name: "Imran Shah",
    email: "imran_dyeing@tailor.com",
    password: "password123",
    role: USER_ROLES.DYEING,
    is_active: true,
    permissions: [
      "dyeing.view",
      "dyeing.accept",
      "dyeing.start",
      "dyeing.complete",
      "orders.view",
      "inventory.view",
      "products.view",
    ],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },

  {
    id: 15, // Adjust ID based on your existing users
    name: "Tariq Ahmed",
    email: "tariq_dyeing@tailor.com",
    password: "password123",
    role: USER_ROLES.DYEING,
    is_active: true,
    permissions: [
      "dyeing.view",
      "dyeing.accept",
      "dyeing.start",
      "dyeing.complete",
      "orders.view",
      "inventory.view",
      "products.view",
    ],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },

  {
    id: 16,
    name: "Usman Ali",
    email: "usman@tailor.com",
    password: "usman123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 2001111",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task",
      "production.complete_task",
      "orders.view",
    ],
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
  },

  // Worker 3 - Kamran Shah
  {
    id: 17,
    name: "Kamran Shah",
    email: "kamran@tailor.com",
    password: "kamran123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 2002222",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task",
      "production.complete_task",
      "orders.view",
    ],
    created_at: "2024-05-05T00:00:00Z",
    updated_at: "2024-05-05T00:00:00Z",
  },

  // Worker 4 - Nadeem Akhtar
  {
    id: 18,
    name: "Nadeem Akhtar",
    email: "nadeem@tailor.com",
    password: "nadeem123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 2003333",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task",
      "production.complete_task",
      "orders.view",
    ],
    created_at: "2024-05-10T00:00:00Z",
    updated_at: "2024-05-10T00:00:00Z",
  },

  // Worker 5 - Tariq Mehmood
  {
    id: 19,
    name: "Tariq Mehmood",
    email: "tariq@tailor.com",
    password: "tariq123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 2004444",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task",
      "production.complete_task",
      "orders.view",
    ],
    created_at: "2024-05-15T00:00:00Z",
    updated_at: "2024-05-15T00:00:00Z",
  },

  // Worker 6 - Waseem Khan
  {
    id: 20,
    name: "Waseem Khan",
    email: "waseem@tailor.com",
    password: "waseem123",
    role: USER_ROLES.WORKER,
    phone: "+92 300 2005555",
    is_active: true,
    permissions: [
      "production.view",
      "production.start_task",
      "production.complete_task",
      "orders.view",
    ],
    created_at: "2024-05-20T00:00:00Z",
    updated_at: "2024-05-20T00:00:00Z",
  },

  {
    id: 21,
    name: "Tom Dispatch",
    email: "dispatch@tailor.com",
    password: "dispatch123",
    role: USER_ROLES.DISPATCH,
    phone: "+92 300 1134567",
    is_active: true,
    permissions: ["orders.view", "dispatch.view", "dispatch.manage"],
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
]

// ==================== HELPER FUNCTIONS ====================

/**
 * Get user by ID
 */
export function getUserById(id) {
  return mockUsers.find((user) => user.id === parseInt(id))
}

/**
 * Get users by role
 */
export function getUsersByRole(role) {
  return mockUsers.filter((user) => user.role === role && user.is_active)
}

/**
 * Get active users only
 */
export function getActiveUsers() {
  return mockUsers.filter((user) => user.is_active)
}

/**
 * Find user by email (for authentication)
 */
export function findUserByEmail(email) {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

/**
 * Validate credentials (for login)
 * Returns the user object if valid, null if invalid
 */
export function validateCredentials(email, password) {
  const user = findUserByEmail(email)

  if (!user) {
    return null // User not found
  }

  if (user.password !== password) {
    return null // Wrong password
  }

  if (!user.is_active) {
    return null // Account is disabled
  }

  return user
}

/**
 * Generate a mock JWT token (for authentication)
 *
 * In a real system, this would be a cryptographically signed token.
 * For our mock, we just create a string that looks like a JWT.
 */
export function generateMockToken(userId) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000, // Expires in 15 minutes
    })
  )
  const signature = btoa(`mock-signature-${userId}-${Date.now()}`)

  return `${header}.${payload}.${signature}`
}

/**
 * Sanitize user data for sending to frontend
 *
 * We never send passwords to the frontend.
 * This removes sensitive fields before returning user data.
 */
export function sanitizeUser(user) {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}

/**
 * Get all active production heads
 * Used for round-robin assignment
 */
export const getActiveProductionHeads = () => {
  return mockUsers.filter((user) => user.role === USER_ROLES.PRODUCTION_HEAD && user.is_active)
}

/**
 * Get all active production workers
 * Used for task assignment dropdowns
 */
export const getActiveProductionWorkers = () => {
  return mockUsers.filter((user) => user.role === USER_ROLES.WORKER && user.is_active)
}
