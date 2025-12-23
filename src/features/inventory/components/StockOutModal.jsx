import { useState } from "react"
import { useRecordStockOut } from "@/hooks/useInventory"
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
import { Loader2, TrendingDown, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * Stock-Out Modal Component
 *
 * Modal for recording when materials are consumed in production or sold.
 * Similar to StockInModal but with deduction logic and insufficient stock validation.
 *
 * Key differences from StockInModal:
 * - Validates that sufficient stock exists before allowing submission
 * - Shows warning if quantity would create low stock situation
 * - Different visual styling (red/warning theme vs green/success theme)
 * - Reference typically refers to production orders rather than purchase orders
 */
export function StockOutModal({ item, open, onClose }) {
  const { toast } = useToast()
  const recordStockOut = useRecordStockOut()

  // Form state
  const [quantity, setQuantity] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")

  // Validation state
  const [validationError, setValidationError] = useState("")

  /**
   * Get current stock for selected variant or simple item
   */
  const getCurrentStock = () => {
    if (item.has_variants && selectedVariantId) {
      const variant = item.variants.find((v) => v.variant_id === parseInt(selectedVariantId))
      return variant ? variant.remaining_stock : 0
    }
    return item.remaining_stock || 0
  }

  /**
   * Get reorder level for selected variant or simple item
   */
  const getReorderLevel = () => {
    if (item.has_variants && selectedVariantId) {
      const variant = item.variants.find((v) => v.variant_id === parseInt(selectedVariantId))
      return variant ? variant.reorder_level : 0
    }
    return item.reorder_level || 0
  }

  const currentStock = getCurrentStock()
  const reorderLevel = getReorderLevel()
  const requestedQuantity = parseFloat(quantity) || 0
  const stockAfterDeduction = currentStock - requestedQuantity
  const willBeLowStock = stockAfterDeduction < reorderLevel && stockAfterDeduction >= 0

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError("")

    // Validation: Quantity must be positive
    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setValidationError("Please enter a valid quantity greater than zero")
      return
    }

    // Validation: For variant items, size must be selected
    if (item.has_variants && !selectedVariantId) {
      setValidationError("Please select a size variant")
      return
    }

    // Validation: Check sufficient stock
    if (qty > currentStock) {
      setValidationError(`Insufficient stock. Only ${currentStock} ${item.unit} available.`)
      return
    }

    // Build stock data
    const stockData = {
      quantity: qty,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    if (item.has_variants && selectedVariantId) {
      stockData.variant_id = parseInt(selectedVariantId)
    }

    // Submit mutation
    recordStockOut.mutate(
      { itemId: item.id, stockData },
      {
        onSuccess: (result) => {
          toast({
            title: "Stock-Out Recorded",
            description: `Successfully deducted ${qty} ${item.unit}${qty !== 1 ? "s" : ""} from inventory`,
          })
          onClose()
        },
        onError: (error) => {
          toast({
            title: "Stock-Out Failed",
            description: error.message || "Failed to record stock-out transaction",
            variant: "destructive",
          })
        },
      }
    )
  }

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!recordStockOut.isPending) {
      setQuantity("")
      setSelectedVariantId("")
      setReferenceNumber("")
      setNotes("")
      setValidationError("")
      onClose()
    }
  }

  const selectedVariant =
    item.has_variants && selectedVariantId
      ? item.variants.find((v) => v.variant_id === parseInt(selectedVariantId))
      : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            Record Stock-Out
          </DialogTitle>
          <DialogDescription>
            Record materials consumed for <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Variant Selector */}
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
                      Size {variant.size} - Available: {variant.remaining_stock} {item.unit}
                      {variant.remaining_stock === 0 && (
                        <span className="text-destructive ml-2">(Out of Stock)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Current Stock Display */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-muted-foreground">Available Stock:</span>
              <span className="font-medium">
                {selectedVariant
                  ? `${selectedVariant.remaining_stock} ${item.unit}`
                  : item.has_variants
                    ? "Select a size first"
                    : `${item.remaining_stock} ${item.unit}`}
              </span>
            </div>
            {currentStock > 0 && currentStock < reorderLevel && (
              <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                <AlertCircle className="h-3 w-3" />
                Already below reorder level ({reorderLevel} {item.unit})
              </div>
            )}
            {currentStock === 0 && (
              <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                Out of stock - cannot record stock-out
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity to Deduct <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                max={currentStock}
                placeholder={`Max: ${currentStock}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={recordStockOut.isPending || currentStock === 0}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {item.unit}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Amount consumed in production or sold</p>
          </div>

          {/* Stock After Deduction Warning */}
          {requestedQuantity > 0 && requestedQuantity <= currentStock && (
            <Alert className={willBeLowStock ? "border-orange-200 bg-orange-50" : ""}>
              <AlertCircle className={`h-4 w-4 ${willBeLowStock ? "text-orange-600" : ""}`} />
              <AlertDescription className={willBeLowStock ? "text-orange-800" : ""}>
                <strong>After deduction:</strong> {stockAfterDeduction} {item.unit} remaining
                {willBeLowStock && (
                  <span className="block mt-1">⚠️ This will trigger a low stock alert</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number (Optional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Production order or sale reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              disabled={recordStockOut.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Production order, sale order, or work order number
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Purpose of consumption, production details, etc..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={recordStockOut.isPending}
            />
          </div>

          {/* Success State */}
          {recordStockOut.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Stock-out recorded successfully! Inventory has been updated.
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={recordStockOut.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={recordStockOut.isPending || currentStock === 0}
            variant="destructive"
          >
            {recordStockOut.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 mr-2" />
                Record Stock-Out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
