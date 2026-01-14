import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { getPieceLabel } from "@/constants/productConstants"
import { useCreateBOMItem, useUpdateBOMItem } from "../../../hooks/useProducts"
import { useInventoryItems } from "../../../hooks/useInventory"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
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
import { Loader2 } from "lucide-react"

// Allowed inventory categories for BOMs
const BOM_ALLOWED_CATEGORIES = ["FABRIC", "RAW_MATERIAL", "MULTI_HEAD", "ADA_MATERIAL"]

// Garment pieces
const GARMENT_PIECES = [
  "Shirt",
  "Pants/Trouser",
  "Kaftan",
  "Jacket",
  "Gown",
  "Pashwas",
  "Saree",
  "Peti Coat",
  "Blouse",
  "Sherwani",
  "Kurta",
  "Farshi Sharara",
  "Gharara",
  "Lehnga",
  "Waistcoat",
  "Dupatta",
  "Unstitched Suit",
  "Veil",
  "Pouch",
  "Shawl",
  "Hijab",
  "Shoes",
]

export default function BOMItemModal({
  isOpen,
  onClose,
  bomId,
  productId,
  size,
  itemToEdit = null,
  piece,
}) {
  const isEditMode = !!itemToEdit

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
      inventory_item_id: "",
      quantity_per_unit: "",
      unit: "",
      notes: "",
    },
  })

  // Fetch inventory items (filtered to BOM-allowed categories)
  const { data: inventoryResponse, isLoading: inventoryLoading } = useInventoryItems({
    // We'll filter on frontend since backend might not support category filtering
  })
  console.log("inventory items: ", inventoryResponse)

  const createBOMItemMutation = useCreateBOMItem()
  const updateBOMItemMutation = useUpdateBOMItem()

  // Handle both wrapped {success, data} and unwrapped array response formats
  const inventoryItems = Array.isArray(inventoryResponse)
    ? inventoryResponse
    : inventoryResponse?.data || []

  // Filter inventory items to only BOM-allowed categories
  const bomInventoryItems = inventoryItems.filter((item) =>
    BOM_ALLOWED_CATEGORIES.includes(item.category)
  )

  // Watch selected inventory item to auto-fill unit
  const selectedInventoryId = watch("inventory_item_id")

  // Auto-fill unit when material is selected
  useEffect(() => {
    if (selectedInventoryId && bomInventoryItems.length > 0) {
      const selectedItem = bomInventoryItems.find(
        (item) => item.id.toString() === selectedInventoryId
      )
      if (selectedItem) {
        setValue("unit", selectedItem.unit || "Piece")
      }
    }
  }, [selectedInventoryId, bomInventoryItems, setValue])

  // Populate form when editing
  useEffect(() => {
    if (itemToEdit) {
      reset({
        inventory_item_id: itemToEdit.inventory_item_id?.toString() || "",
        quantity_per_unit: itemToEdit.quantity_per_unit?.toString() || "",
        unit: itemToEdit.unit || "",
        notes: itemToEdit.notes || "",
      })
    } else {
      reset({
        inventory_item_id: "",
        quantity_per_unit: "",
        unit: "",
        notes: "",
      })
    }
  }, [itemToEdit, reset])

  const onSubmit = async (data) => {
    // Find the selected inventory item to get its details
    const selectedItem = bomInventoryItems.find(
      (item) => item.id.toString() === data.inventory_item_id
    )

    try {
      const itemData = {
        inventory_item_id: parseInt(data.inventory_item_id),
        quantity_per_unit: parseFloat(data.quantity_per_unit),
        unit: data.unit || selectedItem?.unit || "Piece", // Use inventory item's unit
        piece: piece, // Use piece from props, not from form
        notes: data.notes || null,
      }

      if (isEditMode) {
        await updateBOMItemMutation.mutateAsync({
          bomId,
          itemId: itemToEdit.id,
          updates: itemData,
          productId,
          size,
        })
      } else {
        await createBOMItemMutation.mutateAsync({
          bomId,
          itemData,
          productId,
          size,
        })
      }

      // Success - close modal and reset form
      handleClose()
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Add"} BOM Item - {getPieceLabel(piece)}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the material details for this BOM item."
              : "Add a new material to this Bill of Materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Material Selection */}
          <div className="space-y-2">
            <Label htmlFor="inventory_item_id">
              Material <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="inventory_item_id"
              control={control}
              rules={{ required: "Material is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a material..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm">Loading materials...</span>
                      </div>
                    ) : bomInventoryItems && bomInventoryItems.length > 0 ? (
                      bomInventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.category}) - {item.sku}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-gray-500">
                        No materials available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.inventory_item_id && (
              <p className="text-sm text-red-500">{errors.inventory_item_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Only FABRIC, RAW_MATERIAL, MULTI_HEAD, and ADDA_MATERIAL items shown
            </p>
          </div>

          {/* Quantity and Unit - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity_per_unit">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity_per_unit"
                type="number"
                step="0.01"
                placeholder="e.g., 3.5"
                {...register("quantity_per_unit", {
                  required: "Quantity is required",
                  min: { value: 0.01, message: "Quantity must be greater than 0" },
                })}
              />
              {errors.quantity_per_unit && (
                <p className="text-sm text-red-500">{errors.quantity_per_unit.message}</p>
              )}
            </div>

            {/* Unit - Read-only, auto-filled from material */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="Auto-filled from material"
                {...register("unit")}
                readOnly
                className="bg-slate-50"
              />
              <p className="text-xs text-muted-foreground">Auto-filled from material</p>
            </div>
          </div>

          {/* Garment Piece - Display only, comes from props */}
          <div className="space-y-2">
            <Label>Garment Piece</Label>
            <Input value={getPieceLabel(piece)} readOnly className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">
              This item will be added to the {getPieceLabel(piece)} section
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this material..."
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Form Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBOMItemMutation.isPending || updateBOMItemMutation.isPending}
            >
              {createBOMItemMutation.isPending || updateBOMItemMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
