import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { AlertTriangle } from "lucide-react"
import { useCreateBOM, useProductBOMs } from "../../../hooks/useProducts"
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
import { Switch } from "../../../components/ui/switch"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import BOMSizeSelector from "./BOMSizeSelector"

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

/**
 * CreateBOMModal - Create new BOM version for a specific size
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {string} productId - Product ID
 * @param {string} preSelectedSize - Pre-selected size (when opened from size-filtered view)
 */
export default function CreateBOMModal({ isOpen, onClose, productId, preSelectedSize = null }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      size: preSelectedSize || "",
      name: "", // Optional - will auto-generate if empty
      notes: "",
      is_active: false,
    },
  })

  const createBOMMutation = useCreateBOM()
  const { data: allBOMsResponse } = useProductBOMs(productId, null) // Get all BOMs
  const allBOMs = allBOMsResponse?.data || []

  const selectedSize = watch("size")
  const isActive = watch("is_active")

  // Check if selected size has an active BOM
  const hasActiveBOMForSize = selectedSize
    ? allBOMs.some((bom) => bom.size === selectedSize && bom.is_active)
    : false

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        size: preSelectedSize || "",
        name: "",
        notes: "",
        is_active: false,
      })
    }
  }, [isOpen, preSelectedSize, reset])

  const onSubmit = async (data) => {
    try {
      await createBOMMutation.mutateAsync({
        productId,
        bomData: {
          size: data.size, // REQUIRED
          name: data.name || undefined, // Optional - backend auto-generates if not provided
          notes: data.notes || "",
          is_active: data.is_active,
        },
      })

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New BOM Version</DialogTitle>
          <DialogDescription>
            Create a new Bill of Materials version for a specific size. The version name will be
            auto-generated if left empty.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Size Selection - REQUIRED */}
          <div className="space-y-2">
            <Label htmlFor="size">
              Size <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="size"
              control={control}
              rules={{ required: "Size is required" }}
              render={({ field }) => (
                <BOMSizeSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  includeAll={false}
                  placeholder="Select a size..."
                />
              )}
            />
            {errors.size && <p className="text-sm text-red-500">{errors.size.message}</p>}
            {selectedSize && (
              <p className="text-sm text-muted-foreground">
                Creating BOM for: <strong>Size {selectedSize}</strong>
              </p>
            )}
          </div>

          {/* Version Name - Optional */}
          <div className="space-y-2">
            <Label htmlFor="name">Version Name (Optional)</Label>
            <Input
              id="name"
              placeholder="Leave empty to auto-generate (e.g., 'Size M - Version 1')"
              {...register("name")}
            />
            <p className="text-xs text-muted-foreground">
              If left empty, the name will be auto-generated as "Size {selectedSize || "X"} -
              Version N"
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this BOM version..."
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Set as Active */}
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Set as Active BOM
              </Label>
              <p className="text-sm text-muted-foreground">
                Make this the active BOM for Size {selectedSize || "X"}
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
                  disabled={!selectedSize}
                />
              )}
            />
          </div>

          {/* Warning if activating will deactivate another BOM */}
          {isActive && hasActiveBOMForSize && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Warning:</strong> Setting this as active will deactivate the current active
                BOM for Size {selectedSize}.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createBOMMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBOMMutation.isPending || !selectedSize}>
              {createBOMMutation.isPending ? "Creating..." : "Create BOM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}