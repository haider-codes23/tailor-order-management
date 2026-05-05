import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreateInventoryItem } from "@/hooks/useInventory"
import { useProducts } from "@/hooks/useProducts"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function CreateInventoryItemPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createItem = useCreateInventoryItem()

  const [selectedCategory, setSelectedCategory] = useState("")
  const [productPopoverOpen, setProductPopoverOpen] = useState(false)

  const isVariantCategory =
    selectedCategory === "READY_STOCK" || selectedCategory === "READY_SAMPLE"

  // Fetch products only when needed (variant categories)
  const { data: productsData, isLoading: productsLoading } = useProducts({ active: true })
  const products = productsData?.data || []

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
      linked_product_id: "",
      variants: [
        { size: "S", remaining_stock: 0, reorder_level: 1, reorder_amount: 5, price: "" },
        { size: "M", remaining_stock: 0, reorder_level: 1, reorder_amount: 5, price: "" },
        { size: "L", remaining_stock: 0, reorder_level: 1, reorder_amount: 5, price: "" },
        { size: "XL", remaining_stock: 0, reorder_level: 1, reorder_amount: 5, price: "" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "variants" })

  const linkedProductId = watch("linked_product_id")
  const selectedProduct = products.find((p) => p.id === linkedProductId)

  // Auto-fill fields from the selected product whenever the product changes
  useEffect(() => {
    if (!selectedProduct || !isVariantCategory) return

    const prefix = selectedCategory === "READY_STOCK" ? "RS" : "RSAMP"
    const suggestedSku = selectedProduct.sku
      ? `${prefix}-${selectedProduct.sku}`
      : `${prefix}-${Date.now().toString().slice(-6)}`

    setValue("name", selectedProduct.name || "")
    setValue("sku", suggestedSku)
    setValue("description", selectedProduct.description || "")
  }, [selectedProduct?.id, isVariantCategory, selectedCategory, setValue])

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setValue("category", value)

    // Reset product-dependent fields when switching categories
    setValue("linked_product_id", "")
    setValue("name", "")
    setValue("sku", "")
    setValue("description", "")
  }

  const onSubmit = (data) => {
    // Common fields
    const itemData = {
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category: data.category,
      description: data.description.trim(),
      notes: data.notes.trim(),
    }

    if (isVariantCategory) {
      // Ready Stock / Ready Sample — inherit pricing, unit, and image from product
      const product = selectedProduct
      // Base price = sum of product_items only (excludes add-ons like dupatta/pouch)
      const productPrice =
        Array.isArray(product?.product_items) && product.product_items.length > 0
          ? product.product_items.reduce((sum, piece) => sum + (parseFloat(piece.price) || 0), 0)
          : 0

      itemData.unit = "pieces"
      itemData.base_price = productPrice
      itemData.linked_product_id = data.linked_product_id
      itemData.has_variants = true
      itemData.image_url = product?.image_url || ""
      // Vendor/rack intentionally omitted for in-house ready stock

      itemData.variants = data.variants.map((variant) => ({
        size: variant.size.trim(),
        sku: `${data.sku.trim().toUpperCase()}-${variant.size.trim().toUpperCase()}`,
        remaining_stock: parseInt(variant.remaining_stock) || 0,
        reorder_level: parseInt(variant.reorder_level) || 1,
        reorder_amount: parseFloat(variant.reorder_amount) || 0,
        price: parseFloat(variant.price) || productPrice,
        image_url: product?.image_url || "",
      }))
    } else {
      // Simple items — full manual entry
      itemData.unit = data.unit.trim()
      itemData.unit_price = parseFloat(data.unit_price) || 0
      itemData.remaining_stock = parseFloat(data.remaining_stock) || 0
      itemData.reorder_level = parseFloat(data.reorder_level) || 0
      itemData.reorder_amount = parseFloat(data.reorder_amount) || 0
      itemData.vendor_name = data.vendor_name.trim()
      itemData.vendor_contact = data.vendor_contact.trim()
      itemData.rack_location = data.rack_location.trim()
      itemData.image_url = data.image_url.trim()
    }

    createItem.mutate(itemData, {
      onSuccess: (result) => {
        toast({
          title: "Inventory Item Created",
          description: `Successfully created ${result.data.name}`,
        })
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

  // Whether to show the rest of the form (after category + product are chosen for ready stock)
  const showRestOfForm = selectedCategory && (!isVariantCategory || !!linkedProductId)

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
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
        {/* STEP 1: Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
            <CardDescription>
              Select the type of inventory item you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        {/* STEP 2a (Ready Stock/Sample): Linked Product picker */}
        {isVariantCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Linked Product</CardTitle>
              <CardDescription>
                Select the product this ready stock corresponds to. Item details will auto-fill
                from the product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Product <span className="text-destructive">*</span>
                </Label>
                <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={productPopoverOpen}
                      className="w-full justify-between font-normal"
                      disabled={createItem.isPending || productsLoading}
                    >
                      {productsLoading ? (
                        <span className="text-muted-foreground">Loading products...</span>
                      ) : selectedProduct ? (
                        <span className="truncate">
                          {selectedProduct.name}
                          {selectedProduct.sku && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              ({selectedProduct.sku})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a product...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search products by name or SKU..." />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => {
                            const label = `${product.name} ${product.sku || ""}`
                            return (
                              <CommandItem
                                key={product.id}
                                value={label}
                                onSelect={() => {
                                  setValue("linked_product_id", product.id, {
                                    shouldValidate: true,
                                  })
                                  setProductPopoverOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    linkedProductId === product.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  {product.sku && (
                                    <span className="text-xs text-muted-foreground">
                                      {product.sku}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input
                  type="hidden"
                  {...register("linked_product_id", {
                    required: isVariantCategory ? "Please select a linked product" : false,
                  })}
                />
                {errors.linked_product_id && (
                  <p className="text-sm text-destructive">{errors.linked_product_id.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Item name, description, price, and image will be inherited from this product.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Rest of form — shown once category (and product, if applicable) chosen */}
        {showRestOfForm && (
          <>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  {isVariantCategory
                    ? "Inherited from the linked product"
                    : "Essential details about the inventory item"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={
                      isVariantCategory
                        ? "Auto-filled from product"
                        : "e.g., Tissue Silk, Champagne Karti"
                    }
                    readOnly={isVariantCategory}
                    className={isVariantCategory ? "bg-muted cursor-not-allowed" : ""}
                    {...register("name", {
                      required: "Item name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                    })}
                    disabled={createItem.isPending}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  {isVariantCategory && (
                    <p className="text-xs text-muted-foreground">
                      This is inherited from the linked product and cannot be edited here.
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU (Stock Keeping Unit) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku"
                    placeholder={
                      isVariantCategory
                        ? "Auto-filled from product"
                        : "e.g., FAB-TISSUE-001, ADA-KARTI-013"
                    }
                    readOnly={isVariantCategory}
                    className={isVariantCategory ? "bg-muted cursor-not-allowed" : ""}
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
                    {isVariantCategory
                      ? "Auto-generated from the linked product's SKU."
                      : "Unique identifier for this item. Use format: CATEGORY-NAME-NUMBER"}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder={
                      isVariantCategory
                        ? "Auto-filled from product"
                        : "Detailed description of the item..."
                    }
                    rows={3}
                    readOnly={isVariantCategory}
                    className={isVariantCategory ? "bg-muted cursor-not-allowed" : ""}
                    {...register("description")}
                    disabled={createItem.isPending}
                  />
                  {!isVariantCategory && (
                    <p className="text-xs text-muted-foreground">
                      Provide details about material quality, color, texture, or garment style
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Measurement — simple items only */}
            {!isVariantCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Measurement</CardTitle>
                  <CardDescription>Unit of measurement and pricing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">
                      Unit of Measurement <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="unit"
                      placeholder="e.g., Yard, Gram, Piece, Meter"
                      {...register("unit", { required: "Unit of measurement is required" })}
                      disabled={createItem.isPending}
                    />
                    {errors.unit && (
                      <p className="text-sm text-destructive">{errors.unit.message}</p>
                    )}
                  </div>

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
                </CardContent>
              </Card>
            )}

            {/* Stock Information — simple items only */}
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
                        <p className="text-sm text-destructive">
                          {errors.remaining_stock.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        How much stock you currently have
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
                        <p className="text-sm text-destructive">
                          {errors.reorder_amount.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        How much to order when restocking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Size Variants — ready stock/sample only */}
            {isVariantCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Size Variants</CardTitle>
                  <CardDescription>
                    Configure available sizes and their stock levels
                  </CardDescription>
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

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="space-y-2">
                          <Label>Size</Label>
                          <Input
                            {...register(`variants.${index}.size`, {
                              required: "Size is required",
                            })}
                            placeholder="S, M, L, XL, XXL"
                            disabled={createItem.isPending}
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
                            placeholder="0"
                            disabled={createItem.isPending}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Reorder At</Label>
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

                        <div className="space-y-2">
                          <Label>Reorder Amt</Label>
                          <Input
                            type="number"
                            min="1"
                            {...register(`variants.${index}.reorder_amount`, {
                              valueAsNumber: true,
                            })}
                            placeholder="5"
                            disabled={createItem.isPending}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Price (PKR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variants.${index}.price`)}
                            placeholder={
                              Array.isArray(selectedProduct?.product_items) &&
                              selectedProduct.product_items.length > 0
                                ? selectedProduct.product_items
                                    .reduce(
                                      (sum, piece) => sum + (parseFloat(piece.price) || 0),
                                      0
                                    )
                                    .toString()
                                : "From product"
                            }
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
                        reorder_amount: 5,
                        price: "",
                      })
                    }
                    disabled={createItem.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Size
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Price defaults to the linked product's price. Override per size if needed.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Vendor & Location — simple items only */}
            {!isVariantCategory && (
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
                      placeholder="e.g., Silk House Karachi, ADA Materials Bazaar"
                      {...register("vendor_name")}
                      disabled={createItem.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor_contact">Vendor Contact</Label>
                    <Input
                      id="vendor_contact"
                      placeholder="e.g., +92-300-1234567"
                      {...register("vendor_contact")}
                      disabled={createItem.isPending}
                    />
                  </div>

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

            {/* Visual Reference — simple items only */}
            {!isVariantCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Visual Reference</CardTitle>
                  <CardDescription>Add an image to help identify this item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <div className="space-y-2">
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this item..."
                      rows={3}
                      {...register("notes")}
                      disabled={createItem.isPending}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Internal Notes — ready stock/sample (lightweight, no image) */}
            {isVariantCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                  <CardDescription>
                    Optional notes about this ready stock batch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Quality observations, batch info, etc."
                      rows={3}
                      {...register("notes")}
                      disabled={createItem.isPending}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before submitting the form.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        {showRestOfForm && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/inventory")}
              disabled={createItem.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createItem.isPending}>
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
        )}
      </form>
    </div>
  )
}