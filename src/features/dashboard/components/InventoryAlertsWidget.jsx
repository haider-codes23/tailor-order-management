import { useInventoryAlerts } from "@/hooks/useDashboard"
import { Loader2, AlertCircle, Package, AlertTriangle, ShoppingCart, DollarSign } from "lucide-react"
import { Link } from "react-router-dom"

export default function InventoryAlertsWidget() {
  const { data, isLoading, isError, error } = useInventoryAlerts()

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
        <p className="text-sm">Failed to load inventory alerts</p>
        <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
      </div>
    )
  }

  const lowStockCount = data?.lowStockCount || 0
  const outOfStockCount = data?.outOfStockCount || 0
  const openProcurementCount = data?.openProcurementCount || 0
  const totalShortageValue = data?.totalShortageValue || 0

  const tiles = [
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "text-orange-600 bg-orange-50",
      link: "/inventory/alerts/low-stock",
    },
    {
      label: "Out of Stock",
      value: outOfStockCount,
      icon: Package,
      color: "text-red-600 bg-red-50",
      link: "/inventory",
    },
    {
      label: "Open Procurement",
      value: openProcurementCount,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50",
      link: "/procurement",
    },
    {
      label: "Shortage Value",
      value: `PKR ${totalShortageValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600 bg-purple-50",
      link: "/procurement",
      isText: true,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Inventory Alerts</h2>
        <p className="text-sm text-slate-500 mt-1">Stock & procurement summary</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.label}
              to={tile.link}
              className="block rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className={`inline-flex p-2 rounded-lg ${tile.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-500 uppercase tracking-wide">
                  {tile.label}
                </div>
                <div
                  className={`font-bold text-slate-900 mt-1 ${
                    tile.isText ? "text-base" : "text-2xl"
                  }`}
                >
                  {tile.value}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}