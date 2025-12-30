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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
  Printer,
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
  const sizeChart = sizeChartData?.data?.sizes || {}
  const standardSizeMeasurements = sizeChart[item?.size] || {}

  // Get height-based measurements
  const heightChart = heightChartData?.data?.heights || {}
  const heightMeasurements = order?.customerHeight
    ? heightChart[order.customerHeight]
    : null

  // Handle category toggle for custom measurements
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
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
          details:
            data.styleType === CUSTOMIZATION_TYPE.CUSTOMIZED
              ? data.styleDetails
              : null,
        },
        color: {
          type: data.colorType,
          details:
            data.colorType === CUSTOMIZATION_TYPE.CUSTOMIZED
              ? data.colorDetails
              : null,
        },
        fabric: {
          type: data.fabricType,
          details:
            data.fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED
              ? data.fabricDetails
              : null,
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
    window.print()
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
                  <p className="font-medium">
                    {isStandardSize ? "Standard" : "Custom"}
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
                </div>
              </CardContent>
            </Card>

            {heightMeasurements && (
              <Card>
                <CardHeader>
                  <CardTitle>Height-Based Measurements</CardTitle>
                  <CardDescription>
                    Based on customer height: {order.customerHeight}
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
              <CardDescription>
                Select categories and enter custom measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MEASUREMENT_CATEGORIES.map((cat) => (
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
                      {category.measurements.map((m) => (
                        <Controller
                          key={m.id}
                          name={`measurements.${m.id}`}
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Label>{m.name}</Label>
                              <Input
                                {...field}
                                type="number"
                                step="0.5"
                                placeholder={`${m.name} (inches)`}
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
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>
                          Original
                        </SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>
                          Customized
                        </SelectItem>
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
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>
                          Original
                        </SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>
                          Customized
                        </SelectItem>
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
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>
                          Original
                        </SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>
                          Customized
                        </SelectItem>
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

          <div ref={printRef} className="p-6 bg-white print:p-0">
            <div className="space-y-6 text-sm">
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold">ORDER CONFIRMATION FORM</h1>
                <p className="text-muted-foreground">
                  Order #{order.orderNumber}
                </p>
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
                  <div>
                    <strong>Customer:</strong> {order.customerName}
                  </div>
                  <div>
                    <strong>Product:</strong> {item.productName || product?.name}
                  </div>
                  <div>
                    <strong>Size:</strong> {item.size} (
                    {isStandardSize ? "Standard" : "Custom"})
                  </div>
                  <div>
                    <strong>Quantity:</strong> {item.quantity}
                  </div>
                </div>
              </div>

              {/* Measurements in Preview */}
              {generatedFormData?.measurements && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Measurements</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(generatedFormData.measurements).map(
                      ([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}:
                          </span>{" "}
                          {value}"
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Customizations in Preview */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Customizations</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <strong>Style:</strong>{" "}
                    {generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
                      ? "Customized"
                      : "Original"}
                  </div>
                  <div>
                    <strong>Color:</strong>{" "}
                    {generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
                      ? "Customized"
                      : "Original"}
                  </div>
                  <div>
                    <strong>Fabric:</strong>{" "}
                    {generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
                      ? "Customized"
                      : "Original"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-center text-muted-foreground">
                <p>Please confirm these details are correct.</p>
                <p className="text-xs mt-2">
                  Generated on {new Date().toLocaleString()}
                </p>
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