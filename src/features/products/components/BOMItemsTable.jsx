import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useDeleteBOMItem } from "../../../hooks/useProducts"
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

const CATEGORY_COLORS = {
  FABRIC: "bg-purple-100 text-purple-800",
  RAW_MATERIAL: "bg-blue-100 text-blue-800",
  MULTI_HEAD: "bg-green-100 text-green-800",
  ADDA_MATERIAL: "bg-orange-100 text-orange-800",
}

export default function BOMItemsTable({ bom, productId }) {
  const [itemToDelete, setItemToDelete] = useState(null)
  const deleteBOMItemMutation = useDeleteBOMItem()

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await deleteBOMItemMutation.mutateAsync({
        bomId: bom.id,
        itemId: itemToDelete.id,
        productId: productId,
      })
      setItemToDelete(null)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  const items = bom.items || []

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
        <Button>
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

      {/* Table */}
      {items.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No items in this BOM yet</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : (
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
                      <Button variant="ghost" size="sm">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BOM Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this material from the BOM. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
