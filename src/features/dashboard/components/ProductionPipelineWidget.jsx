import { useProductionPipeline } from "@/hooks/useDashboard"
import { Loader2, AlertCircle, Factory } from "lucide-react"

const STAGE_COLORS = {
  Dyeing: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
  Production: "bg-amber-100 text-amber-900 border-amber-200",
  QA: "bg-violet-100 text-violet-900 border-violet-200",
  "Awaiting Client": "bg-yellow-100 text-yellow-900 border-yellow-200",
  Approved: "bg-green-100 text-green-900 border-green-200",
}

export default function ProductionPipelineWidget() {
  const { data, isLoading, isError, error } = useProductionPipeline()

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
        <p className="text-sm">Failed to load production pipeline</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const pipeline = data?.pipeline || []
  const totalItems = pipeline.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Factory className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Production Pipeline</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {totalItems} items in production stages
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {pipeline.map((stage) => (
          <div
            key={stage.stage}
            className={`rounded-lg border p-4 ${
              STAGE_COLORS[stage.stage] || "bg-slate-100 border-slate-200"
            }`}
          >
            <div className="text-xs font-medium uppercase tracking-wide opacity-75">
              {stage.stage}
            </div>
            <div className="text-3xl font-bold mt-2">{stage.count}</div>
            {stage.breakdown && stage.breakdown.length > 0 && (
              <div className="mt-3 space-y-1 text-xs opacity-80">
                {stage.breakdown.map((b) => (
                  <div key={b.status} className="flex justify-between">
                    <span className="truncate pr-2">
                      {b.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <span className="font-semibold">{b.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}