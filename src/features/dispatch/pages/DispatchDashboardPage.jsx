/**
 * Dispatch Dashboard Page - Phase 15
 * src/features/dispatch/DispatchDashboardPage.jsx
 *
 * 3-tab dashboard:
 * Tab 1: Ready for Dispatch — orders awaiting shipping
 * Tab 2: Dispatched — orders shipped, can be marked completed
 * Tab 3: Completed — closed orders (read-only)
 */

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Truck,
  Package,
  CheckCircle,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  ExternalLink,
  User,
  AlertTriangle,
} from "lucide-react"
import { format, formatDistanceToNow, isPast, parseISO } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useDispatchQueue,
  useDispatched,
  useCompleted,
  useDispatchStats,
  useDispatchOrder,
  useCompleteOrder,
} from "@/hooks/useDispatch"
import DispatchFormDialog from "../components/DispatchFormDialog"

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (amount, currency = "PKR") => {
  return `${currency} ${Number(amount || 0).toLocaleString()}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  try {
    return format(parseISO(dateStr), "dd MMM yyyy")
  } catch {
    return dateStr
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DispatchDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("queue")
  const [searchQuery, setSearchQuery] = useState("")

  // Dispatch form dialog
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Complete confirmation dialog
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [orderToComplete, setOrderToComplete] = useState(null)

  // Queries
  const { data: queueOrders = [], isLoading: queueLoading, error: queueError } = useDispatchQueue()
  const {
    data: dispatchedOrders = [],
    isLoading: dispatchedLoading,
    error: dispatchedError,
  } = useDispatched()
  const {
    data: completedOrders = [],
    isLoading: completedLoading,
    error: completedError,
  } = useCompleted()
  const { data: stats, isLoading: statsLoading } = useDispatchStats()

  // Mutations
  const dispatchMutation = useDispatchOrder()
  const completeMutation = useCompleteOrder()

  // Filter helper
  const filterOrders = (orders) => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.destination?.toLowerCase().includes(q) ||
        o.dispatchData?.trackingNumber?.toLowerCase().includes(q)
    )
  }

  const filteredQueue = useMemo(() => filterOrders(queueOrders), [queueOrders, searchQuery])
  const filteredDispatched = useMemo(
    () => filterOrders(dispatchedOrders),
    [dispatchedOrders, searchQuery]
  )
  const filteredCompleted = useMemo(
    () => filterOrders(completedOrders),
    [completedOrders, searchQuery]
  )

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOpenDispatchForm = (order) => {
    setSelectedOrder(order)
    setDispatchDialogOpen(true)
  }

  const handleDispatchSubmit = (formData) => {
    dispatchMutation.mutate(
      {
        orderId: selectedOrder.orderId,
        ...formData,
        dispatchedBy: user?.id,
      },
      {
        onSuccess: () => {
          setDispatchDialogOpen(false)
          setSelectedOrder(null)
        },
      }
    )
  }

  const handleOpenCompleteDialog = (order) => {
    setOrderToComplete(order)
    setCompleteDialogOpen(true)
  }

  const handleConfirmComplete = () => {
    completeMutation.mutate(
      {
        orderId: orderToComplete.orderId,
        completedBy: user?.id,
      },
      {
        onSuccess: () => {
          setCompleteDialogOpen(false)
          setOrderToComplete(null)
        },
      }
    )
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLoading = (color) => (
    <div className="flex justify-center py-12">
      <Loader2 className={`h-8 w-8 animate-spin text-${color}-500`} />
    </div>
  )

  const renderError = () => (
    <div className="text-center py-12 text-red-500">
      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
      <p>Failed to load data. Please try again.</p>
    </div>
  )

  const renderEmpty = (Icon, message) => (
    <div className="text-center py-12 text-slate-400">
      <Icon className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )

  // ------------ Queue Card (Tab 1) ------------
  const renderQueueCard = (order) => {
    const isFwdPast = order.fwdDate && isPast(parseISO(order.fwdDate))

    return (
      <Card
        key={order.orderId}
        className={`border ${order.urgent ? "border-red-300 bg-red-50/30" : ""}`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{order.orderNumber}</span>
                {order.urgent && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    URGENT
                  </Badge>
                )}
                <Badge className="bg-sky-100 text-sky-700 text-xs px-1.5 py-0">
                  Ready for Dispatch
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {order.customerName}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {order.destination}
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {order.itemCount} item(s)
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              {formatCurrency(order.totalAmount, order.currency)}
            </span>
            <span
              className={`flex items-center gap-1 ${isFwdPast ? "text-red-500 font-medium" : ""}`}
            >
              <Calendar className="h-3 w-3" />
              FWD: {formatDate(order.fwdDate)}
              {isFwdPast && <AlertTriangle className="h-3 w-3 text-red-500" />}
            </span>
          </div>

          {/* Items */}
          <div className="text-xs text-slate-500 mb-3 border-t pt-2 space-y-0.5">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.productName}</span>
                <span>
                  {item.size} × {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Action */}
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700"
            size="sm"
            onClick={() => handleOpenDispatchForm(order)}
          >
            <Truck className="h-4 w-4 mr-2" />
            Process Dispatch
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ------------ Dispatched Card (Tab 2) ------------
  const renderDispatchedCard = (order) => {
    const dd = order.dispatchData
    return (
      <Card key={order.orderId} className="border">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{order.orderNumber}</span>
                <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0">Dispatched</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{order.customerName}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <MapPin className="h-3 w-3 inline mr-1" />
              {order.destination}
            </div>
          </div>

          {/* Shipping Info */}
          {dd && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Courier:</span>
                <span className="font-medium">{dd.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tracking:</span>
                <span className="font-medium font-mono text-xs">{dd.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispatched:</span>
                <span className="font-medium">{formatDate(dd.dispatchDate)}</span>
              </div>
              {dd.notes && (
                <div className="text-xs text-slate-500 border-t pt-1 mt-1">
                  <span className="font-medium">Notes: </span>
                  {dd.notes}
                </div>
              )}
              <div className="text-xs text-slate-400 border-t pt-1 mt-1">
                Dispatched by {dd.dispatchedByName} •{" "}
                {dd.dispatchedAt &&
                  formatDistanceToNow(parseISO(dd.dispatchedAt), { addSuffix: true })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="text-xs text-slate-500 mb-3 space-y-0.5">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.productName}</span>
                <span>
                  {item.size} × {item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Action */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
            onClick={() => handleOpenCompleteDialog(order)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Completed
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ------------ Completed Card (Tab 3) ------------
  const renderCompletedCard = (order) => {
    const dd = order.dispatchData
    return (
      <Card key={order.orderId} className="border bg-slate-50/50">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{order.orderNumber}</span>
                <Badge className="bg-green-100 text-green-700 text-xs px-1.5 py-0">Completed</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{order.customerName}</p>
            </div>
            <div className="text-xs text-slate-500">
              <MapPin className="h-3 w-3 inline mr-1" />
              {order.destination}
            </div>
          </div>

          {dd && (
            <div className="text-xs text-slate-500 space-y-0.5">
              <div>
                <span className="font-medium">Courier:</span> {dd.courier} •{" "}
                <span className="font-medium">Tracking:</span>{" "}
                <span className="font-mono">{dd.trackingNumber}</span>
              </div>
              <div>
                <span className="font-medium">Dispatched:</span> {formatDate(dd.dispatchDate)} •{" "}
                <span className="font-medium">Amount:</span>{" "}
                {formatCurrency(order.totalAmount, order.currency)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dispatch Dashboard</h1>
        <p className="text-sm text-slate-500">Process shipments and track deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-sky-50 border-sky-200">
          <CardContent className="p-3 text-center">
            <Package className="h-5 w-5 text-sky-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-sky-700">
              {statsLoading ? "..." : stats?.readyForDispatch || 0}
            </div>
            <div className="text-xs text-sky-600">Ready to Ship</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? "..." : stats?.totalDispatched || 0}
            </div>
            <div className="text-xs text-blue-600">In Transit</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">
              {statsLoading ? "..." : stats?.totalCompleted || 0}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, customer, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="queue" className="text-xs">
            Ready to Ship ({filteredQueue.length})
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="text-xs">
            Dispatched ({filteredDispatched.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ready for Dispatch */}
        <TabsContent value="queue">
          {queueLoading ? (
            renderLoading("sky")
          ) : queueError ? (
            renderError()
          ) : filteredQueue.length === 0 ? (
            renderEmpty(Package, "No orders ready for dispatch")
          ) : (
            <div className="space-y-4">{filteredQueue.map((order) => renderQueueCard(order))}</div>
          )}
        </TabsContent>

        {/* Tab 2: Dispatched */}
        <TabsContent value="dispatched">
          {dispatchedLoading ? (
            renderLoading("blue")
          ) : dispatchedError ? (
            renderError()
          ) : filteredDispatched.length === 0 ? (
            renderEmpty(Truck, "No dispatched orders")
          ) : (
            <div className="space-y-4">
              {filteredDispatched.map((order) => renderDispatchedCard(order))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Completed */}
        <TabsContent value="completed">
          {completedLoading ? (
            renderLoading("green")
          ) : completedError ? (
            renderError()
          ) : filteredCompleted.length === 0 ? (
            renderEmpty(CheckCircle, "No completed orders yet")
          ) : (
            <div className="space-y-4">
              {filteredCompleted.map((order) => renderCompletedCard(order))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dispatch Form Dialog */}
      <DispatchFormDialog
        open={dispatchDialogOpen}
        onOpenChange={setDispatchDialogOpen}
        order={selectedOrder}
        onSubmit={handleDispatchSubmit}
        isLoading={dispatchMutation.isPending}
      />

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Order as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This confirms that <strong>{orderToComplete?.orderNumber}</strong> has been delivered
              to <strong>{orderToComplete?.customerName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              disabled={completeMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Completed
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
