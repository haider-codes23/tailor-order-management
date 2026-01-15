/**
 * PacketCreatorActions.jsx
 * Start/Complete buttons for Fabrication team
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, CheckCircle, Loader2, Package, AlertCircle, Clock } from "lucide-react"
import { useStartPacket, useCompletePacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_STATUS } from "@/constants/orderConstants"
import { formatDistanceToNow } from "date-fns"
import PacketStatusBadge from "./PacketStatusBadge"

export default function PacketCreatorActions({ packet }) {
  const { user } = useAuth()
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")

  const startPacket = useStartPacket()
  const completePacket = useCompletePacket()

  if (!packet) return null

  const isAssignedToMe = packet.assignedTo === user?.id || packet.assignedTo === String(user?.id)
  const canStart = packet.status === PACKET_STATUS.ASSIGNED && isAssignedToMe
  const canComplete = packet.status === PACKET_STATUS.IN_PROGRESS && isAssignedToMe
  const allItemsPicked = packet.pickedItems === packet.totalItems && packet.totalItems > 0

  const handleStart = async () => {
    await startPacket.mutateAsync({
      orderItemId: packet.orderItemId,
      userId: user?.id,
    })
  }

  const handleComplete = async () => {
    await completePacket.mutateAsync({
      orderItemId: packet.orderItemId,
      userId: user?.id,
      notes: completionNotes,
    })
    setShowCompleteDialog(false)
    setCompletionNotes("")
  }

  // Not assigned to current user
  if (!isAssignedToMe && packet.assignedTo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This packet is assigned to <strong>{packet.assignedToName}</strong>. Only the assigned
              user can work on this packet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packet Actions
            </CardTitle>
            <PacketStatusBadge status={packet.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status info */}
          {packet.status === PACKET_STATUS.ASSIGNED && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This packet was assigned to you{" "}
                {formatDistanceToNow(new Date(packet.assignedAt), { addSuffix: true })}. Click
                "Start Packet" when you're ready to begin gathering materials.
              </AlertDescription>
            </Alert>
          )}

          {packet.status === PACKET_STATUS.IN_PROGRESS && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress:</span>
                <Badge variant="outline">
                  {packet.pickedItems}/{packet.totalItems} items picked
                </Badge>
              </div>

              {!allItemsPicked && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Pick all items from the pick list before marking complete.
                  </AlertDescription>
                </Alert>
              )}

              {allItemsPicked && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All items picked! You can now mark the packet as complete.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {packet.status === PACKET_STATUS.COMPLETED && (
            <Alert className="border-cyan-200 bg-cyan-50">
              <CheckCircle className="h-4 w-4 text-cyan-600" />
              <AlertDescription className="text-cyan-800">
                Packet completed! Awaiting verification from Production Head.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {canStart && (
              <Button onClick={handleStart} disabled={startPacket.isPending} className="flex-1">
                {startPacket.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Packet
                  </>
                )}
              </Button>
            )}

            {canComplete && (
              <Button
                onClick={() => setShowCompleteDialog(true)}
                disabled={!allItemsPicked || completePacket.isPending}
                className="flex-1"
                variant={allItemsPicked ? "default" : "secondary"}
              >
                {completePacket.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Packet</DialogTitle>
            <DialogDescription>
              Confirm that all materials have been gathered and the packet is ready for
              verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">All items picked</span>
              <Badge className="bg-green-100 text-green-800">
                {packet.totalItems}/{packet.totalItems}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Any notes about the materials or issues encountered..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete} disabled={completePacket.isPending}>
              {completePacket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Packet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
