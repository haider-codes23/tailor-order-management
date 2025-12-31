import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useOrder, useOrderItem, useGenerateOrderForm } from "@/hooks/useOrders"
import { useProduct } from "@/hooks/useProducts"
import { useStandardSizeChart, useStandardHeightChart } from "@/hooks"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { SIZE_TYPE, CUSTOMIZATION_TYPE } from "@/constants/orderConstants"
import {
  MEASUREMENT_CATEGORIES,
  getMeasurementCategoryById,
} from "@/constants/measurementCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, FileText, Loader2, Printer, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function OrderFormGeneratorPage() {
  const { id: orderId, itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const printRef = useRef()

  const [showPreview, setShowPreview] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [generatedFormData, setGeneratedFormData] = useState(null)

  const { data: orderData, isLoading: orderLoading } = useOrder(orderId)
  const { data: itemData, isLoading: itemLoading } = useOrderItem(itemId)
  const { data: sizeChartData } = useStandardSizeChart()
  const { data: heightChartData } = useStandardHeightChart()
  const generateForm = useGenerateOrderForm()

  const order = orderData
  const item = itemData?.data

  // Fetch product details - only when item is loaded
  const { data: productData } = useProduct(item?.productId, {
    enabled: !!item?.productId,
  })
  const product = productData?.data

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      styleType: CUSTOMIZATION_TYPE.ORIGINAL,
      styleDetails: "",
      colorType: CUSTOMIZATION_TYPE.ORIGINAL,
      colorDetails: "",
      fabricType: CUSTOMIZATION_TYPE.ORIGINAL,
      fabricDetails: "",
      notes: "",
      measurements: {},
    },
  })

  const isStandardSize = item?.sizeType === SIZE_TYPE.STANDARD

  // Get standard size measurements from chart
  // Get standard size measurements from chart - convert rows array to object
  const sizeChartRows = sizeChartData?.rows || []
const sizeRow = sizeChartRows.find((row) => row.size_code === item?.size)
// Separate body measurements from size info
const { id, size_code, sequence, uk_size, us_size, ...bodyMeasurements } = sizeRow || {}
const standardSizeMeasurements = bodyMeasurements
const sizeInfo = { uk_size, us_size }

