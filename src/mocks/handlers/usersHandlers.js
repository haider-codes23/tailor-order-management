/**
 * MSW Handlers for Users API - Permission-Based System
 *
 * These handlers simulate the backend API for user management.
 * Users now have a permissions array instead of role-based permissions.
 */

import { http, HttpResponse } from "msw"
// import { mockUsers, getUserById } from "../data/mockUsers"
import { mockUsers, getUserById } from "../data/mockUser"
import { appConfig } from "@/config/appConfig"

// const appConfig.apiBaseUrl = "/api"

/**
 * Users Handlers
 */
export const usersHandlers = [
  /**
   * GET /api/users
   * List all users with optional filtering
   * Query params: role, is_active, search
   */
  http.get(`${appConfig.apiBaseUrl}/users`, ({ request }) => {
    const url = new URL(request.url)
    const roleFilter = url.searchParams.get("role")
    const isActiveFilter = url.searchParams.get("is_active")
    const searchQuery = url.searchParams.get("search")?.toLowerCase()

    let filteredUsers = [...mockUsers]

    // Filter by role
    if (roleFilter) {
      filteredUsers = filteredUsers.filter((user) => user.role === roleFilter)
    }

    // Filter by active status
    if (isActiveFilter !== null) {
      const isActive = isActiveFilter === "true"
      filteredUsers = filteredUsers.filter((user) => user.is_active === isActive)
    }

    // Filter by search query (name or email)
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery) ||
          user.email.toLowerCase().includes(searchQuery)
      )
    }

    console.log("📋 GET /api/users - Returning:", filteredUsers.length, "users")

    return HttpResponse.json({
      success: true,
      data: filteredUsers,
      meta: {
        total: filteredUsers.length,
        filters_applied: {
          role: roleFilter,
          is_active: isActiveFilter,
          search: searchQuery,
        },
      },
    })
  }),

  /**
   * GET /api/users/:id
   * Get a single user by ID
   */
  http.get(`${appConfig.apiBaseUrl}/users/:id`, ({ params }) => {
    const { id } = params
    const user = getUserById(id)

    if (!user) {
      console.error("❌ GET /api/users/:id - User not found:", id)
      return HttpResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    console.log("✅ GET /api/users/:id - Returning user:", user.name)

    return HttpResponse.json({
      success: true,
      data: user,
    })
  }),

  /**
   * POST /api/users
   * Create a new user
   */
  http.post(`${appConfig.apiBaseUrl}/users`, async ({ request }) => {
    const body = await request.json()

    // Validation
    if (!body.name || !body.email || !body.role) {
      console.error("❌ POST /api/users - Missing required fields")
      return HttpResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email, role",
        },
        { status: 400 }
      )
    }

    // Validate permissions array
    if (!body.permissions || !Array.isArray(body.permissions)) {
      console.error("❌ POST /api/users - Invalid permissions")
      return HttpResponse.json(
        {
          success: false,
          error: "Permissions must be an array",
        },
        { status: 400 }
      )
    }

    // Check if email already exists
    const emailExists = mockUsers.some(
      (user) => user.email.toLowerCase() === body.email.toLowerCase()
    )

    if (emailExists) {
      console.error("❌ POST /api/users - Email already exists:", body.email)
      return HttpResponse.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = {
      id: Math.max(...mockUsers.map((u) => u.id)) + 1,
      name: body.name,
      email: body.email,
      role: body.role,
      phone: body.phone || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      permissions: body.permissions, // Include permissions array
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Add to mock data
    mockUsers.push(newUser)

    console.log("✅ POST /api/users - Created user:", newUser.name, "with", newUser.permissions.length, "permissions")

    return HttpResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    )
  }),

  /**
   * PUT /api/users/:id
   * Update an existing user
   */
  http.put(`${appConfig.apiBaseUrl}/users/:id`, async ({ params, request }) => {
    const { id } = params
    const body = await request.json()

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id))

    if (userIndex === -1) {
      console.error("❌ PUT /api/users/:id - User not found:", id)
      return HttpResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Validate permissions if provided
    if (body.permissions && !Array.isArray(body.permissions)) {
      console.error("❌ PUT /api/users/:id - Invalid permissions")
      return HttpResponse.json(
        {
          success: false,
          error: "Permissions must be an array",
        },
        { status: 400 }
      )
    }

    // Check if email is being changed and if it already exists
    if (body.email && body.email !== mockUsers[userIndex].email) {
      const emailExists = mockUsers.some(
        (user) => user.email.toLowerCase() === body.email.toLowerCase() && user.id !== parseInt(id)
      )

      if (emailExists) {
        console.error("❌ PUT /api/users/:id - Email already exists:", body.email)
        return HttpResponse.json(
          {
            success: false,
            error: "Email already exists",
          },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = {
      ...mockUsers[userIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    mockUsers[userIndex] = updatedUser

    console.log("✅ PUT /api/users/:id - Updated user:", updatedUser.name, "with", updatedUser.permissions?.length || 0, "permissions")

    return HttpResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    })
  }),

  /**
   * DELETE /api/users/:id
   * Delete (deactivate) a user
   * Note: We don't actually delete users, we just deactivate them
   */
  http.delete(`${appConfig.apiBaseUrl}/users/:id`, ({ params }) => {
    const { id } = params

    const userIndex = mockUsers.findIndex((u) => u.id === parseInt(id))

    if (userIndex === -1) {
      console.error("❌ DELETE /api/users/:id - User not found:", id)
      return HttpResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      )
    }

    // Deactivate user instead of deleting
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      is_active: false,
      updated_at: new Date().toISOString(),
    }

    console.log("✅ DELETE /api/users/:id - Deactivated user:", mockUsers[userIndex].name)

    return HttpResponse.json({
      success: true,
      message: "User deactivated successfully",
    })
  }),
]