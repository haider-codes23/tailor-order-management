import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { useProduct, useCreateProduct, useUpdateProduct } from "../../../hooks/useProducts"
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
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Skeleton } from "../../../components/ui/skeleton"

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

  const {
    register,
    handleSubmit,
    reset,
    control,
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
    },
  })

  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  // Populate form when editing
  useEffect(() => {
    if (product?.data && isEditMode) {
      reset({
        name: product.data.name || "",
        sku: product.data.sku || "",
        description: product.data.description || "",
        category: product.data.category || "",
        base_price: product.data.base_price?.toString() || "",
        image_url: product.data.image_url || "",
        shopify_product_id: product.data.shopify_product_id || "",
        shopify_variant_id: product.data.shopify_variant_id || "",
        is_active: product.data.is_active ?? true,
      })
    }
  }, [product, isEditMode, reset])

  const onSubmit = async (data) => {
  try {
    const productData = {
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      category: data.category,
      base_price: parseFloat(data.base_price),
      image_url: data.image_url || null,
      shopify_product_id: data.shopify_product_id || null,
      shopify_variant_id: data.shopify_variant_id || null,
      is_active: data.is_active,
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
    const productId = isEditMode ? id : result.id  // ✅ FIXED: result.id instead of result.data.id
    navigate(`/products/${productId}`)
  } catch (error) {
    // Error toast already shown by mutation
  }
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
          {isEditMode
            ? "Update product details and settings"
            : "Add a new product to your catalog"}
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
            <div className="grid grid-cols-2 gap-4">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="base_price">
                  Base Price (PKR) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5000"
                  {...register("base_price", {
                    required: "Base price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                />
                {errors.base_price && (
                  <p className="text-sm text-red-500">{errors.base_price.message}</p>
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
                  <Switch
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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