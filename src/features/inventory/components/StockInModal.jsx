import { useState } from "react"
import { useRecordStockIn } from "@/hooks/useInventory"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * Stock-In Modal Component
 *
 * This modal provides a focused interface for recording when materials arrive
 * from vendors. It demonstrates several important patterns:
 *
 * 1. Form state management for capturing user input
 * 2. Conditional rendering based on item type (variant vs simple)
 * 3. Form validation before submission
 * 4. Mutation state handling (loading, success, error)
 * 5. User feedback through toasts and visual indicators
 *
 * The modal automatically adapts its interface based on the item being updated.
 * For variant items like ready stock, it shows a size selector. For simple items
 * like fabrics, it hides the size selector since it is not applicable.
 *
 * Notice how the component uses the useRecordStockIn mutation hook. When the
 * mutation succeeds, React Query automatically invalidates relevant queries, which
 * causes the detail page behind this modal to refresh and show the new stock level.
 * The component does not need to manually update anything - the architecture handles
 * synchronization automatically.
 */
export function StockInModal({ item, open, onClose }) {
  const { toast } = useToast()
  const recordStockIn = useRecordStockIn()

  // Form state - these track user input as they fill out the form
  const [quantity, setQuantity] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")

  // Validation state - tracks any errors in user input
  const [validationError, setValidationError] = useState("")

  /**
   * Handle form submission
   *
   * This function runs when the user clicks the "Record Stock-In" button.
   * It performs validation first, then calls the mutation if everything is valid.
   * The mutation hook handles the actual API call and all the cache invalidation.
   */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Clear any previous validation errors
    setValidationError("")

    // Validation: Quantity must be a positive number
    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setValidationError("Please enter a valid quantity greater than zero")
      return
    }

    // Validation: For variant items, a size must be selected
    if (item.has_variants && !selectedVariantId) {
      setValidationError("Please select a size variant")
      return
    }

    // Build the stock data object to send to the API
    const stockData = {
      quantity: qty,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    // For variant items, include which variant is being updated
    if (item.has_variants && selectedVariantId) {
      stockData.variant_id = parseInt(selectedVariantId)
    }

    // Call the mutation with success and error handlers
    recordStockIn.mutate(
      { itemId: item.id, stockData },
      {
        onSuccess: (result) => {
          // Show success toast notification
          toast({
            title: "Stock-In Recorded",
            description: `Successfully added ${qty} ${item.unit}${qty !== 1 ? "s" : ""} to inventory`,
          })

          // Close the modal - the parent component (detail page) will automatically
          // refresh because React Query invalidated its queries
          onClose()
        },
        onError: (error) => {
          // Show error toast if the mutation fails
          toast({
            title: "Stock-In Failed",
            description: error.message || "Failed to record stock-in transaction",
            variant: "destructive",
          })
        },
      }
    )
  }

  /**
   * Handle modal close
   *
   * Reset the form when the modal closes so it is clean if reopened.
   * We only allow closing if a mutation is not in progress to prevent
   * users from accidentally canceling an in-flight request.
   */
  const handleClose = () => {
    if (!recordStockIn.isPending) {
      setQuantity("")
      setSelectedVariantId("")
      setReferenceNumber("")
      setNotes("")
      setValidationError("")
      onClose()
    }
  }

  /**
   * Find the selected variant details for display purposes
   * This helps show the user which size they are adding stock to
   */
  const selectedVariant =
    item.has_variants && selectedVariantId
      ? item.variants.find((v) => v.variant_id === parseInt(selectedVariantId))
      : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Record Stock-In
          </DialogTitle>
          <DialogDescription>
            Record materials received for <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Validation Error Alert */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Variant Selector (only for ready stock items with sizes) */}
          {item.has_variants && item.variants && (
            <div className="space-y-2">
              <Label htmlFor="variant">
                Size <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Select a size..." />
                </SelectTrigger>
                <SelectContent>
                  {item.variants.map((variant) => (
                    <SelectItem key={variant.variant_id} value={variant.variant_id.toString()}>
                      Size {variant.size} - Current: {variant.remaining_stock} {item.unit}
                      {variant.remaining_stock < variant.reorder_level && (
                        <span className="text-destructive ml-2">(Low Stock)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which size variant you are adding stock to
              </p>
            </div>
          )}

          {/* Current Stock Display */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground">Current Stock:</span>
              <span className="font-medium">
                {selectedVariant
                  ? `${selectedVariant.remaining_stock} ${item.unit}`
                  : item.has_variants
                    ? "Select a size first"
                    : `${item.remaining_stock} ${item.unit}`}
              </span>
            </div>
            {selectedVariant && selectedVariant.remaining_stock < selectedVariant.reorder_level && (
              <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                Below reorder level ({selectedVariant.reorder_level} {item.unit})
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity Received <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder={`Enter quantity in ${item.unit}s`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={recordStockIn.isPending}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {item.unit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              How much material was received from the vendor
            </p>
          </div>

          {/* Reference Number Input */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="PO number or invoice reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={recordStockIn.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Purchase order or invoice number for tracking
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this shipment..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={recordStockIn.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Quality observations, vendor information, or other details
            </p>
          </div>

          {/* Success State (shown briefly before modal closes) */}
          {recordStockIn.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Stock-in recorded successfully! The inventory has been updated.
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={recordStockIn.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={recordStockIn.isPending}>
            {recordStockIn.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Record Stock-In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
