import { useState } from "react"
import { useNavigate } from "react-router-dom"

import {
  useProcurementDemands,
  useProcurementStats,
  useUpdateProcurementDemand,
} from "../../../hooks/useProcurement"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Package,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  ExternalLink,
  Filter,
} from "lucide-react"
import { toast } from "sonner"

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "bg-red-100 text-red-800", icon: AlertTriangle },
  ORDERED: { label: "Ordered", color: "bg-yellow-100 text-yellow-800", icon: ShoppingCart },
  RECEIVED: { label: "Received", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-800", icon: Clock },
}

export default function ProcurementDashboardPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDemand, setSelectedDemand] = useState(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [notes, setNotes] = useState("")

  const { data: demandsData, isLoading: demandsLoading } = useProcurementDemands(
    statusFilter !== "all" ? { status: statusFilter } : {}
  )
  const { data: statsData } = useProcurementStats()
  const updateDemand = useUpdateProcurementDemand()

  const demands = demandsData?.data || []
  const stats = statsData?.data || { total: 0, open: 0, ordered: 0, received: 0, cancelled: 0 }

  const handleUpdateStatus = async () => {
    if (!selectedDemand || !newStatus) return

    try {
      await updateDemand.mutateAsync({
        id: selectedDemand.id,
        data: { status: newStatus, notes },
      })
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
      setShowUpdateDialog(false)
      setSelectedDemand(null)
      setNewStatus("")
      setNotes("")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const openUpdateDialog = (demand, status) => {
    setSelectedDemand(demand)
    setNewStatus(status)
    setNotes(demand.notes || "")
    setShowUpdateDialog(true)
  }

  if (demandsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Procurement Dashboard</h1>
        <p className="text-muted-foreground">Manage material shortages and procurement demands</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-600">{stats.open}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ordered</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.ordered}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold text-green-600">{stats.received}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Procurement Demands
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="ORDERED">Ordered</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {demands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No procurement demands found</p>
              {statusFilter !== "all" && (
                <Button variant="link" onClick={() => setStatusFilter("all")} className="mt-2">
                  Clear filter
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Required</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Shortage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demands.map((demand) => {
                    const statusConfig = STATUS_CONFIG[demand.status] || STATUS_CONFIG.OPEN
                    return (
                      <TableRow key={demand.id}>
                        <TableCell className="font-medium">{demand.inventoryItemName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {demand.inventoryItemSku}
                        </TableCell>
                        <TableCell>
                          {demand.affectedSection ? (
                            <Badge variant="outline" className="capitalize">
                              {demand.affectedSection}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => navigate(`/orders/${demand.orderId}`)}
                          >
                            View Order
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          {demand.requiredQty} {demand.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {demand.availableQty} {demand.unit}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {demand.shortageQty} {demand.unit}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {demand.status === "OPEN" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUpdateDialog(demand, "ORDERED")}
                              >
                                Mark Ordered
                              </Button>
                            )}
                            {demand.status === "ORDERED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUpdateDialog(demand, "RECEIVED")}
                              >
                                Mark Received
                              </Button>
                            )}
                            {(demand.status === "OPEN" || demand.status === "ORDERED") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openUpdateDialog(demand, "CANCELLED")}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Procurement Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Material</p>
              <p className="font-medium">{selectedDemand?.inventoryItemName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Status</p>
              <Badge className={STATUS_CONFIG[newStatus]?.color || ""}>
                {STATUS_CONFIG[newStatus]?.label || newStatus}
              </Badge>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this update..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateDemand.isPending}>
              {updateDemand.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
