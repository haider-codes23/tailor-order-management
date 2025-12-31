import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useOrder, useUpdateOrder, useAddPayment, useDeletePayment } from "@/hooks/useOrders"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  ORDER_ITEM_STATUS_CONFIG,
  ORDER_SOURCE,
  PAYMENT_STATUS,
  CURRENCIES,
  PAYMENT_METHODS,
  SIZE_TYPE,
} from "@/constants/orderConstants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  Calendar,
  MapPin,
  User,
  Phone,
  CreditCard,
  Truck,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  Package,
  Edit,
  Ruler,
} from "lucide-react"

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: order, isLoading, isError } = useOrder(id)
  const updateOrder = useUpdateOrder()
  const addPayment = useAddPayment()
  const deletePayment = useDeletePayment()

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentReceipt, setPaymentReceipt] = useState("")

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const getPaymentBadge = (status) => {
    const config = {
      PAID: "bg-green-100 text-green-700",
      EXTRA_PAID: "bg-blue-100 text-blue-700",
      PENDING: "bg-amber-100 text-amber-700",
    }
    return config[status] || "bg-slate-100 text-slate-700"
  }

  const getStatusBadge = (status) => {
    const config = ORDER_ITEM_STATUS_CONFIG[status]
    return config?.color || "bg-slate-100 text-slate-700"
  }

  const calculateDelayedDays = () => {
    if (!order?.actualShippingDate) return null

    // Use dispatch date if dispatched, otherwise use today
    const compareDate = order?.dispatchedAt ? new Date(order.dispatchedAt) : new Date()
    const promisedDate = new Date(order.actualShippingDate)

    // Reset time to midnight for accurate day comparison
    compareDate.setHours(0, 0, 0, 0)
    promisedDate.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((compareDate - promisedDate) / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Handle add payment
  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    addPayment.mutate(
      {
        orderId: id,
        data: {
          amount: parseFloat(paymentAmount),
          receiptUrl: paymentReceipt || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Payment added successfully")
          setPaymentModalOpen(false)
          setPaymentAmount("")
          setPaymentReceipt("")
        },
        onError: () => {
          toast.error("Failed to add payment")
        },
      }
    )
  }

  // Handle delete payment
  const handleDeletePayment = (paymentId) => {
    if (!confirm("Are you sure you want to delete this payment?")) return

    deletePayment.mutate(
      { orderId: id, paymentId },
      {
        onSuccess: () => toast.success("Payment deleted"),
        onError: () => toast.error("Failed to delete payment"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium text-slate-900">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  const delayedDays = calculateDelayedDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                order.source === ORDER_SOURCE.SHOPIFY ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {order.source === ORDER_SOURCE.SHOPIFY ? (
                <ShoppingBag className="h-5 w-5 text-green-600" />
              ) : (
                <Store className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
              <p className="text-sm text-slate-500">
                {order.source === ORDER_SOURCE.SHOPIFY ? "Shopify Order" : "Manual Order"}
              </p>
            </div>
            {order.urgent && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                {order.urgent}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({order.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Customer Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Height</p>
                  <p className="font-medium">{order.clientHeight || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Modesty Requirement</p>
                  <p className="font-medium">{order.modesty}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {order.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Full Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">FWD Date</p>
                  <p className="font-medium">{formatDate(order.fwdDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Production Ship Date</p>
                  <p className="font-medium">{formatDate(order.productionShippingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Actual Ship Date</p>
                  <p className="font-medium">{formatDate(order.actualShippingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Delayed Days</p>
                  <p
                    className={`font-medium ${
                      delayedDays > 0 ? "text-red-600" : delayedDays < 0 ? "text-green-600" : ""
                    }`}
                  >
                    {delayedDays !== null
                      ? delayedDays > 0
                        ? `+${delayedDays} days late`
                        : delayedDays < 0
                          ? `${delayedDays} days early`
                          : "On time"
                      : "—"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tracking ID</p>
                <p className="font-medium">{order.preTrackingId || "—"}</p>
              </div>
              {order.orderFormLink && (
                <div>
                  <p className="text-sm text-slate-500">Order Form Link</p>
                  <a
                    href={order.orderFormLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Form <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Team Assignment
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Consultant</p>
                  {order.consultantName ? (
                    <p className="font-medium">{order.consultantName}</p>
                  ) : (
                    <p className="text-amber-600">Unassigned</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Production Incharge</p>
                  {order.productionInchargeName ? (
                    <p className="font-medium">{order.productionInchargeName}</p>
                  ) : (
                    <p className="text-slate-400">Not assigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Notes</h3>
              <p className="text-slate-600">{order.notes || "No notes added."}</p>
            </div>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="bg-white rounded-lg border">
            {order.items?.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No items in this order</p>
              </div>
            ) : (
              <div className="divide-y">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-slate-400" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-slate-900">{item.productName}</h4>
                            <p className="text-sm text-slate-500">SKU: {item.productSku}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm text-slate-600">
                                Size: {item.size}
                                {item.sizeType === SIZE_TYPE.CUSTOM && (
                                  <span className="ml-1 text-amber-600">(Custom)</span>
                                )}
                              </span>
                              <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {ORDER_ITEM_STATUS_CONFIG[item.status]?.label || item.status}
                          </span>
                        </div>

                        {/* Form Status */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.orderFormGenerated ? (
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                              Form Generated
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                              Form Not Generated
                            </span>
                          )}
                          {item.orderFormGenerated &&
                            (item.orderFormApproved ? (
                              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                Customer Approved
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                                Awaiting Approval
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/orders/${id}/items/${item.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            {/* Payment Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(order.totalAmount, order.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Paid</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(
                    order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
                    order.currency
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Remaining</p>
                <p className="text-xl font-semibold text-amber-600">
                  {formatCurrency(order.remainingAmount, order.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded ${getPaymentBadge(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Payment Method & Currency */}
            <div className="flex gap-4 mb-6 text-sm">
              <div>
                <span className="text-slate-500">Currency:</span>{" "}
                <span className="font-medium">{order.currency}</span>
              </div>
              <div>
                <span className="text-slate-500">Method:</span>{" "}
                <span className="font-medium capitalize">
                  {order.paymentMethod?.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Payments List */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900">Payment History</h4>
                <Button size="sm" onClick={() => setPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </div>

              {order.payments?.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {order.payments?.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Payment #{index + 1}: {formatCurrency(payment.amount, order.currency)}
                          </p>
                          <p className="text-sm text-slate-500">{formatDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Receipt
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this order. Upload a receipt image if available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Amount ({order.currency})</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Receipt URL (optional)</Label>
              <Input
                placeholder="https://drive.google.com/..."
                value={paymentReceipt}
                onChange={(e) => setPaymentReceipt(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">
                Upload receipt to Google Drive and paste the link
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment} disabled={addPayment.isPending}>
              {addPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
