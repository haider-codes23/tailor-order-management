/**
 * NotificationsList — Phase 16
 *
 * Full-page notification list with pagination, filters, and actions.
 * Used inside NotificationsPage.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications"

/**
 * Map notification type to a color class for the left border accent
 */
function typeBorderColor(type) {
  if (type.includes("ORDER_CREATED") || type.includes("ORDER_DISPATCHED")) return "border-l-blue-500"
  if (type.includes("QA") || type.includes("REVIEW")) return "border-l-teal-500"
  if (type.includes("PRODUCTION") || type.includes("TASK")) return "border-l-indigo-500"
  if (type.includes("CLIENT_APPROVED") || type.includes("READY_FOR_DISPATCH")) return "border-l-green-500"
  if (type.includes("REWORK") || type.includes("REJECTED") || type.includes("SHORTAGE") || type.includes("LOW_STOCK")) return "border-l-red-500"
  if (type.includes("ALTERATION") || type.includes("RE_VIDEO")) return "border-l-amber-500"
  if (type.includes("DYEING")) return "border-l-cyan-500"
  if (type.includes("PACKET")) return "border-l-purple-500"
  return "border-l-slate-300"
}

function timeAgo(dateStr) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState("all") // "all" | "unread" | "read"
  const limit = 20

  const isReadParam = filter === "unread" ? false : filter === "read" ? true : undefined

  const { data, isLoading } = useNotifications({ page, limit, is_read: isReadParam })
  const notifications = data?.notifications || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotif = useDeleteNotification()

  const handleClick = (notif) => {
    if (!notif.is_read) {
      markAsRead.mutate(notif.id)
    }
    if (notif.action_url) {
      navigate(notif.action_url)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "read", label: "Read" },
          ].map((f) => (
            <button
              key={f.key}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f.key
                  ? "bg-white text-slate-900 shadow-sm font-medium"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => {
                setFilter(f.key)
                setPage(1)
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">{total} notifications</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${typeBorderColor(
                notif.type
              )} ${
                !notif.is_read
                  ? "bg-blue-50/60 border border-blue-100"
                  : "bg-white border border-slate-100 hover:bg-slate-50"
              }`}
              onClick={() => handleClick(notif)}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm ${
                      !notif.is_read ? "font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-400">{timeAgo(notif.created_at)}</span>
                  <span className="text-xs text-slate-300 bg-slate-100 px-2 py-0.5 rounded">
                    {notif.type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.is_read && (
                  <button
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Mark as read"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead.mutate(notif.id)
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotif.mutate(notif.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
