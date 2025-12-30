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

  const { data: order, isLoading: orderLoading } = useOrder(orderId)
  const { data: itemData, isLoading: itemLoading } = useOrderItem(itemId)
  const approveForm = useApproveOrderForm()

  const item = itemData?.data
  
  // Fetch product details to get the image
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
  const productImage = product?.image || item.productImage || item.product?.image

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
              {order?.data?.orderNumber} • SKU: {product?.sku || "N/A"}
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
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p>No image available</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg">{item.productName || product?.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {product?.sku || "N/A"}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Size</span>
                    <span className="font-medium">{item.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Size Type</span>
                    <span className="font-medium">
                      {item.sizeType === SIZE_TYPE.STANDARD ? "Standard" : "Custom"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customization Details */}
            <div className="space-y-4">
              {/* Style */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Style
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                    <div className="space-y-2">
                      <Badge variant="outline">Customized</Badge>
                      {item.style.details && (
                        <div className="text-sm">
                          <p className="font-medium">Details:</p>
                          <p className="text-muted-foreground">{item.style.details}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Original (no customization)</p>
                  )}
                </CardContent>
              </Card>

              {/* Color */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                    <div className="space-y-2">
                      <Badge variant="outline">Customized</Badge>
                      {item.color.details && (
                        <p className="text-sm text-muted-foreground">{item.color.details}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Original</p>
                  )}
                </CardContent>
              </Card>

              {/* Fabric */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Fabric
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
                    <div className="space-y-2">
                      <Badge variant="outline">Customized</Badge>
                      {item.fabric.details && (
                        <p className="text-sm text-muted-foreground">{item.fabric.details}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Original</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Order Form Tab */}
        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Form Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.orderForm ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>Form generated on {new Date(item.orderForm.generatedAt).toLocaleDateString()}</span>
                  </div>

                  {item.status === ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL && canApprove && (
                    <Button onClick={handleApprove} disabled={approveForm.isPending}>
                      {approveForm.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Customer Approved
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    <span>Form not yet generated</span>
                  </div>

                  {canManageForms && (
                    <Button
                      onClick={() =>
                        navigate(`/orders/${orderId}/items/${itemId}/form`)
                      }
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Order Form
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Show measurements if form exists */}
          {item.orderForm?.measurements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Measurements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(item.orderForm.measurements).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium">{value}"</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {item.timeline && item.timeline.length > 0 ? (
                <div className="space-y-4">
                  {item.timeline.map((entry, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{entry.action}</p>
                        {entry.details && (
                          <p className="text-sm text-muted-foreground">{entry.details}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.timestamp).toLocaleString()} by {entry.userName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No activity recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}