import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreateInventoryItem } from "@/hooks/useInventory"
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
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * Create Inventory Item Page
 *
 * This form handles creating both simple inventory items (fabrics, materials)
 * and complex variant items (ready stock with multiple sizes). The form
 * dynamically adapts based on the selected category.
 *
 * Form Structure:
 * - Basic Information (name, SKU, category, description)
 * - Pricing & Measurement (unit, unit_price/base_price)
 * - Stock Information (for simple items: stock + reorder level)
 * - Size Variants (for ready stock: dynamic array of size configurations)
 * - Vendor & Location (vendor details, rack location)
 * - Visual Reference (image URL)
 *
 * The form uses react-hook-form for state management and validation,
 * and our existing useCreateInventoryItem mutation hook for submission.
 */
export default function CreateInventoryItemPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createItem = useCreateInventoryItem()

  // Track selected category to show/hide relevant fields
  const [selectedCategory, setSelectedCategory] = useState("")

  // Determine if this category requires size variants
  const isVariantCategory =
    selectedCategory === "READY_STOCK" || selectedCategory === "READY_SAMPLE"

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      variants: [
        { size: "S", remaining_stock: 0, reorder_level: 1, price: "" },
        { size: "M", remaining_stock: 0, reorder_level: 1, price: "" },
        { size: "L", remaining_stock: 0, reorder_level: 1, price: "" },
        { size: "XL", remaining_stock: 0, reorder_level: 1, price: "" },
      ],
    },
  })

  // Manage dynamic size variant fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  })

  /**
   * Handle category change
   * Updates local state to trigger conditional field rendering
   */
  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setValue("category", value)
  }

  /**
   * Form submission handler
   * Transforms form data into the format expected by the API,
   * handling both simple items and variant items appropriately
   */
  const onSubmit = (data) => {
    // Build the item data object based on category type
    const itemData = {
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category: data.category,
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
      // For ready stock/sample: add base price and variants
      itemData.base_price = parseFloat(data.base_price) || 0
      itemData.variants = data.variants.map((variant, index) => ({
        size: variant.size.trim(),
        sku: `${data.sku.trim().toUpperCase()}-${variant.size.trim().toUpperCase()}`,
        remaining_stock: parseInt(variant.remaining_stock) || 0,
        reorder_level: parseInt(variant.reorder_level) || 1,
        reorder_amount: parseFloat(data.reorder_amount) || 0,
        price: parseFloat(variant.price) || parseFloat(data.base_price) || 0,
        image_url: data.image_url.trim(), // Same image for all variants initially
      }))
    } else {
      // For simple items: add unit price and stock levels
      itemData.unit_price = parseFloat(data.unit_price) || 0
      itemData.remaining_stock = parseFloat(data.remaining_stock) || 0
      itemData.reorder_level = parseFloat(data.reorder_level) || 0,
      itemData.reorder_amount = parseFloat(data.reorder_amount) || 0
    }

    // Submit the mutation
    createItem.mutate(itemData, {
      onSuccess: (result) => {
        toast({
          title: "Inventory Item Created",
          description: `Successfully created ${result.data.name}`,
        })
        // Navigate to the newly created item's detail page
        navigate(`/inventory/${result.data.id}`)
      },
      onError: (error) => {
        toast({
          title: "Failed to Create Item",
          description: error.message || "An error occurred while creating the inventory item",
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/inventory")}
          className="mb-4"
          disabled={createItem.isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Inventory Item</h1>
            <p className="text-muted-foreground mt-1">
              Create a new material, fabric, or ready stock item
            </p>
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
                placeholder="e.g., Tissue Silk, Champagne Karti, GOLDESS Luxury Ensemble"
                {...register("name", {
                  required: "Item name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                disabled={createItem.isPending}
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
                placeholder="e.g., FAB-TISSUE-001, ADA-KARTI-013, RS-GOLDESS-043"
                {...register("sku", {
                  required: "SKU is required",
                  pattern: {
                    value: /^[A-Z0-9-]+$/i,
                    message: "SKU can only contain letters, numbers, and hyphens",
                  },
                })}
                disabled={createItem.isPending}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
              <p className="text-xs text-muted-foreground">
                Unique identifier for this item. Use format: CATEGORY-NAME-NUMBER
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                disabled={createItem.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FABRIC">Fabric</SelectItem>
                  <SelectItem value="MULTI_HEAD">Multi-Head Embroidery</SelectItem>
                  <SelectItem value="ADA_MATERIAL">ADA Material</SelectItem>
                  <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                  <SelectItem value="READY_STOCK">Ready Stock (with size variants)</SelectItem>
                  <SelectItem value="READY_SAMPLE">Ready Sample (with size variants)</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the item, its characteristics, and uses..."
                rows={3}
                {...register("description")}
                disabled={createItem.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Provide details about material quality, color, texture, or garment style
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Measurement Card */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Measurement</CardTitle>
              <CardDescription>Unit of measurement and pricing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Unit of Measurement */}
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit of Measurement <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  placeholder="e.g., Yard, Gram, Piece, Meter"
                  {...register("unit", {
                    required: "Unit of measurement is required",
                  })}
                  disabled={createItem.isPending}
                />
                {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
              </div>

              {/* Conditional Pricing Field */}
              {isVariantCategory ? (
                // Base Price for variant items
                <div className="space-y-2">
                  <Label htmlFor="base_price">
                    Base Price (PKR) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="28000"
                    {...register("base_price", {
                      required: "Base price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                    })}
                    disabled={createItem.isPending}
                  />
                  {errors.base_price && (
                    <p className="text-sm text-destructive">{errors.base_price.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Default selling price per piece (can be overridden per size)
                  </p>
                </div>
              ) : (
                // Unit Price for simple items
                <div className="space-y-2">
                  <Label htmlFor="unit_price">
                    Unit Price (PKR) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="850"
                    {...register("unit_price", {
                      required: "Unit price is required",
                      min: { value: 0, message: "Price cannot be negative" },
                    })}
                    disabled={createItem.isPending}
                  />
                  {errors.unit_price && (
                    <p className="text-sm text-destructive">{errors.unit_price.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Cost per {watch("unit") || "unit"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stock Information Card - Only for Simple Items */}
        {selectedCategory && !isVariantCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
              <CardDescription>Current stock levels and reorder thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Initial Stock */}
                <div className="space-y-2">
                  <Label htmlFor="remaining_stock">
                    Initial Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="remaining_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50"
                    {...register("remaining_stock", {
                      required: "Initial stock is required",
                      min: { value: 0, message: "Stock cannot be negative" },
                    })}
                    disabled={createItem.isPending}
                  />
                  {errors.remaining_stock && (
                    <p className="text-sm text-destructive">{errors.remaining_stock.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">How much stock you currently have</p>
                </div>

                {/* Reorder Level */}
                <div className="space-y-2">
                  <Label htmlFor="reorder_level">
                    Reorder Level <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="20"
                    {...register("reorder_level", {
                      required: "Reorder level is required",
                      min: { value: 0, message: "Reorder level cannot be negative" },
                    })}
                    disabled={createItem.isPending}
                  />
                  {errors.reorder_level && (
                    <p className="text-sm text-destructive">{errors.reorder_level.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Alert when stock falls below this level
                  </p>
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
                    disabled={createItem.isPending}
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

        {/* Size Variants Card - Only for Ready Stock/Sample */}
        {isVariantCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Size Variants</CardTitle>
              <CardDescription>Configure available sizes and their stock levels</CardDescription>
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
                        disabled={createItem.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Size Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.size`}>Size</Label>
                      <Input
                        {...register(`variants.${index}.size`, {
                          required: "Size is required",
                        })}
                        placeholder="S, M, L, XL, XXL"
                        disabled={createItem.isPending}
                      />
                    </div>

                    {/* Initial Stock */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.remaining_stock`}>Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.remaining_stock`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        disabled={createItem.isPending}
                      />
                    </div>

                    {/* Reorder Level */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.reorder_level`}>Reorder At</Label>
                      <Input
                        type="number"
                        min="0"
                        {...register(`variants.${index}.reorder_level`, {
                          valueAsNumber: true,
                        })}
                        placeholder="1"
                        disabled={createItem.isPending}
                      />
                    </div>

                    {/* Price Override */}
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.price`}>Price (PKR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`variants.${index}.price`)}
                        placeholder={watch("base_price") || "Same as base"}
                        disabled={createItem.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    size: "",
                    remaining_stock: 0,
                    reorder_level: 1,
                    price: "",
                  })
                }
                disabled={createItem.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Size
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vendor & Location Card */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Vendor & Location</CardTitle>
              <CardDescription>Supplier information and storage location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vendor Name */}
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name</Label>
                <Input
                  id="vendor_name"
                  placeholder="e.g., Silk House Karachi, ADA Materials Bazaar"
                  {...register("vendor_name")}
                  disabled={createItem.isPending}
                />
              </div>

              {/* Vendor Contact */}
              <div className="space-y-2">
                <Label htmlFor="vendor_contact">Vendor Contact</Label>
                <Input
                  id="vendor_contact"
                  placeholder="e.g., +92-300-1234567"
                  {...register("vendor_contact")}
                  disabled={createItem.isPending}
                />
              </div>

              {/* Rack Location */}
              <div className="space-y-2">
                <Label htmlFor="rack_location">Rack Location</Label>
                <Input
                  id="rack_location"
                  placeholder="e.g., A3, B5, C12"
                  {...register("rack_location")}
                  disabled={createItem.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Where this item is stored in your warehouse
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Reference Card */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Visual Reference</CardTitle>
              <CardDescription>Add an image to help identify this item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/images/item.jpg"
                  {...register("image_url")}
                  disabled={createItem.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  URL to an image of this item (optional but recommended)
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this item, quality observations, special handling, etc."
                  rows={3}
                  {...register("notes")}
                  disabled={createItem.isPending}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before submitting the form.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory")}
            disabled={createItem.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createItem.isPending || !selectedCategory}>
            {createItem.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Inventory Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
