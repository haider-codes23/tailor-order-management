/**
 * OrderFormViewFabrication
 * Read-only view of order form for Fabrication team
 * Shows: Order info, Client info, Team info, Product info, What's included,
 *        Customizations, Measurements, Design sketch
 * Does NOT show: Payment info, Shipping details
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CUSTOMIZATION_TYPE } from "@/constants/orderConstants"
import { getMeasurementCategoryById } from "@/constants/measurementCategories"
import { FileText, User, Users, Package, Palette, Ruler, Image as ImageIcon } from "lucide-react"

export default function OrderFormViewFabrication({ order, item }) {
  // Early return if order or item is not available
  if (!order || !item) {
    return (
      <div className="p-4 text-center text-muted-foreground">Order form data not available</div>
    )
  }
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get customization type label
  const getCustomizationLabel = (type) => {
    switch (type) {
      case CUSTOMIZATION_TYPE.ORIGINAL:
        return "Original"
      case CUSTOMIZATION_TYPE.CUSTOMIZED:
        return "Customized"
      default:
        return type
    }
  }

  // Get measurement category name
  const getCategoryName = (categoryId) => {
    const category = getMeasurementCategoryById(categoryId)
    return category?.name || categoryId
  }

  // Group measurements by category
  // Group measurements by category
  const groupedMeasurements = {}
  if (item.measurementCategories && item.measurements) {
    item.measurementCategories.forEach((categoryId) => {
      const category = getMeasurementCategoryById(categoryId)
      if (category && category.groups) {
        groupedMeasurements[categoryId] = {
          name: category.name,
          measurements: {},
        }

        // Flatten all measurements from all groups
        const allMeasurements = category.groups.flatMap((g) => g.measurements || [])

        // Get measurements for this category - check both prefixed and non-prefixed keys
        allMeasurements.forEach((m) => {
          // Try prefixed key first (e.g., "kaftan_shoulder"), then non-prefixed (e.g., "shoulder")
          const prefixedKey = `${categoryId}_${m.id}`
          const value = item.measurements[prefixedKey] ?? item.measurements[m.id]

          if (value !== undefined && value !== "") {
            groupedMeasurements[categoryId].measurements[m.id] = {
              label: m.label,
              value: value,
              unit: m.unit,
            }
          }
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-200">
        <FileText className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-bold text-slate-900">Customer Order Form</h2>
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Order Number</span>
              <p className="font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Order Date</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Production Ship Date</span>
              <p className="font-medium">{formatDate(order.productionShippingDate)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-purple-100 text-purple-800">{item.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Height</span>
              <p className="font-medium">{order.clientHeight || "Not specified"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Modesty Requirement</span>
              <p className="font-medium">
                {item.orderForm?.modestyRequirement || order.notes?.includes("modest")
                  ? "Yes"
                  : "Standard"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Consultant</span>
              <p className="font-medium">{order.consultantName || "—"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Production In-Charge</span>
              <p className="font-medium">{order.productionInCharge || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {item.productImage && (
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Product Name</span>
                <p className="font-medium">{item.productName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">SKU</span>
                <p className="font-medium">{item.productSku}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Size Type</span>
                <Badge variant="outline">{item.sizeType}</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Quantity</span>
                <p className="font-medium">{item.quantity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Included Items */}
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Included Items</span>
              <div className="flex flex-wrap gap-2">
                {item.includedItems?.map((inc, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 capitalize"
                  >
                    {inc.piece}
                    {inc.price && (
                      <span className="ml-1 text-green-600">PKR {inc.price.toLocaleString()}</span>
                    )}
                  </Badge>
                ))}
                {(!item.includedItems || item.includedItems.length === 0) && (
                  <span className="text-sm text-muted-foreground">None specified</span>
                )}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Selected Add-ons</span>
              <div className="flex flex-wrap gap-2">
                {item.selectedAddOns?.map((addon, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 capitalize"
                  >
                    {addon.piece}
                    {addon.price && (
                      <span className="ml-1 text-amber-600">
                        +PKR {addon.price.toLocaleString()}
                      </span>
                    )}
                  </Badge>
                ))}
                {(!item.selectedAddOns || item.selectedAddOns.length === 0) && (
                  <span className="text-sm text-muted-foreground">None selected</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customizations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Customizations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Style:</span>
              <Badge
                variant={
                  item.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "default" : "secondary"
                }
              >
                {getCustomizationLabel(item.style?.type)}
              </Badge>
            </div>
            {item.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && item.style?.details && (
              <div className="pl-4 space-y-1 text-sm">
                {item.style.details.top && (
                  <p>
                    <span className="text-muted-foreground">Top:</span> {item.style.details.top}
                  </p>
                )}
                {item.style.details.bottom && (
                  <p>
                    <span className="text-muted-foreground">Bottom:</span>{" "}
                    {item.style.details.bottom}
                  </p>
                )}
                {item.style.details.dupattaShawl && (
                  <p>
                    <span className="text-muted-foreground">Dupatta/Shawl:</span>{" "}
                    {item.style.details.dupattaShawl}
                  </p>
                )}
              </div>
            )}
            {item.style?.image && (
              <div className="mt-2">
                <img
                  src={item.style.image}
                  alt="Style reference"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Color */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Color:</span>
              <Badge
                variant={
                  item.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "default" : "secondary"
                }
              >
                {getCustomizationLabel(item.color?.type)}
              </Badge>
            </div>
            {item.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && item.color?.details && (
              <p className="pl-4 text-sm">{item.color.details}</p>
            )}
            {item.color?.image && (
              <div className="mt-2">
                <img
                  src={item.color.image}
                  alt="Color reference"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Fabric */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Fabric:</span>
              <Badge
                variant={
                  item.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "default" : "secondary"
                }
              >
                {getCustomizationLabel(item.fabric?.type)}
              </Badge>
            </div>
            {item.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && item.fabric?.details && (
              <p className="pl-4 text-sm">{item.fabric.details}</p>
            )}
            {item.fabric?.image && (
              <div className="mt-2">
                <img
                  src={item.fabric.image}
                  alt="Fabric reference"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Measurements - CRITICAL FOR BOM */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-purple-900">
            <Ruler className="h-4 w-4" />
            📏 MEASUREMENTS (Critical for BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedMeasurements).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedMeasurements).map(([categoryId, categoryData]) => (
                <div key={categoryId}>
                  <h4 className="font-semibold text-purple-900 mb-3 capitalize">
                    {categoryData.name} Measurements
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(categoryData.measurements).map(([measurementId, m]) => (
                      <div
                        key={measurementId}
                        className="bg-white rounded-lg p-3 border border-purple-100"
                      >
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <p className="font-semibold text-purple-900">
                          {m.value} {m.unit || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : item.measurements && Object.keys(item.measurements).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(item.measurements).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-purple-100">
                  <span className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <p className="font-semibold text-purple-900">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No measurements recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Design Sketch */}
      {(item.orderForm?.sketchImage || item.orderForm?.designSketch) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Design Sketch / Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={item.orderForm?.sketchImage || item.orderForm?.designSketch}
                alt="Design sketch"
                className="max-w-md rounded-lg border"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
