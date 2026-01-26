/**
 * ProductionAdminDashboard.jsx - COMPLETE FIXED FILE
 * Admin view for production - shows order items ready for production head assignment
 *
 * File: src/features/production/components/ProductionAdminDashboard.jsx
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Factory,
  UserPlus,
  RefreshCw,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Package,
  Calendar,
  ArrowRight,
  Shirt,
  CircleDot,
} from "lucide-react"
import { toast } from "sonner"
import {
  useReadyForAssignment,
  useRoundRobinState,
  useAssignProductionHead,
} from "@/hooks/useProduction"
import { formatDate } from "../../../utils/formatters"

export default function ProductionAdminDashboard() {
  const navigate = useNavigate()

  // Fetch order items ready for production head assignment
  // IMPORTANT: This returns { items: [...], nextProductionHead: {...} }
  const { data: readyData, isLoading: isLoadingReady, error: readyError } = useReadyForAssignment()

  // Extract items array from the response, default to empty array
  const readyItems = readyData?.items || []

  console.log("ProductionAdminDashboard - readyData:", readyData)
  console.log("ProductionAdminDashboard - readyItems:", readyItems)

  // Fetch round robin state to show next production head
  const { data: roundRobinState, isLoading: isLoadingRoundRobin } = useRoundRobinState()

  // Assignment mutation
  const assignMutation = useAssignProductionHead()

  // Handle assign production head - THIS IS THE CRITICAL FUNCTION
  const handleAssignProductionHead = async (orderItemId, orderNumber, productName) => {
    // DEBUG: Log what we received
    console.log("=== handleAssignProductionHead CALLED ===")
    console.log("orderItemId:", orderItemId, "type:", typeof orderItemId)
    console.log("orderNumber:", orderNumber)
    console.log("productName:", productName)

    // GUARD: Check if orderItemId is valid
    if (!orderItemId || orderItemId === "undefined" || orderItemId === undefined) {
      console.error("ERROR: orderItemId is invalid:", orderItemId)
      toast.error("Cannot assign production head", {
        description: "Order item ID is missing. Please refresh and try again.",
      })
      return
    }

    try {
      console.log("Calling assignMutation.mutateAsync with:", orderItemId)
      await assignMutation.mutateAsync(orderItemId)
      console.log("Assignment successful!")
      toast.success(`Production head assigned to ${productName} (${orderNumber})`, {
        description: "The production head can now manage this order item.",
      })
    } catch (error) {
      console.error("Assignment failed:", error)
      toast.error("Failed to assign production head", {
        description: error.message || "Please try again.",
      })
    }
  }

  // Loading state
  if (isLoadingReady || isLoadingRoundRobin) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Error state
  if (readyError) {
    return (
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-muted-foreground">{readyError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get next production head from either source
  const nextProductionHead = readyData?.nextProductionHead || roundRobinState?.nextProductionHead

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />

      {/* Round Robin Status Card */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-2">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Round Robin Assignment</p>
                <p className="text-xs text-slate-500">
                  Next in rotation:{" "}
                  <span className="font-semibold text-indigo-600">
                    {nextProductionHead?.name || "Loading..."}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Active Production Heads</p>
              <p className="text-2xl font-bold text-indigo-600">
                {roundRobinState?.totalProductionHeads || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Awaiting Assignment"
          value={readyItems.length}
          icon={UserPlus}
          color="amber"
          description="Order items need production head"
        />
        <StatsCard
          title="In Production"
          value={roundRobinState?.stats?.inProduction || 0}
          icon={Factory}
          color="blue"
          description="Currently being worked on"
        />
        <StatsCard
          title="Completed Today"
          value={roundRobinState?.stats?.completedToday || 0}
          icon={CheckCircle}
          color="green"
          description="Production completed"
        />
      </div>

      {/* Ready for Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-600" />
            Order Items Ready for Production Head Assignment
          </CardTitle>
          <CardDescription>
            Click "Assign Production Head" to automatically assign using round-robin rotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readyItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No order items are currently waiting for production head assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {readyItems.map((item, index) => (
                <OrderItemAssignmentCard
                  key={item.id || item.orderItemId || index}
                  item={item}
                  nextProductionHead={nextProductionHead}
                  onAssign={handleAssignProductionHead}
                  isAssigning={assignMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Header Component
function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-indigo-100 p-2">
        <Factory className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Production Management</h1>
        <p className="text-muted-foreground">Assign production heads and monitor workflow</p>
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color, description }) {
  const colorClasses = {
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-3 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Order Item Assignment Card Component
function OrderItemAssignmentCard({ item, nextProductionHead, onAssign, isAssigning }) {
  // Get the order item ID - support both 'id' and 'orderItemId' field names
  const orderItemId = item.id || item.orderItemId

  // Get sections that are ready for production
  const readySections =
    item.readySections ||
    item.sections?.filter(
      (s) => s.status === "READY_FOR_PRODUCTION" || s.status === "DYEING_COMPLETED"
    ) ||
    []

  // Debug log
  console.log("OrderItemAssignmentCard render - item:", item)
  console.log("OrderItemAssignmentCard render - extracted orderItemId:", orderItemId)

  // Handle button click with explicit logging
  const handleClick = () => {
    console.log("=== BUTTON CLICKED ===")
    console.log("item object:", item)
    console.log("item.id:", item.id)
    console.log("item.orderItemId:", item.orderItemId)
    console.log("Using orderItemId:", orderItemId)
    console.log("item.orderNumber:", item.orderNumber)
    console.log("item.productName:", item.productName)

    // Call the onAssign function
    onAssign(orderItemId, item.orderNumber, item.productName)
  }

  return (
    <Card className="border-amber-200 hover:border-amber-300 transition-colors">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Order Item Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-slate-400" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">{item.productName}</h3>
                <Badge variant="outline" className="text-xs">
                  {item.orderNumber}
                </Badge>
                {/* Debug: Show the ID */}
                <Badge variant="outline" className="text-xs bg-gray-100">
                  ID: {orderItemId || "MISSING!"}
                </Badge>
              </div>

              <p className="text-sm text-slate-500 mb-2">Customer: {item.customerName || "N/A"}</p>

              {/* Sections Ready */}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(readySections) &&
                  readySections.map((section, index) => {
                    const sectionName = typeof section === "string" ? section : section.name
                    return (
                      <Badge
                        key={sectionName || index}
                        variant="secondary"
                        className="text-xs bg-amber-100 text-amber-700"
                      >
                        <Shirt className="h-3 w-3 mr-1" />
                        {sectionName}
                      </Badge>
                    )
                  })}
                {item.totalSections > readySections.length && (
                  <Badge variant="outline" className="text-xs text-slate-500">
                    +{item.totalSections - readySections.length} more sections pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* FWD Date & Assignment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* FWD Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">FWD Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(item.fwdDate) || "Not set"}
                </p>
              </div>
            </div>

            {/* Assign Button */}
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleClick}
                disabled={isAssigning || !orderItemId}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isAssigning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Assign Production Head
              </Button>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CircleDot className="h-3 w-3 text-indigo-500" />
                Will assign: {nextProductionHead?.name || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
