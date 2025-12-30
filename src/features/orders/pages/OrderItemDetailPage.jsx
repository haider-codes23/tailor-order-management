import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useOrder, useOrderItem, useApproveOrderForm } from "@/hooks/useOrders"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ORDER_ITEM_STATUS_CONFIG, SIZE_TYPE, CUSTOMIZATION_TYPE } from "@/constants/orderConstants"
import { getMeasurementCategoryById } from "@/constants/measurementCategories"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  Ruler,
  Palette,
  Scissors,
  Shirt,
  User,
  Calendar,
} from "lucide-react"

export default function OrderItemDetailPage() {
  const { id: orderId, itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: order } = useOrder(orderId)
  const { data: item, isLoading, isError } = useOrderItem(itemId)
  const approveForm = useApproveOrderForm()

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    const config = ORDER_ITEM_STATUS_CONFIG[status]
    return config?.color || "bg-slate-100 text-slate-700"
  }

  const handleApproveForm = () => {
    if (!confirm("Mark this item as customer approved? This will move it to Inventory Check.")) {
      return
    }

    approveForm.mutate(
      { itemId, data: { approvedBy: user?.name } },
      {
        onSuccess: () => toast.success("Order form approved"),
        onError: () => toast.error("Failed to approve form"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium text-slate-900">Item not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`/orders/${orderId}`)}>
          Back to Order
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${orderId}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Order
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{item.productName}</h1>
            <p className="text-sm text-slate-500">
              {order?.orderNumber} • SKU: {item.productSku}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(item.status)}`}
        >
          {ORDER_ITEM_STATUS_CONFIG[item.status]?.label || item.status}
        </span>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="form">Order Form</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-16 w-16 text-slate-400" />
                )}
              </div>
              <h3 className="font-semibold text-lg">{item.productName}</h3>
              <p className="text-sm text-slate-500">SKU: {item.productSku}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Size</span>
                  <span className="font-medium">
                    {item.size}
                    {item.sizeType === SIZE_TYPE.CUSTOM && (
                      <span className="ml-1 text-amber-600">(Custom)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
              </div>
            </div>

            {/* Customizations */}
            <div className="lg:col-span-2 space-y-4">
              {/* Style */}
              <div className="bg-white rounded-lg border p-6">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Shirt className="h-4 w-4" />
                  Style
                </h4>
                {item.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                  <div className="space-y-2">
                    {item.style.details?.top && (
                      <div>
                        <span className="text-sm text-slate-500">Top: </span>
                        <span>{item.style.details.top}</span>
                      </div>
                    )}
                    {item.style.details?.bottom && (
                      <div>
                        <span className="text-sm text-slate-500">Bottom: </span>
                        <span>{item.style.details.bottom}</span>
                      </div>
                    )}
                    {item.style.details?.dupattaShawl && (
                      <div>
                        <span className="text-sm text-slate-500">Dupatta/Shawl: </span>
                        <span>{item.style.details.dupattaShawl}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">Original (no customization)</p>
                )}
              </div>

              {/* Color & Fabric */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border p-6">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4" />
                    Color
                  </h4>
                  {item.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                    <p>{item.color.details}</p>
                  ) : (
                    <p className="text-slate-500">Original</p>
                  )}
                </div>
                <div className="bg-white rounded-lg border p-6">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Scissors className="h-4 w-4" />
                    Fabric
                  </h4>
                  {item.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                    <p>{item.fabric.details}</p>
                  ) : (
                    <p className="text-slate-500">Original</p>
                  )}
                </div>
              </div>

              {/* Custom Measurements */}
              {item.sizeType === SIZE_TYPE.CUSTOM && item.measurementCategories?.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Ruler className="h-4 w-4" />
                    Custom Measurements (inches)
                  </h4>
                  {item.measurementCategories.map((catId) => {
                    const category = getMeasurementCategoryById(catId)
                    if (!category) return null
                    return (
                      <div key={catId} className="mb-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">{category.name}</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {category.groups.map((group) =>
                            group.measurements.map((m) => {
                              const value = item.measurements?.[m.id]
                              if (!value) return null
                              return (
                                <div key={m.id} className="text-sm">
                                  <span className="text-slate-500">{m.label}: </span>
                                  <span className="font-medium">{value}"</span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Order Form Tab */}
        <TabsContent value="form" className="space-y-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-lg">Order Form Status</h3>
                <p className="text-sm text-slate-500">
                  Generate and manage the customer confirmation form
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Form Generated Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                {item.orderFormGenerated ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {item.orderFormGenerated ? "Form Generated" : "Form Not Generated"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.orderFormGenerated
                      ? "The order form has been created and can be sent to customer"
                      : "Generate the order form to send to customer for approval"}
                  </p>
                </div>
                {!item.orderFormGenerated && (
                  <Button
                    onClick={() => navigate(`/orders/${orderId}/items/${itemId}/generate-form`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Form
                  </Button>
                )}
              </div>

              {/* Customer Approval Status */}
              {item.orderFormGenerated && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50">
                  {item.orderFormApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.orderFormApproved ? "Customer Approved" : "Awaiting Customer Approval"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.orderFormApproved
                        ? "Customer has approved the order details"
                        : "Waiting for customer to confirm the order form"}
                    </p>
                  </div>
                  {!item.orderFormApproved && (
                    <Button onClick={handleApproveForm} disabled={approveForm.isPending}>
                      {approveForm.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Mark Approved
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-6">Activity Timeline</h3>
            {item.timeline?.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No activity recorded</p>
            ) : (
              <div className="space-y-4">
                {item.timeline?.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      {index < item.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-slate-900">{entry.action}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{entry.user}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
