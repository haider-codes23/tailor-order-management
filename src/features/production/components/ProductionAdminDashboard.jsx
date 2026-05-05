/**
 * ProductionAdminDashboard.jsx
 * Admin view for production - shows order items ready for production head assignment
 *
 * File: src/features/production/components/ProductionAdminDashboard.jsx
 *
 * Manual production head assignment (round-robin removed).
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Loader2,
  Factory,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  Shirt,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react"
import { toast } from "sonner"
import {
  useReadyForAssignment,
  useRoundRobinState,
  useAssignProductionHead,
  useProductionHeadsList,
  useProductionHeadsWorkload,
} from "@/hooks/useProduction"
import { formatDate } from "../../../utils/formatters"

export default function ProductionAdminDashboard() {
  const navigate = useNavigate()

  // Fetch order items ready for production head assignment
  const { data: readyData, isLoading: isLoadingReady, error: readyError } = useReadyForAssignment()

  // Extract items array from the response, default to empty array
  const readyItems = readyData?.items || []

  console.log("ProductionAdminDashboard - readyData:", readyData)
  console.log("ProductionAdminDashboard - readyItems:", readyItems)

  // Fetch round robin state ONLY for stats (inProduction, completedToday, totalProductionHeads)
  const { data: roundRobinState, isLoading: isLoadingRoundRobin } = useRoundRobinState()

  // Assignment mutation
  const assignMutation = useAssignProductionHead()

  // Fetch production head workload for informed assignment
  const { data: workloadData, isLoading: isLoadingWorkload } = useProductionHeadsWorkload()
  const headsWorkload = workloadData || []

  // Handle assign production head — now requires productionHeadId
  const handleAssignProductionHead = async (orderItemId, orderNumber, productName, productionHeadId) => {
    console.log("=== handleAssignProductionHead CALLED ===")
    console.log("orderItemId:", orderItemId)
    console.log("productionHeadId:", productionHeadId)

    if (!orderItemId || orderItemId === "undefined" || orderItemId === undefined) {
      console.error("ERROR: orderItemId is invalid:", orderItemId)
      toast.error("Cannot assign production head", {
        description: "Order item ID is missing. Please refresh and try again.",
      })
      return
    }

    if (!productionHeadId) {
      toast.error("Please select a production head")
      return
    }

    try {
      await assignMutation.mutateAsync({ orderItemId, productionHeadId })
      toast.success(`Production head assigned to ${productName} (${orderNumber})`, {
        description: "The production head can now manage this order item.",
      })
    } catch (error) {
      console.error("Assignment failed:", error)
      toast.error("Failed to assign production head", {
        description: error.message || "Please try again.",
      })
    }
  }

  // Loading state
  if (isLoadingReady || isLoadingRoundRobin) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Error state
  if (readyError) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">{readyError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Awaiting Assignment"
          value={readyItems.length}
          icon={UserPlus}
          color="amber"
          description="Order items need production head"
        />
        <StatsCard
          title="In Production"
          value={roundRobinState?.stats?.inProduction || 0}
          icon={Factory}
          color="blue"
          description="Currently being worked on"
        />
        <StatsCard
          title="Completed Today"
          value={roundRobinState?.stats?.completedToday || 0}
          icon={CheckCircle}
          color="green"
          description="Production completed"
        />
      </div>

      {/* Production Head Workload Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Production Head Workload
          </CardTitle>
          <CardDescription>
            Current assignments per production head — use this to make informed assignment decisions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingWorkload ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : headsWorkload.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active production heads found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {headsWorkload.map((head) => (
                <ProductionHeadWorkloadCard key={head.id} head={head} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready for Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-600" />
            Order Items Ready for Production Head Assignment
          </CardTitle>
          <CardDescription>
            Select a production head from the dropdown and click "Assign" to assign manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readyItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No order items are currently waiting for production head assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {readyItems.map((item, index) => (
                <OrderItemAssignmentCard
                  key={item.id || item.orderItemId || index}
                  item={item}
                  onAssign={handleAssignProductionHead}
                  isAssigning={assignMutation.isPending}
                  headsWorkload={headsWorkload}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Header Component
function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-indigo-100 p-2">
        <Factory className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Production Management</h1>
        <p className="text-muted-foreground">Assign production heads and monitor workflow</p>
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color, description }) {
  const colorClasses = {
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-3 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Order Item Assignment Card Component
function OrderItemAssignmentCard({ item, onAssign, isAssigning, headsWorkload = [] }) {
  // Local state for the selected production head in this card's dropdown
  const [selectedHeadId, setSelectedHeadId] = useState("")

  // Fetch the list of active production heads for the dropdown
  const { data: heads = [], isLoading: isLoadingHeads } = useProductionHeadsList()

  // Get the order item ID — support both 'id' and 'orderItemId' field names
  const orderItemId = item.id || item.orderItemId

  // Get sections that are ready for production
  const readySections =
    item.readySections ||
    item.sections?.filter(
      (s) => s.status === "READY_FOR_PRODUCTION" || s.status === "DYEING_COMPLETED"
    ) ||
    []

  console.log("OrderItemAssignmentCard render - item:", item)
  console.log("OrderItemAssignmentCard render - extracted orderItemId:", orderItemId)

  const handleClick = () => {
    if (!selectedHeadId) {
      toast.error("Please select a production head")
      return
    }
    onAssign(orderItemId, item.orderNumber, item.productName, selectedHeadId)
  }

  return (
    <Card className="border-amber-200 hover:border-amber-300 transition-colors">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Order Item Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-slate-400" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{item.productName}</h3>
                <Badge variant="outline" className="text-xs">
                  {item.orderNumber}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gray-100">
                  ID: {orderItemId || "MISSING!"}
                </Badge>
              </div>

              <p className="text-sm text-slate-500 mb-2">Customer: {item.customerName || "N/A"}</p>

              {/* Sections Ready */}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(readySections) &&
                  readySections.map((section, index) => {
                    const sectionName = typeof section === "string" ? section : section.name
                    return (
                      <Badge
                        key={sectionName || index}
                        variant="secondary"
                        className="text-xs bg-amber-100 text-amber-700"
                      >
                        <Shirt className="h-3 w-3 mr-1" />
                        {sectionName}
                      </Badge>
                    )
                  })}
                {item.totalSections > readySections.length && (
                  <Badge variant="outline" className="text-xs text-slate-500">
                    +{item.totalSections - readySections.length} more sections pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* FWD Date & Assignment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* FWD Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">FWD Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(item.fwdDate) || "Not set"}
                </p>
              </div>
            </div>

            {/* Production Head Dropdown + Assign Button */}
            <div className="flex flex-col items-end gap-2">
              <Select
                value={selectedHeadId}
                onValueChange={setSelectedHeadId}
                disabled={isLoadingHeads || isAssigning}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue
                    placeholder={isLoadingHeads ? "Loading..." : "Select production head"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {heads.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-slate-500">
                      No active production heads
                    </div>
                  ) : (
                    heads.map((h) => {
                      const workload = headsWorkload.find((w) => w.id === h.id)
                      const count = workload?.totalActiveItems || 0
                      return (
                        <SelectItem key={h.id} value={String(h.id)}>
                          {h.name} ({count} active)
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleClick}
                disabled={isAssigning || !orderItemId || !selectedHeadId || isLoadingHeads}
                className="bg-indigo-600 hover:bg-indigo-700 w-[220px]"
              >
                {isAssigning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Assign Production Head
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Production Head Workload Card Component
function ProductionHeadWorkloadCard({ head }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{head.name}</p>
            <p className="text-xs text-slate-500">
              {head.totalActiveItems} active item{head.totalActiveItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {head.productBreakdown.length > 0 && (
          expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )
        )}
      </div>

      {/* Product breakdown badges — always visible */}
      {head.productBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {head.productBreakdown.map((product) => (
            <Badge
              key={product.productName}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700"
            >
              {product.productName} × {product.count}
            </Badge>
          ))}
        </div>
      )}

      {head.totalActiveItems === 0 && (
        <p className="text-xs text-green-600 mt-2">Available — no active assignments</p>
      )}

      {/* Expanded: show individual items */}
      {expanded && head.activeItems.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-2">
          {head.activeItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-slate-700">{item.productName}</span>
                <span className="text-slate-400 ml-2">{item.orderNumber}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.status?.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
