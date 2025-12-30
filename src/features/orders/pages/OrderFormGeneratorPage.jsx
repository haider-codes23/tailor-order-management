import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useOrder, useOrderItem, useGenerateOrderForm } from "@/hooks/useOrders"
import { useProduct } from "@/hooks/useProducts"
import { useStandardSizeChart, useStandardHeightChart } from "@/hooks"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  SIZE_TYPE,
  CUSTOMIZATION_TYPE,
} from "@/constants/orderConstants"
import { MEASUREMENT_CATEGORIES, getMeasurementCategoryById } from "@/constants/measurementCategories"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Download,
  Printer,
  Eye,
  Image as ImageIcon,
} from "lucide-react"
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

  const order = orderData?.data
  const item = itemData?.data

  // Fetch product details - only when item is loaded
  const { data: productData } = useProduct(item?.productId, {
    enabled: !!item?.productId,
  })
  const product = productData?.data

  const isStandardSize = item?.sizeType === SIZE_TYPE.STANDARD

  // Get standard measurements for the selected size
  const standardSizeMeasurements = sizeChartData?.rows?.find(
    (row) => row.size_code === item?.size
  )

  // Get height measurements based on client height
  const getHeightMeasurements = () => {
    if (!order?.clientHeight || !heightChartData?.rows) return null
    
    // Map client height to height chart range
    const heightMap = {
      "4ft0in-4ft2in": "4'10\" - 5'0\"",
      "4ft3in-4ft5in": "4'10\" - 5'0\"",
      "4ft6in-4ft8in": "4'10\" - 5'0\"",
      "4ft9in-4ft11in": "4'10\" - 5'0\"",
      "5ft0in-5ft2in": "5'1\" - 5'2\"",
      "5ft3in-5ft5in": "5'3\" - 5'5\"",
      "5ft6in-5ft8in": "5'6\" - 5'8\"",
      "5ft9in-5ft11in": "5'9\" - 5'11\"",
      "6ft0in-6ft2in": "6'0\" - 6'2\"",
      "6ft3in-6ft5in": "6'0\" - 6'2\"",
      "6ft6in-6ft8in": "6'0\" - 6'2\"",
    }
    
    const mappedHeight = heightMap[order.clientHeight]
    return heightChartData.rows.find((row) => row.height_range === mappedHeight)
  }

  const heightMeasurements = getHeightMeasurements()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      styleType: CUSTOMIZATION_TYPE.ORIGINAL,
      styleDetails: { top: "", bottom: "", dupatta: "" },
      colorType: CUSTOMIZATION_TYPE.ORIGINAL,
      colorDetails: "",
      fabricType: CUSTOMIZATION_TYPE.ORIGINAL,
      fabricDetails: "",
      measurements: {},
    },
  })

  const styleType = watch("styleType")
  const colorType = watch("colorType")
  const fabricType = watch("fabricType")

  // Toggle category selection for custom measurements
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Get all measurement fields for selected categories
  const getMeasurementFields = () => {
    const fields = []
    selectedCategories.forEach((categoryId) => {
      const category = getMeasurementCategoryById(categoryId)
      if (category) {
        category.groups.forEach((group) => {
          group.measurements.forEach((measurement) => {
            fields.push({
              ...measurement,
              categoryId,
              categoryName: category.name,
              groupName: group.name,
            })
          })
        })
      }
    })
    return fields
  }

  const onSubmit = async (data) => {
    try {
      let formData = {
        sizeType: item.sizeType,
        size: item.size,
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

      await generateForm.mutateAsync({ itemId, formData })
      setGeneratedFormData(formData)
      setShowPreview(true)
      toast.success("Order form generated successfully")
    } catch (error) {
      toast.error("Failed to generate form")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Get product image - check multiple sources
  const productImage = product?.primary_image || product?.image_url || product?.images?.[0] || item?.productImage

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
            {item.productName || product?.name} • {isStandardSize ? "Standard" : "Custom"} Size: {item.size}
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
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Image */}
              <div className="w-full md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={item.productName || product?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{item.productName || product?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{product?.sku || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size Type</p>
                  <p className="font-medium">{isStandardSize ? "Standard" : "Custom"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{item.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customerName}</p>
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
                  Body measurements for size {item.size} from the standard size chart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {standardSizeMeasurements ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Shoulder</p>
                      <p className="font-semibold">{standardSizeMeasurements.shoulder}"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Bust</p>
                      <p className="font-semibold">{standardSizeMeasurements.bust}"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Waist</p>
                      <p className="font-semibold">{standardSizeMeasurements.waist}"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Hip</p>
                      <p className="font-semibold">{standardSizeMeasurements.hip}"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Armhole</p>
                      <p className="font-semibold">{standardSizeMeasurements.armhole}"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">UK Size</p>
                      <p className="font-semibold">{standardSizeMeasurements.uk_size}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">US Size</p>
                      <p className="font-semibold">{standardSizeMeasurements.us_size}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No measurements found for size {item.size}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Height Chart Measurements */}
            {order.clientHeight && (
              <Card>
                <CardHeader>
                  <CardTitle>Height-Based Measurements</CardTitle>
                  <CardDescription>
                    Length measurements based on client height: {order.clientHeight.replace(/-/g, " - ").replace(/ft/g, "' ").replace(/in/g, '"')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {heightMeasurements ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Kaftan Length</p>
                        <p className="font-semibold">{heightMeasurements.kaftan_length}"</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Sleeve Front</p>
                        <p className="font-semibold">{heightMeasurements.sleeve_front}"</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Sleeve Back</p>
                        <p className="font-semibold">{heightMeasurements.sleeve_back}"</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No height measurements found. Please ensure client height is set in order details.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Custom Size - Category Selection */}
        {!isStandardSize && (
          <Card>
            <CardHeader>
              <CardTitle>Select Measurement Categories</CardTitle>
              <CardDescription>
                Choose which measurement categories apply to this garment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(MEASUREMENT_CATEGORIES).map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.groups.reduce((acc, g) => acc + g.measurements.length, 0)} measurements
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Measurements Input */}
        {!isStandardSize && selectedCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Measurements (inches)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedCategories.map((categoryId) => {
                  const category = getMeasurementCategoryById(categoryId)
                  if (!category) return null

                  return (
                    <div key={categoryId}>
                      <h4 className="font-semibold mb-4">{category.name}</h4>
                      {category.groups.map((group) => (
                        <div key={group.name} className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">{group.name}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {group.measurements.map((m) => (
                              <div key={m.id}>
                                <Label className="text-xs">{m.label}</Label>
                                <Input
                                  type="number"
                                  step="0.25"
                                  {...register(`measurements.${m.id}`)}
                                  placeholder="0.00"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customizations */}
        <Card>
          <CardHeader>
            <CardTitle>Customizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Style */}
            <div className="space-y-3">
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
              {styleType === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label className="text-xs">Top</Label>
                    <Textarea {...register("styleDetails.top")} placeholder="Top style details" rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">Bottom</Label>
                    <Textarea {...register("styleDetails.bottom")} placeholder="Bottom style details" rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">Dupatta/Shawl</Label>
                    <Textarea {...register("styleDetails.dupatta")} placeholder="Dupatta/Shawl details" rows={2} />
                  </div>
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-3">
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
              {colorType === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <Textarea {...register("colorDetails")} placeholder="Color customization details" rows={2} />
              )}
            </div>

            {/* Fabric */}
            <div className="space-y-3">
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
              {fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                <Textarea {...register("fabricDetails")} placeholder="Fabric customization details" rows={2} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
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

          <div ref={printRef} className="p-6 bg-white print:p-0">
            {/* Printable Form Content */}
            <div className="space-y-6 text-sm">
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">ORDER CONFIRMATION FORM</h1>
                <p className="text-muted-foreground">Order #{order.orderNumber}</p>
              </div>

              {/* Product Image in Preview */}
              <div className="flex gap-6">
                {productImage && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div><strong>Customer:</strong> {order.customerName}</div>
                  <div><strong>Product:</strong> {item.productName || product?.name}</div>
                  <div><strong>Size:</strong> {item.size} ({isStandardSize ? "Standard" : "Custom"})</div>
                  <div><strong>Quantity:</strong> {item.quantity}</div>
                  <div><strong>Destination:</strong> {order.destination}</div>
                  <div><strong>Consultant:</strong> {user?.name}</div>
                </div>
              </div>

              {/* Measurements */}
              {generatedFormData?.standardSizeChart && (
                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">Body Measurements (Size {item.size})</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div><strong>Shoulder:</strong> {generatedFormData.standardSizeChart.shoulder}"</div>
                    <div><strong>Bust:</strong> {generatedFormData.standardSizeChart.bust}"</div>
                    <div><strong>Waist:</strong> {generatedFormData.standardSizeChart.waist}"</div>
                    <div><strong>Hip:</strong> {generatedFormData.standardSizeChart.hip}"</div>
                    <div><strong>Armhole:</strong> {generatedFormData.standardSizeChart.armhole}"</div>
                    <div><strong>UK Size:</strong> {generatedFormData.standardSizeChart.uk_size}</div>
                    <div><strong>US Size:</strong> {generatedFormData.standardSizeChart.us_size}</div>
                  </div>
                </div>
              )}

              {generatedFormData?.heightChart && (
                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">Length Measurements (Based on Height)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div><strong>Kaftan Length:</strong> {generatedFormData.heightChart.kaftan_length}"</div>
                    <div><strong>Sleeve Front:</strong> {generatedFormData.heightChart.sleeve_front}"</div>
                    <div><strong>Sleeve Back:</strong> {generatedFormData.heightChart.sleeve_back}"</div>
                  </div>
                </div>
              )}

              {/* Custom Measurements */}
              {!isStandardSize && generatedFormData?.measurements && (
                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">Custom Measurements</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(generatedFormData.measurements).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          <strong>{key.replace(/_/g, " ")}:</strong> {value}"
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Customizations */}
              <div>
                <h3 className="font-semibold border-b pb-2 mb-3">Customizations</h3>
                <div className="space-y-2">
                  <div><strong>Style:</strong> {generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "Customized" : "Original"}</div>
                  <div><strong>Color:</strong> {generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "Customized" : "Original"}</div>
                  <div><strong>Fabric:</strong> {generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? "Customized" : "Original"}</div>
                </div>
              </div>

              <div className="border-t pt-4 text-center text-muted-foreground">
                <p>Please confirm these details are correct.</p>
                <p className="text-xs mt-2">Generated on {new Date().toLocaleString()}</p>
              </div>
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