/**
 * useSocket — Phase 16C (Real-time Notifications)
 *
 * Connects to the backend Socket.IO server using the JWT access token.
 * Listens for "notification" events and invalidates React Query caches
 * so the bell badge and notification list update instantly.
 *
 * Automatically connects when a user is logged in and disconnects on logout.
 */

import { useEffect, useRef } from "react"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { appConfig } from "@/config/appConfig"

// Socket.IO server URL — same as the API base but without the /api path
// e.g., if apiBaseUrl is "/api", the socket server is at the origin
const SOCKET_URL = "http://localhost:5000"

export function useSocket() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef(null)

  console.log("🔌 useSocket called, user:", user?.name || "null")

  useEffect(() => {
    console.log("🔌 useSocket useEffect, user:", user?.name || "null")
    if (!user) return

    const token = localStorage.getItem("authToken")
    console.log("🔌 Token found:", !!token)
    if (!token) return

    console.log("🔌 Creating socket connection to", SOCKET_URL)

    // Create socket connection with JWT auth
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id)
    })

    // Listen for real-time notifications
    socket.on("notification", (data) => {
      console.log("🔔 Real-time notification:", data.notification?.title)

      // Instantly update the unread count and notifications list
      queryClient.setQueryData(["notifications", "unread-count"], {
        unreadCount: data.unreadCount,
      })

      // Invalidate the notifications list so it refetches
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    })

    socket.on("connect_error", (err) => {
      console.warn("🔌 Socket connection error:", err.message)
    })

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason)
    })

    // Cleanup on unmount or user change
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user, queryClient])

  return socketRef
}