/**
 * PacketCreatorQueuePage.jsx
 * Shows packets assigned to the current user (fabrication team)
 * With date filtering support
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Package,
  Clock,
  Play,
  CheckCircle,
  Eye,
  Loader2,
  AlertCircle,
  Inbox,
  Filter,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react"
import { useMyPacketTasks, useStartPacket } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_STATUS, PACKET_STATUS_CONFIG } from "@/constants/orderConstants"
import { formatDistanceToNow, format } from "date-fns"
import PacketStatusBadge from "../components/PacketStatusBadge"

// Filter type options
const DATE_FILTER_TYPES = [
  { value: "created", label: "Packet Created Date" },
  { value: "fwd", label: "FWD Date" },
  { value: "productionShipping", label: "Production Shipping Date" },
]

export default function PacketCreatorQueuePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("assigned")
  
  // Date filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterType, setFilterType] = useState("created")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // Build date filters object for the hook
  const dateFilters = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    filterType: (dateFrom || dateTo) ? filterType : undefined,
  }
  
  const hasActiveFilters = dateFrom || dateTo

  const { data, isLoading, isError } = useMyPacketTasks(user?.id, null, dateFilters)
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

  const handleClearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setFilterType("created")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load packet tasks. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">My Packet Tasks</h1>
        <p className="text-muted-foreground">
          Packets assigned to you for material picking
        </p>
      </div>

      {/* Date Filter Section */}
      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-base font-medium">
                    Filter by Date
                  </CardTitle>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter Type */}
                <div className="space-y-2">
                  <Label htmlFor="filterType">Filter By</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filterType">
                      <SelectValue placeholder="Select date type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FILTER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>

                {/* Clear Button */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Active Filter Summary */}
              {hasActiveFilters && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Active filter:</span>{" "}
                    {DATE_FILTER_TYPES.find((t) => t.value === filterType)?.label}
                    {dateFrom && ` from ${format(new Date(dateFrom), "MMM d, yyyy")}`}
                    {dateTo && ` to ${format(new Date(dateTo), "MMM d, yyyy")}`}
                    {" · "}
                    <span className="font-medium">{packets.length}</span> packets found
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{meta.pending || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-lg font-bold">{meta.inProgress || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{meta.completed || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned" className="text-xs sm:text-sm">
            Assigned ({meta.pending || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
            In Progress ({meta.inProgress || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Completed ({meta.completed || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPackets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No packets found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {hasActiveFilters
                      ? "Try adjusting your date filters"
                      : `No ${activeTab} packets at the moment`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPackets.map((packet) => (
                <PacketCard
                  key={packet.id}
                  packet={packet}
                  onStart={() => handleStartPacket(packet)}
                  onView={() =>
                    navigate(`/orders/${packet.orderId}/items/${packet.orderItemId}?tab=packet`)
                  }
                  isStarting={startPacket.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Packet Card Component
function PacketCard({ packet, onStart, onView, isStarting }) {
  const canStart = packet.status === PACKET_STATUS.ASSIGNED
  const canView = packet.status !== PACKET_STATUS.PENDING

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">
                  {packet.orderItemDetails?.productName || "Unknown Product"}
                </span>
                <PacketStatusBadge status={packet.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {packet.orderItemDetails?.productSku} · Size:{" "}
                {packet.orderItemDetails?.size}
              </p>
            </div>
            {packet.packetRound > 1 && (
              <Badge variant="outline" className="shrink-0">
                Round {packet.packetRound}
              </Badge>
            )}
          </div>

          {/* Order Details Row */}
          {packet.orderDetails && (
            <div className="bg-muted/50 rounded-md p-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Order:</span>{" "}
                  <span className="font-medium">{packet.orderDetails.orderNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  <span className="font-medium">{packet.orderDetails.customerName}</span>
                </div>
                {packet.orderDetails.fwdDate && (
                  <div>
                    <span className="text-muted-foreground">FWD:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(packet.orderDetails.fwdDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {packet.orderDetails.productionShippingDate && (
                  <div>
                    <span className="text-muted-foreground">Ship Date:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(packet.orderDetails.productionShippingDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Assigned{" "}
              {packet.assignedAt
                ? formatDistanceToNow(new Date(packet.assignedAt), {
                    addSuffix: true,
                  })
                : "recently"}
            </span>
            {packet.startedAt && (
              <span>
                Started{" "}
                {formatDistanceToNow(new Date(packet.startedAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {canStart && (
              <Button
                size="sm"
                onClick={onStart}
                disabled={isStarting}
                className="flex-1"
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Picking
              </Button>
            )}
            {canView && (
              <Button
                size="sm"
                variant={canStart ? "outline" : "default"}
                onClick={onView}
                className={canStart ? "" : "flex-1"}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}