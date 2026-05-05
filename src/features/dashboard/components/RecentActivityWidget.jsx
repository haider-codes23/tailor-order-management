import { useRecentActivity } from "@/hooks/useDashboard"
import { Loader2, AlertCircle, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"

export default function RecentActivityWidget() {
  const { data, isLoading, isError, error } = useRecentActivity(20)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-[400px] flex flex-col items-center justify-center text-red-600">
        <AlertCircle className="h-6 w-6 mb-2" />
        <p className="text-sm">Failed to load recent activity</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const activities = data || []

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
          No recent activity
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {activities.map((a) => {
            let timeAgo = ""
            try {
              timeAgo = formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })
            } catch {
              timeAgo = ""
            }

            return (
              <div
                key={a.id}
                className="border-l-2 border-slate-200 pl-3 py-1 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{a.action}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {a.orderNumber && (
                        <Link
                          to={`/orders/${a.orderId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {a.orderNumber}
                        </Link>
                      )}
                      {a.userName && <span>• {a.userName}</span>}
                      {a.sectionName && (
                        <span className="capitalize">• {a.sectionName}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}