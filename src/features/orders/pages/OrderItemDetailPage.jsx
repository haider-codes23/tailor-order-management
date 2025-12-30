import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useOrder, useOrderItem, useApproveOrderForm } from "@/hooks/useOrders"
import { useProduct } from "@/hooks/useProducts"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  ORDER_ITEM_STATUS,
  ORDER_ITEM_STATUS_CONFIG,
  SIZE_TYPE,
  CUSTOMIZATION_TYPE,
} from "@/constants/orderConstants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  Package,
  Loader2,
  Palette,
  Scissors,
  Ruler,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { hasPermission } from "@/lib/rbac"

export default function OrderItemDetailPage() {
  const { id: orderId, itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("details")

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId)
  const { data: itemData, isLoading: itemLoading } = useOrderItem(itemId)
  const approveForm = useApproveOrderForm()

  const order = orderData?.data
  const item = itemData?.data

  // Fetch product details to get the image - only when item is loaded
  const { data: productData } = useProduct(item?.productId, {
    enabled: !!item?.productId,
  })
  const product = productData?.data

  const canManageForms = hasPermission(user, "orders.manage_customer_forms")
  const canApprove = hasPermission(user, "orders.approve_customer_forms")

  const handleApprove = async () => {
    try {
      await approveForm.mutateAsync(itemId)
      toast.success("Order form approved")
    } catch (error) {
      toast.error("Failed to approve form")
    }
  }

  if (orderLoading || itemLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-6">
        <p>Order item not found</p>
        <Button variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
          Back to Order
        </Button>
      </div>
    )
  }

  const statusConfig = ORDER_ITEM_STATUS_CONFIG[item.status] || {
    label: item.status,
    color: "bg-gray-100 text-gray-800",
  }

  // Get product image - check multiple sources
  const productImage = product?.image || product?.primary_image || product?.image_url || 
                       item.productImage || item.product?.image

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{item.productName || product?.name}</h1>
            <p className="text-muted-foreground">
              {order?.orderNumber} • SKU: {product?.sku || item.productSku || "N/A"}
            </p>
          </div>
        </div>
        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="form">Order Form</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Image Card */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={item.productName || product?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="h-16 w-16 mb-2" />
                      <span>No image available</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size Type</p>
                    <p className="font-medium">
                      {item.sizeType === SIZE_TYPE.STANDARD ? "Standard" : "Custom"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{item.size || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customizations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Customizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Style */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Scissors className="h-4 w-4" />
                    Style
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.style?.type === CUSTOMIZATION_TYPE.ORIGINAL
                      ? "Original style"
                      : item.style?.details || "Custom style"}
                  </p>
                </div>

                {/* Color */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.color?.type === CUSTOMIZATION_TYPE.ORIGINAL
                      ? "Original color"
                      : item.color?.details || "Custom color"}
                  </p>
                </div>

                {/* Fabric */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4" />
                    Fabric
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.fabric?.type === CUSTOMIZATION_TYPE.ORIGINAL
                      ? "Original fabric"
                      : item.fabric?.details || "Custom fabric"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements (for custom items) */}
          {item.sizeType === SIZE_TYPE.CUSTOM && item.measurements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Custom Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(item.measurements).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-medium">{value}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Order Form Tab */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.orderFormGenerated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      Form generated on{" "}
                      {new Date(item.orderForm?.generatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.status === ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL &&
                    canApprove && (
                      <Button onClick={handleApprove} disabled={approveForm.isPending}>
                        {approveForm.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Form
                          </>
                        )}
                      </Button>
                    )}

                  {item.orderFormApproved && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Customer approved</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-5 w-5" />
                    <span>Order form not yet generated</span>
                  </div>

                  {canManageForms && (
                    <Button
                      onClick={() =>
                        navigate(`/orders/${orderId}/items/${itemId}/form`)
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Order Form
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.timeline && item.timeline.length > 0 ? (
                <div className="space-y-4">
                  {item.timeline.map((entry, index) => (
                    <div
                      key={entry.id || index}
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.user} •{" "}
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}