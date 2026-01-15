/**
 * PacketCreatorQueuePage.jsx
 * Shows packets assigned to the current user (fabrication team)
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, Play, CheckCircle, Eye, Loader2, AlertCircle, Inbox } from "lucide-react"
import { useMyPacketTasks, useStartPacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_STATUS, PACKET_STATUS_CONFIG } from "@/constants/orderConstants"
import { formatDistanceToNow, format } from "date-fns"
import PacketStatusBadge from "../components/PacketStatusBadge"

export default function PacketCreatorQueuePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("assigned")

  const { data, isLoading, isError } = useMyPacketTasks(user?.id)
  const startPacket = useStartPacket()

  const packets = data?.data || []
  const meta = data?.meta || {}

  // Filter packets by tab
  const filteredPackets = packets.filter((packet) => {
    switch (activeTab) {
      case "assigned":
        return packet.status === PACKET_STATUS.ASSIGNED
      case "in-progress":
        return packet.status === PACKET_STATUS.IN_PROGRESS
      case "completed":
        return packet.status === PACKET_STATUS.COMPLETED || packet.status === PACKET_STATUS.APPROVED
      default:
        return true
    }
  })

  const handleStartPacket = async (packet) => {
    await startPacket.mutateAsync({
      orderItemId: packet.orderItemId,
      userId: user?.id,
    })
  }

  const handleViewPacket = (packet) => {
    // Navigate to order item detail page with packet tab
    const orderId = packet.orderId
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
          <h1 className="text-2xl font-bold">My Packet Tasks</h1>
          <p className="text-muted-foreground">Packets assigned to you for material gathering</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-base px-3 py-1">
            {packets.length} total
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Pending Start</p>
                <p className="text-2xl font-bold text-blue-700">{meta.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">In Progress</p>
                <p className="text-2xl font-bold text-amber-700">{meta.inProgress || 0}</p>
              </div>
              <Package className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{meta.completed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packets List */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="assigned" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({meta.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="gap-2">
                <Package className="h-4 w-4" />
                In Progress ({meta.inProgress || 0})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({meta.completed || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pt-6">
          {filteredPackets.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-muted-foreground">No packets in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPackets.map((packet) => (
                <div
                  key={packet.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Packet Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{packet.id}</h3>
                        <PacketStatusBadge status={packet.status} />
                      </div>

                      {packet.orderItemDetails && (
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {packet.orderItemDetails.productName}
                            </span>{" "}
                            • Size {packet.orderItemDetails.size}
                          </p>
                          <p className="text-muted-foreground">Order: {packet.orderId}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {packet.totalItems} items
                        </span>
                        {packet.status === PACKET_STATUS.IN_PROGRESS && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {packet.pickedItems}/{packet.totalItems} picked
                          </span>
                        )}
                        <span>
                          Assigned{" "}
                          {formatDistanceToNow(new Date(packet.assignedAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Rejection warning */}
                      {packet.rejectionReason && packet.status === PACKET_STATUS.ASSIGNED && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          <strong>Rejected:</strong> {packet.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {packet.status === PACKET_STATUS.ASSIGNED && (
                        <Button
                          size="sm"
                          onClick={() => handleStartPacket(packet)}
                          disabled={startPacket.isPending}
                        >
                          {startPacket.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      )}

                      <Button size="sm" variant="outline" onClick={() => handleViewPacket(packet)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
