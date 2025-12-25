import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateBOM } from "../../../hooks/useProducts"
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
import { AlertTriangle } from "lucide-react"

export default function CreateBOMModal({ isOpen, onClose, productId, currentBOMsCount }) {
  const [setAsActive, setSetAsActive] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      notes: "",
    },
  })

  const createBOMMutation = useCreateBOM()

  const onSubmit = async (data) => {
    try {
      // Auto-generate name if empty
      const bomName = data.name.trim() || `Version ${currentBOMsCount + 1}`

      await createBOMMutation.mutateAsync({
        productId,
        bomData: {
          name: bomName,
          notes: data.notes,
          is_active: setAsActive,
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
    setSetAsActive(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New BOM Version</DialogTitle>
          <DialogDescription>
            Create a new Bill of Materials version for this product. You can set it as active to
            replace the current active BOM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Version Name <span className="text-gray-500">(optional)</span>
            </Label>
            <Input
              id="name"
              placeholder={`Version ${currentBOMsCount + 1}`}
              {...register("name")}
            />
            <p className="text-sm text-gray-500">
              Leave empty to auto-generate name (e.g., "Version {currentBOMsCount + 1}")
            </p>
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe what changed in this version..."
              rows={3}
              {...register("notes")}
            />
          </div>

          {/* Set as Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="set-active" className="text-base">
                Set as Active BOM
              </Label>
              <p className="text-sm text-gray-500">
                This BOM will be used for all future orders
              </p>
            </div>
            <Switch
              id="set-active"
              checked={setAsActive}
              onCheckedChange={setSetAsActive}
            />
          </div>

          {/* Warning if setting as active */}
          {setAsActive && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Setting this as active will deactivate the current
                active BOM. This will affect all future production orders for this product.
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBOMMutation.isPending}>
              {createBOMMutation.isPending ? "Creating..." : "Create BOM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}