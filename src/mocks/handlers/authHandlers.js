import { http, HttpResponse, delay } from "msw"
import { validateCredentials, sanitizeUser, generateMockToken } from "../data/mockUser.js"
import { appConfig } from "@/config/appConfig"

/**
 * Authentication Handlers for Mock Service Worker
 *
 * These handlers intercept authentication-related API calls and respond
 * with mock data as if a real backend server were responding.
 *
 * Key behaviors we're simulating:
 * 1. Network delay (realistic response time)
 * 2. Credential validation
 * 3. Token generation
 * 4. Error scenarios (wrong password, server errors)
 */

export const authHandlers = [
  /**
   * POST /auth/login
   *
   * Handles user login attempts.
   *
   * Request body expects:
   * {
   *   email: string,
   *   password: string
   * }
   *
   * Success response:
   * {
   *   user: { id, name, email, role, permissions, ... },
   *   accessToken: string
   * }
   *
   * The refresh token would be set as an httpOnly cookie by a real backend,
   * but since we're mocking, we'll just simulate that behavior without
   * actually setting a real cookie.
   */
  http.post(`${appConfig.apiBaseUrl}/auth/login`, async ({ request }) => {
    // Simulate network delay - real APIs take time to respond
    // This helps you see loading states and makes the experience more realistic
    await delay(500)

    // Parse the request body to get email and password
    const body = await request.json()
    const { email, password } = body

    // Validate that required fields are present
    if (!email || !password) {
      return HttpResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Email and password are required",
        },
        { status: 400 }
      )
    }

    // Check credentials against our mock user database
    const user = validateCredentials(email, password)

    if (!user) {
      // Invalid credentials - could be wrong email or wrong password
      // In a real system, you wouldn't want to reveal which one for security,
      // so we give a generic message
      return HttpResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
        { status: 401 }
      )
    }

    // Credentials are valid! Generate tokens and return user data
    const accessToken = generateMockToken(user.id)
    const sanitizedUser = sanitizeUser(user)

    // In a real backend, the refresh token would be set as an httpOnly cookie here
    // For our mock, we're just simulating the access token response
    // The refresh token handling will be added when we implement token refresh

    return HttpResponse.json(
      {
        user: sanitizedUser,
        accessToken: accessToken,
        message: "Login successful",
      },
      {
        status: 200,
        // In a real system, the refresh token cookie would be set here:
        // headers: {
        //   'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
        // }
      }
    )
  }),

  /**
   * POST /auth/refresh
   *
   * Handles access token refresh.
   *
   * In a real system:
   * - The refresh token would be sent automatically as an httpOnly cookie
   * - Backend would validate the refresh token
   * - Backend would generate a new access token
   *
   * For our mock:
   * - We'll just generate a new mock token
   * - We simulate the cookie being present by checking if there's
   *   an existing user in localStorage (if they were logged in)
   */
  http.post(`${appConfig.apiBaseUrl}/auth/refresh`, async ({ request }) => {
    await delay(300)

    // Check if user is logged in (has existing auth data)
    // In a real system, this would validate the refresh token from the cookie
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("authToken")

    if (!storedUser || !storedToken) {
      // No valid session - refresh token is missing or invalid
      return HttpResponse.json(
        {
          error: "INVALID_REFRESH_TOKEN",
          message: "Please log in again",
        },
        { status: 401 }
      )
    }

    // Parse the stored user to get their ID
    const user = JSON.parse(storedUser)

    // Generate a new access token
    const newAccessToken = generateMockToken(user.id)

    return HttpResponse.json(
      {
        accessToken: newAccessToken,
        message: "Token refreshed successfully",
      },
      { status: 200 }
    )
  }),

  /**
   * POST /auth/logout
   *
   * Handles user logout.
   *
   * In a real system, this would:
   * - Invalidate the refresh token in the database
   * - Clear the refresh token cookie
   *
   * For our mock, we just acknowledge the logout request.
   * The actual cleanup (clearing localStorage, etc.) happens in the frontend.
   */
  http.post(`${appConfig.apiBaseUrl}/auth/logout`, async ({ request }) => {
    await delay(200)

    // In a real backend, we'd invalidate the refresh token here
    // For the mock, we just return success
    // The frontend's logout function handles clearing local storage

    return HttpResponse.json(
      {
        message: "Logged out successfully",
      },
      { status: 200 }
    )
  }),

  /**
   * GET /auth/me
   *
   * Gets the current user's information based on their access token.
   * This is useful for:
   * - Validating a token is still valid
   * - Refreshing user data if it might have changed
   * - Checking authentication status
   *
   * In a real system, the backend would:
   * - Decode and validate the JWT access token from the Authorization header
   * - Look up the user in the database
   * - Return current user data
   */
  http.get(`${appConfig.apiBaseUrl}/auth/me`, async ({ request }) => {
    await delay(200)

    // Get the authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "No valid access token provided",
        },
        { status: 401 }
      )
    }

    // In a real system, we'd decode and validate the JWT here
    // For our mock, we just check if there's a user in localStorage
    const storedUser = localStorage.getItem("user")

    if (!storedUser) {
      return HttpResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
        { status: 401 }
      )
    }

    const user = JSON.parse(storedUser)

    return HttpResponse.json(
      {
        user: user,
      },
      { status: 200 }
    )
  }),
]
