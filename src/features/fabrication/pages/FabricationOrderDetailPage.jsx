/**
 * FabricationOrderDetailPage
 * Shows order overview and list of custom size items needing BOM
 */

import { useParams, useNavigate } from "react-router-dom"
import { useFabricationOrder } from "@/hooks/useFabrication"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ORDER_ITEM_STATUS } from "@/constants/orderConstants"
import {
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Phone,
  Mail,
  Scissors,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react"

export default function FabricationOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const { data: orderData, isLoading, isError, error } = useFabricationOrder(orderId)

  const order = orderData?.data || orderData

  // const order = Array.isArray(orderData) ? orderData : (orderData?.data || [])

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getItemStatusBadge = (item) => {
    if (item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
      if (item.hasBOM) {
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            BOM Created - Pending Submit
          </Badge>
        )
      }
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Scissors className="h-3 w-3 mr-1" />
          BOM Required
        </Badge>
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
            <p className="text-red-800">Error loading order: {error?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Order not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/fabrication")} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Fabrication Queue
      </Button>

      {/* Order Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Scissors className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
                <p className="text-muted-foreground">Custom Size Order - Fabrication</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-purple-50 text-purple-700">
              FABRICATION
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{order.customerName}</p>
            </div>
            {order.customerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customerEmail}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customerPhone}</span>
              </div>
            )}
            {order.clientHeight && (
              <div>
                <span className="text-sm text-muted-foreground">Height</span>
                <p className="font-medium">{order.clientHeight}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Team & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Consultant</span>
              <p className="font-medium">{order.consultantName || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Production In-Charge</span>
              <p className="font-medium">{order.productionInCharge || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Production Ship Date</span>
              <p className="font-medium">{formatDate(order.productionShippingDate)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Order Date</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Custom Size Items ({order.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!order.items || order.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No custom size items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Scissors className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Size: {item.size}</Badge>
                      <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                    {/* Included items preview */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.includedItems?.slice(0, 3).map((inc, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-slate-100 rounded capitalize"
                        >
                          {inc.piece}
                        </span>
                      ))}
                      {item.selectedAddOns?.slice(0, 2).map((addon, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded capitalize"
                        >
                          +{addon.piece}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex flex-col items-end gap-3">
                    {getItemStatusBadge(item)}
                    <Button
                      onClick={() => navigate(`/fabrication/orders/${orderId}/items/${item.id}`)}
                      disabled={item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {item.hasBOM ? "Edit BOM" : "Create BOM"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
