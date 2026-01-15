/**
 * PacketCheckQueuePage.jsx
 * Shows packets awaiting verification by Production Head
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  ClipboardCheck,
  Package,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Inbox,
  User,
  Clock,
  Info,
} from "lucide-react"
import { usePacketCheckQueue, useApprovePacket, useRejectPacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_REJECTION_REASONS } from "@/constants/orderConstants"
import { formatDistanceToNow } from "date-fns"

export default function PacketCheckQueuePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data, isLoading, isError } = usePacketCheckQueue()
  const approvePacket = useApprovePacket()
  const rejectPacket = useRejectPacket()

  // Modal states
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isReadyStock, setIsReadyStock] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReasonCode, setRejectionReasonCode] = useState("")
  const [rejectionNotes, setRejectionNotes] = useState("")

  const packets = data?.data || []
  const selectedReason = PACKET_REJECTION_REASONS.find((r) => r.code === rejectionReasonCode)

  const handleApproveClick = (packet) => {
    setSelectedPacket(packet)
    setShowApproveDialog(true)
  }

  const handleRejectClick = (packet) => {
    setSelectedPacket(packet)
    setShowRejectDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedPacket) return

    await approvePacket.mutateAsync({
      orderItemId: selectedPacket.orderItemId,
      userId: user?.id,
      isReadyStock,
      notes: approvalNotes,
    })

    setShowApproveDialog(false)
    setSelectedPacket(null)
    setApprovalNotes("")
    setIsReadyStock(false)
  }

  const handleReject = async () => {
    if (!selectedPacket || !rejectionReasonCode) return

    await rejectPacket.mutateAsync({
      orderItemId: selectedPacket.orderItemId,
      userId: user?.id,
      reasonCode: rejectionReasonCode,
      reason: selectedReason?.label || rejectionReasonCode,
      notes: rejectionNotes,
    })

    setShowRejectDialog(false)
    setSelectedPacket(null)
    setRejectionReasonCode("")
    setRejectionNotes("")
  }

  const handleViewPacket = (packet) => {
    const orderId = packet.orderId || packet.orderItemDetails?.orderId
    const itemId = packet.orderItemId
    navigate(`/orders/${orderId}/items/${itemId}?tab=packet`)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Packets Awaiting Verification
          </h1>
          <p className="text-muted-foreground">Review and approve completed packets</p>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">
          {packets.length} pending
        </Badge>
      </div>

      {/* Packets Grid */}
      {packets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-500">No packets awaiting verification</p>
              <p className="text-sm text-muted-foreground mt-1">
                Completed packets will appear here for review
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {packets.map((packet) => (
            <Card key={packet.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{packet.id}</CardTitle>
                    {packet.orderItemDetails && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {packet.orderItemDetails.productName} • Size {packet.orderItemDetails.size}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-800">Awaiting Check</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Product image if available */}
                {packet.orderItemDetails?.productImage && (
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={packet.orderItemDetails.productImage}
                      alt={packet.orderItemDetails.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed by</p>
                      <p className="font-medium">{packet.assignedToName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(packet.completedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="font-medium">
                        {packet.pickedItems}/{packet.totalItems} picked
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Order</p>
                      <p className="font-medium">
                        {packet.orderId || packet.orderItemDetails?.orderId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes if any */}
                {packet.notes && (
                  <div className="p-2 bg-slate-50 rounded text-sm">
                    <span className="text-muted-foreground">Notes: </span>
                    {packet.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveClick(packet)}
                    disabled={approvePacket.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleRejectClick(packet)}
                    disabled={rejectPacket.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => handleViewPacket(packet)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Packet
            </DialogTitle>
            <DialogDescription>
              Confirm that all materials have been gathered correctly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="ready-stock">Ready Stock Item?</Label>
                <p className="text-xs text-muted-foreground">
                  Enable if this doesn't need production
                </p>
              </div>
              <Switch id="ready-stock" checked={isReadyStock} onCheckedChange={setIsReadyStock} />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Any notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approvePacket.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvePacket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Packet
            </DialogTitle>
            <DialogDescription>This packet will be sent back for correction.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Rejection Reason *</Label>
              <RadioGroup
                value={rejectionReasonCode}
                onValueChange={setRejectionReasonCode}
                className="space-y-2"
              >
                {PACKET_REJECTION_REASONS.map((reason) => (
                  <div
                    key={reason.code}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${
                      rejectionReasonCode === reason.code ? "border-red-300 bg-red-50" : ""
                    }`}
                    onClick={() => setRejectionReasonCode(reason.code)}
                  >
                    <RadioGroupItem value={reason.code} id={`quick-${reason.code}`} />
                    <Label
                      htmlFor={`quick-${reason.code}`}
                      className="cursor-pointer flex-1 text-sm"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Specific details..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectionReasonCode || rejectPacket.isPending}
              variant="destructive"
            >
              {rejectPacket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
