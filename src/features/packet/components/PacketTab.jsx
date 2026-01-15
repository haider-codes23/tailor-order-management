/**
 * PacketTab.jsx
 * Main tab component for packet workflow in OrderItemDetailPage
 * Combines all packet sub-components based on status and user role
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package, Clock, History, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { usePacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { hasPermission } from "@/lib/rbac"
import { ORDER_ITEM_STATUS, PACKET_STATUS } from "@/constants/orderConstants"
import { format } from "date-fns"

import PacketStatusBadge from "./PacketStatusBadge"
import PacketAssignmentPanel from "./PacketAssignmentPanel"
import PacketPickList from "./PacketPickList"
import PacketCreatorActions from "./PacketCreatorActions"
import PacketCheckPanel from "./PacketCheckPanel"

export default function PacketTab({ orderItem }) {
  const { user } = useAuth()
  const { data: packetData, isLoading, isError, error } = usePacket(orderItem?.id)

  const packet = packetData?.data

  // Check permissions
  const canAssignPackets = hasPermission(user, "production.assign_tasks")
  const canApprovePackets = hasPermission(user, "production.approve_packets")
  const canWorkOnPackets =
    hasPermission(user, "fabrication.view") || hasPermission(user, "production.view")

  // Determine if current user is assigned to this packet
  const isAssignedToMe = packet?.assignedTo === user?.id || packet?.assignedTo === String(user?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // No packet exists yet (shouldn't happen if status is CREATE_PACKET or PACKET_CHECK)
  if (
    !packet &&
    (orderItem?.status === ORDER_ITEM_STATUS.CREATE_PACKET ||
      orderItem?.status === ORDER_ITEM_STATUS.PACKET_CHECK)
  ) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Packet not found. This may be a data inconsistency. Please run inventory check again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!packet) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No packet information available for this order item.</p>
            <p className="text-sm mt-1">Packet will be created when inventory check passes.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Packet Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Packet: {packet.id}
            </CardTitle>
            <PacketStatusBadge status={packet.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Items</span>
              <p className="font-medium">{packet.totalItems}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Picked</span>
              <p className="font-medium">
                {packet.pickedItems}/{packet.totalItems}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium">{format(new Date(packet.createdAt), "MMM d, h:mm a")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned To</span>
              <p className="font-medium">{packet.assignedToName || "Not assigned"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Alert (if packet was previously rejected) */}
      {packet.rejectionReason && packet.status === PACKET_STATUS.ASSIGNED && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Packet was rejected:</strong> {packet.rejectionReason}
            {packet.rejectionNotes && (
              <span className="block mt-1 text-sm">Notes: {packet.rejectionNotes}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment Panel - For Production Head when packet is pending */}
      {canAssignPackets && packet.status === PACKET_STATUS.PENDING && (
        <PacketAssignmentPanel packet={packet} orderItemId={orderItem.id} />
      )}

      {/* Show assignment info if already assigned */}
      {packet.status !== PACKET_STATUS.PENDING && packet.assignedTo && !canAssignPackets && (
        <PacketAssignmentPanel packet={packet} orderItemId={orderItem.id} />
      )}

      {/* Pick List - Always show when packet exists */}
      <PacketPickList
        packet={packet}
        canPick={isAssignedToMe && packet.status === PACKET_STATUS.IN_PROGRESS}
      />

      {/* Creator Actions - For assigned fabrication team member */}
      {canWorkOnPackets &&
        (packet.status === PACKET_STATUS.ASSIGNED ||
          packet.status === PACKET_STATUS.IN_PROGRESS) && <PacketCreatorActions packet={packet} />}

      {/* Check Panel - For Production Head when packet is completed */}
      {canApprovePackets && packet.status === PACKET_STATUS.COMPLETED && (
        <PacketCheckPanel packet={packet} orderItem={orderItem} />
      )}

      {/* Completion Info for approved packets */}
      {packet.status === PACKET_STATUS.APPROVED && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Packet Approved</p>
                <p className="text-sm text-green-700">
                  Approved by {packet.checkedByName} on{" "}
                  {format(new Date(packet.checkedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {packet.timeline && packet.timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Packet Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {packet.timeline
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div key={entry.id || index} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{entry.action}</p>
                      {entry.details && (
                        <p className="text-muted-foreground text-xs">{entry.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.user} • {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
