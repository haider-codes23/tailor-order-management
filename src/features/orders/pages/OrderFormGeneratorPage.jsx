import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useOrder, useOrderItem, useGenerateOrderForm } from "@/hooks/useOrders"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { SIZE_TYPE, CUSTOMIZATION_TYPE } from "@/constants/orderConstants"
import {
  MEASUREMENT_CATEGORY_OPTIONS,
  getMeasurementCategoryById,
} from "@/constants/measurementCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  Ruler,
  Palette,
  Scissors,
  Shirt,
  Package,
  FileText,
  Eye,
  Printer,
} from "lucide-react"
import OrderFormPreview from "../components/OrderFormPreview"

export default function OrderFormGeneratorPage() {
  const { id: orderId, itemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const printRef = useRef()

  const { data: order } = useOrder(orderId)
  const { data: item, isLoading, isError } = useOrderItem(itemId)
  const generateForm = useGenerateOrderForm()

  // Selected measurement categories (for custom size)
  const [selectedCategories, setSelectedCategories] = useState([])
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false)
  const [formDataForPreview, setFormDataForPreview] = useState(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      styleType: "original",
      styleTop: "",
      styleBottom: "",
      styleDupatta: "",
      colorType: "original",
      colorDetails: "",
      fabricType: "original",
      fabricDetails: "",
      measurements: {},
    },
  })

  const styleType = watch("styleType")
  const colorType = watch("colorType")
  const fabricType = watch("fabricType")

  // Toggle category selection
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Build form data object
  const buildFormData = (data) => {
    return {
      style: {
        type: data.styleType,
        details:
          data.styleType === CUSTOMIZATION_TYPE.CUSTOMIZED
            ? { top: data.styleTop, bottom: data.styleBottom, dupattaShawl: data.styleDupatta }
            : {},
        attachments: [],
      },
      color: {
        type: data.colorType,
        details: data.colorType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.colorDetails : "",
        attachments: [],
      },
      fabric: {
        type: data.fabricType,
        details: data.fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.fabricDetails : "",
        attachments: [],
      },
      measurementCategories: item?.sizeType === SIZE_TYPE.CUSTOM ? selectedCategories : [],
      measurements: item?.sizeType === SIZE_TYPE.CUSTOM ? data.measurements : {},
      generatedBy: user?.name,
    }
  }

  // Handle preview
  const handlePreview = () => {
    const data = getValues()
    const formData = buildFormData(data)
    setFormDataForPreview(formData)
    setShowPreview(true)
  }

  // Handle print/download
  const handlePrint = () => {
    const printContent = printRef.current
    const printWindow = window.open("", "_blank")
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Form - ${order?.orderNumber} - ${item?.productName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .text-slate-500 { color: #64748b; }
            .text-slate-600 { color: #475569; }
            .text-slate-700 { color: #334155; }
            .text-slate-900 { color: #0f172a; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-2xl { font-size: 1.5rem; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-center { text-align: center; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-8 { margin-top: 2rem; }
            .ml-1 { margin-left: 0.25rem; }
            .ml-2 { margin-left: 0.5rem; }
            .p-8 { padding: 2rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pt-4 { padding-top: 1rem; }
            .pt-6 { padding-top: 1.5rem; }
            .pl-4 { padding-left: 1rem; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .border-b-2 { border-bottom: 2px solid; }
            .border-t { border-top: 1px solid #e2e8f0; }
            .border-t-2 { border-top: 2px solid #cbd5e1; }
            .border-l-2 { border-left: 2px solid #cbd5e1; }
            .border-slate-900 { border-color: #0f172a; }
            .border-slate-300 { border-color: #cbd5e1; }
            .border-slate-400 { border-color: #94a3b8; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .gap-2 { gap: 0.5rem; }
            .gap-4 { gap: 1rem; }
            .gap-8 { gap: 2rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .max-w-3xl { max-width: 48rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            section { page-break-inside: avoid; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Handle form submission
  const onSubmit = (data) => {
    const formData = buildFormData(data)

    generateForm.mutate(
      { itemId, data: formData },
      {
        onSuccess: () => {
          toast.success("Order form generated successfully! You can now preview and download it.")
          setFormDataForPreview(formData)
          setShowPreview(true)
        },
        onError: () => {
          toast.error("Failed to generate order form")
        },
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

  const isCustomSize = item.sizeType === SIZE_TYPE.CUSTOM

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/orders/${orderId}/items/${itemId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Generate Order Form</h1>
          <p className="text-sm text-slate-500">
            {item.productName} • {isCustomSize ? "Custom Size" : `Size ${item.size}`}
          </p>
        </div>
      </div>

      {/* Form Type Indicator */}
      <div
        className={`p-4 rounded-lg flex items-center gap-3 ${
          isCustomSize ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"
        }`}
      >
        <FileText className={`h-5 w-5 ${isCustomSize ? "text-amber-600" : "text-green-600"}`} />
        <div>
          <p className="font-medium">{isCustomSize ? "Custom Order Form" : "Standard Order Form"}</p>
          <p className="text-sm text-slate-600">
            {isCustomSize
              ? "You will need to enter custom measurements for this item"
              : "Measurements will be auto-filled from the standard size chart"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Info (Read Only) */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Information
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Product</p>
              <p className="font-medium">{item.productName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">SKU</p>
              <p className="font-medium">{item.productSku}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Size</p>
              <p className="font-medium">{item.size}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Quantity</p>
              <p className="font-medium">{item.quantity}</p>
            </div>
          </div>
        </div>

        {/* Style Customization */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            Style
          </h3>
          <div className="space-y-4">
            <Controller
              name="styleType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="customized">Customized</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {styleType === "customized" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Top</Label>
                  <Textarea {...register("styleTop")} placeholder="Top customization..." rows={3} />
                </div>
                <div>
                  <Label>Bottom</Label>
                  <Textarea {...register("styleBottom")} placeholder="Bottom customization..." rows={3} />
                </div>
                <div>
                  <Label>Dupatta / Shawl</Label>
                  <Textarea {...register("styleDupatta")} placeholder="Dupatta/Shawl details..." rows={3} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Color Customization */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color
          </h3>
          <div className="space-y-4">
            <Controller
              name="colorType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="customized">Customized</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {colorType === "customized" && (
              <div className="pt-4 border-t">
                <Label>Color Details</Label>
                <Textarea {...register("colorDetails")} placeholder="Describe custom color..." rows={2} />
              </div>
            )}
          </div>
        </div>

        {/* Fabric Customization */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            Fabric
          </h3>
          <div className="space-y-4">
            <Controller
              name="fabricType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="customized">Customized</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {fabricType === "customized" && (
              <div className="pt-4 border-t">
                <Label>Fabric Details</Label>
                <Textarea {...register("fabricDetails")} placeholder="Describe custom fabric..." rows={2} />
              </div>
            )}
          </div>
        </div>

        {/* Custom Measurements (only for custom size) */}
        {isCustomSize && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Custom Measurements
            </h3>

            {/* Category Selection */}
            <div className="mb-6">
              <Label className="mb-3 block">Select Measurement Categories</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MEASUREMENT_CATEGORY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCategories.includes(option.value)
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(option.value)}
                      onCheckedChange={() => toggleCategory(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Measurement Inputs */}
            {selectedCategories.length > 0 && (
              <div className="space-y-6 pt-6 border-t">
                {selectedCategories.map((categoryId) => {
                  const category = getMeasurementCategoryById(categoryId)
                  if (!category) return null

                  return (
                    <div key={categoryId}>
                      <h4 className="font-medium text-slate-900 mb-4">{category.name}</h4>
                      {category.groups.map((group) => (
                        <div key={group.name} className="mb-4">
                          <p className="text-sm font-medium text-slate-600 mb-2">{group.name}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {group.measurements.map((measurement) => (
                              <div key={measurement.id}>
                                <Label className="text-xs">{measurement.label}</Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    {...register(`measurements.${measurement.id}`)}
                                    placeholder="0"
                                    className="pr-8"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                    "
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {selectedCategories.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                Select at least one category to enter measurements
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/orders/${orderId}/items/${itemId}`)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={isCustomSize && selectedCategories.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            type="submit"
            disabled={generateForm.isPending || (isCustomSize && selectedCategories.length === 0)}
          >
            {generateForm.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Generate Form
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Form Preview</span>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print / Download PDF
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div ref={printRef}>
            <OrderFormPreview
              order={order}
              item={item}
              formData={formDataForPreview}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}