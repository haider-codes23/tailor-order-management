/**
 * Sales Approval Dashboard Page - Phase 14 Redesign
 * src/features/sales/pages/SalesApprovalDashboardPage.jsx
 *
 * COMPLETE REWRITE — Now operates at ORDER level with 3 tabs:
 * Tab 1: Ready for Client — Orders with videos ready to send
 * Tab 2: Awaiting Response — Orders sent, awaiting client feedback
 * Tab 3: Payment Verification — Client approved, verifying payments
 *
 * Modals triggered from Tab 2:
 * - ClientApprovalModal (screenshot upload)
 * - RejectionOptionsModal → ReVideoRequestModal / AlterationRequestModal /
 *   StartFromScratchModal / CancellationConfirmModal
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Send,
  Clock,
  CreditCard,
  Search,
  Loader2,
  AlertCircle,
  Video,
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useApprovalQueue,
  useAwaitingResponse,
  useAwaitingPayment,
  useSalesStats,
  useSendOrderToClient,
  useMarkClientApproved,
  useApprovePayments,
} from "@/hooks/useSalesApproval"
import ClientApprovalModal from "../components/ClientApprovalModal"
import RejectionOptionsModal from "../components/RejectionOptionsModal"
import ReVideoRequestModal from "../components/ReVideoRequestModal"
import AlterationRequestModal from "../components/AlterationRequestModal"
import CancellationConfirmModal from "../components/CancellationConfirmModal"
import StartFromScratchModal from "../components/StartFromScratchModal"

export default function SalesApprovalDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("ready")
  const [searchQuery, setSearchQuery] = useState("")

  // ── Modal state ──────────────────────────────────────────────────────
  const [approvalModal, setApprovalModal] = useState({ open: false, order: null })
  const [rejectionModal, setRejectionModal] = useState({ open: false, order: null })
  const [reVideoModal, setReVideoModal] = useState({ open: false, order: null })
  const [alterationModal, setAlterationModal] = useState({ open: false, order: null })
  const [cancelModal, setCancelModal] = useState({ open: false, order: null })
  const [scratchModal, setScratchModal] = useState({ open: false, order: null })

  // ── Queries ──────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useSalesStats()
  const { data: readyOrders, isLoading: readyLoading, error: readyError } = useApprovalQueue()
  const {
    data: awaitingOrders,
    isLoading: awaitingLoading,
    error: awaitingError,
  } = useAwaitingResponse()
  const {
    data: paymentOrders,
    isLoading: paymentLoading,
    error: paymentError,
  } = useAwaitingPayment()

  // ── Mutations ────────────────────────────────────────────────────────
  const sendToClientMutation = useSendOrderToClient()
  const approvePaymentsMutation = useApprovePayments()

  // ── Search filter ────────────────────────────────────────────────────
  const filterOrders = (orders) => {
    if (!searchQuery.trim()) return orders || []
    const q = searchQuery.toLowerCase()
    return (orders || []).filter(
      (o) => o.orderNumber?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q)
    )
  }

  const filteredReady = filterOrders(readyOrders)
  const filteredAwaiting = filterOrders(awaitingOrders)
  const filteredPayment = filterOrders(paymentOrders)

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleSendToClient = (order) => {
    sendToClientMutation.mutate({ orderId: order.orderId, sentBy: user?.id })
  }

  const handleClientApproved = (order) => {
    setApprovalModal({ open: true, order })
  }

  const handleClientNotSatisfied = (order) => {
    setRejectionModal({ open: true, order })
  }

  // Rejection option handlers — close rejection modal, open sub-modal
  const handleRejectionOption = (option, order) => {
    setRejectionModal({ open: false, order: null })
    if (option === "revideo") setReVideoModal({ open: true, order })
    else if (option === "alteration") setAlterationModal({ open: true, order })
    else if (option === "scratch") setScratchModal({ open: true, order })
    else if (option === "cancel") setCancelModal({ open: true, order })
  }

  const handleApprovePayments = (order) => {
    approvePaymentsMutation.mutate({ orderId: order.orderId, approvedBy: user?.id })
  }

  // ── Render helpers ───────────────────────────────────────────────────
  const renderLoading = (color = "blue") => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className={`h-8 w-8 animate-spin text-${color}-600`} />
    </div>
  )

  const renderError = () => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">Failed to load data</p>
      </CardContent>
    </Card>
  )

  const renderEmpty = (Icon, message) => (
    <Card>
      <CardContent className="p-6 text-center">
        <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">{searchQuery ? "No orders match your search" : message}</p>
      </CardContent>
    </Card>
  )

  // ════════════════════════════════════════════════════════════════════════
  // TAB 1: Ready for Client — Order cards with video links
  // ════════════════════════════════════════════════════════════════════════
  const renderReadyCard = (order) => (
    <Card key={order.orderId} className="overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <div>
          <span className="font-semibold text-sm">{order.orderNumber}</span>
          <span className="text-gray-500 text-sm ml-2">• {order.customerName}</span>
        </div>
        <Badge className="bg-blue-100 text-blue-700">Ready</Badge>
      </div>

      <CardContent className="p-4">
        <div className="text-sm text-gray-600 mb-3">
          {order.items?.length || 0} Order Items • Total: PKR {order.totalAmount?.toLocaleString()}
        </div>

        {/* Order Items with Videos */}
        <div className="space-y-2 mb-4">
          {(order.items || []).map((item) => (
            <div key={item.id} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.productName}</span>
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Video className="h-3 w-3" /> Video Ready
                </span>
              </div>
              {item.videoData?.youtubeUrl && (
                <a
                  href={item.videoData.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline flex items-center gap-1 mt-1"
                >
                  {item.videoData.youtubeUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={() => handleSendToClient(order)}
          disabled={sendToClientMutation.isPending}
        >
          {sendToClientMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send to Client for Approval
        </Button>
      </CardContent>
    </Card>
  )

  // ════════════════════════════════════════════════════════════════════════
  // TAB 2: Awaiting Response — Sent to client, waiting for feedback
  // ════════════════════════════════════════════════════════════════════════
  const renderAwaitingCard = (order) => {
    const sentAt = order.clientApprovalData?.sentToClientAt
    const timeAgo = sentAt ? formatDistanceToNow(new Date(sentAt), { addSuffix: true }) : null

    return (
      <Card key={order.orderId} className="overflow-hidden border-2 border-amber-300 bg-amber-50">
        {/* Header */}
        <div className="bg-amber-100 px-4 py-3 flex justify-between items-center">
          <div>
            <span className="font-semibold text-sm">{order.orderNumber}</span>
            <span className="text-gray-500 text-sm ml-2">• {order.customerName}</span>
          </div>
          <Badge className="bg-amber-200 text-amber-800">Awaiting</Badge>
        </div>

        <CardContent className="p-4">
          {sentAt && (
            <div className="text-xs text-gray-500 mb-3">
              Sent: {format(new Date(sentAt), "MMM d, yyyy")} • {timeAgo}
            </div>
          )}

          {/* Video Links */}
          <div className="bg-white rounded p-3 mb-4 border">
            <div className="text-xs text-gray-500 mb-1">Videos sent to client:</div>
            {(order.items || []).map((item) => (
              <div key={item.id} className="text-sm">
                <span className="font-medium">{item.productName}: </span>
                {item.videoData?.youtubeUrl && (
                  <a
                    href={item.videoData.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs"
                  >
                    {item.videoData.youtubeUrl}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-xs text-gray-500 mb-2">Client Response:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleClientApproved(order)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Client Approved
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleClientNotSatisfied(order)}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Client Not Satisfied
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // TAB 3: Payment Verification — Verify payments & dispatch
  // ════════════════════════════════════════════════════════════════════════
  const renderPaymentCard = (order) => {
    const totalPaid = (order.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    const remaining = (order.totalAmount || 0) - totalPaid
    const canApprove = remaining <= 0

    return (
      <Card key={order.orderId} className="overflow-hidden border-2 border-purple-300 bg-purple-50">
        {/* Header */}
        <div className="bg-purple-100 px-4 py-3 flex justify-between items-center">
          <div>
            <span className="font-semibold text-sm">{order.orderNumber}</span>
            <span className="text-gray-500 text-sm ml-2">• {order.customerName}</span>
          </div>
          <Badge className="bg-purple-200 text-purple-800">Payment Pending</Badge>
        </div>

        <CardContent className="p-4">
          {/* Payment Summary */}
          <div className="bg-white rounded p-3 mb-3 border">
            <div className="flex justify-between text-sm mb-2">
              <span>Order Total:</span>
              <span className="font-bold">PKR {order.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Total Paid:</span>
              <span className={`font-bold ${canApprove ? "text-green-600" : "text-amber-600"}`}>
                PKR {totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className={`font-bold ${canApprove ? "text-green-600" : "text-red-600"}`}>
                PKR {remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {(order.payments || []).length > 0 && (
            <>
              <div className="text-xs text-gray-500 mb-2">Payment History:</div>
              <div className="space-y-2 mb-3">
                {order.payments.map((payment, idx) => (
                  <div
                    key={payment.id || idx}
                    className="bg-white rounded p-2 border flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm">PKR {payment.amount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {payment.createdAt
                          ? format(new Date(payment.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> View Receipt
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Approval Screenshots */}
          {order.clientApprovalData?.approvalScreenshots?.length > 0 && (
            <>
              <div className="text-xs text-gray-500 mb-2">Client Approval Proof:</div>
              <div className="bg-white rounded p-2 border mb-3">
                <div className="flex gap-2 flex-wrap">
                  {order.clientApprovalData.approvalScreenshots.map((ss, idx) => (
                    <div
                      key={ss.id || idx}
                      className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs border"
                      title={ss.name || `Screenshot ${idx + 1}`}
                    >
                      📷
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => handleApprovePayments(order)}
            disabled={!canApprove || approvePaymentsMutation.isPending}
          >
            {approvePaymentsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {canApprove
              ? "Payments Verified — Send to Dispatch"
              : `Outstanding: PKR ${remaining.toLocaleString()}`}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Approval Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage client approvals and requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <Send className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? "..." : stats?.readyToSend || 0}
            </div>
            <div className="text-xs text-blue-600">Ready to Send</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">
              {statsLoading ? "..." : stats?.awaitingResponse || 0}
            </div>
            <div className="text-xs text-amber-600">Awaiting Response</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-3 text-center">
            <CreditCard className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-700">
              {statsLoading ? "..." : stats?.awaitingPayment || 0}
            </div>
            <div className="text-xs text-purple-600">Payment Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="ready" className="text-xs">
            Ready for Client ({filteredReady.length})
          </TabsTrigger>
          <TabsTrigger value="awaiting" className="text-xs">
            Awaiting Response ({filteredAwaiting.length})
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs">
            Payment Verify ({filteredPayment.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ready for Client */}
        <TabsContent value="ready">
          {readyLoading ? (
            renderLoading("blue")
          ) : readyError ? (
            renderError()
          ) : filteredReady.length === 0 ? (
            renderEmpty(Send, "No orders ready to send")
          ) : (
            <div className="space-y-4">{filteredReady.map((order) => renderReadyCard(order))}</div>
          )}
        </TabsContent>

        {/* Tab 2: Awaiting Response */}
        <TabsContent value="awaiting">
          {awaitingLoading ? (
            renderLoading("amber")
          ) : awaitingError ? (
            renderError()
          ) : filteredAwaiting.length === 0 ? (
            renderEmpty(Clock, "No orders awaiting response")
          ) : (
            <div className="space-y-4">
              {filteredAwaiting.map((order) => renderAwaitingCard(order))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Payment Verification */}
        <TabsContent value="payment">
          {paymentLoading ? (
            renderLoading("purple")
          ) : paymentError ? (
            renderError()
          ) : filteredPayment.length === 0 ? (
            renderEmpty(CreditCard, "No orders pending payment verification")
          ) : (
            <div className="space-y-4">
              {filteredPayment.map((order) => renderPaymentCard(order))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ══ MODALS ══════════════════════════════════════════════════════ */}

      {/* Client Approved → Screenshot upload */}
      <ClientApprovalModal
        open={approvalModal.open}
        order={approvalModal.order}
        userId={user?.id}
        onClose={() => setApprovalModal({ open: false, order: null })}
      />

      {/* Client Not Satisfied → 4 options */}
      <RejectionOptionsModal
        open={rejectionModal.open}
        order={rejectionModal.order}
        onClose={() => setRejectionModal({ open: false, order: null })}
        onSelectOption={(option) => handleRejectionOption(option, rejectionModal.order)}
      />

      {/* Re-Video Request */}
      <ReVideoRequestModal
        open={reVideoModal.open}
        order={reVideoModal.order}
        userId={user?.id}
        onClose={() => setReVideoModal({ open: false, order: null })}
      />

      {/* Alteration Request */}
      <AlterationRequestModal
        open={alterationModal.open}
        order={alterationModal.order}
        userId={user?.id}
        onClose={() => setAlterationModal({ open: false, order: null })}
      />

      {/* Cancel Order */}
      <CancellationConfirmModal
        open={cancelModal.open}
        order={cancelModal.order}
        userId={user?.id}
        onClose={() => setCancelModal({ open: false, order: null })}
      />

      {/* Start from Scratch */}
      <StartFromScratchModal
        open={scratchModal.open}
        order={scratchModal.order}
        userId={user?.id}
        onClose={() => setScratchModal({ open: false, order: null })}
      />
    </div>
  )
}
