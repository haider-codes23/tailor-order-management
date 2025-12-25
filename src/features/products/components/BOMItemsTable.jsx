import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useBOMItems, useDeleteBOMItem } from "../../../hooks/useProducts"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
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
import { Alert, AlertDescription } from "../../../components/ui/alert"
import BOMItemModal from "./BOMItemModal"

const CATEGORY_COLORS = {
  FABRIC: "bg-purple-100 text-purple-800",
  RAW_MATERIAL: "bg-blue-100 text-blue-800",
  MULTI_HEAD: "bg-green-100 text-green-800",
  ADDA_MATERIAL: "bg-orange-100 text-orange-800",
}

export default function BOMItemsTable({ bom, productId }) {
  // ✅ State for delete dialog
  const [itemToDelete, setItemToDelete] = useState(null)

  // ✅ State for add/edit modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)

  const deleteBOMItemMutation = useDeleteBOMItem()

  // ✅ FIX: Fetch items directly instead of using bom.items prop
  const { data: itemsResponse, isLoading } = useBOMItems(bom.id)
  const items = itemsResponse?.data || []

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await deleteBOMItemMutation.mutateAsync({
        bomId: bom.id,
        itemId: itemToDelete.id,
        productId: productId,
        size: bom.size, // ✅ Add size for proper cache invalidation
      })
      setItemToDelete(null)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {bom.name || `BOM Version ${bom.version}`}
          </h3>
          {bom.notes && <p className="text-sm text-gray-600 mt-1">{bom.notes}</p>}
        </div>
        {/* Add Item button opens modal */}
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Note:</strong> BOM items can only reference FABRIC, RAW_MATERIAL, MULTI_HEAD, and
          ADDA_MATERIAL inventory categories. READY_STOCK and READY_SAMPLE are not allowed in BOMs.
        </AlertDescription>
      </Alert>

      {/* Loading State */}
      {isLoading ? (
        <div className="border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No items in this BOM yet</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : (
        /* Table */
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Piece</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {/* In real implementation, would fetch inventory item name */}
                    Item {item.inventory_item_id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-800"}
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.quantity_per_unit} {item.unit}
                  </TableCell>
                  <TableCell className="text-gray-600">{item.garment_piece || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {item.notes || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit button opens modal with item data */}
                      <Button variant="ghost" size="sm" onClick={() => setItemToEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setItemToDelete(item)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && <div className="text-sm text-gray-600">Total items: {items.length}</div>}

      {/* BOM Item Modal (Add/Edit) */}
      <BOMItemModal
        isOpen={showAddModal || !!itemToEdit}
        onClose={() => {
          setShowAddModal(false)
          setItemToEdit(null)
        }}
        bomId={bom.id}
        productId={productId}
        itemToEdit={itemToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BOM Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from the BOM. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}