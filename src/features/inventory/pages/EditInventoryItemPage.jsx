import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { useInventoryItem, useUpdateInventoryItem } from "@/hooks/useInventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Trash2, Loader2, AlertCircle, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * Edit Inventory Item Page
 *
 * This form loads an existing inventory item and allows editing all its properties.
 * Like the create form, it handles both simple items and variant items dynamically.
 *
 * Key Differences from Create Form:
 * - Fetches existing item data using useInventoryItem hook
 * - Pre-populates form fields with existing values
 * - Preserves variant IDs when updating ready stock items
 * - Uses useUpdateInventoryItem mutation instead of create
 * - Category cannot be changed once set (structural constraint)
 */
export default function EditInventoryItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const updateItem = useUpdateInventoryItem()

  // Fetch the existing item data
  const { data: itemData, isLoading: itemLoading, isError: itemError, error } = useInventoryItem(id)

  // Track if form has been initialized with item data
  const [formInitialized, setFormInitialized] = useState(false)

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      description: "",
      unit: "",
      unit_price: "",
      base_price: "",
      remaining_stock: "",
      reorder_level: "",
      reorder_amount: "",
      vendor_name: "",
      vendor_contact: "",
      rack_location: "",
      image_url: "",
      notes: "",
      variants: [],
    },
  })

  // Manage dynamic size variant fields
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
  })

  // Extract item from response
  const item = itemData?.data
  const isVariantCategory = item?.has_variants || false

  /**
   * Initialize form with existing item data
   * This effect runs once when item data is successfully loaded
   */
  useEffect(() => {
    if (item && !formInitialized) {
      // Prepare form values from item data
      const formValues = {
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        description: item.description || "",
        unit: item.unit || "",
        unit_price: item.unit_price || "",
        base_price: item.base_price || "",
        remaining_stock: item.remaining_stock || "",
        reorder_level: item.reorder_level || "",
        reorder_amount: item.reorder_amount || "",
        vendor_name: item.vendor_name || "",
        vendor_contact: item.vendor_contact || "",
        rack_location: item.rack_location || "",
        image_url: item.image_url || "",
        notes: item.notes || "",
        variants: item.variants || [],
      }

      // Reset form with loaded values
      reset(formValues)

      // If item has variants, replace the variants array
      if (item.variants && item.variants.length > 0) {
        replace(item.variants)
      }

      setFormInitialized(true)
    }
  }, [item, formInitialized, reset, replace])

  /**
   * Form submission handler
   * Builds the update payload and submits to the API
   */
  const onSubmit = (data) => {
    // Build the updates object
    const updates = {
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      description: data.description.trim(),
      unit: data.unit.trim(),
      vendor_name: data.vendor_name.trim(),
      vendor_contact: data.vendor_contact.trim(),
      rack_location: data.rack_location.trim(),
      image_url: data.image_url.trim(),
      notes: data.notes.trim(),
    }

    // Add category-specific fields
    if (isVariantCategory) {
      updates.base_price = parseFloat(data.base_price) || 0
      updates.variants = data.variants.map((variant) => ({
        variant_id: variant.variant_id, // Preserve existing variant ID
        size: variant.size.trim(),
        sku: variant.sku || `${data.sku.trim().toUpperCase()}-${variant.size.trim().toUpperCase()}`,
        remaining_stock: parseInt(variant.remaining_stock) || 0,
        reorder_level: parseInt(variant.reorder_level) || 1,
        reorder_amount: parseFloat(data.reorder_amount) || 0,
        price: parseFloat(variant.price) || parseFloat(data.base_price) || 0,
        image_url: variant.image_url || data.image_url.trim(),
      }))
    } else {
      updates.unit_price = parseFloat(data.unit_price) || 0
      updates.remaining_stock = parseFloat(data.remaining_stock) || 0
      updates.reorder_level = parseFloat(data.reorder_level) || 0
      updates.reorder_amount = parseFloat(data.reorder_amount) || 0
    }

    // Submit the mutation
    updateItem.mutate(
      { itemId: parseInt(id), updates },
      {
        onSuccess: () => {
          toast({
            title: "Changes Saved",
            description: `Successfully updated ${data.name}`,
          })
          // Navigate back to detail page
          navigate(`/inventory/${id}`)
        },
        onError: (error) => {
          toast({
            title: "Failed to Save Changes",
            description: error.message || "An error occurred while updating the inventory item",
            variant: "destructive",
          })
        },
      }
    )
  }

  /**
   * Loading state while fetching item data
   */
  if (itemLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading item data...</p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Error state if item doesn't exist or fetch failed
   */
  if (itemError) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/inventory")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || "Failed to load inventory item"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!item) {
    return null
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/inventory/${id}`)}
          className="mb-4"
          disabled={updateItem.isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Inventory Item</h1>
            <p className="text-muted-foreground mt-1">Update details for {item.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the inventory item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Tissue Silk, Champagne Karti"
                {...register("name", {
                  required: "Item name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                disabled={updateItem.isPending}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU (Stock Keeping Unit) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                placeholder="e.g., FAB-TISSUE-001"
                {...register("sku", {
                  required: "SKU is required",
                  pattern: {
                    value: /^[A-Z0-9-]+$/i,
                    message: "SKU can only contain letters, numbers, and hyphens",
                  },
                })}
                disabled={updateItem.isPending}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>

            {/* Category - Display Only (Cannot Be Changed) */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {item.category.replace("_", " ")}
              </div>
              <p className="text-xs text-muted-foreground">
                Category cannot be changed after creation
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description..."
                rows={3}
                {...register("description")}
                disabled={updateItem.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Measurement Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Measurement</CardTitle>
            <CardDescription>Unit of measurement and pricing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit of Measurement <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit"
                placeholder="e.g., Yard, Gram, Piece"
                {...register("unit", { required: "Unit is required" })}
                disabled={updateItem.isPending}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
            </div>

            {/* Conditional Price Field */}
            {isVariantCategory ? (
              <div className="space-y-2">
                <Label htmlFor="base_price">
                  Base Price (PKR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("base_price", {
                    required: "Base price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                  disabled={updateItem.isPending}
                />
                {errors.base_price && (
                  <p className="text-sm text-destructive">{errors.base_price.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="unit_price">
                  Unit Price (PKR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("unit_price", {
                    required: "Unit price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                  disabled={updateItem.isPending}
                />
                {errors.unit_price && (
                  <p className="text-sm text-destructive">{errors.unit_price.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Information - Only for Simple Items */}
        {!isVariantCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
              <CardDescription>Current stock levels and reorder thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remaining_stock">
                    Current Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="remaining_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("remaining_stock", {
                      required: "Stock is required",
                      min: { value: 0, message: "Stock cannot be negative" },
                    })}
                    disabled={updateItem.isPending}
                  />
                  {errors.remaining_stock && (
                    <p className="text-sm text-destructive">{errors.remaining_stock.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use Stock In/Out buttons for tracking changes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder_level">
                    Reorder Level <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("reorder_level", {
                      required: "Reorder level is required",
                      min: { value: 0, message: "Reorder level cannot be negative" },
                    })}
                    disabled={updateItem.isPending}
                  />
                  {errors.reorder_level && (
                    <p className="text-sm text-destructive">{errors.reorder_level.message}</p>
                  )}
                </div>
                {/* Reorder Amount - NEW FIELD */}
                <div className="space-y-2">
                  <Label htmlFor="reorder_amount">
                    Reorder Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reorder_amount"
                    type="number"
                    step="1"
                    min="1"
                    placeholder="100"
                    {...register("reorder_amount", {
                      required: "Reorder amount is required",
                      min: { value: 1, message: "Reorder amount must be at least 1" },
                    })}
                    disabled={updateItem.isPending}
                  />
                  {errors.reorder_amount && (
                    <p className="text-sm text-destructive">{errors.reorder_amount.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">How much to order when restocking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Size Variants - Only for Ready Stock */}
        {isVariantCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Size Variants</CardTitle>
              <CardDescription>Manage available sizes and their stock levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Size {watch(`variants.${index}.size`)}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={updateItem.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Input
                        {...register(`variants.${index}.size`, { required: true })}
                        disabled={updateItem.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.remaining_stock`, {
                          valueAsNumber: true,
                        })}
                        disabled={updateItem.isPending}
                      />
                      <p className="text-xs text-muted-foreground">Use Stock In for tracking</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Reorder At</Label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.reorder_level`, {
                          valueAsNumber: true,
                        })}
                        disabled={updateItem.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price (PKR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`variants.${index}.price`)}
                        disabled={updateItem.isPending}
                      />
                    </div>
                  </div>

                  {/* Hidden field to preserve variant_id */}
                  <input type="hidden" {...register(`variants.${index}.variant_id`)} />
                  <input type="hidden" {...register(`variants.${index}.sku`)} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Vendor & Location Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor & Location</CardTitle>
            <CardDescription>Supplier information and storage location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input
                id="vendor_name"
                {...register("vendor_name")}
                disabled={updateItem.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_contact">Vendor Contact</Label>
              <Input
                id="vendor_contact"
                {...register("vendor_contact")}
                disabled={updateItem.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rack_location">Rack Location</Label>
              <Input
                id="rack_location"
                {...register("rack_location")}
                disabled={updateItem.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visual Reference Card */}
        <Card>
          <CardHeader>
            <CardTitle>Visual Reference</CardTitle>
            <CardDescription>Image and additional notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                {...register("image_url")}
                disabled={updateItem.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                {...register("notes")}
                disabled={updateItem.isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/inventory/${id}`)}
            disabled={updateItem.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateItem.isPending}>
            {updateItem.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
