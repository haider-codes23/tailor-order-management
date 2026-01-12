/**
 * CustomBOMSection
 * A collapsible section for a specific piece (e.g., Peshwas, Lehnga) in the Custom BOM
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"

export default function CustomBOMSection({
  piece,
  items = [],
  onAddItem,
  onEditItem,
  onDeleteItem,
  isEditable = true,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Format piece name for display
  const getPieceLabel = (p) => {
    return p
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(piece, itemToDelete.id)
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-slate-900 capitalize">
                {getPieceLabel(piece)}
              </span>
              <span className="text-sm text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            {isEditable && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddItem(piece)
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t">
            {items.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>No materials added yet.</p>
                {isEditable && (
                  <Button variant="link" className="mt-2" onClick={() => onAddItem(piece)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add first material
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[200px]">Notes</TableHead>
                    {isEditable && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
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
                        <span className="font-medium">{item.quantity}</span>
                        <span className="text-muted-foreground ml-1">{item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{item.notes || "—"}</span>
                      </TableCell>
                      {isEditable && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditItem(piece, item)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToDelete?.inventory_item_name}" from the{" "}
              {getPieceLabel(piece)} section? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
