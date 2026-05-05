import { useOrderFunnel } from "@/hooks/useDashboard"
import { Loader2, AlertCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#22c55e", // green
]

export default function OrderFunnelWidget() {
  const { data, isLoading, isError, error } = useOrderFunnel()

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
        <p className="text-sm">Failed to load order funnel</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const funnel = data?.funnel || []
  const totalActive = data?.totalActive || 0
  const cancelledCount = data?.cancelledCount || 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Order Funnel</h2>
          <p className="text-sm text-slate-500 mt-1">
            {totalActive} active orders • {cancelledCount} cancelled
          </p>
        </div>
      </div>

      {funnel.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
          No orders yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={funnel} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <XAxis
              dataKey="label"
              angle={-35}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 11, fill: "#64748b" }}
              height={70}
            />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {funnel.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}