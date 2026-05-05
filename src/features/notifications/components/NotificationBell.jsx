/**
 * NotificationBell — Phase 16
 *
 * Bell icon with red badge showing unread count.
 * Clicking opens a dropdown with recent notifications.
 * "View all" links to /notifications page.
 */

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from "lucide-react"
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications"

/**
 * Simple relative-time formatter.
 * If you have a dateUtils with formatDistanceToNow, use that.
 * Otherwise this fallback works.
 */
function timeAgo(dateStr) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/**
 * Map notification type → emoji/icon prefix for the dropdown
 */
function typeIcon(type) {
  const map = {
    ORDER_CREATED: "🛒",
    ORDER_DISPATCHED: "🚚",
    TASK_ASSIGNED: "📋",
    PRODUCTION_ASSIGNED: "🏭",
    QA_REVIEW_NEEDED: "🔍",
    QA_APPROVED: "✅",
    QA_REJECTED: "❌",
    CLIENT_APPROVAL_NEEDED: "📹",
    CLIENT_APPROVED: "👍",
    REWORK_NEEDED: "🔄",
    RE_VIDEO_REQUESTED: "🎬",
    ALTERATION_REQUESTED: "✂️",
    READY_FOR_DISPATCH: "📦",
    MATERIAL_SHORTAGE: "⚠️",
    LOW_STOCK: "📉",
    PACKET_ASSIGNED: "📦",
    DYEING_REQUIRED: "🎨",
    DYEING_COMPLETED: "🎨",
  }
  return map[type] || "🔔"
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.unreadCount || 0

  // Fetch the 10 most recent notifications for the dropdown
  const { data: notifData, isLoading } = useNotifications({ page: 1, limit: 10 })
  const notifications = notifData?.notifications || []

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const handleNotificationClick = (notif) => {
    // Mark as read
    if (!notif.is_read) {
      markAsRead.mutate(notif.id)
    }
    // Navigate to action URL if present
    if (notif.action_url) {
      navigate(notif.action_url)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-[480px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${
                    !notif.is_read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Type icon */}
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {typeIcon(notif.type)}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <span className="flex-shrink-0 mt-2 h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2">
            <button
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
              onClick={() => {
                navigate("/notifications")
                setOpen(false)
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
