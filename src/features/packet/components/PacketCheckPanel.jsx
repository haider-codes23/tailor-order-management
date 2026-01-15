/**
 * PacketCheckPanel.jsx
 * Approve/Reject panel for Production Head
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Loader2, ClipboardCheck, AlertTriangle, Info } from "lucide-react"
import { useApprovePacket, useRejectPacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_STATUS, PACKET_REJECTION_REASONS } from "@/constants/orderConstants"
import { formatDistanceToNow } from "date-fns"

export default function PacketCheckPanel({ packet, orderItem }) {
  const { user } = useAuth()
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [rejectionReasonCode, setRejectionReasonCode] = useState("")
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [isReadyStock, setIsReadyStock] = useState(false)

  const approvePacket = useApprovePacket()
  const rejectPacket = useRejectPacket()

  if (!packet || packet.status !== PACKET_STATUS.COMPLETED) {
    return null
  }

  const selectedReason = PACKET_REJECTION_REASONS.find((r) => r.code === rejectionReasonCode)

  const handleApprove = async () => {
    await approvePacket.mutateAsync({
      orderItemId: packet.orderItemId,
      userId: user?.id,
      isReadyStock,
      notes: approvalNotes,
    })
    setShowApproveDialog(false)
    setApprovalNotes("")
    setIsReadyStock(false)
  }

  const handleReject = async () => {
    if (!rejectionReasonCode) return

    await rejectPacket.mutateAsync({
      orderItemId: packet.orderItemId,
      userId: user?.id,
      reasonCode: rejectionReasonCode,
      reason: selectedReason?.label || rejectionReasonCode,
      notes: rejectionNotes,
    })
    setShowRejectDialog(false)
    setRejectionReasonCode("")
    setRejectionNotes("")
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Packet Verification
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Completion info */}
          <div className="p-3 bg-cyan-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyan-800">Completed by</span>
              <span className="font-medium text-cyan-900">{packet.assignedToName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyan-800">Completed</span>
              <span className="text-sm text-cyan-900">
                {formatDistanceToNow(new Date(packet.completedAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyan-800">Items picked</span>
              <Badge className="bg-cyan-100 text-cyan-800">
                {packet.pickedItems}/{packet.totalItems}
              </Badge>
            </div>
          </div>

          {packet.notes && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Notes:</strong> {packet.notes}
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={approvePacket.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {approvePacket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={rejectPacket.isPending}
              variant="destructive"
              className="flex-1"
            >
              {rejectPacket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Packet
            </DialogTitle>
            <DialogDescription>
              Confirm that all materials have been gathered correctly and the packet is ready.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Ready stock toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="ready-stock">Ready Stock Item?</Label>
                <p className="text-xs text-muted-foreground">
                  Enable if this item doesn't need production (already made)
                </p>
              </div>
              <Switch id="ready-stock" checked={isReadyStock} onCheckedChange={setIsReadyStock} />
            </div>

            <Alert
              className={
                isReadyStock ? "border-violet-200 bg-violet-50" : "border-teal-200 bg-teal-50"
              }
            >
              <Info className={`h-4 w-4 ${isReadyStock ? "text-violet-600" : "text-teal-600"}`} />
              <AlertDescription className={isReadyStock ? "text-violet-800" : "text-teal-800"}>
                {isReadyStock
                  ? "Next step: Quality Assurance (QA will take photos/videos for client)"
                  : "Next step: Ready for Production (production team will start work)"}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Any notes about the verification..."
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
              {approvePacket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Packet
                </>
              )}
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
            <DialogDescription>
              The packet will be sent back to {packet.assignedToName} for correction.
            </DialogDescription>
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
                    <RadioGroupItem value={reason.code} id={reason.code} />
                    <Label htmlFor={reason.code} className="cursor-pointer flex-1">
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
                placeholder="Provide specific details about what needs to be fixed..."
                rows={3}
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
              {rejectPacket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Packet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
