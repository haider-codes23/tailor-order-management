import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useProduct, useCreateProduct, useUpdateProduct } from "../../../hooks/useProducts"
import { MAIN_GARMENTS, ADD_ONS, getPieceLabel } from "../../../constants/productConstants"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Checkbox } from "../../../components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import { Skeleton } from "../../../components/ui/skeleton"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { toast } from "sonner"

const PRODUCT_CATEGORIES = [
  { value: "Formal", label: "Formal" },
  { value: "Semi-Formal", label: "Semi-Formal" },
  { value: "Casual", label: "Casual" },
  { value: "Party Wear", label: "Party Wear" },
  { value: "Bridal", label: "Bridal" },
  { value: "Winter Collection", label: "Winter Collection" },
  { value: "Summer Collection", label: "Summer Collection" },
  { value: "Accessories", label: "Accessories" },
]

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const { data: product, isLoading: productLoading } = useProduct(id, {
    enabled: isEditMode,
  })

  console.log("Products: ", product);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "",
      base_price: "",
      image_url: "",
      shopify_product_id: "",
      shopify_variant_id: "",
      is_active: true,
      product_items: [],
      add_ons: [],
      discount: 0,
    },
  })

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  // Watch for price calculations
  const productItems = watch("product_items")
  const addOns = watch("add_ons")
  const discount = watch("discount")

  // Calculate totals
  const subtotal = [...(productItems || []), ...(addOns || [])].reduce(
    (sum, item) => sum + (parseFloat(item?.price) || 0),
    0
  )
  const totalPrice = subtotal - (parseFloat(discount) || 0)

  // Show toast when total changes
  useEffect(() => {
    if (subtotal > 0) {
      toast.info(`Total Price: PKR ${totalPrice.toLocaleString()}`, {
        id: "price-toast",
        duration: 2000,
      })
    }
  }, [totalPrice, subtotal])

  // Populate form when editing
  useEffect(() => {
    if (product?.data && isEditMode) {
      reset({
        name: product.data.name || "",
        sku: product.data.sku || "",
        description: product.data.description || "",
        category: product.data.category || "",
        base_price: product.data.base_price?.toString() || "",
        image_url: product.data.primary_image || product.data.image_url || "",
        shopify_product_id: product.data.shopify_product_id || "",
        shopify_variant_id: product.data.shopify_variant_id || "",
        is_active: product.data.is_active ?? true,
        product_items: product.data.product_items || [],
        add_ons: product.data.add_ons || [],
        discount: product.data.discount || 0,
      })
    }
  }, [product, isEditMode, reset])

  const onSubmit = async (data) => {
    try {
      // Validate at least one product item
      if (!data.product_items || data.product_items.length === 0) {
        toast.error("Please select at least one main garment")
        return
      }
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description || null,
        category: data.category,
        image_url: data.image_url || null,
        shopify_product_id: data.shopify_product_id || null,
        shopify_variant_id: data.shopify_variant_id || null,
        is_active: data.is_active,
        product_items: data.product_items.map((item) => ({
          piece: item.piece,
          price: parseFloat(item.price) || 0,
        })),
        add_ons: data.add_ons.map((item) => ({
          piece: item.piece,
          price: parseFloat(item.price) || 0,
        })),
        discount: parseFloat(data.discount) || 0,
      }

      let result
      if (isEditMode) {
        result = await updateProductMutation.mutateAsync({
          productId: id,
          updates: productData,
        })
      } else {
        result = await createProductMutation.mutateAsync(productData)
      }

      // Navigate to product detail page on success
      const productId = isEditMode ? id : (result.data?.id || result.id) // ✅ FIXED: result.id instead of result.data.id
      navigate(`/products/${productId}`)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  // Handle main garment checkbox change
  const handleMainGarmentChange = (pieceId, checked) => {
    const currentItems = watch("product_items") || []
    if (checked) {
      setValue("product_items", [...currentItems, { piece: pieceId, price: "" }])
    } else {
      setValue(
        "product_items",
        currentItems.filter((item) => item.piece !== pieceId)
      )
    }
  }

  // Handle add-on checkbox change
  const handleAddOnChange = (pieceId, checked) => {
    const currentAddOns = watch("add_ons") || []
    if (checked) {
      setValue("add_ons", [...currentAddOns, { piece: pieceId, price: "" }])
    } else {
      setValue(
        "add_ons",
        currentAddOns.filter((item) => item.piece !== pieceId)
      )
    }
  }

  // Check if a piece is selected
  const isMainGarmentSelected = (pieceId) => {
    return (watch("product_items") || []).some((item) => item.piece === pieceId)
  }

  const isAddOnSelected = (pieceId) => {
    return (watch("add_ons") || []).some((item) => item.piece === pieceId)
  }

  // Update price for a specific item
  const updateItemPrice = (type, pieceId, price) => {
    const fieldName = type === "main" ? "product_items" : "add_ons"
    const items = watch(fieldName) || []
    const updatedItems = items.map((item) =>
      item.piece === pieceId ? { ...item, price: price } : item
    )
    setValue(fieldName, updatedItems)
  }

  if (isEditMode && productLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/products")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Product" : "Create New Product"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? "Update product details and settings" : "Add a new product to your catalog"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Premium Lawn Suit"
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                placeholder="e.g., LAWN-001"
                disabled={isEditMode} // SKU cannot be changed in edit mode
                {...register("sku", { required: !isEditMode && "SKU is required" })}
              />
              {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
              {isEditMode && (
                <p className="text-sm text-gray-500">SKU cannot be changed after creation</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed product description..."
                rows={4}
                {...register("description")}
              />
            </div>

            {/* Category and Price - Side by Side */}
            <div className="grid grid-cols-1 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} key={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" placeholder="https://..." {...register("image_url")} />
            </div>
          </CardContent>
        </Card>

        {/* Product Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Composition</CardTitle>
            <CardDescription>
              Select the garments and add-ons included in this product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Garments */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Main Garments *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MAIN_GARMENTS.map((garment) => (
                  <div key={garment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`garment-${garment.id}`}
                      checked={isMainGarmentSelected(garment.id)}
                      onCheckedChange={(checked) => handleMainGarmentChange(garment.id, checked)}
                    />
                    <Label
                      htmlFor={`garment-${garment.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {garment.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price fields for selected main garments */}
              {(watch("product_items") || []).length > 0 && (
                <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">Set Prices for Selected Items</Label>
                  {(watch("product_items") || []).map((item, index) => (
                    <div key={item.piece} className="flex items-center gap-4">
                      <Label className="w-32 text-sm">{getPieceLabel(item.piece)}</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">PKR</span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-32"
                          value={item.price}
                          onChange={(e) => updateItemPrice("main", item.piece, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Add-ons (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADD_ONS.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${addon.id}`}
                      checked={isAddOnSelected(addon.id)}
                      onCheckedChange={(checked) => handleAddOnChange(addon.id, checked)}
                    />
                    <Label
                      htmlFor={`addon-${addon.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {addon.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Price fields for selected add-ons */}
              {(watch("add_ons") || []).length > 0 && (
                <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">
                    Set Prices for Add-ons (0 if included free)
                  </Label>
                  {(watch("add_ons") || []).map((item, index) => (
                    <div key={item.piece} className="flex items-center gap-4">
                      <Label className="w-32 text-sm">{getPieceLabel(item.piece)}</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">PKR</span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="w-32"
                          value={item.price}
                          onChange={(e) => updateItemPrice("addon", item.piece, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            {subtotal > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Discount (PKR)</span>
                  <Input type="number" placeholder="0" className="w-32" {...register("discount")} />
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Price</span>
                  <span className="text-primary">PKR {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopify Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Shopify Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Shopify Product ID */}
              <div className="space-y-2">
                <Label htmlFor="shopify_product_id">Shopify Product ID</Label>
                <Input
                  id="shopify_product_id"
                  placeholder="e.g., 7234567890"
                  {...register("shopify_product_id")}
                />
              </div>

              {/* Shopify Variant ID */}
              <div className="space-y-2">
                <Label htmlFor="shopify_variant_id">Shopify Variant ID</Label>
                <Input
                  id="shopify_variant_id"
                  placeholder="e.g., 42345678901"
                  {...register("shopify_variant_id")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-base">
                  Product Active
                </Label>
                <p className="text-sm text-gray-500">
                  Inactive products won't appear in order forms
                </p>
              </div>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProductMutation.isPending || updateProductMutation.isPending}
          >
            {createProductMutation.isPending || updateProductMutation.isPending
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
