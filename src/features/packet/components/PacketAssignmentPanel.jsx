/**
 * PacketAssignmentPanel.jsx
 * Production Head assigns packet to Fabrication team member
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Loader2, CheckCircle, Clock, User } from "lucide-react"
import { useAssignPacket } from "@/hooks/usePacket"
import { useUsers } from "@/hooks/useUsers"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { USER_ROLES } from "@/mocks/data/mockUser"
import { PACKET_STATUS } from "@/constants/orderConstants"
import { formatDistanceToNow } from "date-fns"

export default function PacketAssignmentPanel({ packet, orderItemId }) {
  const { user } = useAuth()
  const [selectedUserId, setSelectedUserId] = useState("")
  const assignPacket = useAssignPacket()

  // Fetch fabrication team members
  const { data: usersData, isLoading: usersLoading } = useUsers()

  // Filter to get fabrication team members (they create packets)
  const fabricationTeam =
    usersData?.data?.filter(
      (u) =>
        u.is_active && (u.role === USER_ROLES.FABRICATION || u.role === USER_ROLES.PACKET_CREATOR)
    ) || []

  const handleAssign = async () => {
    if (!selectedUserId) return

    await assignPacket.mutateAsync({
      orderItemId,
      assignToUserId: selectedUserId,
      assignedByUserId: user?.id,
    })
    setSelectedUserId("")
  }

  // If packet is already assigned, show assignment info
  if (packet?.assignedTo && packet.status !== PACKET_STATUS.PENDING) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Packet Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{packet.assignedToName}</p>
                <p className="text-sm text-muted-foreground">
                  Assigned {formatDistanceToNow(new Date(packet.assignedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Assigned
            </Badge>
          </div>

          {packet.assignedByName && (
            <p className="text-xs text-muted-foreground mt-2">
              Assigned by: {packet.assignedByName}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Show assignment form for pending packets
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Packet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            This packet needs to be assigned to a fabrication team member who will gather the
            materials.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <label className="text-sm font-medium">Select Fabrication Team Member</label>

          <Select
            value={selectedUserId}
            onValueChange={setSelectedUserId}
            disabled={usersLoading || assignPacket.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder={usersLoading ? "Loading..." : "Select team member"} />
            </SelectTrigger>
            <SelectContent>
              {fabricationTeam.length === 0 ? (
                <SelectItem value="none" disabled>
                  No fabrication team members available
                </SelectItem>
              ) : (
                fabricationTeam.map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || assignPacket.isPending}
            className="w-full"
          >
            {assignPacket.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Packet Task
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
