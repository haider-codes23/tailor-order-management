import { useState } from "react"
import { Plus, Eye, Check, Trash2 } from "lucide-react"
import { useUpdateBOM, useDeleteBOM } from "../../../hooks/useProducts"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
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

export default function BOMVersionsList({ productId, allBOMs }) {
  const [bomToActivate, setBomToActivate] = useState(null)
  const [bomToDelete, setBomToDelete] = useState(null)

  const updateBOMMutation = useUpdateBOM()
  const deleteBOMMutation = useDeleteBOM()

  const handleActivate = async () => {
    if (!bomToActivate) return

    try {
      await updateBOMMutation.mutateAsync({
        bomId: bomToActivate.id,
        updates: { is_active: true },
      })
      setBomToActivate(null)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  const handleDelete = async () => {
    if (!bomToDelete) return

    try {
      await deleteBOMMutation.mutateAsync({
        bomId: bomToDelete.id,
        productId,
      })
      setBomToDelete(null)
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  if (!allBOMs || allBOMs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No BOMs created for this product</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create First BOM
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">BOM Version History</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Version
        </Button>
      </div>

      {/* BOM List */}
      <div className="space-y-3">
        {allBOMs.map((bom) => (
          <div
            key={bom.id}
            className={`border-2 rounded-lg p-4 ${
              bom.is_active ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {bom.name || `Version ${bom.version}`}
                  </h4>
                  <Badge
                    variant={bom.is_active ? "default" : "secondary"}
                    className={bom.is_active ? "bg-green-100 text-green-800" : ""}
                  >
                    {bom.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>

                {bom.notes && <p className="text-sm text-gray-600 mb-2">{bom.notes}</p>}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Created {new Date(bom.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Version {bom.version}</span>
                  {bom.created_by && (
                    <>
                      <span>•</span>
                      <span>by {bom.created_by}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                {!bom.is_active && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBomToActivate(bom)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBomToDelete(bom)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Total versions: {allBOMs.length} • Active: {allBOMs.filter((b) => b.is_active).length}
      </div>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={!!bomToActivate} onOpenChange={() => setBomToActivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate this BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set "{bomToActivate?.name || `Version ${bomToActivate?.version}`}" as the
              active BOM. The currently active BOM will be deactivated. This affects all future
              orders for this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} className="bg-green-600 hover:bg-green-700">
              Activate BOM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bomToDelete} onOpenChange={() => setBomToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{bomToDelete?.name || `Version ${bomToDelete?.version}`}
              " and all its items. This action cannot be undone.
              {bomToDelete?.is_active && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This BOM is currently active and cannot be deleted. Please activate a
                  different BOM first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={bomToDelete?.is_active}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete BOM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
