import { useState } from "react"
import { Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useBOMItems, useDeleteBOMItem } from "../../../hooks/useProducts"
import { getPieceLabel } from "@/constants/productConstants"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card } from "@/components/ui/card"
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

// FIXED: Accept bomId, productId, size as separate props
export default function BOMItemsTable({ bomId, productId, size, pieces = [] }) {
  const [itemToDelete, setItemToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [addingToPiece, setAddingToPiece] = useState(null) // Track which piece we're adding to
  const [expandedPieces, setExpandedPieces] = useState({}) // Track expanded/collapsed state

  const deleteBOMItemMutation = useDeleteBOMItem()

  // Fetch items using bomId
  const { data: itemsResponse, isLoading } = useBOMItems(bomId)
  const items = itemsResponse?.data || []

  console.log(`BOMItemsTable: bomId=${bomId}, items=`, items)

  // Group items by piece
  const itemsByPiece = pieces.reduce((acc, piece) => {
    acc[piece] = items.filter((item) => item.piece === piece)
    return acc
  }, {})

  // Toggle piece section expand/collapse
  const togglePiece = (piece) => {
    setExpandedPieces((prev) => ({
      ...prev,
      [piece]: !prev[piece],
    }))
  }

  // Initialize all pieces as expanded
  useState(() => {
    const initial = {}
    pieces.forEach((p) => (initial[p] = true))
    setExpandedPieces(initial)
  }, [pieces])

  const handleAddItem = (piece) => {
    setAddingToPiece(piece)
    setShowAddModal(true)
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return

    try {
      await deleteBOMItemMutation.mutateAsync({
        bomId,
        itemId: itemToDelete.id,
        productId,
        size,
      })
      setItemToDelete(null)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setItemToEdit(null)
    setAddingToPiece(null)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading items...</div>
  }

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <Alert>
        <AlertDescription className="text-sm">
          <strong>Note:</strong> BOM items can only reference FABRIC, RAW_MATERIAL, MULTI_HEAD, and
          ADDA_MATERIAL inventory categories.
        </AlertDescription>
      </Alert>

      {/* Piece Sections */}
      {pieces.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No sections defined for this BOM
        </div>
      ) : (
        <div className="space-y-4">
          {pieces.map((piece) => {
            const pieceItems = itemsByPiece[piece] || []
            const isExpanded = expandedPieces[piece] !== false

            return (
              <Card key={piece} className="overflow-hidden">
                {/* Section Header */}
                <div
                  className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer"
                  onClick={() => togglePiece(piece)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <h4 className="font-semibold">{getPieceLabel(piece)}</h4>
                    <Badge variant="secondary">{pieceItems.length} items</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddItem(piece)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4">
                    {pieceItems.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No items added yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAddItem(piece)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pieceItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <p className="font-medium">
                                    {item.inventory_item_name || `Item ${item.inventory_item_id}`}
                                  </p>
                                  {item.inventory_item_sku && (
                                    <p className="text-xs text-muted-foreground">
                                      {item.inventory_item_sku}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.quantity_per_unit} {item.unit}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-muted-foreground">
                                {item.notes || "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setItemToEdit(item)
                                      setAddingToPiece(piece)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setItemToDelete(item)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      Total items in {getPieceLabel(piece)}: {pieceItems.length}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Total Summary */}
      <div className="text-sm text-muted-foreground border-t pt-4">
        Total items across all sections: {items.length}
      </div>

      {/* Add/Edit Modal */}
      <BOMItemModal
        isOpen={showAddModal || !!itemToEdit}
        onClose={handleCloseModal}
        bomId={bomId}
        productId={productId}
        size={size}
        piece={addingToPiece} // Pass the piece to modal
        itemToEdit={itemToEdit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BOM Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this material from the BOM? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
