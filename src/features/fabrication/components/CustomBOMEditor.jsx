/**
 * CustomBOMEditor
 * Main editor component for creating/editing custom BOMs
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import CustomBOMSection from "./CustomBOMSection"
import CustomBOMItemModal from "./CustomBOMItemModal"
import {
  useAddCustomBOMItem,
  useUpdateCustomBOMItem,
  useDeleteCustomBOMItem,
  useSubmitCustomBOM,
} from "@/hooks/useFabrication"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ORDER_ITEM_STATUS } from "@/constants/orderConstants"
import { Scissors, Eye, EyeOff, Info, Send, Loader2 } from "lucide-react"

export default function CustomBOMEditor({ item, onBOMSubmitted }) {
  const { user } = useAuth()
  const [showItems, setShowItems] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPiece, setCurrentPiece] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)

  // Mutations
  const addBOMItem = useAddCustomBOMItem()
  const updateBOMItem = useUpdateCustomBOMItem()
  const deleteBOMItem = useDeleteCustomBOMItem()
  const submitBOM = useSubmitCustomBOM()

  // Check if editing is allowed (only in FABRICATION_BESPOKE status)
  const isEditable = item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE

  // Derive pieces from includedItems and selectedAddOns
  const pieces = [
    ...(item.includedItems?.map((i) => i.piece) || []),
    ...(item.selectedAddOns?.map((a) => a.piece) || []),
  ]

  // Get BOM items for a specific piece
  const getBOMItemsForPiece = (piece) => {
    return item.customBOM?.items?.filter((bomItem) => bomItem.piece === piece) || []
  }

  // Get total items count
  const totalItemsCount = item.customBOM?.items?.length || 0

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Handle add item click
  const handleAddItem = (piece) => {
    setCurrentPiece(piece)
    setEditingItem(null)
    setModalOpen(true)
  }

  // Handle edit item click
  const handleEditItem = (piece, bomItem) => {
    setCurrentPiece(piece)
    setEditingItem(bomItem)
    setModalOpen(true)
  }

  // Handle delete item
  const handleDeleteItem = (piece, bomItemId) => {
    deleteBOMItem.mutate({
      itemId: item.id,
      piece,
      bomItemId,
    })
  }

  // Handle modal submit (add or update)
  const handleModalSubmit = (data, existingItemId) => {
    if (existingItemId) {
      // Update existing item
      updateBOMItem.mutate(
        {
          itemId: item.id,
          piece: currentPiece,
          bomItemId: existingItemId,
          bomItemData: {
            ...data,
            updatedBy: user?.name || "System",
          },
        },
        {
          onSuccess: () => {
            setModalOpen(false)
            setEditingItem(null)
            setCurrentPiece(null)
          },
        }
      )
    } else {
      // Add new item
      addBOMItem.mutate(
        {
          itemId: item.id,
          piece: currentPiece,
          bomItemData: {
            ...data,
            addedBy: user?.name || "System",
          },
        },
        {
          onSuccess: () => {
            setModalOpen(false)
            setCurrentPiece(null)
          },
        }
      )
    }
  }

  // Handle submit BOM
  const handleSubmitBOM = () => {
    submitBOM.mutate(
      {
        itemId: item.id,
        submittedBy: user?.name || "System",
      },
      {
        onSuccess: () => {
          setSubmitDialogOpen(false)
          if (onBOMSubmitted) {
            onBOMSubmitted()
          }
        },
      }
    )
  }

  // Check if BOM has at least one item
  const canSubmit = totalItemsCount > 0

  return (
    <>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-200">
          <Scissors className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-slate-900">Custom BOM Creation</h2>
        </div>

        {/* BOM Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Custom BOM</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Custom BOM for {item.productName}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>Sections: {pieces.length}</span>
                  <span>•</span>
                  <span>Items: {totalItemsCount}</span>
                  {item.customBOM?.createdAt && (
                    <>
                      <span>•</span>
                      <span>Created: {formatDate(item.customBOM.createdAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowItems(!showItems)}>
                  {showItems ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Items
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Items
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex no-wrap gap-1">
                BOM items can only reference <strong>FABRIC</strong>, <strong>RAW_MATERIAL</strong>,{" "}
                <strong>MULTI_HEAD</strong>, and <strong>ADDA_MATERIAL</strong> inventory
                categories.
              </AlertDescription>
            </Alert>

            {/* Not editable warning */}
            {!isEditable && (
              <Alert variant="destructive">
                <AlertDescription>
                  This BOM cannot be edited because the order item has moved past the Fabrication
                  stage.
                </AlertDescription>
              </Alert>
            )}

            {/* BOM Sections */}
            {showItems && (
              <div className="space-y-3">
                {pieces.map((piece) => (
                  <CustomBOMSection
                    key={piece}
                    piece={piece}
                    items={getBOMItemsForPiece(piece)}
                    onAddItem={handleAddItem}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    isEditable={isEditable}
                  />
                ))}
              </div>
            )}

            {/* Submit Button */}
            {isEditable && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => setSubmitDialogOpen(true)}
                  disabled={!canSubmit || submitBOM.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitBOM.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Save Custom BOM & Submit for Inventory Check
                </Button>
              </div>
            )}

            {!canSubmit && isEditable && (
              <p className="text-sm text-amber-600 text-right">
                Add at least one material to submit the BOM.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Item Modal */}
      <CustomBOMItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
          setCurrentPiece(null)
        }}
        onSubmit={handleModalSubmit}
        piece={currentPiece}
        editingItem={editingItem}
        isSubmitting={addBOMItem.isPending || updateBOMItem.isPending}
      />

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Custom BOM</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this Custom BOM? Once submitted, the order item will
              move to <strong>Inventory Check</strong> status and the BOM can no longer be edited.
              <br />
              <br />
              <strong>Summary:</strong>
              <br />• {pieces.length} sections
              <br />• {totalItemsCount} total materials
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitBOM.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitBOM}
              disabled={submitBOM.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitBOM.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit BOM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
