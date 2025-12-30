import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useOrders } from "@/hooks/useOrders"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_CONFIG,
  ORDER_SOURCE,
  PAYMENT_STATUS,
  URGENT_TYPE,
} from "@/constants/orderConstants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  ShoppingBag,
  Store,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  User,
  Package,
} from "lucide-react"

export default function OrdersListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Filter state
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [urgentFilter, setUrgentFilter] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 10

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Build query params
  const queryParams = {
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(sourceFilter !== "all" && { source: sourceFilter }),
    ...(urgentFilter !== "all" && { urgent: urgentFilter }),
  }

  const { data, isLoading, isError } = useOrders(queryParams)

  const orders = data?.orders || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get payment status badge
  const getPaymentBadge = (status) => {
    const config = {
      PAID: "bg-green-100 text-green-700",
      EXTRA_PAID: "bg-blue-100 text-blue-700",
      PENDING: "bg-amber-100 text-amber-700",
    }
    return config[status] || "bg-slate-100 text-slate-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">Manage customer orders and track their progress</p>
        </div>
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by customer name or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(ORDER_ITEM_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value={ORDER_SOURCE.SHOPIFY}>Shopify</SelectItem>
              <SelectItem value={ORDER_SOURCE.MANUAL}>Manual</SelectItem>
            </SelectContent>
          </Select>

          {/* Urgent Filter */}
          <Select value={urgentFilter} onValueChange={setUrgentFilter}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value={URGENT_TYPE.EVENT}>Event</SelectItem>
              <SelectItem value={URGENT_TYPE.RTS}>RTS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filters indicator */}
        {(debouncedSearch ||
          statusFilter !== "all" ||
          sourceFilter !== "all" ||
          urgentFilter !== "all") && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
            <button
              onClick={() => {
                setSearch("")
                setDebouncedSearch("")
                setStatusFilter("all")
                setSourceFilter("all")
                setUrgentFilter("all")
              }}
              className="text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load orders</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Package className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm">
              {debouncedSearch
                ? "Try adjusting your search"
                : "Create your first order to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b text-sm font-medium text-slate-500">
              <div className="col-span-3">Order / Customer</div>
              <div className="col-span-2">Date / Destination</div>
              <div className="col-span-2">Items Status</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-2">Consultant</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Orders */}
            <div className="divide-y divide-slate-200">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                    {/* Order / Customer */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            order.source === ORDER_SOURCE.SHOPIFY ? "bg-green-100" : "bg-blue-100"
                          }`}
                        >
                          {order.source === ORDER_SOURCE.SHOPIFY ? (
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                          ) : (
                            <Store className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/orders/${order.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-sm text-slate-500">{order.customerName}</p>
                        </div>
                        {order.urgent && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            {order.urgent}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date / Destination */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-slate-900">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(order.fwdDate)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {order.destination}
                      </div>
                    </div>

                    {/* Items Status */}
                    <div className="col-span-2">
                      <p className="text-sm text-slate-900">
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-slate-500">{order.statusSummary?.summary}</p>
                    </div>

                    {/* Payment */}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getPaymentBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                        {order.remainingAmount > 0 && (
                          <span className="text-xs text-slate-500">
                            {formatCurrency(order.remainingAmount, order.currency)} due
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Consultant */}
                    <div className="col-span-2">
                      {order.consultantName ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {order.consultantName}
                        </div>
                      ) : (
                        <span className="text-sm text-amber-600">Unassigned</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            order.source === ORDER_SOURCE.SHOPIFY ? "bg-green-100" : "bg-blue-100"
                          }`}
                        >
                          {order.source === ORDER_SOURCE.SHOPIFY ? (
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                          ) : (
                            <Store className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <Link to={`/orders/${order.id}`} className="font-medium text-slate-900">
                            {order.orderNumber}
                          </Link>
                          <p className="text-sm text-slate-500">{order.customerName}</p>
                        </div>
                      </div>
                      {order.urgent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                          {order.urgent}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(order.fwdDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.destination}
                      </span>
                      <span>{order.itemCount} items</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </span>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded ${getPaymentBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-slate-500">
                  Showing {(pagination.page - 1) * limit + 1} to{" "}
                  {Math.min(pagination.page * limit, pagination.total)} of {pagination.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
