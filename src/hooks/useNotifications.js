/**
 * Notification Hooks — Phase 16
 * src/hooks/useNotifications.js
 *
 * React Query hooks for notifications with 30s polling on unread count.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth/hooks/useAuth"
import * as notificationApi from "@/services/api/notificationApi"
import { toast } from "sonner"

// ─── Query Keys ────────────────────────────────────────────────────────

const KEYS = {
  notifications: ["notifications"],
  unreadCount: ["notifications", "unread-count"],
}

// ─── Queries ───────────────────────────────────────────────────────────

/**
 * Fetch paginated notifications.
 * @param {Object} params - { page, limit, is_read, type }
 */
export function useNotifications(params = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...KEYS.notifications, params],
    queryFn: () => notificationApi.getNotifications(params),
    enabled: !!user,
    staleTime: 30_000,
  })
}

/**
 * Fetch unread count — polled every 30s for the bell badge.
 */
export function useUnreadCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: KEYS.unreadCount,
    queryFn: notificationApi.getUnreadCount,
    enabled: !!user,
    refetchInterval: 30_000, // poll every 30 seconds
    staleTime: 15_000,
  })
}

// ─── Mutations ─────────────────────────────────────────────────────────

/**
 * Mark a single notification as read.
 */
export function useMarkAsRead() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.notifications })
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
    },
  })
}

/**
 * Mark all notifications as read.
 */
export function useMarkAllAsRead() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KEYS.notifications })
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
      toast.success(`Marked ${data.updatedCount || "all"} notifications as read`)
    },
    onError: () => {
      toast.error("Failed to mark notifications as read")
    },
  })
}

/**
 * Delete a notification.
 */
export function useDeleteNotification() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.notifications })
      qc.invalidateQueries({ queryKey: KEYS.unreadCount })
    },
    onError: () => {
      toast.error("Failed to delete notification")
    },
  })
}