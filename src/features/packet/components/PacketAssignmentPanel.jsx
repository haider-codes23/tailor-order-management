/**
 * PacketAssignmentPanel.jsx
 * Production Head assigns packet to Fabrication team member
 * Updated to handle partial packet rounds with auto-reassign option
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
import { UserPlus, Loader2, CheckCircle, Clock, User, RefreshCw } from "lucide-react"
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

  // Handle auto-reassign to previous fabrication user
  const handleAutoReassign = async () => {
    const previousUserId = packet.previousAssignee?.assignedTo || packet.assignedTo
    if (!previousUserId) return

    await assignPacket.mutateAsync({
      orderItemId,
      assignToUserId: previousUserId,
      assignedByUserId: user?.id,
    })
  }

  // Check if this is a subsequent round with a previous assignee
  const isSubsequentRound = packet?.packetRound > 1
  const hasPreviousAssignee = packet?.previousAssignee?.assignedTo || packet?.assignedTo
  const previousAssigneeName = packet?.previousAssignee?.assignedToName || packet?.assignedToName

  // If packet is already assigned and NOT pending, show assignment info
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
          {isSubsequentRound
            ? `Assign Remaining Materials (Round ${packet.packetRound})`
            : "Assign Packet"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Round 2+ Info Banner */}
        {isSubsequentRound && (
          <Alert className="border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Round {packet.packetRound}:</strong> New materials added for{" "}
              <strong>{packet.currentRoundSections?.join(", ") || "remaining sections"}</strong>.
              {hasPreviousAssignee && (
                <span className="block mt-1">
                  Previously worked on by: <strong>{previousAssigneeName}</strong>
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Reassign Button for Round 2+ */}
        {isSubsequentRound && hasPreviousAssignee && (
          <Button
            onClick={handleAutoReassign}
            disabled={assignPacket.isPending}
            variant="outline"
            className="w-full border-green-300 bg-green-50 hover:bg-green-100 text-green-800"
          >
            {assignPacket.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reassign to {previousAssigneeName}
              </>
            )}
          </Button>
        )}

        {isSubsequentRound && hasPreviousAssignee && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or assign to someone else</span>
            </div>
          </div>
        )}

        {!isSubsequentRound && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This packet needs to be assigned to a fabrication team member who will gather the
              materials.
            </AlertDescription>
          </Alert>
        )}

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
                      {isSubsequentRound && 
                        String(member.id) === String(packet.previousAssignee?.assignedTo || packet.assignedTo) && (
                        <Badge className="bg-green-100 text-green-800 text-xs">Previous</Badge>
                      )}
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
                Assign Task
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
