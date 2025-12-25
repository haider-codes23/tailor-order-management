import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
const BOM_ALLOWED_CATEGORIES = ["FABRIC", "RAW_MATERIAL", "MULTI_HEAD", "ADDA_MATERIAL"]

// Common units for materials
const UNITS = ["Meter", "Yard", "Kg", "Gram", "Piece", "Set"]

// Garment pieces
const GARMENT_PIECES = ["Shirt", "Trouser", "Dupatta", "Kameez", "Shalwar", "Waistcoat", "Kurta"]

export default function BOMItemModal({ isOpen, onClose, bomId, productId, itemToEdit = null }) {
  const isEditMode = !!itemToEdit

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      inventory_item_id: "",
      quantity_per_unit: "",
      unit: "",
      garment_piece: "",
      notes: "",
    },
  })

  // Fetch inventory items (filtered to BOM-allowed categories)
  const { data: inventoryResponse, isLoading: inventoryLoading } = useInventoryItems({
    // We'll filter on frontend since backend might not support category filtering
  })

  const createBOMItemMutation = useCreateBOMItem()
  const updateBOMItemMutation = useUpdateBOMItem()

  // Populate form when editing
  useEffect(() => {
    if (itemToEdit) {
      reset({
        inventory_item_id: itemToEdit.inventory_item_id?.toString() || "",
        quantity_per_unit: itemToEdit.quantity_per_unit?.toString() || "",
        unit: itemToEdit.unit || "",
        garment_piece: itemToEdit.garment_piece || "",
        notes: itemToEdit.notes || "",
      })
    } else {
      reset({
        inventory_item_id: "",
        quantity_per_unit: "",
        unit: "",
        garment_piece: "",
        notes: "",
      })
    }
  }, [itemToEdit, reset])

  const onSubmit = async (data) => {
    try {
      const itemData = {
        inventory_item_id: parseInt(data.inventory_item_id),
        quantity_per_unit: parseFloat(data.quantity_per_unit),
        unit: data.unit,
        garment_piece: data.garment_piece || null,
        notes: data.notes || null,
      }

      if (isEditMode) {
        await updateBOMItemMutation.mutateAsync({
          bomId,
          itemId: itemToEdit.id,
          updates: itemData,
          productId,
        })
      } else {
        await createBOMItemMutation.mutateAsync({
          bomId,
          itemData,
          productId,
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

  // Filter inventory items to only BOM-allowed categories
  const bomInventoryItems = inventoryResponse?.data?.filter((item) =>
    BOM_ALLOWED_CATEGORIES.includes(item.category)
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit BOM Item" : "Add BOM Item"}</DialogTitle>
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
            <p className="text-sm text-gray-500">
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

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="unit"
                control={control}
                rules={{ required: "Unit is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
            </div>
          </div>

          {/* Garment Piece */}
          <div className="space-y-2">
            <Label htmlFor="garment_piece">Garment Piece</Label>
            <Controller
              name="garment_piece"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select garment piece..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GARMENT_PIECES.map((piece) => (
                      <SelectItem key={piece} value={piece}>
                        {piece}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
              {createBOMItemMutation.isPending || updateBOMItemMutation.isPending
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}