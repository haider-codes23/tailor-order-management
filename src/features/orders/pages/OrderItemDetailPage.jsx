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
  SECTION_STATUS,
  SECTION_STATUS_CONFIG,
} from "@/constants/orderConstants"
import PacketTab from "@/features/packet/components/PacketTab"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Eye,
  Edit,
  History,
  AlertCircle,
  Image as ImageIcon,
  ClipboardCheck,
  Layers,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { hasPermission } from "@/lib/rbac"
import CustomBOMViewModal from "../components/CustomBOMViewModal"
import {
  useRunInventoryCheck,
  useRerunSectionInventoryCheck,
  useProcurementDemands,
} from "../../../hooks/useProcurement"

/**
 * SectionInventoryResults Component
 * Displays inventory check results grouped by section (included items/add-ons)
 * with pass/fail indicators, procurement status, and re-run capability
 */
function SectionInventoryResults({
  sectionStatuses,
  orderItemId,
  procurementDemands = [],
  onRerunCheck,
}) {
  if (!sectionStatuses || Object.keys(sectionStatuses).length === 0) {
    return null
  }

  // Group procurement demands by section
  const demandsBySection = {}
  procurementDemands.forEach((pd) => {
    const section = pd.affectedSection?.toLowerCase() || "unknown"
    if (!demandsBySection[section]) demandsBySection[section] = []
    demandsBySection[section].push(pd)
  })

  // Check if any section in AWAITING_MATERIAL has all demands fulfilled
  // Also include PENDING_INVENTORY_CHECK sections (after dyeing rejection - inventory was released)
  const sectionsReadyForRecheck = []
  Object.entries(sectionStatuses).forEach(([sectionName, sectionData]) => {
    if (sectionData.status === SECTION_STATUS.AWAITING_MATERIAL) {
      const sectionDemands = demandsBySection[sectionName.toLowerCase()] || []
      const allFulfilled =
        sectionDemands.length > 0 &&
        sectionDemands.every((pd) => pd.status === "RECEIVED" || pd.status === "CANCELLED")
      if (allFulfilled) {
        sectionsReadyForRecheck.push(sectionName)
      }
    } else if (sectionData.status === SECTION_STATUS.PENDING_INVENTORY_CHECK) {
      // Sections rejected from dyeing go back to PENDING_INVENTORY_CHECK
      // They can be re-checked immediately since inventory was released
      sectionsReadyForRecheck.push(sectionName)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Inventory Check by Section
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(sectionStatuses).map(([sectionName, sectionData]) => {
          const statusConfig = SECTION_STATUS_CONFIG[sectionData.status] || {}
          const isAwaiting = sectionData.status === SECTION_STATUS.AWAITING_MATERIAL
          const sectionDemands = demandsBySection[sectionName.toLowerCase()] || []
          const allDemandsFulfilled =
            sectionDemands.length > 0 &&
            sectionDemands.every((pd) => pd.status === "RECEIVED" || pd.status === "CANCELLED")
          const passed =
            sectionData.status === SECTION_STATUS.INVENTORY_PASSED ||
            sectionData.status === SECTION_STATUS.CREATE_PACKET ||
            sectionData.status === SECTION_STATUS.PACKET_CREATED ||
            sectionData.status === SECTION_STATUS.PACKET_VERIFIED

          return (
            <div key={sectionName} className="border rounded-lg p-4">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium capitalize flex items-center gap-2">
                  {sectionName}
                  {passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </h4>
                <Badge className={statusConfig.color || "bg-gray-100 text-gray-800"}>
                  {statusConfig.label || sectionData.status}
                </Badge>
              </div>

              {/* ============================================================ */}
              {/* Dyeing Rejection Banner - Shows when section was rejected */}
              {/* ============================================================ */}
              {sectionData.dyeingRejectedAt && (
                <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">
                        Previously Rejected from Dyeing (Round {sectionData.dyeingRound || 1})
                      </p>
                      <p className="text-sm text-red-800 mt-1">
                        <span className="font-medium">Reason:</span>{" "}
                        {sectionData.dyeingRejectionReason || "Not specified"}
                      </p>
                      {sectionData.dyeingRejectionNotes && (
                        <p className="text-sm text-red-700 mt-1">
                          <span className="font-medium">Notes:</span>{" "}
                          {sectionData.dyeingRejectionNotes}
                        </p>
                      )}
                      <p className="text-xs text-red-600 mt-2">
                        Rejected by {sectionData.dyeingRejectedByName || "Unknown"} on{" "}
                        {new Date(sectionData.dyeingRejectedAt).toLocaleString()}
                      </p>
                      {sectionData.previousFabricationUserName && (
                        <p className="text-xs text-amber-700 mt-1">
                          ⚡ Auto-assigned to: {sectionData.previousFabricationUserName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Procurement Status Banner for AWAITING_MATERIAL sections */}
              {isAwaiting && sectionDemands.length > 0 && (
                <div
                  className={`mb-3 p-3 rounded-lg ${
                    allDemandsFulfilled
                      ? "bg-green-50 border border-green-200"
                      : "bg-amber-50 border border-amber-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {allDemandsFulfilled ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          allDemandsFulfilled ? "text-green-800" : "text-amber-800"
                        }`}
                      >
                        {allDemandsFulfilled
                          ? "All procurement demands fulfilled!"
                          : `${sectionDemands.filter((d) => d.status !== "RECEIVED").length} demand(s) pending`}
                      </span>
                    </div>
                    {allDemandsFulfilled && (
                      <Badge className="bg-green-100 text-green-800">Ready for Recheck</Badge>
                    )}
                  </div>
                  {/* Show demand details */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {sectionDemands.map((pd) => (
                      <div key={pd.id} className="flex items-center gap-2">
                        <span>{pd.inventoryItemName}:</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            pd.status === "RECEIVED"
                              ? "bg-green-50 text-green-700"
                              : pd.status === "ORDERED"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {pd.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials Table */}
              {sectionData.inventoryCheckResult?.materials &&
                sectionData.inventoryCheckResult.materials.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="text-left py-1 pr-2">Material</th>
                          <th className="text-right py-1 px-2">Required</th>
                          <th className="text-right py-1 px-2">Available</th>
                          <th className="text-right py-1 pl-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionData.inventoryCheckResult.materials.map((mat, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-1.5 pr-2">
                              <span className="font-medium">{mat.inventoryItemName}</span>
                              {mat.inventoryItemSku && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({mat.inventoryItemSku})
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              {mat.requiredQty} {mat.unit}
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              {mat.availableQty} {mat.unit}
                            </td>
                            <td className="py-1.5 pl-2 text-right">
                              {mat.status === "SUFFICIENT" ? (
                                <span className="inline-flex items-center text-green-600">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-600 gap-1">
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span className="text-xs">-{mat.shortageQty}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )
        })}

        {/* Re-run Inventory Check Button */}
        {sectionsReadyForRecheck.length > 0 && onRerunCheck && (
          <div className="pt-4 border-t">
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Ready for Inventory Check</AlertTitle>
              <AlertDescription className="text-green-700">
                Sections ready for inventory recheck:{" "}
                <strong>{sectionsReadyForRecheck.join(", ")}</strong>
              </AlertDescription>
            </Alert>
            <Button onClick={onRerunCheck} className="w-full">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Run Inventory Check for {sectionsReadyForRecheck.join(", ")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function OrderItemDetailPage() {
  const { id: orderId, itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("details")
  const [showFormPreview, setShowFormPreview] = useState(false)
  const [showCustomBOMModal, setShowCustomBOMModal] = useState(false)

  const [showInventoryResults, setShowInventoryResults] = useState(false)
  const [inventoryResults, setInventoryResults] = useState(null)

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId)
  const { data: itemData, isLoading: itemLoading } = useOrderItem(itemId)
  const approveForm = useApproveOrderForm()
  const runInventoryCheck = useRunInventoryCheck()
  const { data: procurementDemandsData } = useProcurementDemands({ orderItemId: itemId })
  const procurementDemands = procurementDemandsData?.data || []

  // Re-run section inventory check
  const rerunSectionCheck = useRerunSectionInventoryCheck()

  const order = orderData
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

  const handleRunInventoryCheck = async () => {
    try {
      const response = await runInventoryCheck.mutateAsync({
        orderItemId: itemId,
        data: { checkedBy: user?.name || "System" },
      })

      const result = response?.data || response
      setInventoryResults(result)
      setShowInventoryResults(true)

      if (result.shortages && result.shortages.length > 0) {
        toast.warning(`Found ${result.shortages.length} material shortage(s)`)
      } else {
        toast.success("All materials available! Ready for production.")
      }
    } catch (error) {
      toast.error("Failed to run inventory check")
      console.error("Inventory check error:", error)
    }
  }

  const handleRerunSectionInventoryCheck = async () => {
    try {
      const response = await rerunSectionCheck.mutateAsync({
        orderItemId: itemId,
        data: { checkedBy: user?.name || "System" },
      })

      const result = response?.data || response
      if (result.passedSections?.length > 0) {
        toast.success(`Inventory check passed for: ${result.passedSections.join(", ")}`)
      }
    } catch (error) {
      toast.error("Failed to re-run section inventory check")
      console.error("Rerun section inventory check error:", error)
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
  const productImage =
    product?.image ||
    product?.primary_image ||
    product?.image_url ||
    item.productImage ||
    item.product?.image

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${orderId}`)}>
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
          {/* Packet Tab - only show for relevant statuses (including PARTIAL and DYEING) */}
          {(item?.status === ORDER_ITEM_STATUS.CREATE_PACKET ||
            item?.status === ORDER_ITEM_STATUS.PARTIAL_CREATE_PACKET ||
            item?.status === ORDER_ITEM_STATUS.PACKET_CHECK ||
            item?.status === ORDER_ITEM_STATUS.PARTIAL_PACKET_CHECK ||
            item?.status === ORDER_ITEM_STATUS.QUALITY_ASSURANCE ||
            item?.status === ORDER_ITEM_STATUS.READY_FOR_DYEING ||
            item?.status === ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING ||
            item?.status === ORDER_ITEM_STATUS.IN_DYEING ||
            item?.status === ORDER_ITEM_STATUS.DYEING_COMPLETED ||
            item?.status === ORDER_ITEM_STATUS.READY_FOR_PRODUCTION ||
            item?.status === ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION ||
            item?.status === ORDER_ITEM_STATUS.IN_PRODUCTION) && (
            <TabsTrigger value="packet">Packet</TabsTrigger>
          )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Included Items */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Included Items</p>
                {item.includedItems && item.includedItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.includedItems.map((included, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-full capitalize flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {included.piece}
                        {included.price > 0 && (
                          <span className="text-green-600 text-xs ml-1">
                            PKR {included.price.toLocaleString()}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No included items specified</p>
                )}
              </div>

              {/* Selected Add-ons */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Selected Add-ons</p>
                {item.selectedAddOns && item.selectedAddOns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.selectedAddOns.map((addon, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm rounded-full capitalize flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {addon.piece}
                        {addon.price > 0 ? (
                          <span className="text-amber-600 text-xs ml-1">
                            +PKR {addon.price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs ml-1">(Included)</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No add-ons selected</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status-Specific Messages */}
          {item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Scissors className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Fabrication in Progress</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      This order item has been forwarded to the Fabrication (Bespoke) department for
                      custom BOM creation.
                    </p>
                    <p className="text-sm text-purple-600 mt-2">
                      Custom measurements are being used to calculate the required materials for
                      production. Status will update to "Inventory Check" once the custom BOM has
                      been created.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show success message when custom BOM was created (item is custom AND in INVENTORY_CHECK) */}
          {item.sizeType === SIZE_TYPE.CUSTOM &&
            item.status === ORDER_ITEM_STATUS.INVENTORY_CHECK &&
            item.customBOM && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">
                        Custom BOM Created Successfully
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        The Fabrication department has created the custom BOM for this order item.
                        Material requirements are now ready to be checked.
                      </p>
                      <div className="text-sm text-green-600 mt-2">
                        <span>Created by: {item.customBOM.createdBy}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(item.customBOM.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowCustomBOMModal(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Custom BOM
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Inventory Check section - show for items in INVENTORY_CHECK status */}
          {item.status === ORDER_ITEM_STATUS.INVENTORY_CHECK && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Inventory Check</h3>
                      <p className="text-sm text-muted-foreground">
                        Verify material availability for production
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleRunInventoryCheck} disabled={runInventoryCheck.isPending}>
                    {runInventoryCheck.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Run Inventory Check
                      </>
                    )}
                  </Button>
                </div>

                {/* Show last check results if available */}
                {item.lastInventoryCheck && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(item.lastInventoryCheck).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============================================================ */}
          {/* NEW: Section-Level Inventory Results (for partial workflow) */}
          {/* ============================================================ */}
          {item.sectionStatuses && Object.keys(item.sectionStatuses).length > 0 && (
            <SectionInventoryResults
              sectionStatuses={item.sectionStatuses}
              orderItemId={itemId}
              procurementDemands={procurementDemands}
              onRerunCheck={handleRerunSectionInventoryCheck}
            />
          )}

          {/* Partial Workflow Status Banner */}
          {(item.status === ORDER_ITEM_STATUS.PARTIAL_CREATE_PACKET ||
            item.status === ORDER_ITEM_STATUS.PARTIAL_PACKET_CHECK ||
            item.status === ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION) && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Partial Workflow Active</AlertTitle>
              <AlertDescription className="text-amber-700">
                Some sections are progressing while others await materials. Check section statuses
                above for details.
              </AlertDescription>
            </Alert>
          )}

          {/* Material Requirements Display (after inventory check) */}
          {item.materialRequirements && item.materialRequirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Material Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Material</th>
                        <th className="text-left py-2 font-medium">SKU</th>
                        <th className="text-right py-2 font-medium">Required</th>
                        <th className="text-right py-2 font-medium">Available</th>
                        <th className="text-right py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.materialRequirements.map((req, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2">{req.inventoryItemName}</td>
                          <td className="py-2 text-muted-foreground">{req.inventoryItemSku}</td>
                          <td className="py-2 text-right">
                            {req.requiredQty} {req.unit}
                          </td>
                          <td className="py-2 text-right">
                            {req.availableQty} {req.unit}
                          </td>
                          <td className="py-2 text-right">
                            {req.status === "SUFFICIENT" ? (
                              <Badge className="bg-green-100 text-green-800">OK</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Short: {req.shortageQty} {req.unit}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Awaiting Material Status Card */}
          {item.status === ORDER_ITEM_STATUS.AWAITING_MATERIAL && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Awaiting Material</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Some materials are not available in sufficient quantity. Procurement demands
                      have been created.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate("/procurement")}
                    >
                      View Procurement Demands
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partial Create Packet Status Card */}
          {item.status === ORDER_ITEM_STATUS.PARTIAL_CREATE_PACKET && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-indigo-100 p-2">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900">Partial Packet Ready</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                      Some sections have materials available. A partial packet has been created for
                      the available sections. Other sections are awaiting materials.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setActiveTab("packet")}
                    >
                      View Packet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready for Production Card */}
          {item.status === ORDER_ITEM_STATUS.READY_FOR_PRODUCTION && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Ready for Production</h3>
                    <p className="text-sm text-green-700 mt-1">
                      All materials are available. This item is ready to be moved to production.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                {/* Style */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Scissors className="h-4 w-4" />
                    Style
                  </h4>
                  {item.style?.type === CUSTOMIZATION_TYPE.ORIGINAL ? (
                    <p className="text-sm text-muted-foreground">Original style</p>
                  ) : (
                    <div className="text-sm text-muted-foreground space-y-2">
                      {typeof item.style?.details === "object" && item.style?.details !== null ? (
                        <>
                          {item.style.details.top && (
                            <p>
                              <span className="font-medium">Top:</span> {item.style.details.top}
                            </p>
                          )}
                          {item.style.details.bottom && (
                            <p>
                              <span className="font-medium">Bottom:</span>{" "}
                              {item.style.details.bottom}
                            </p>
                          )}
                          {item.style.details.dupattaShawl && (
                            <p>
                              <span className="font-medium">Dupatta/Shawl:</span>{" "}
                              {item.style.details.dupattaShawl}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{item.style?.details || "Custom style"}</p>
                      )}
                      {item.style?.image && (
                        <img
                          src={item.style.image}
                          alt="Style reference"
                          className="w-20 h-20 object-cover rounded border mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Color */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Scissors className="h-4 w-4" />
                    Color
                  </h4>
                  {item.color?.type === CUSTOMIZATION_TYPE.ORIGINAL ? (
                    <p className="text-sm text-muted-foreground">Original Color</p>
                  ) : (
                    <div className="text-sm text-muted-foreground space-y-2">
                      {typeof item.color?.details === "object" && item.color?.details !== null ? (
                        <>
                          {item.color.details.top && (
                            <p>
                              <span className="font-medium">Top:</span> {item.color.details.top}
                            </p>
                          )}
                          {item.color.details.bottom && (
                            <p>
                              <span className="font-medium">Bottom:</span>{" "}
                              {item.color.details.bottom}
                            </p>
                          )}
                          {item.color.details.dupattaShawl && (
                            <p>
                              <span className="font-medium">Dupatta/Shawl:</span>{" "}
                              {item.color.details.dupattaShawl}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{item.color?.details || "Custom Color"}</p>
                      )}
                      {item.color?.image && (
                        <img
                          src={item.color.image}
                          alt="Color reference"
                          className="w-20 h-20 object-cover rounded border mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Fabric */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Scissors className="h-4 w-4" />
                    Fabric
                  </h4>
                  {item.fabric?.type === CUSTOMIZATION_TYPE.ORIGINAL ? (
                    <p className="text-sm text-muted-foreground">Original Fabric</p>
                  ) : (
                    <div className="text-sm text-muted-foreground space-y-2">
                      {typeof item.fabric?.details === "object" && item.fabric?.details !== null ? (
                        <>
                          {item.fabric.details.top && (
                            <p>
                              <span className="font-medium">Top:</span> {item.fabric.details.top}
                            </p>
                          )}
                          {item.fabric.details.bottom && (
                            <p>
                              <span className="font-medium">Bottom:</span>{" "}
                              {item.fabric.details.bottom}
                            </p>
                          )}
                          {item.fabric.details.dupattaShawl && (
                            <p>
                              <span className="font-medium">Dupatta/Shawl:</span>{" "}
                              {item.fabric.details.dupattaShawl}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{item.fabric?.details || "Custom fabric"}</p>
                      )}
                      {item.fabric?.image && (
                        <img
                          src={item.fabric.image}
                          alt="Fabric reference"
                          className="w-20 h-20 object-cover rounded border mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Sketch (for custom items with sketch) */}
          {item.sizeType === SIZE_TYPE.CUSTOM && item.orderForm?.sketchImage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Design Sketch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={item.orderForm.sketchImage}
                  alt="Design sketch"
                  className="max-w-xs rounded border"
                />
              </CardContent>
            </Card>
          )}
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
                  {/* Current Version Info */}
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      Form generated on {new Date(item.orderForm?.generatedAt).toLocaleDateString()}
                      {item.orderFormVersions?.length > 1 && (
                        <span className="text-muted-foreground ml-2">
                          (Version {item.orderFormVersions.length})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setShowFormPreview(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/orders/${orderId}/items/${itemId}/form?edit=true`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Form
                    </Button>
                  </div>

                  {/* Version History */}
                  {item.orderFormVersions?.length > 1 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <History className="h-4 w-4" />
                        Version History
                      </h4>
                      <div className="space-y-2">
                        {item.orderFormVersions.map((version, index) => (
                          <div
                            key={version.versionId}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span>v{index + 1}</span>
                            <span>•</span>
                            <span>{new Date(version.generatedAt).toLocaleString()}</span>
                            <span>•</span>
                            <span>by {version.generatedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approval Button */}
                  {item.status === ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL &&
                    canApprove && (
                      <div className="mt-4 pt-4 border-t">
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
                      </div>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>Order form not yet generated</span>
                  </div>
                  {canManageForms && (
                    <Button onClick={() => navigate(`/orders/${orderId}/items/${itemId}/form`)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Order Form
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packet Tab - Phase 12 */}
        <TabsContent value="packet" className="space-y-6">
          <PacketTab orderItem={item} />
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
                          {entry.user} • {new Date(entry.timestamp).toLocaleString()}
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
        {/* Packet Tab - Phase 12 */}
      </Tabs>
      {/* Form Preview Modal */}
      {/* Form Preview Modal */}
      <Dialog open={showFormPreview} onOpenChange={setShowFormPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Form Preview</DialogTitle>
          </DialogHeader>

          {item.orderForm && (
            <div className="p-6 bg-white space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">ORDER CONFIRMATION FORM</h1>
                <p className="text-muted-foreground">Order #{item.orderForm.orderNumber}</p>
              </div>

              {/* Section 1: Basic Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Order No:</span>
                    <p className="font-semibold text-slate-900">{item.orderForm.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Order Date:</span>
                    <p className="font-semibold text-slate-900">
                      {item.orderForm.orderDate
                        ? new Date(item.orderForm.orderDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">FWD Date:</span>
                    <p className="font-semibold text-slate-900">
                      {item.orderForm.fwdDate
                        ? new Date(item.orderForm.fwdDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Production Ship Date:</span>
                    <p className="font-semibold text-slate-900">
                      {item.orderForm.productionShipDate
                        ? new Date(item.orderForm.productionShipDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Client & Team Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Client & Team Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Customer Name:</span>
                    <p className="font-semibold text-slate-900">{item.orderForm.customerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Destination:</span>
                    <p className="font-semibold text-slate-900">
                      {item.orderForm.destination || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Modesty:</span>
                    <p className="font-semibold text-slate-900">{item.orderForm.modesty || "NO"}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Product Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Product Information
                </h3>
                <div className="flex gap-6">
                  {item.orderForm.productImage ? (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                      <img
                        src={item.orderForm.productImage}
                        alt={item.orderForm.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-200 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                    <div>
                      <span className="text-slate-600">Product:</span>
                      <p className="font-semibold text-slate-900">{item.orderForm.productName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Size Type:</span>
                      <p className="font-semibold text-slate-900">{item.orderForm.sizeType}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Size:</span>
                      <p className="font-semibold text-slate-900">{item.orderForm.size}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Quantity:</span>
                      <p className="font-semibold text-slate-900">{item.orderForm.quantity || 1}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: What's Included */}
              {(item.includedItems?.length > 0 || item.selectedAddOns?.length > 0) && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                    What's Included
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-600 text-sm">Included Items:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.includedItems?.map((inc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize"
                          >
                            {inc.piece}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 text-sm">Add-ons:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedAddOns?.length > 0 ? (
                          item.selectedAddOns.map((addon, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize"
                            >
                              {addon.piece}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Customizations with Images */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Customizations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Style */}
                  <div>
                    <span className="text-slate-600 text-sm">Style:</span>
                    <p className="font-semibold capitalize">{item.orderForm.style?.type}</p>
                    {item.orderForm.style?.details && (
                      <p className="text-xs text-slate-500 mt-1">{item.orderForm.style.details}</p>
                    )}
                    {item.orderForm.style?.image && (
                      <img
                        src={item.orderForm.style.image}
                        alt="Style"
                        className="w-20 h-20 object-cover rounded mt-2 border"
                      />
                    )}
                  </div>
                  {/* Color */}
                  <div>
                    <span className="text-slate-600 text-sm">Color:</span>
                    <p className="font-semibold capitalize">{item.orderForm.color?.type}</p>
                    {item.orderForm.color?.details && (
                      <p className="text-xs text-slate-500 mt-1">{item.orderForm.color.details}</p>
                    )}
                    {item.orderForm.color?.image && (
                      <img
                        src={item.orderForm.color.image}
                        alt="Color"
                        className="w-20 h-20 object-cover rounded mt-2 border"
                      />
                    )}
                  </div>
                  {/* Fabric */}
                  <div>
                    <span className="text-slate-600 text-sm">Fabric:</span>
                    <p className="font-semibold capitalize">{item.orderForm.fabric?.type}</p>
                    {item.orderForm.fabric?.details && (
                      <p className="text-xs text-slate-500 mt-1">{item.orderForm.fabric.details}</p>
                    )}
                    {item.orderForm.fabric?.image && (
                      <img
                        src={item.orderForm.fabric.image}
                        alt="Fabric"
                        className="w-20 h-20 object-cover rounded mt-2 border"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Section 5a: Standard Size Measurements */}
              {item.orderForm.sizeType === "Standard" &&
                item.orderForm.standardSizeChart &&
                Object.keys(item.orderForm.standardSizeChart).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                      Standard Size Measurements ({item.orderForm.size})
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(item.orderForm.standardSizeChart).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-baseline py-1">
                          <span className="text-slate-600 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-semibold text-slate-900 ml-2">{value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Section 5b: Height-Based Measurements */}
              {item.orderForm.hasHeightChart &&
                item.orderForm.heightChart &&
                Object.keys(item.orderForm.heightChart).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                      Height-Based Measurements
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(item.orderForm.heightChart).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-baseline py-1">
                          <span className="text-slate-600 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-semibold text-slate-900 ml-2">{value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Section 5c: Custom Measurements (for custom size orders) */}
              {item.orderForm.sizeType === "Custom" &&
                item.orderForm.measurements &&
                Object.keys(item.orderForm.measurements).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                      Custom Measurements
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(item.orderForm.measurements).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-baseline py-1">
                          <span className="text-slate-600 capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-semibold text-slate-900 ml-2">{value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Section 6: Sketch */}
              {item.orderForm.sketchImage && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                    Design Sketch
                  </h3>
                  <img
                    src={item.orderForm.sketchImage}
                    alt="Sketch"
                    className="max-w-xs rounded border"
                  />
                </div>
              )}

              {/* Section 7: Notes */}
              {item.orderForm.notes && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-slate-700">{item.orderForm.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-4 text-center text-muted-foreground text-sm">
                <p>Please confirm these details are correct.</p>
                <p className="text-xs mt-1">
                  Generated on {new Date(item.orderForm.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Custom BOM View Modal */}
      <CustomBOMViewModal
        open={showCustomBOMModal}
        onOpenChange={setShowCustomBOMModal}
        customBOM={item?.customBOM}
      />
    </div>
  )
}
