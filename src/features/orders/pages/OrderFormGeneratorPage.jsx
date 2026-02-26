import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useOrder, useOrderItem, useGenerateOrderForm } from "@/hooks/useOrders"
import { useProduct } from "@/hooks/useProducts"
import { useStandardSizeChart, useStandardHeightChart } from "@/hooks"
import { useProductMeasurementCharts } from "@/hooks/useProducts"
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
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Printer,
  Image as ImageIcon,
  Palette,
  Shirt,
  Paintbrush,
  Scissors,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import ImageUploader from "../components/ImageUploader"

// Garment categories config
const GARMENT_CATEGORIES = ["shirt", "bottom", "dupatta"]
const GARMENT_LABELS = {
  shirt: "Shirt",
  bottom: "Bottom",
  dupatta: "Dupatta / Hijab",
}
const GARMENT_FIELD_MAP = {
  shirt: {
    silhouette: "shirtSilhouette",
    dressColor: "shirtDressColor",
    front: "shirtFront",
    back: "shirtBack",
    embroidery: "shirtEmbroidery",
  },
  bottom: {
    silhouette: "bottomSilhouette",
    dressColor: "bottomDressColor",
    front: "bottomFront",
    back: "bottomBack",
    embroidery: "bottomEmbroidery",
  },
  dupatta: {
    silhouette: "dupattaSilhouette",
    dressColor: "dupattaDressColor",
    front: "dupattaFront",
    back: "dupattaBack",
    embroidery: "dupattaEmbroidery",
  },
}

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

  const order = orderData
  const item = itemData?.data
  // Fetch product-specific measurement charts
  const { data: productChartsData, isLoading: chartsLoading } = useProductMeasurementCharts(
    item?.productId,
    { enabled: !!item?.productId }
  )

  const productCharts = productChartsData?.data
  const sizeChartData = productCharts?.size_chart
  const heightChartData = productCharts?.height_chart
  const hasSizeChart = productCharts?.has_size_chart
  const hasHeightChart = productCharts?.has_height_chart
  const generateForm = useGenerateOrderForm()

  // Check if we're in edit mode
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"

  // Image upload states
  const [styleImage, setStyleImage] = useState(null)
  const [colorImage, setColorImage] = useState(null)
  const [fabricImage, setFabricImage] = useState(null)
  const [sketchImage, setSketchImage] = useState(null)

  // Fetch product details - only when item is loaded
  const { data: productData } = useProduct(item?.productId, {
    enabled: !!item?.productId,
  })
  const product = productData?.data

  const {
    control,
    handleSubmit,
    watch,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      styleType: CUSTOMIZATION_TYPE.ORIGINAL,
      styleDetails: "",
      colorType: CUSTOMIZATION_TYPE.ORIGINAL,
      colorDetails: "",
      fabricType: CUSTOMIZATION_TYPE.ORIGINAL,
      fabricDetails: "",
      notes: "",
      measurements: {},
      // Garment-specific customization notes
      shirtSilhouette: "",
      shirtDressColor: "",
      shirtFront: "",
      shirtBack: "",
      shirtEmbroidery: "",
      bottomSilhouette: "",
      bottomDressColor: "",
      bottomFront: "",
      bottomBack: "",
      bottomEmbroidery: "",
      dupattaSilhouette: "",
      dupattaDressColor: "",
      dupattaFront: "",
      dupattaBack: "",
      dupattaEmbroidery: "",
    },
  })

  // ======== Customization reactive watchers ========
  const styleType = watch("styleType")
  const colorType = watch("colorType")
  const fabricType = watch("fabricType")

  const isStyleCustomized = styleType === CUSTOMIZATION_TYPE.CUSTOMIZED
  const isColorCustomized = colorType === CUSTOMIZATION_TYPE.CUSTOMIZED
  const isFabricCustomized = fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED
  const hasAnyCustomization = isStyleCustomized || isColorCustomized || isFabricCustomized

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isEditMode && item?.orderForm) {
      const form = item.orderForm
      // Reset form with existing values
      reset({
        styleType: form.style?.type || CUSTOMIZATION_TYPE.ORIGINAL,
        styleDetails: form.style?.details || "",
        colorType: form.color?.type || CUSTOMIZATION_TYPE.ORIGINAL,
        colorDetails: form.color?.details || "",
        fabricType: form.fabric?.type || CUSTOMIZATION_TYPE.ORIGINAL,
        fabricDetails: form.fabric?.details || "",
        notes: form.notes || "",
        measurements: form.measurements || {},
        // Pre-fill garment notes
        shirtSilhouette: form.garmentNotes?.shirt?.silhouette || "",
        shirtDressColor: form.garmentNotes?.shirt?.dressColor || "",
        shirtFront: form.garmentNotes?.shirt?.front || "",
        shirtBack: form.garmentNotes?.shirt?.back || "",
        shirtEmbroidery: form.garmentNotes?.shirt?.embroidery || "",
        bottomSilhouette: form.garmentNotes?.bottom?.silhouette || "",
        bottomDressColor: form.garmentNotes?.bottom?.dressColor || "",
        bottomFront: form.garmentNotes?.bottom?.front || "",
        bottomBack: form.garmentNotes?.bottom?.back || "",
        bottomEmbroidery: form.garmentNotes?.bottom?.embroidery || "",
        dupattaSilhouette: form.garmentNotes?.dupatta?.silhouette || "",
        dupattaDressColor: form.garmentNotes?.dupatta?.dressColor || "",
        dupattaFront: form.garmentNotes?.dupatta?.front || "",
        dupattaBack: form.garmentNotes?.dupatta?.back || "",
        dupattaEmbroidery: form.garmentNotes?.dupatta?.embroidery || "",
      })
      // Set measurement categories
      if (form.selectedCategories) {
        setSelectedCategories(form.selectedCategories)
      }
      // Set images
      if (form.style?.image) setStyleImage(form.style.image)
      if (form.color?.image) setColorImage(form.color.image)
      if (form.fabric?.image) setFabricImage(form.fabric.image)
      if (form.sketchImage) setSketchImage(form.sketchImage)
    }
  }, [isEditMode, item?.orderForm, reset])

  const isStandardSize = item?.sizeType === SIZE_TYPE.STANDARD

  // Get product-specific size measurements from chart
  const sizeChartRows = sizeChartData?.rows || []
  const sizeRow = sizeChartRows.find((row) => row.size_code === item?.size)

  // Get enabled fields for this product
  const enabledSizeFields = productCharts?.enabled_size_fields || []

  // Extract only enabled measurement fields
  const standardSizeMeasurements = {}
  if (sizeRow && enabledSizeFields.length > 0) {
    enabledSizeFields.forEach((field) => {
      if (sizeRow[field] !== undefined && sizeRow[field] !== null) {
        standardSizeMeasurements[field] = sizeRow[field]
      }
    })
  }
  const sizeInfo = sizeRow ? { uk_size: sizeRow.uk_size, us_size: sizeRow.us_size } : {}

  const heightChartRows = heightChartData?.rows || []
  const enabledHeightFields = productCharts?.enabled_height_fields || []

  // Match height - try exact match first, then flexible match
  const heightRow =
    order?.clientHeight && hasHeightChart
      ? heightChartRows.find((row) => {
          if (row.height_range === order.clientHeight) return true
          const normalizeHeight = (str) => {
            if (!str) return ""
            return str
              .toLowerCase()
              .replace(/ft/g, "'")
              .replace(/in/g, "")
              .replace(/['"\s-]/g, "")
          }
          const extractNumbers = (str) => {
            if (!str) return ""
            const numbers = str.match(/\d+/g)
            return numbers ? numbers.join("") : ""
          }
          const normalizedRow = normalizeHeight(row.height_range)
          const normalizedOrder = normalizeHeight(order.clientHeight)
          if (normalizedRow === normalizedOrder) return true
          return extractNumbers(row.height_range) === extractNumbers(order.clientHeight)
        })
      : null

  // Extract only enabled height measurement fields
  const heightMeasurements = {}
  if (heightRow && enabledHeightFields.length > 0) {
    enabledHeightFields.forEach((field) => {
      if (heightRow[field] !== undefined && heightRow[field] !== null) {
        heightMeasurements[field] = heightRow[field]
      }
    })
  }
  const hasHeightMeasurements = Object.keys(heightMeasurements).length > 0

  // Handle category toggle for custom measurements
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  // Show toast if product doesn't have measurement charts configured
  useEffect(() => {
    if (item && productCharts !== undefined && isStandardSize) {
      if (!hasSizeChart) {
        toast.warning(
          "This product doesn't have a measurement size chart configured. The order form will be generated without standard measurements. Please configure measurements in Products → " +
            (product?.name || item?.productName) +
            " → Measurements tab.",
          { duration: 8000, id: "no-size-chart" }
        )
      }
    }
  }, [item, productCharts, isStandardSize, hasSizeChart, product?.name, item?.productName])

  const onSubmit = async (data) => {
    try {
      const formData = {
        orderNumber: order?.orderNumber,
        orderDate: order?.createdAt,
        fwdDate: order?.fwdDate,
        productionShipDate: order?.productionShippingDate,
        customerName: order?.customerName,
        destination: order?.destination,
        modesty: order?.modesty,
        productName: item?.productName || product?.name,
        sizeType: isStandardSize ? "Standard" : "Custom",
        size: item?.size,
        quantity: item?.quantity,
        notes: data.notes,
        generatedBy: user?.name || "System",
        style: {
          type: data.styleType,
          details: data.styleType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.styleDetails : null,
          image: data.styleType === CUSTOMIZATION_TYPE.CUSTOMIZED ? styleImage : null,
        },
        color: {
          type: data.colorType,
          details: data.colorType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.colorDetails : null,
          image: data.colorType === CUSTOMIZATION_TYPE.CUSTOMIZED ? colorImage : null,
        },
        fabric: {
          type: data.fabricType,
          details: data.fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED ? data.fabricDetails : null,
          image: data.fabricType === CUSTOMIZATION_TYPE.CUSTOMIZED ? fabricImage : null,
        },
        // CHANGED: Only include garment notes for customized types
        garmentNotes: {
          shirt: {
            silhouette: isStyleCustomized ? data.shirtSilhouette : "",
            dressColor: isColorCustomized ? data.shirtDressColor : "",
            front: isStyleCustomized || isFabricCustomized ? data.shirtFront : "",
            back: isStyleCustomized || isFabricCustomized ? data.shirtBack : "",
            embroidery: isFabricCustomized ? data.shirtEmbroidery : "",
          },
          bottom: {
            silhouette: isStyleCustomized ? data.bottomSilhouette : "",
            dressColor: isColorCustomized ? data.bottomDressColor : "",
            front: isStyleCustomized || isFabricCustomized ? data.bottomFront : "",
            back: isStyleCustomized || isFabricCustomized ? data.bottomBack : "",
            embroidery: isFabricCustomized ? data.bottomEmbroidery : "",
          },
          dupatta: {
            silhouette: isStyleCustomized ? data.dupattaSilhouette : "",
            dressColor: isColorCustomized ? data.dupattaDressColor : "",
            front: isStyleCustomized || isFabricCustomized ? data.dupattaFront : "",
            back: isStyleCustomized || isFabricCustomized ? data.dupattaBack : "",
            embroidery: isFabricCustomized ? data.dupattaEmbroidery : "",
          },
        },
        sketchImage: !isStandardSize ? sketchImage : null,
        productImage: productImage,
        isEditMode: isEditMode,
      }

      // Add measurements
      if (isStandardSize) {
        formData.measurements = {
          ...standardSizeMeasurements,
          ...(hasHeightMeasurements && heightMeasurements),
        }
        formData.standardSizeChart = hasSizeChart ? standardSizeMeasurements : null
        formData.heightChart = hasHeightMeasurements ? heightMeasurements : null
        formData.hasSizeChart = hasSizeChart
        formData.hasHeightChart = hasHeightChart && hasHeightMeasurements
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

    // Format shipping address
    const formatAddress = () => {
      const addr = order?.shippingAddress
      if (!addr) return order?.address || "—"
      const parts = [
        addr.street1,
        addr.street2,
        addr.city,
        addr.state,
        addr.postalCode,
        addr.country,
      ].filter(Boolean)
      return parts.join(", ") || "—"
    }

    // Check customization state from generated data for print
    const printIsStyleCustomized = generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
    const printIsColorCustomized = generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
    const printIsFabricCustomized =
      generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED
    const printHasAnyCustomization =
      printIsStyleCustomized || printIsColorCustomized || printIsFabricCustomized

    // Build garment details HTML conditionally for print
    const buildGarmentFieldsHTML = (category) => {
      const notes = generatedFormData?.garmentNotes?.[category]
      if (!notes) return ""
      let fields = ""
      if (printIsStyleCustomized) {
        fields += `<li><strong>Silhouette:</strong> ${notes.silhouette || "—"}</li>`
        fields += `<li><strong>Front:</strong> ${notes.front || "—"}</li>`
        fields += `<li><strong>Back:</strong> ${notes.back || "—"}</li>`
      }
      if (printIsColorCustomized) {
        fields += `<li><strong>Dress Color:</strong> ${notes.dressColor || "—"}</li>`
      }
      if (printIsFabricCustomized) {
        if (!printIsStyleCustomized) {
          fields += `<li><strong>Front:</strong> ${notes.front || "—"}</li>`
          fields += `<li><strong>Back:</strong> ${notes.back || "—"}</li>`
        }
        fields += `<li><strong>Embroidery/Adda Work:</strong> ${notes.embroidery || "—"}</li>`
      }
      return fields
    }

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Form - ${order?.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { font-size: 24px; font-weight: bold; }
          .header p { color: #64748b; }
          .section { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
          .section-title { font-weight: 600; font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .field label { font-size: 12px; color: #64748b; display: block; }
          .field p { font-weight: 600; font-size: 13px; }
          .product-section { display: flex; gap: 20px; }
          .product-image { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
          .product-placeholder { width: 100px; height: 100px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
          .measurements-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .measurement-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
          .measurement-item span:first-child { color: #64748b; }
          .measurement-item span:last-child { font-weight: 600; }
          .notes-section { background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
          .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; color: #64748b; font-size: 12px; }
          .customization-image { max-width: 150px; max-height: 150px; object-fit: cover; border-radius: 4px; margin-top: 8px; }
          .sketch-section img { max-width: 300px; border-radius: 4px; }
          .urgent-badge { background: #fef2f2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .source-badge { background: #f0f9ff; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
          .included-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
          .included-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; text-transform: capitalize; }
          .included-badge.green { background: #dcfce7; color: #166534; }
          .included-badge.amber { background: #fef3c7; color: #92400e; }
          @media print { body { padding: 0; } .section { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ORDER CONFIRMATION FORM</h1>
          <p>Order #${order?.orderNumber || ""}</p>
          ${order?.source ? `<span class="source-badge">${order.source}</span>` : ""}
          ${order?.shopifyOrderNumber ? `<span class="source-badge">Shopify: ${order.shopifyOrderNumber}</span>` : ""}
        </div>

        <div class="section">
          <div class="section-title">Order Information</div>
          <div class="grid">
            <div class="field"><label>Order No:</label><p>${order?.orderNumber || "—"}</p></div>
            <div class="field"><label>Order Date:</label><p>${order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p></div>
            <div class="field"><label>FWD Date:</label><p>${order?.fwdDate ? new Date(order.fwdDate).toLocaleDateString() : "—"}</p></div>
            <div class="field"><label>Expected Shipping Date:</label><p>${order?.actualShippingDate ? new Date(order.actualShippingDate).toLocaleDateString() : "To be confirmed"}</p></div>
            <div class="field"><label>Urgent:</label><p>${order?.urgent ? `<span class="urgent-badge">${order.urgent}</span>` : "No"}</p></div>
            <div class="field"><label>Order Source:</label><p>${order?.source || "Manual"}</p></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="grid">
            <div class="field"><label>Payment Status:</label><p>${order?.paymentStatus || "—"}</p></div>
            <div class="field"><label>Payment Method:</label><p>${order?.paymentMethod?.replace("_", " ") || "—"}</p></div>
            <div class="field"><label>Currency:</label><p>${order?.currency || "PKR"}</p></div>
            <div class="field"><label>Total Amount:</label><p>${order?.totalAmount?.toLocaleString() || "0"}</p></div>
            <div class="field"><label>Total Received:</label><p>${order?.totalReceived?.toLocaleString() || "0"}</p></div>
            <div class="field"><label>Remaining:</label><p>${order?.remainingAmount?.toLocaleString() || "0"}</p></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Client Information</div>
          <div class="grid">
            <div class="field"><label>Customer Name:</label><p>${order?.customerName || "—"}</p></div>
            <div class="field"><label>Email:</label><p>${order?.customerEmail || "—"}</p></div>
            <div class="field"><label>Phone:</label><p>${order?.customerPhone || "—"}</p></div>
            <div class="field"><label>Customer Height:</label><p>${order?.clientHeight || "—"}</p></div>
            <div class="field"><label>Modesty Requirement:</label><p>${order?.modesty || "NO"}</p></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Team Information</div>
          <div class="grid">
            <div class="field"><label>Fashion Consultant:</label><p>${order?.consultantName || "—"}</p></div>
            <div class="field"><label>Production Incharge:</label><p>${order?.productionInchargeName || order?.productionInCharge || "Not assigned"}</p></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Product Information</div>
          <div class="product-section">
            ${productImage ? `<img src="${productImage}" class="product-image" alt="Product" />` : `<div class="product-placeholder">No Image</div>`}
            <div class="grid-2" style="flex: 1;">
              <div class="field"><label>Product Name:</label><p>${item?.productName || product?.name || "—"}</p></div>
              <div class="field"><label>SKU:</label><p>${product?.sku || item?.productSku || "—"}</p></div>
              <div class="field"><label>Size Type:</label><p>${isStandardSize ? "Standard" : "Custom"}</p></div>
              <div class="field"><label>Size:</label><p>${isStandardSize ? item?.size : "Custom Measurements"}</p></div>
              <div class="field"><label>Quantity:</label><p>${item?.quantity || 1}</p></div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">What's Included</div>
          <div class="grid-2">
            <div class="field">
              <label>Included Items:</label>
              ${
                item?.includedItems && item.includedItems.length > 0
                  ? `<div class="included-items">${item.includedItems.map((i) => `<span class="included-badge green">${i.piece}</span>`).join("")}</div>`
                  : `<p>None specified</p>`
              }
            </div>
            <div class="field">
              <label>Selected Add-ons:</label>
              ${
                item?.selectedAddOns && item.selectedAddOns.length > 0
                  ? `<div class="included-items">${item.selectedAddOns.map((a) => `<span class="included-badge amber">${a.piece}</span>`).join("")}</div>`
                  : `<p>No add-ons selected</p>`
              }
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
              ${generatedFormData?.style?.image ? `<img src="${generatedFormData.style.image}" class="customization-image" alt="Style reference" />` : ""}
            </div>
            <div class="field">
              <label>Color:</label>
              <p>${generatedFormData?.color?.type || "Original"}</p>
              ${generatedFormData?.color?.details ? `<p style="font-size:11px;color:#64748b;">${generatedFormData.color.details}</p>` : ""}
              ${generatedFormData?.color?.image ? `<img src="${generatedFormData.color.image}" class="customization-image" alt="Color reference" />` : ""}
            </div>
            <div class="field">
              <label>Fabric:</label>
              <p>${generatedFormData?.fabric?.type || "Original"}</p>
              ${generatedFormData?.fabric?.details ? `<p style="font-size:11px;color:#64748b;">${generatedFormData.fabric.details}</p>` : ""}
              ${generatedFormData?.fabric?.image ? `<img src="${generatedFormData.fabric.image}" class="customization-image" alt="Fabric reference" />` : ""}
            </div>
          </div>
        </div>

        ${
          printHasAnyCustomization
            ? `
        <div class="section">
          <div class="section-title">Garment Details</div>
          <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
            ${GARMENT_CATEGORIES.map((cat) => {
              const notes = generatedFormData?.garmentNotes?.[cat]
              let content = ""
              if (printIsStyleCustomized) {
                content += `<p style="font-weight:600;color:#7c3aed;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin:8px 0 4px 0;">Style</p>`
                content += `<ul style="list-style-type:disc;padding-left:20px;font-size:11px;margin:0 0 6px 0;">`
                content += `<li>Silhouette: <strong>${notes?.silhouette || "—"}</strong></li>`
                content += `<li>Front: <strong>${notes?.front || "—"}</strong></li>`
                content += `<li>Back: <strong>${notes?.back || "—"}</strong></li>`
                content += `</ul>`
              }
              if (printIsColorCustomized) {
                content += `<p style="font-weight:600;color:#e11d48;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin:8px 0 4px 0;">Color</p>`
                content += `<ul style="list-style-type:disc;padding-left:20px;font-size:11px;margin:0 0 6px 0;">`
                content += `<li>Dress Color: <strong>${notes?.dressColor || "—"}</strong></li>`
                content += `</ul>`
              }
              if (printIsFabricCustomized) {
                content += `<p style="font-weight:600;color:#d97706;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin:8px 0 4px 0;">Fabric</p>`
                content += `<ul style="list-style-type:disc;padding-left:20px;font-size:11px;margin:0 0 6px 0;">`
                if (!printIsStyleCustomized) {
                  content += `<li>Front: <strong>${notes?.front || "—"}</strong></li>`
                  content += `<li>Back: <strong>${notes?.back || "—"}</strong></li>`
                }
                content += `<li>Embroidery/Adda Work: <strong>${notes?.embroidery || "—"}</strong></li>`
                content += `</ul>`
              }
              return `
              <div class="field">
                <label style="font-weight:600;font-size:13px;">${GARMENT_LABELS[cat]}</label>
                ${content}
              </div>`
            }).join("")}
          </div>
        </div>
        `
            : ""
        }

        ${
          isStandardSize
            ? `
          <div class="section">
            <div class="section-title">Standard Size Measurements (${item?.size})</div>
            ${
              Object.keys(standardSizeMeasurements).length > 0
                ? `
            <div class="measurements-grid">
              ${Object.entries(standardSizeMeasurements)
                .map(
                  ([key, value]) => `
                <div class="measurement-item"><span>${key.replace(/_/g, " ")}</span><span>${value}"</span></div>
              `
                )
                .join("")}
            </div>`
                : `<p style="color:#64748b;font-size:12px;">No size chart configured for this product</p>`
            }
            ${
              heightMeasurements && Object.keys(heightMeasurements).length > 0
                ? `
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;">
                <div style="font-weight:500;margin-bottom:8px;">Height-Based Measurements (${order?.clientHeight})</div>
                <div class="measurements-grid">
                  ${Object.entries(heightMeasurements)
                    .map(
                      ([key, value]) => `
                    <div class="measurement-item"><span>${key.replace(/_/g, " ")}</span><span>${value}"</span></div>
                  `
                    )
                    .join("")}
                </div>
              </div>`
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
                        return `<div class="measurement-item"><span>${measurement?.label || measurementId}</span><span>${value}"</span></div>`
                      })
                      .join("")}
                  </div>
                </div>`
              })
              .join("")}
          `
              : ""
          }
        `
        }

        ${
          generatedFormData?.sketchImage
            ? `
          <div class="section sketch-section">
            <div class="section-title">Design Sketch</div>
            <img src="${generatedFormData.sketchImage}" alt="Design sketch" />
          </div>`
            : ""
        }

        <div class="section">
          <div class="section-title">Shipping Details</div>
          <div class="grid">
            <div class="field"><label>Destination:</label><p>${order?.destination || "—"}</p></div>
            <div class="field" style="grid-column: span 2;"><label>Full Address:</label><p>${formatAddress()}</p></div>
            <div class="field"><label>Tracking ID:</label><p>${order?.preTrackingId || "Not assigned"}</p></div>
          </div>
        </div>

        ${
          generatedFormData?.notes || order?.notes
            ? `
          <div class="notes-section">
            <div class="section-title" style="border:none;margin-bottom:8px;padding-bottom:0;">Additional Notes</div>
            <p style="font-size:13px;">${generatedFormData?.notes || ""}</p>
            ${order?.notes ? `<p style="font-size:12px;color:#92400e;margin-top:8px;"><strong>Order Notes:</strong> ${order.notes}</p>` : ""}
          </div>`
            : ""
        }

        <div class="footer">
          <p>Please confirm these details are correct.</p>
          <p>Generated on ${new Date().toLocaleString()} by ${user?.name || "System"}</p>
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

  if (orderLoading || itemLoading || chartsLoading) {
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
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Order Form" : "Generate Order Form"}
          </h1>
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
            {hasSizeChart && Object.keys(standardSizeMeasurements).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Standard Size Measurements</CardTitle>
                  <CardDescription>
                    Product-specific measurements for size {item.size}
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
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">No Size Chart Configured</CardTitle>
                  <CardDescription className="text-yellow-700">
                    This product doesn't have a measurement size chart. The order form will be
                    generated without standard measurements.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-600">
                    To add measurements, go to Products → {product?.name || item?.productName} →
                    Measurements tab.
                  </p>
                </CardContent>
              </Card>
            )}
            {hasHeightChart && hasHeightMeasurements && (
              <Card>
                <CardHeader>
                  <CardTitle>Height-Based Measurements</CardTitle>
                  <CardDescription>Based on customer height: {order?.clientHeight}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(heightMeasurements).map(([key, value]) => (
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

        {/* ====================================================== */}
        {/* REDESIGNED Customization Options Section                */}
        {/* ====================================================== */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-violet-600" />
              Customization Options
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select which aspects are customized. Garment detail fields appear based on your
              selections.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* 3 visual selector cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Style Card */}
              <div
                className={`rounded-xl border-2 p-4 transition-all ${isStyleCustomized ? "border-violet-400 bg-violet-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${isStyleCustomized ? "bg-violet-100" : "bg-slate-100"}`}
                    >
                      <Shirt
                        className={`h-4 w-4 ${isStyleCustomized ? "text-violet-600" : "text-slate-500"}`}
                      />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">Style</span>
                  </div>
                  {isStyleCustomized && (
                    <Badge
                      variant="outline"
                      className="bg-violet-100 text-violet-700 border-violet-300 text-xs"
                    >
                      Customized
                    </Badge>
                  )}
                </div>
                <Controller
                  name="styleType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={isStyleCustomized ? "border-violet-300" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {isStyleCustomized && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-violet-200">
                    <div>
                      <Label className="text-xs text-violet-700">Style Details</Label>
                      <Controller
                        name="styleDetails"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Describe style changes"
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-violet-700">Style Reference Image</Label>
                      <ImageUploader
                        value={styleImage}
                        onChange={setStyleImage}
                        label="Upload style reference"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Card */}
              <div
                className={`rounded-xl border-2 p-4 transition-all ${isColorCustomized ? "border-rose-400 bg-rose-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${isColorCustomized ? "bg-rose-100" : "bg-slate-100"}`}
                    >
                      <Palette
                        className={`h-4 w-4 ${isColorCustomized ? "text-rose-600" : "text-slate-500"}`}
                      />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">Color</span>
                  </div>
                  {isColorCustomized && (
                    <Badge
                      variant="outline"
                      className="bg-rose-100 text-rose-700 border-rose-300 text-xs"
                    >
                      Customized
                    </Badge>
                  )}
                </div>
                <Controller
                  name="colorType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={isColorCustomized ? "border-rose-300" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {isColorCustomized && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-rose-200">
                    <div>
                      <Label className="text-xs text-rose-700">Color Details</Label>
                      <Controller
                        name="colorDetails"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Describe color changes"
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-rose-700">Color Reference Image</Label>
                      <ImageUploader
                        value={colorImage}
                        onChange={setColorImage}
                        label="Upload color reference"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Fabric Card */}
              <div
                className={`rounded-xl border-2 p-4 transition-all ${isFabricCustomized ? "border-amber-400 bg-amber-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${isFabricCustomized ? "bg-amber-100" : "bg-slate-100"}`}
                    >
                      <Scissors
                        className={`h-4 w-4 ${isFabricCustomized ? "text-amber-600" : "text-slate-500"}`}
                      />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">Fabric</span>
                  </div>
                  {isFabricCustomized && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700 border-amber-300 text-xs"
                    >
                      Customized
                    </Badge>
                  )}
                </div>
                <Controller
                  name="fabricType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={isFabricCustomized ? "border-amber-300" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CUSTOMIZATION_TYPE.ORIGINAL}>Original</SelectItem>
                        <SelectItem value={CUSTOMIZATION_TYPE.CUSTOMIZED}>Customized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {isFabricCustomized && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-amber-200">
                    <div>
                      <Label className="text-xs text-amber-700">Fabric Details</Label>
                      <Controller
                        name="fabricDetails"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Describe fabric changes"
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-amber-700">Fabric Reference Image</Label>
                      <ImageUploader
                        value={fabricImage}
                        onChange={setFabricImage}
                        label="Upload fabric reference"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Garment Detail Fields - conditional */}
            {hasAnyCustomization ? (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-4 w-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Garment Details</h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    Fields marked * are required
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {GARMENT_CATEGORIES.map((category) => {
                    const fm = GARMENT_FIELD_MAP[category]
                    const label = GARMENT_LABELS[category]

                    return (
                      <div
                        key={category}
                        className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                      >
                        <h4 className="font-semibold text-slate-800 text-sm border-b border-slate-200 pb-2">
                          {label}
                        </h4>

                        {/* Style fields: Silhouette, Front, Back */}
                        {isStyleCustomized && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-medium text-violet-600 uppercase tracking-wide">
                              Style
                            </p>
                            <div>
                              <Label className="text-xs">Silhouette *</Label>
                              <Input
                                {...register(fm.silhouette, {
                                  required: `${label} silhouette is required`,
                                })}
                                placeholder="Enter silhouette details"
                                className="text-sm h-8"
                              />
                              {errors[fm.silhouette] && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {errors[fm.silhouette].message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs">Front *</Label>
                              <Input
                                {...register(fm.front, {
                                  validate: (v) =>
                                    (isStyleCustomized || isFabricCustomized) && !v
                                      ? `${label} front details are required`
                                      : true,
                                })}
                                placeholder="Enter front details"
                                className="text-sm h-8"
                              />
                              {errors[fm.front] && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {errors[fm.front].message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-xs">Back *</Label>
                              <Input
                                {...register(fm.back, {
                                  validate: (v) =>
                                    (isStyleCustomized || isFabricCustomized) && !v
                                      ? `${label} back details are required`
                                      : true,
                                })}
                                placeholder="Enter back details"
                                className="text-sm h-8"
                              />
                              {errors[fm.back] && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {errors[fm.back].message}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Color fields: Dress Color */}
                        {isColorCustomized && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-medium text-rose-600 uppercase tracking-wide">
                              Color
                            </p>
                            <div>
                              <Label className="text-xs">Dress Color *</Label>
                              <Input
                                {...register(fm.dressColor, {
                                  required: `${label} dress color is required`,
                                })}
                                placeholder="Enter dress color"
                                className="text-sm h-8"
                              />
                              {errors[fm.dressColor] && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {errors[fm.dressColor].message}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Fabric fields: Front, Back (if Style not customized), Embroidery */}
                        {isFabricCustomized && (
                          <div className="space-y-2">
                            <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wide">
                              Fabric
                            </p>
                            {!isStyleCustomized && (
                              <>
                                <div>
                                  <Label className="text-xs">Front *</Label>
                                  <Input
                                    {...register(fm.front, {
                                      required: `${label} front details are required`,
                                    })}
                                    placeholder="Enter front details"
                                    className="text-sm h-8"
                                  />
                                  {errors[fm.front] && (
                                    <p className="text-xs text-red-500 mt-0.5">
                                      {errors[fm.front].message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Label className="text-xs">Back *</Label>
                                  <Input
                                    {...register(fm.back, {
                                      required: `${label} back details are required`,
                                    })}
                                    placeholder="Enter back details"
                                    className="text-sm h-8"
                                  />
                                  {errors[fm.back] && (
                                    <p className="text-xs text-red-500 mt-0.5">
                                      {errors[fm.back].message}
                                    </p>
                                  )}
                                </div>
                              </>
                            )}
                            <div>
                              <Label className="text-xs">Embroidery / Adda Work *</Label>
                              <Input
                                {...register(fm.embroidery, {
                                  required: `${label} embroidery details are required`,
                                })}
                                placeholder="Enter embroidery/adda work details"
                                className="text-sm h-8"
                              />
                              {errors[fm.embroidery] && (
                                <p className="text-xs text-red-500 mt-0.5">
                                  {errors[fm.embroidery].message}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="border-t pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Paintbrush className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No customizations selected</p>
                  <p className="text-xs mt-1">
                    Select "Customized" for Style, Color, or Fabric above to enter garment details
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sketch Upload - Only for Custom Size */}
        {!isStandardSize && (
          <Card>
            <CardHeader>
              <CardTitle>Sketch / Design Reference</CardTitle>
              <CardDescription>
                Upload a sketch or design reference for the custom order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={sketchImage}
                onChange={setSketchImage}
                label="Upload sketch or design image"
                className="max-w-md"
              />
            </CardContent>
          </Card>
        )}

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
                {isEditMode ? "Updating..." : "Generating..."}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {isEditMode ? "Update Form" : "Generate Form"}
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
                  <span className="text-slate-600">Expected Shipping Date:</span>
                  <p className="font-semibold text-slate-900">
                    {order?.actualShippingDate
                      ? new Date(order.actualShippingDate).toLocaleDateString()
                      : "To be confirmed"}
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

            {/* Section 2: Client & Team */}
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

            {/* Section 3: Product Info */}
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

            {/* What's Included */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600 text-sm">Included Items:</span>
                  {item?.includedItems && item.includedItems.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.includedItems.map((included, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize"
                        >
                          {included.piece}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">None specified</p>
                  )}
                </div>
                <div>
                  <span className="text-slate-600 text-sm">Selected Add-ons:</span>
                  {item?.selectedAddOns && item.selectedAddOns.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedAddOns.map((addon, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize"
                        >
                          {addon.piece}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No add-ons selected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Customization Options */}
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
                  {generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                    <>
                      {generatedFormData?.style?.details && (
                        <p className="text-slate-600 mt-1 text-xs">
                          {generatedFormData.style.details}
                        </p>
                      )}
                      {generatedFormData?.style?.image && (
                        <img
                          src={generatedFormData.style.image}
                          alt="Style reference"
                          className="mt-2 w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </>
                  )}
                </div>
                <div>
                  <span className="text-slate-600">Color:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {generatedFormData?.color?.type || "Original"}
                  </p>
                  {generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                    <>
                      {generatedFormData?.color?.details && (
                        <p className="text-slate-600 mt-1 text-xs">
                          {generatedFormData.color.details}
                        </p>
                      )}
                      {generatedFormData?.color?.image && (
                        <img
                          src={generatedFormData.color.image}
                          alt="Color reference"
                          className="mt-2 w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </>
                  )}
                </div>
                <div>
                  <span className="text-slate-600">Fabric:</span>
                  <p className="font-semibold text-slate-900 capitalize">
                    {generatedFormData?.fabric?.type || "Original"}
                  </p>
                  {generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                    <>
                      {generatedFormData?.fabric?.details && (
                        <p className="text-slate-600 mt-1 text-xs">
                          {generatedFormData.fabric.details}
                        </p>
                      )}
                      {generatedFormData?.fabric?.image && (
                        <img
                          src={generatedFormData.fabric.image}
                          alt="Fabric reference"
                          className="mt-2 w-24 h-24 object-cover rounded border"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CHANGED: Garment Details - only shown when customizations exist */}
            {hasAnyCustomization && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Garment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {GARMENT_CATEGORIES.map((category) => {
                    const notes = generatedFormData?.garmentNotes?.[category]
                    const label = GARMENT_LABELS[category]
                    return (
                      <div key={category}>
                        <h4 className="font-medium text-slate-800 mb-2">{label}</h4>
                        <div className="space-y-1 text-sm">
                          {generatedFormData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                            <>
                              <p>
                                <span className="text-violet-500">Silhouette:</span>{" "}
                                {notes?.silhouette || "—"}
                              </p>
                              <p>
                                <span className="text-violet-500">Front:</span>{" "}
                                {notes?.front || "—"}
                              </p>
                              <p>
                                <span className="text-violet-500">Back:</span> {notes?.back || "—"}
                              </p>
                            </>
                          )}
                          {generatedFormData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                            <p>
                              <span className="text-rose-500">Dress Color:</span>{" "}
                              {notes?.dressColor || "—"}
                            </p>
                          )}
                          {generatedFormData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED && (
                            <>
                              {generatedFormData?.style?.type !== CUSTOMIZATION_TYPE.CUSTOMIZED && (
                                <>
                                  <p>
                                    <span className="text-amber-500">Front:</span>{" "}
                                    {notes?.front || "—"}
                                  </p>
                                  <p>
                                    <span className="text-amber-500">Back:</span>{" "}
                                    {notes?.back || "—"}
                                  </p>
                                </>
                              )}
                              <p>
                                <span className="text-amber-500">Embroidery/Adda:</span>{" "}
                                {notes?.embroidery || "—"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Measurements - Standard */}
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

            {/* Measurements - Custom */}
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

            {/* Sketch */}
            {generatedFormData?.sketchImage && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-200">
                  Design Sketch
                </h3>
                <img
                  src={generatedFormData.sketchImage}
                  alt="Design sketch"
                  className="max-w-xs rounded border"
                />
              </div>
            )}

            {/* Shipping */}
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
