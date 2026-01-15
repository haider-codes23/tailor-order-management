import { useState } from "react"
import { Plus, ChevronDown, ChevronUp, Check, XCircle, Trash2 } from "lucide-react"
import { getPieceLabel } from "@/constants/productConstants"
import { useProduct } from "../../../hooks/useProducts"
import { useProductBOMs, useUpdateBOM, useDeleteBOM } from "../../../hooks/useProducts"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card } from "../../../components/ui/card"
import { Skeleton } from "../../../components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"
import BOMItemsTable from "./BOMItemsTable"
import CreateBOMModal from "./CreateBOMModal"

// Available sizes from measurement chart
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

export default function BOMVersionsList({ productId }) {
  const [selectedSize, setSelectedSize] = useState("ALL")
  const [expandedBOMId, setExpandedBOMId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bomToActivate, setBomToActivate] = useState(null)
  const [bomToDeactivate, setBomToDeactivate] = useState(null)
  const [bomToDelete, setBomToDelete] = useState(null)

  // Fetch product to get pieces for display
  const { data: productData } = useProduct(productId)
  const product = productData?.data

  // Fetch BOMs for selected size
  const { data: bomsResponse, isLoading } = useProductBOMs(
    productId,
    selectedSize === "ALL" ? null : selectedSize
  )
  const updateBOMMutation = useUpdateBOM()
  const deleteBOMMutation = useDeleteBOM()

  // Extract BOMs array from response
  const boms = bomsResponse?.data || []

  console.log(`📊 BOMVersionsList: productId=${productId}, size=${selectedSize}, boms=`, boms)

  // Toggle expand/collapse
  const toggleExpand = (bomId) => {
    console.log(`🔄 Toggling expand for BOM ${bomId}`)
    setExpandedBOMId(expandedBOMId === bomId ? null : bomId)
  }

  // Activate BOM
  const handleActivate = async () => {
    if (!bomToActivate) return

    try {
      console.log(`✅ Activating BOM ${bomToActivate.id}`)
      await updateBOMMutation.mutateAsync({
        bomId: bomToActivate.id,
        updates: { is_active: true },
      })
      setBomToActivate(null)
    } catch (error) {
      console.error("❌ Activate failed:", error)
    }
  }

  // Deactivate BOM
  const handleDeactivate = async () => {
    if (!bomToDeactivate) return

    try {
      console.log(`⏸️ Deactivating BOM ${bomToDeactivate.id}`)
      await updateBOMMutation.mutateAsync({
        bomId: bomToDeactivate.id,
        updates: { is_active: false },
      })
      setBomToDeactivate(null)
    } catch (error) {
      console.error("❌ Deactivate failed:", error)
    }
  }

  // Delete BOM
  const handleDelete = async () => {
    if (!bomToDelete) return

    try {
      console.log(`🗑️ Deleting BOM ${bomToDelete.id}`)
      await deleteBOMMutation.mutateAsync({
        bomId: bomToDelete.id,
        productId,
        size: selectedSize,
      })
      setBomToDelete(null)
    } catch (error) {
      console.error("❌ Delete failed:", error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Size Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Size:</label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sizes</SelectItem>
              {AVAILABLE_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  Size {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {boms.length} BOM{boms.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Version
        </Button>
      </div>

      {/* BOM Cards */}
      {boms.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {selectedSize === "ALL"
                ? "No BOMs created yet"
                : `No BOMs for Size ${selectedSize} yet`}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>Create First BOM</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {boms.map((bom) => {
            const isExpanded = expandedBOMId === bom.id

            return (
              <Card
                key={bom.id}
                className={`p-4 ${bom.is_active ? "border-green-200 bg-green-50/50" : ""}`}
              >
                {/* BOM Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{bom.name}</h3>
                      <Badge variant={bom.is_active ? "default" : "secondary"}>
                        {bom.is_active ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                      {selectedSize === "ALL" && <Badge variant="outline">Size {bom.size}</Badge>}
                    </div>
                    {bom.notes && <p className="text-sm text-muted-foreground mb-2">{bom.notes}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Items: {bom.pieces?.length || 0} section
                        {(bom.pieces?.length || 0) !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span>Items: {bom.items?.length || 0}</span>
                      <span>Created: {new Date(bom.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Version {bom.version}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Expand/Collapse */}
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(bom.id)}>
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Items
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View Items
                        </>
                      )}
                    </Button>

                    {/* Active BOM: Deactivate */}
                    {bom.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBomToDeactivate(bom)}
                        disabled={updateBOMMutation.isPending}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    )}

                    {/* Inactive BOM: Activate + Delete */}
                    {!bom.is_active && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBomToActivate(bom)}
                          disabled={updateBOMMutation.isPending}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBomToDelete(bom)}
                          disabled={deleteBOMMutation.isPending}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded: Show BOM Items */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    <BOMItemsTable
                      bomId={bom.id}
                      productId={productId}
                      size={bom.size}
                      pieces={bom.pieces || []}
                    />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create BOM Modal */}
      <CreateBOMModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        productId={productId}
      />

      {/* Activate Confirmation */}
      <AlertDialog open={!!bomToActivate} onOpenChange={() => setBomToActivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate any other active BOM for Size {bomToActivate?.size}. The active
              BOM is used for production and inventory calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate}>Activate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={!!bomToDeactivate} onOpenChange={() => setBomToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the current BOM for Size {bomToDeactivate?.size}. You can
              reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!bomToDelete} onOpenChange={() => setBomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{bomToDelete?.name}" and all its items. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
