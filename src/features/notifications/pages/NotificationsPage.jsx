/**
 * NotificationsPage — Phase 16
 *
 * Full-page view at /notifications showing all notifications
 * with filters, pagination, and bulk actions.
 */

import { Bell } from "lucide-react"
import NotificationsList from "@/features/notifications/components/NotificationsList"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
          <Bell className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated on order progress and tasks</p>
        </div>
      </div>

      {/* Notifications list with filters and pagination */}
      <NotificationsList />
    </div>
  )
}
