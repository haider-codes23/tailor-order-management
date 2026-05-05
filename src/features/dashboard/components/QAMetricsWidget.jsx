import { useQAMetrics } from "@/hooks/useDashboard"
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function QAMetricsWidget() {
  const { data, isLoading, isError, error } = useQAMetrics()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-[260px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-[260px] flex flex-col items-center justify-center text-red-600">
        <AlertCircle className="h-6 w-6 mb-2" />
        <p className="text-sm">Failed to load QA metrics</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const approvedThisMonth = data?.approvedThisMonth || 0
  const rejectedThisMonth = data?.rejectedThisMonth || 0
  const approvalRate = data?.approvalRate || 0
  const totalThisMonth = approvedThisMonth + rejectedThisMonth

  const chartData = [
    { name: "Approved", value: approvedThisMonth, color: "#10b981" },
    { name: "Rejected", value: rejectedThisMonth, color: "#ef4444" },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">QA Metrics</h2>
        <p className="text-sm text-slate-500 mt-1">This month • {totalThisMonth} decisions</p>
      </div>

      {totalThisMonth === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
          No QA activity this month
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 items-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{approvalRate}%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                Approval Rate
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-slate-600">Approved:</span>
                <span className="font-semibold text-slate-900 ml-auto">
                  {approvedThisMonth}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-slate-600">Rejected:</span>
                <span className="font-semibold text-slate-900 ml-auto">
                  {rejectedThisMonth}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}