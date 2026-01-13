/**
 * FabricationItemDetailPage
 * Main work page for Fabrication team - view order form and create custom BOM
 */

import { useParams, useNavigate } from "react-router-dom"
import { useFabricationItem } from "@/hooks/useFabrication"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ORDER_ITEM_STATUS } from "@/constants/orderConstants"
import OrderFormViewFabrication from "../components/OrderFormViewFabrication"
import CustomBOMEditor from "../components/CustomBOMEditor"
import { ArrowLeft, Loader2, Scissors, CheckCircle, AlertCircle } from "lucide-react"

export default function FabricationItemDetailPage() {
  const { orderId, itemId } = useParams()
  const navigate = useNavigate()

  const { data: fabricationData, isLoading, isError, error } = useFabricationItem(orderId, itemId)

  // Handle both wrapped {success, data} and unwrapped response formats
  const rawData = fabricationData?.data || fabricationData
  const order = rawData?.order
  const item = rawData?.item

  // Handle BOM submitted - navigate back to order detail
  const handleBOMSubmitted = () => {
    navigate(`/fabrication/orders/${orderId}`)
  }

  // Get status badge
  const getStatusBadge = () => {
    if (!item) return null

    if (item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
      if (item.customBOM && item.customBOM.items?.length > 0) {
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">BOM In Progress</Badge>
        )
      }
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">BOM Required</Badge>
      )
    }

    if (item.status === ORDER_ITEM_STATUS.INVENTORY_CHECK) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          BOM Submitted
        </Badge>
      )
    }

    return <Badge variant="secondary">{item.status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">Error loading item: {error?.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order || !item) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Order item not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if item can be edited (only in FABRICATION_BESPOKE status)
  const canEdit = item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/fabrication/orders/${orderId}`)}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Order
      </Button>

      {/* Page Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Product Image */}
              {item.productImage && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{item.productName}</h1>
                <p className="text-muted-foreground">
                  {order.orderNumber} • SKU: {item.productSku}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">Size: {item.size}</Badge>
                  <Badge variant="outline">Qty: {item.quantity}</Badge>
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      {!canEdit && item.status === ORDER_ITEM_STATUS.INVENTORY_CHECK && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Custom BOM Submitted</h3>
                <p className="text-sm text-green-700 mt-1">
                  The custom BOM has been submitted and this order item has moved to Inventory
                  Check. The BOM can no longer be edited.
                </p>
                {item.customBOM?.submittedAt && (
                  <p className="text-sm text-green-600 mt-2">
                    Submitted by {item.customBOM.submittedBy} on{" "}
                    {new Date(item.customBOM.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Order Form View */}
      <OrderFormViewFabrication order={order} item={item} />

      <Separator className="my-8" />

      {/* Custom BOM Editor */}
      <CustomBOMEditor item={item} onBOMSubmitted={handleBOMSubmitted} />
    </div>
  )
}
