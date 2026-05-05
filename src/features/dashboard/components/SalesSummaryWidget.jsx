import { useSalesSummary } from "@/hooks/useDashboard"
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"

function formatCurrency(value) {
  return `PKR ${(value || 0).toLocaleString()}`
}

function ChangeBadge({ pct }) {
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
        <Minus className="h-3 w-3" />
        0%
      </span>
    )
  }
  const isUp = pct > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-600"
      }`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  )
}

export default function SalesSummaryWidget() {
  const { data, isLoading, isError, error } = useSalesSummary()

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
        <p className="text-sm">Failed to load sales summary</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const salespeople = data?.salespeople || []
  const totals = data?.totals || {}

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Sales Summary</h2>
        <p className="text-sm text-slate-500 mt-1">
          This month • {formatCurrency(totals.revenueThisMonth)} total revenue
        </p>
      </div>

      {salespeople.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
          No sales activity this month
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-left font-medium py-2">Salesperson</th>
                <th className="text-right font-medium py-2">Orders</th>
                <th className="text-right font-medium py-2">Revenue</th>
                <th className="text-right font-medium py-2">Avg Order</th>
                <th className="text-right font-medium py-2">vs Last Mo.</th>
              </tr>
            </thead>
            <tbody>
              {salespeople.map((s) => (
                <tr
                  key={s.salespersonId}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 text-slate-900 font-medium">{s.salespersonName}</td>
                  <td className="py-3 text-right text-slate-700">{s.ordersThisMonth}</td>
                  <td className="py-3 text-right text-slate-900 font-semibold">
                    {formatCurrency(s.revenueThisMonth)}
                  </td>
                  <td className="py-3 text-right text-slate-700">
                    {formatCurrency(s.avgOrderValue)}
                  </td>
                  <td className="py-3 text-right">
                    <ChangeBadge pct={s.revenueChangePct} />
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-semibold bg-slate-50">
                <td className="py-3 text-slate-900">Total</td>
                <td className="py-3 text-right text-slate-900">{totals.ordersThisMonth}</td>
                <td className="py-3 text-right text-slate-900">
                  {formatCurrency(totals.revenueThisMonth)}
                </td>
                <td className="py-3 text-right text-slate-500">—</td>
                <td className="py-3 text-right text-slate-500">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}