const heightChartRows = heightChartData?.rows || []
// Match height - try exact match first, then flexible match
const heightRow = order?.clientHeight
  ? heightChartRows.find((row) => {
      // Exact match
      if (row.height_range === order.clientHeight) return true
      // Flexible match - normalize both strings for comparison
      const normalizeHeight = (str) => str?.toLowerCase().replace(/['"\s-]/g, '') || ''
      return normalizeHeight(row.height_range) === normalizeHeight(order.clientHeight)
    })
  : null
// Extract only measurement fields from height row
const heightMeasurements = heightRow
  ? { 
      kaftan_length: heightRow.kaftan_length, 
      sleeve_front: heightRow.sleeve_front_length, 
      sleeve_back: heightRow.sleeve_back_length 
    }
  : null

  // Handle category toggle for custom measurements
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  const onSubmit = async (data) => {
    try {
      const formData = {
        sizeType: item.sizeType,
        size: item.size,
        notes: data.notes,
        generatedBy: user?.name || "System",
        generatedAt: new Date().toISOString(),
        style: {
          type: data.styleType,
          details: data.styleType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.styleDetails : null,
        },
        color: {
          type: data.colorType,
          details: data.colorType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.colorDetails : null,
        },
        fabric: {
          type: data.fabricType,
          details: data.fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.fabricDetails : null,
        },
        productImage: productImage,
      }

      // Add measurements
      if (isStandardSize) {
        formData.measurements = {
          ...standardSizeMeasurements,
          ...(heightMeasurements && {
            kaftan_length: heightMeasurements.kaftan_length,
            sleeve_front: heightMeasurements.sleeve_front,
            sleeve_back: heightMeasurements.sleeve_back,
          }),
        }
        formData.standardSizeChart = standardSizeMeasurements
        formData.heightChart = heightMeasurements
      } else {
        formData.measurements = data.measurements
        formData.selectedCategories = selectedCategories
      }

      await generateForm.mutateAsync({ itemId, data: formData })
      setGeneratedFormData(formData)
      setShowPreview(true)
      toast.success("Order form generated successfully")
    } catch (error) {
      toast.error("Failed to generate form")
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Form - ${order?.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            color: #1e293b;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            color: #64748b;
          }
          .section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .section-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .field label {
            font-size: 12px;
            color: #64748b;
            display: block;
          }
          .field p {
            font-weight: 600;
            font-size: 13px;
          }
          .product-section {
            display: flex;
            gap: 20px;
          }
          .product-image {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e2e8f0;
          }
          .product-placeholder {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            background: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
          }
          .measurements-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .measurement-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
          }
          .measurement-item span:first-child {
            color: #64748b;
          }
          .measurement-item span:last-child {
            font-weight: 600;
          }
          .notes-section {
            background: #fef3c7;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORDER CONFIRMATION FORM</h1>
          <p>Order #${order?.orderNumber || ""}</p>
        </div>

        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="grid">
            <div class="field">
              <label>Order No:</label>
              <p>${order?.orderNumber || "—"}</p>
            </div>
            <div class="field">
              <label>Order Date:</label>
              <p>${order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
            </div>
            <div class="field">
              <label>FWD Date:</label>
              <p>${order?.fwdDate ? new Date(order.fwdDate).toLocaleDateString() : "—"}</p>
            </div>
            <div class="field">
              <label>Production Ship Date:</label>
              <p>${order?.productionShippingDate ? new Date(order.productionShippingDate).toLocaleDateString() : "—"}</p>
            </div>
            <div class="field">
              <label>Payment Status:</label>
              <p>${order?.paymentStatus || "—"}</p>
            </div>
            <div class="field">
              <label>Payment Method:</label>
              <p>${order?.paymentMethod?.replace("_", " ") || "—"}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Client & Team Information</div>
          <div class="grid">
            <div class="field">
              <label>Customer Name:</label>
              <p>${order?.customerName || "—"}</p>
            </div>
            <div class="field">
              <label>Fashion Consultant:</label>
              <p>${order?.consultantName || "—"}</p>
            </div>
            <div class="field">
              <label>Production Incharge:</label>
              <p>${order?.productionInchargeName || "Not assigned"}</p>
            </div>
            <div class="field">
              <label>Customer Height:</label>
              <p>${order?.clientHeight || "—"}</p>
            </div>
            <div class="field">
              <label>Modesty Requirement:</label>
              <p>${order?.modesty || "NO"}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Product Information</div>
          <div class="product-section">
            ${
              productImage
                ? `<img src="${productImage}" class="product-image" alt="Product" />`
                : `<div class="product-placeholder">No Image</div>`
            }
            <div class="grid-2" style="flex: 1;">
              <div class="field">
                <label>Product Name:</label>
                <p>${item?.productName || product?.name || "—"}</p>
              </div>
              <div class="field">
                <label>SKU:</label>
                <p>${product?.sku || item?.productSku || "—"}</p>
              </div>
              <div class="field">
                <label>Size Type:</label>
                <p>${isStandardSize ? "Standard" : "Custom"}</p>
              </div>
              <div class="field">
                <label>Size:</label>
                <p>${isStandardSize ? item?.size : "Custom Measurements"}</p>
              </div>
              <div class="field">
                <label>Quantity:</label>
                <p>${item?.quantity || 1}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Customization Options</div>
          <div class="grid">
            <div class="field">
              <label>Style:</label>
              <p>${generatedFormData?.style?.type || "Original"}</p>
              ${generatedFormData?.style?.details ? `<p style="font-size:11px;color:#64748b;">${generatedFormData.style.details}</p>` : ""}
            </div>
            <div class="field">
              <label>Color:</label>
              <p>${generatedFormData?.color?.type || "Original"}</p>
              ${generatedFormData?.color?.details ? `<p style="font-size:11px;color:#64748b;">${generatedFormData.color.details}</p>` : ""}
            </div>
            <div class="field">
              <label>Fabric:</label>
              <p>${generatedFormData?.fabric?.type || "Original"}</p>
              ${generatedFormData?.fabric?.details ? `<p style="font-size:11px;color:#64748b;">${generatedFormData.fabric.details}</p>` : ""}
            </div>
          </div>
        </div>

        ${
          isStandardSize
            ? `
          <div class="section">
            <div class="section-title">Standard Size Measurements (${item?.size})</div>
            <div class="measurements-grid">
              ${Object.entries(standardSizeMeasurements)
                .map(
                  ([key, value]) => `
                <div class="measurement-item">
                  <span>${key.replace(/_/g, " ")}</span>
                  <span>${value}"</span>
                </div>
              `
                )
                .join("")}
            </div>
            ${
              heightMeasurements && Object.keys(heightMeasurements).length > 0
                ? `
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
                <div style="font-weight:500;margin-bottom:8px;">Height-Based Measurements (${order?.clientHeight})</div>
                <div class="measurements-grid">
                  ${Object.entries(heightMeasurements)
                    .map(
                      ([key, value]) => `
                    <div class="measurement-item">
                      <span>${key.replace(/_/g, " ")}</span>
                      <span>${value}"</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `
            : `
          ${
            generatedFormData?.measurements &&
            Object.keys(generatedFormData.measurements).length > 0
              ? `
            ${selectedCategories
              .map((catId) => {
                const category = getMeasurementCategoryById(catId)
                if (!category) return ""
                const categoryMeasurements = Object.entries(generatedFormData.measurements).filter(
                  ([key]) => key.startsWith(catId + "_")
                )
                if (categoryMeasurements.length === 0) return ""
                return `
                <div class="section">
                  <div class="section-title">${category.name}</div>
                  <div class="measurements-grid">
                    ${categoryMeasurements
                      .map(([key, value]) => {
                        const measurementId = key.replace(catId + "_", "")
                        const measurement = category.groups
                          .flatMap((g) => g.measurements)
                          .find((m) => m.id === measurementId)
                        return `
                        <div class="measurement-item">
                          <span>${measurement?.label || measurementId}</span>
                          <span>${value}"</span>
                        </div>
                      `
                      })
                      .join("")}
                  </div>
                </div>
              `
              })
              .join("")}
          `
              : ""
          }
        `
        }

        <div class="section">
          <div class="section-title">Shipping Details</div>
          <div class="grid">
            <div class="field">
              <label>Destination:</label>
              <p>${order?.destination || "—"}</p>
            </div>
            <div class="field" style="grid-column: span 2;">
              <label>Full Address:</label>
              <p>${order?.address || "—"}</p>
            </div>
            <div class="field">
              <label>Tracking ID:</label>
              <p>${order?.preTrackingId || "Not assigned"}</p>
            </div>
            <div class="field">
              <label>Urgent:</label>
              <p>${order?.urgent || "No"}</p>
            </div>
          </div>
        </div>

        ${
          generatedFormData?.notes
            ? `
          <div class="notes-section">
            <div class="section-title" style="border:none;margin-bottom:8px;padding-bottom:0;">Additional Notes</div>
            <p style="font-size:13px;">${generatedFormData.notes}</p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>Please confirm these details are correct.</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Get product image - check multiple sources
  const productImage =
    product?.primary_image ||
    product?.image_url ||
    product?.image ||
    product?.images?.[0] ||
    item?.productImage

  if (orderLoading || itemLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!item || !order) {
    return (
      <div className="p-6">
        <p>Order item not found</p>
        <Button variant="outline" onClick={() => navigate(`/orders/${orderId}`)}>
          Back to Order
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/orders/${orderId}/items/${itemId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Generate Order Form</h1>
          <p className="text-muted-foreground">
            {item.productName || product?.name} •{" "}
            {isStandardSize ? `Standard Size ${item.size}` : "Custom Size"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Info Card with Image */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {productImage ? (
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={productImage}
                    alt={item.productName || product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{item.productName || product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size Type</p>
                  <p className="font-medium">{isStandardSize ? "Standard" : "Custom"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{item.size || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Size Measurements */}
        {isStandardSize && (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Standard Size Measurements</CardTitle>
        <CardDescription>
          Pre-filled from the size chart for size {item.size}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(standardSizeMeasurements).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}
              </p>
              <p className="font-medium">{value}"</p>
            </div>
          ))}
          {sizeInfo.uk_size && (
            <div>
              <p className="text-sm text-muted-foreground">UK Size</p>
              <p className="font-medium">{sizeInfo.uk_size}</p>
            </div>
          )}
          {sizeInfo.us_size && (
            <div>
              <p className="text-sm text-muted-foreground">US Size</p>
              <p className="font-medium">{sizeInfo.us_size}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {heightMeasurements && (
      <Card>
        <CardHeader>
          <CardTitle>Height-Based Measurements</CardTitle>
          <CardDescription>
            Based on customer height: {order.clientHeight}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Kaftan Length</p>
              <p className="font-medium">{heightMeasurements.kaftan_length}"</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sleeve Front</p>
              <p className="font-medium">{heightMeasurements.sleeve_front}"</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sleeve Back</p>
              <p className="font-medium">{heightMeasurements.sleeve_back}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
  </>
)}

        {/* Custom Measurements */}
        {!isStandardSize && (
          <Card>
            <CardHeader>
              <CardTitle>Measurement Categories</CardTitle>
              <CardDescription>Select categories and enter custom measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(MEASUREMENT_CATEGORIES).map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => handleCategoryToggle(cat.id)}
                    />
                    <Label htmlFor={cat.id}>{cat.name}</Label>
                  </div>
                ))}
              </div>

              {selectedCategories.map((catId) => {
                const category = getMeasurementCategoryById(catId)
                if (!category) return null

                return (
                  <div key={catId} className="border rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-4">{category.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {category.groups
                        .flatMap((g) => g.measurements)
                        .map((m) => (
                          <Controller
                            key={m.id}
                            name={`measurements.${catId}_${m.id}`}
                            control={control}
                            render={({ field }) => (
                              <div>
                                <Label>{m.name}</Label>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.5"
                                  placeholder={`${m.label} (inches)`}
                                />
                              </div>
                            )}
                          />
                        ))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Customizations */}
        <Card>
          <CardHeader>
            <CardTitle>Customizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Style</Label>
                <Controller
                  name="styleType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {watch("styleType") === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <div>
                  <Label>Style Details</Label>
                  <Controller
                    name="styleDetails"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} placeholder="Describe style changes" />
                    )}
                  />
                </div>
              )}
            </div>

            {/* Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <Controller
                  name="colorType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {watch("colorType") === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <div>
                  <Label>Color Details</Label>
                  <Controller
                    name="colorDetails"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} placeholder="Describe color changes" />
                    )}
                  />
                </div>
              )}
            </div>

            {/* Fabric */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fabric</Label>
                <Controller
                  name="fabricType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {watch("fabricType") === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <div>
                  <Label>Fabric Details</Label>
                  <Controller
                    name="fabricDetails"
                    control={control}
                    render={({ field }) => (
                      <Textarea {...field} placeholder="Describe fabric changes" />
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Any additional notes for this order..."
                  rows={4}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/orders/${orderId}/items/${itemId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={generateForm.isPending}>
            {generateForm.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Form
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Form Preview</DialogTitle>
          </DialogHeader>

          <div ref={printRef} className="p-6 bg-white space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">ORDER CONFIRMATION FORM</h1>
              <p className="text-muted-foreground">Order #{order?.orderNumber}</p>
            </div>

            {/* Section 1: Basic Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Order No:</span>
                  <p className="font-semibold text-slate-900">{order?.orderNumber}</p>
                </div>
                <div>
                  <span className="text-slate-600">Order Date:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">FWD Date:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.fwdDate ? new Date(order.fwdDate).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Production Ship Date:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.productionShippingDate
                      ? new Date(order.productionShippingDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Payment Status:</span>
                  <p className="font-semibold text-slate-900">{order?.paymentStatus || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-600">Payment Method:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {order?.paymentMethod?.replace("_", " ") || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Client & Internal Users */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Client & Team Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Customer Name:</span>
                  <p className="font-semibold text-slate-900">{order?.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-600">Fashion Consultant:</span>
                  <p className="font-semibold text-slate-900">{order?.consultantName || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-600">Production Incharge:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.productionInchargeName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Customer Height:</span>
                  <p className="font-semibold text-slate-900">{order?.clientHeight || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-600">Modesty Requirement:</span>
                  <p className="font-semibold text-slate-900">{order?.modesty || "NO"}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Product Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Product Information
              </h3>
              <div className="flex gap-6">
                {productImage ? (
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border">
                    <img
                      src={productImage}
                      alt={item?.productName || product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg bg-slate-200 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                  <div>
                    <span className="text-slate-600">Product Name:</span>
                    <p className="font-semibold text-slate-900">
                      {item?.productName || product?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">SKU:</span>
                    <p className="font-semibold text-slate-900">
                      {product?.sku || item?.productSku || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Size Type:</span>
                    <p className="font-semibold text-slate-900">
                      {isStandardSize ? "Standard" : "Custom"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Size:</span>
                    <p className="font-semibold text-slate-900">
                      {isStandardSize ? item?.size : "Custom Measurements"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Quantity:</span>
                    <p className="font-semibold text-slate-900">{item?.quantity || 1}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Customization Options */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Customization Options
              </h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-slate-600">Style:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {generatedFormData?.style?.type || "Original"}
                  </p>
                  {generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED &&
                    generatedFormData?.style?.details && (
                      <p className="text-slate-600 mt-1 text-xs">
                        {generatedFormData.style.details}
                      </p>
                    )}
                </div>
                <div>
                  <span className="text-slate-600">Color:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {generatedFormData?.color?.type || "Original"}
                  </p>
                  {generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED &&
                    generatedFormData?.color?.details && (
                      <p className="text-slate-600 mt-1 text-xs">
                        {generatedFormData.color.details}
                      </p>
                    )}
                </div>
                <div>
                  <span className="text-slate-600">Fabric:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {generatedFormData?.fabric?.type || "Original"}
                  </p>
                  {generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED &&
                    generatedFormData?.fabric?.details && (
                      <p className="text-slate-600 mt-1 text-xs">
                        {generatedFormData.fabric.details}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Section 5: Measurements */}
            {/* For Standard Size */}
            {isStandardSize && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Standard Size Measurements ({item?.size})
                </h3>
                {Object.keys(standardSizeMeasurements).length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                    {Object.entries(standardSizeMeasurements).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-baseline py-1">
                        <span className="text-slate-600 capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="font-semibold text-slate-900 ml-2">{value}"</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No measurements available for this size</p>
                )}

                {/* Height Measurements for Standard */}
                {heightMeasurements && Object.keys(heightMeasurements).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-800 mb-2">
                      Height-Based Measurements ({order?.clientHeight})
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(heightMeasurements).map(([key, value]) => (
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
              </div>
            )}

            {/* For Custom Size - Organized by Category */}
            {!isStandardSize &&
              generatedFormData?.measurements &&
              Object.keys(generatedFormData.measurements).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Custom Measurements</h3>
                  {selectedCategories.map((catId) => {
                    const category = getMeasurementCategoryById(catId)
                    if (!category) return null

                    const categoryMeasurements = Object.entries(
                      generatedFormData.measurements
                    ).filter(([key]) => key.startsWith(`${catId}_`))

                    if (categoryMeasurements.length === 0) return null

                    return (
                      <div key={catId} className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                          {categoryMeasurements.map(([key, value]) => {
                            const measurementId = key.replace(`${catId}_`, "")
                            const measurement = category.groups
                              .flatMap((g) => g.measurements)
                              .find((m) => m.id === measurementId)
                            return (
                              <div
                                key={key}
                                className="flex justify-between items-baseline py-1 text-sm"
                              >
                                <span className="text-slate-600">
                                  {measurement?.label || measurementId}
                                </span>
                                <span className="font-semibold text-slate-900 ml-2">{value}"</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            {/* Section 6: Shipping Details */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                Shipping Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Destination:</span>
                  <p className="font-semibold text-slate-900">{order?.destination || "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Full Address:</span>
                  <p className="font-semibold text-slate-900">{order?.address || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-600">Tracking ID:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.preTrackingId || "Not assigned"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Urgent:</span>
                  <p className="font-semibold text-slate-900">{order?.urgent || "No"}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {generatedFormData?.notes && (
              <div className="bg-amber-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Additional Notes</h3>
                <p className="text-sm text-slate-700">{generatedFormData.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-4 text-center text-muted-foreground text-sm">
              <p>Please confirm these details are correct.</p>
              <p className="text-xs mt-1">Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print / Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
