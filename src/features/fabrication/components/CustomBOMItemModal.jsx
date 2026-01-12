/**
 * CustomBOMItemModal
 * Modal for adding/editing BOM items in a custom BOM section
 */

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
// import { useInventory } from "@/hooks/useInventory"
import { useInventoryItems } from "../../../hooks/useInventory"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Loader2 } from "lucide-react"

// Only these inventory categories can be used in BOMs
const BOM_ALLOWED_CATEGORIES = ["FABRIC", "RAW_MATERIAL", "MULTI_HEAD", "ADDA_MATERIAL"]

export default function CustomBOMItemModal({
  isOpen,
  onClose,
  onSubmit,
  piece,
  editingItem = null,
  isSubmitting = false,
}) {
  const isEditMode = !!editingItem

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      inventory_item_id: "",
      quantity: "",
      unit: "",
      notes: "",
    },
  })

  // Fetch inventory items
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems()

  // Filter inventory to only BOM-allowed categories
  const bomInventoryItems =
    inventoryData?.filter((item) => BOM_ALLOWED_CATEGORIES.includes(item.category)) || []

  // Watch selected inventory item to auto-fill unit
  const selectedInventoryId = watch("inventory_item_id")

  useEffect(() => {
    if (selectedInventoryId && bomInventoryItems.length > 0) {
      const selectedItem = bomInventoryItems.find(
        (item) => item.id.toString() === selectedInventoryId
      )
      if (selectedItem) {
        setValue("unit", selectedItem.unit || "PIECE")
      }
    }
  }, [selectedInventoryId, bomInventoryItems, setValue])

  // Reset form when modal opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        reset({
          inventory_item_id: editingItem.inventory_item_id?.toString() || "",
          quantity: editingItem.quantity?.toString() || "",
          unit: editingItem.unit || "",
          notes: editingItem.notes || "",
        })
      } else {
        reset({
          inventory_item_id: "",
          quantity: "",
          unit: "",
          notes: "",
        })
      }
    }
  }, [isOpen, editingItem, reset])

  const handleFormSubmit = (data) => {
    const selectedItem = bomInventoryItems.find(
      (item) => item.id.toString() === data.inventory_item_id
    )

    const submitData = {
      inventory_item_id: data.inventory_item_id,
      inventory_item_name: selectedItem?.name || "",
      inventory_item_sku: selectedItem?.sku || "",
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      notes: data.notes || "",
    }

    onSubmit(submitData, editingItem?.id)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Helper to format piece name
  const getPieceLabel = (p) => {
    return p
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit" : "Add"} Material - {getPieceLabel(piece)}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the material details for this BOM item."
              : "Add a new material to this section of the Bill of Materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
                    ) : bomInventoryItems.length > 0 ? (
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
              Only FABRIC, RAW_MATERIAL, MULTI_HEAD, and ADDA_MATERIAL items are shown
            </p>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g., 3.5"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 0.01, message: "Must be greater than 0" },
                })}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>

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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Main fabric for bodice, Embroidery thread..."
              rows={2}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? "Update Material" : "Add Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
