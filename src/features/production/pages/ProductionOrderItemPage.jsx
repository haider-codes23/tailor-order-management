/**
 * ProductionOrderItemPage.jsx
 * Detailed view for a production head to manage an order item
 * Shows sanitized order form, sections, and task management
 *
 * File: src/features/production/pages/ProductionOrderItemPage.jsx
 */

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Package,
  Calendar,
  Shirt,
  Ruler,
  User,
  Clock,
  CheckCircle,
  Factory,
  AlertCircle,
  ClipboardList,
  Send,
  Eye,
  PlayCircle,
  Image,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import {
  useProductionOrderItemDetails,
  useSectionTasks,
  useSendSectionToQA,
} from "@/hooks/useProduction"
// import { formatDate } from "@/lib/formatters"
import { formatDate } from "../../../utils/formatters"
import { SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import TaskCreationPanel from "../components/TaskCreationPanel"
import TaskTimelineView from "../components/TaskTimelineView"

export default function ProductionOrderItemPage() {
  const { orderItemId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("sections")
  const [selectedSection, setSelectedSection] = useState(null)
  const [showTaskCreation, setShowTaskCreation] = useState(false)

  // Fetch order item details
  const { data: orderItem, isLoading, error } = useProductionOrderItemDetails(orderItemId)

  // Send to QA mutation
  const sendToQAMutation = useSendSectionToQA()

  // Handle send to QA
  const handleSendToQA = async (sectionName) => {
    try {
      await sendToQAMutation.mutateAsync({
        orderItemId,
        section: sectionName,
      })
      toast.success(`${sectionName} sent to QA`, {
        description: "Quality check pending.",
      })
    } catch (error) {
      toast.error("Failed to send to QA", {
        description: error.message || "Please try again.",
      })
    }
  }

  // Handle create tasks click
  const handleCreateTasks = (sectionName) => {
    setSelectedSection(sectionName)
    setShowTaskCreation(true)
  }

  // Handle task creation success
  const handleTaskCreationSuccess = () => {
    setShowTaskCreation(false)
    setSelectedSection(null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !orderItem) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Order Item</h3>
              <p className="text-muted-foreground">{error?.message || "Order item not found"}</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/production")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/production")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{orderItem.productName}</h1>
            <p className="text-muted-foreground">{orderItem.orderNumber} • Production Management</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          FWD: {formatDate(orderItem.fwdDate)}
        </Badge>
      </div>

      {/* Task Creation Panel (Overlay) */}
      {showTaskCreation && selectedSection && (
        <TaskCreationPanel
          orderItemId={orderItemId}
          sectionName={selectedSection}
          onClose={() => setShowTaskCreation(false)}
          onSuccess={handleTaskCreationSuccess}
        />
      )}

      {/* Tabs */}
      {!showTaskCreation && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Sections & Tasks
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="mt-4 space-y-4">
            {/* Section Cards */}
            {orderItem.sections?.map((section) => (
              <SectionCard
                key={section.name}
                orderItemId={orderItemId}
                section={section}
                onCreateTasks={handleCreateTasks}
                onSendToQA={handleSendToQA}
                isSendingToQA={sendToQAMutation.isPending}
              />
            ))}
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <OrderDetailsCard orderItem={orderItem} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Section Card Component
function SectionCard({ orderItemId, section, onCreateTasks, onSendToQA, isSendingToQA }) {
  const [showTimeline, setShowTimeline] = useState(false)

  // Fetch tasks for this section
  const { data: tasksData, isLoading: isLoadingTasks } = useSectionTasks(orderItemId, section.name)

  const tasks = tasksData?.tasks || []
  const statusConfig = SECTION_STATUS_CONFIG[section.status] || {
    label: section.status,
    color: "bg-gray-100 text-gray-800",
  }

  const isReadyForTasks = section.status === "READY_FOR_PRODUCTION"
  const isInProduction = section.status === "IN_PRODUCTION"
  const isProductionCompleted = section.status === "PRODUCTION_COMPLETED"
  const isQARejected = section.status === "QA_REJECTED"
  const hasTasks = tasks.length > 0

  // Calculate progress
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length
  const totalTasks = tasks.length

  return (
    <Card
      className={`
      ${isReadyForTasks ? "border-amber-200" : ""}
      ${isInProduction ? "border-blue-200" : ""}
      ${isProductionCompleted ? "border-green-200" : ""}
      ${isQARejected ? "border-red-300 bg-red-50" : ""}
    `}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
              rounded-full p-2
              ${isReadyForTasks ? "bg-amber-100" : ""}
              ${isInProduction ? "bg-blue-100" : ""}
              ${isProductionCompleted ? "bg-green-100" : ""}
              ${isQARejected ? "bg-red-100" : ""}
              ${!isReadyForTasks && !isInProduction && !isProductionCompleted ? "bg-slate-100" : ""}
            `}
            >
              <Shirt
                className={`
                h-5 w-5
                ${isReadyForTasks ? "text-amber-600" : ""}
                ${isInProduction ? "text-blue-600" : ""}
                ${isProductionCompleted ? "text-green-600" : ""}
                ${isQARejected ? "text-red-600" : ""}
                ${!isReadyForTasks && !isInProduction && !isProductionCompleted ? "text-slate-600" : ""}
              `}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{section.name}</CardTitle>
              {hasTasks && (
                <p className="text-sm text-muted-foreground">
                  Tasks: {completedTasks}/{totalTasks} completed
                </p>
              )}
            </div>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar for sections with tasks */}
        {hasTasks && (
          <div className="mb-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* QA Rejection Info */}
        {isQARejected && (
          <div className="mb-4 p-3 bg-white border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-red-800">QA Rejection Details</span>
              {section.qaData?.currentRound > 1 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                  Round {section.qaData.currentRound}
                </span>
              )}
            </div>

            {section.qaRejectionReason && (
              <div className="text-sm text-red-700 bg-red-50 p-2 rounded mb-2">
                <strong>Reason:</strong> {section.qaRejectionReason}
              </div>
            )}

            {section.qaRejectionNotes && (
              <div className="text-sm text-gray-700 mb-2">
                <strong>Notes:</strong> {section.qaRejectionNotes}
              </div>
            )}

            {section.qaRejectedAt && (
              <div className="text-xs text-gray-500">
                Rejected by: {section.qaRejectedByName || "QA"} •{" "}
                {new Date(section.qaRejectedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Actions based on status */}
        <div className="flex flex-wrap gap-2">
          {/* Ready for tasks - show create tasks button */}
          {(isReadyForTasks || isQARejected) && !hasTasks && (
            <Button
              onClick={() => onCreateTasks(section.name)}
              className={isQARejected ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              {isQARejected ? "Create Rework Tasks" : "Create Tasks"}
              <ClipboardList className="h-4 w-4 mr-2" />
              Create Tasks
            </Button>
          )}

          {/* Has tasks - show view timeline button */}
          {hasTasks && (
            <Button variant="outline" onClick={() => setShowTimeline(!showTimeline)}>
              <Eye className="h-4 w-4 mr-2" />
              {showTimeline ? "Hide Timeline" : "View Timeline"}
            </Button>
          )}

          {/* Production completed - show send to QA button */}
          {isProductionCompleted && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onSendToQA(section.name)}
              disabled={isSendingToQA}
            >
              {isSendingToQA ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send to QA
            </Button>
          )}
        </div>

        {/* Timeline View */}
        {showTimeline && hasTasks && (
          <div className="mt-4">
            <TaskTimelineView tasks={tasks} sectionName={section.name} compact />
          </div>
        )}

        {/* Loading state for tasks */}
        {isLoadingTasks && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tasks...
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Order Details Card - Sanitized for Production (no personal customer info except name & height)
function OrderDetailsCard({ orderItem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Image */}
          {orderItem.productImage && (
            <div className="w-full h-48 rounded-lg bg-slate-100 overflow-hidden">
              <img
                src={orderItem.productImage}
                alt={orderItem.productName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <DetailRow label="Product" value={orderItem.productName} />
            <DetailRow label="SKU" value={orderItem.sku || "N/A"} />
            <DetailRow label="Customer Name" value={orderItem.customerName} />
            <DetailRow label="Height" value={orderItem.customerHeight || "N/A"} />
          </div>
        </CardContent>
      </Card>

      {/* Size & Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="h-5 w-5 text-indigo-600" />
            Size & Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow
            label="Size Type"
            value={orderItem.isCustomSize ? "Custom Measurements" : "Standard Size"}
          />
          {!orderItem.isCustomSize && (
            <DetailRow label="Standard Size" value={orderItem.standardSize || "N/A"} />
          )}

          {/* Custom measurements would go here */}
          {orderItem.isCustomSize && orderItem.measurements && (
            <div className="mt-2 p-3 rounded-lg bg-slate-50">
              <p className="text-sm font-medium mb-2">Custom Measurements:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(orderItem.measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{key}:</span>
                    <span className="font-medium">{value}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Style Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5 text-indigo-600" />
            Style Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Color" value={orderItem.color || "Original"} />
          <DetailRow label="Fabric" value={orderItem.fabric || "Original"} />
          <DetailRow label="Modesty" value={orderItem.modesty ? "Yes" : "No"} />

          {/* Style Sketch */}
          {orderItem.styleSketch && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Custom Style Sketch:</p>
              <div className="w-full h-32 rounded-lg bg-slate-100 overflow-hidden">
                <img
                  src={orderItem.styleSketch}
                  alt="Style Sketch"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What's Included & Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            What's Included & Add-ons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Included Sections */}
          <div>
            <p className="text-sm font-medium mb-2">Included:</p>
            <div className="flex flex-wrap gap-2">
              {orderItem.sections?.map((section) => (
                <Badge key={section.name} variant="secondary">
                  {section.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {orderItem.addons && orderItem.addons.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Selected Add-ons:</p>
              <div className="flex flex-wrap gap-2">
                {orderItem.addons.map((addon, index) => (
                  <Badge key={index} variant="outline" className="bg-indigo-50">
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dates & Notes */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Dates & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">FWD Date</p>
              <p className="font-medium">{formatDate(orderItem.fwdDate)}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Production Ship Date</p>
              <p className="font-medium">{formatDate(orderItem.productionShipDate) || "Not set"}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">Order Date</p>
              <p className="font-medium">{formatDate(orderItem.orderDate)}</p>
            </div>
          </div>

          {/* Notes */}
          {orderItem.notes && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-1">Special Instructions:</p>
              <p className="text-sm text-amber-700">{orderItem.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for detail rows
function DetailRow({ label, value }) {
  // Handle objects - convert to string or show "N/A"
  const displayValue =
    typeof value === "object" && value !== null ? JSON.stringify(value) : (value ?? "N/A")

  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-slate-900">{displayValue}</span>
    </div>
  )
}
