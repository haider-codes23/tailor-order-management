import { useState, useEffect } from "react"
import { Plus, Eye, Check, Trash2, XCircle } from "lucide-react"
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
import CreateBOMModal from "./CreateBOMModal"

export default function BOMVersionsList({ productId, allBOMs }) {
  const [bomToActivate, setBomToActivate] = useState(null)
  const [bomToDeactivate, setBomToDeactivate] = useState(null)
  const [bomToDelete, setBomToDelete] = useState(null)
  
  // ✅ NEW: State for create modal
  const [showCreateModal, setShowCreateModal] = useState(false)

  const updateBOMMutation = useUpdateBOM()
  const deleteBOMMutation = useDeleteBOM()

  // ✅ DEBUG: Log when allBOMs changes
  useEffect(() => {
    console.log('🔍 BOMVersionsList - allBOMs updated:', allBOMs)
    console.log('🔍 BOMVersionsList - Active BOMs:', allBOMs?.filter(b => b.is_active))
    console.log('🔍 BOMVersionsList - Inactive BOMs:', allBOMs?.filter(b => !b.is_active))
  }, [allBOMs])

  // ✅ EXISTING: Activate a BOM
  const handleActivate = async () => {
    if (!bomToActivate) return

    console.log('🔄 Activating BOM:', bomToActivate.id) // Debug log

    try {
      const result = await updateBOMMutation.mutateAsync({
        bomId: bomToActivate.id,
        updates: { is_active: true },
      })
      console.log('✅ Activate successful:', result) // Debug log
      setBomToActivate(null)
    } catch (error) {
      console.error('❌ Activate failed:', error) // Debug log
      // Error toast already shown by mutation
    }
  }

  // ✅ NEW: Deactivate a BOM
  const handleDeactivate = async () => {
    if (!bomToDeactivate) return

    console.log('🔄 Deactivating BOM:', bomToDeactivate.id) // Debug log

    try {
      const result = await updateBOMMutation.mutateAsync({
        bomId: bomToDeactivate.id,
        updates: { is_active: false },
      })
      console.log('✅ Deactivate successful:', result) // Debug log
      setBomToDeactivate(null)
    } catch (error) {
      console.error('❌ Deactivate failed:', error) // Debug log
      // Error toast already shown by mutation
    }
  }

  // ✅ EXISTING: Delete a BOM
  const handleDelete = async () => {
    if (!bomToDelete) return

    console.log('🗑️ Deleting BOM:', bomToDelete.id) // Debug log

    try {
      const result = await deleteBOMMutation.mutateAsync({
        bomId: bomToDelete.id,
        productId,
      })
      console.log('✅ Delete successful:', result) // Debug log
      setBomToDelete(null)
    } catch (error) {
      console.error('❌ Delete failed:', error) // Debug log
      // Error toast already shown by mutation
    }
  }

  // ✅ EXISTING: View button handler
  const handleViewBOM = (bomId) => {
    window.alert(
      `View BOM feature coming soon!\n\nBOM ID: ${bomId}\n\nThis will open a detailed view of the BOM in a future update.`
    )
  }

  if (!allBOMs || allBOMs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No BOMs created for this product</p>
        {/* ✅ NEW: Create First BOM button opens modal */}
        <Button onClick={() => setShowCreateModal(true)}>
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
        {/* ✅ NEW: Create New Version button opens modal */}
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Version
        </Button>
      </div>

      {/* ✅ DEBUG: Show current state */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <strong>Debug Info:</strong> Total BOMs: {allBOMs.length} | 
        Active: {allBOMs.filter(b => b.is_active).length} | 
        Inactive: {allBOMs.filter(b => !b.is_active).length}
      </div>

      {/* BOM List */}
      <div className="space-y-3">
        {allBOMs.map((bom) => {
          // ✅ DEBUG: Log each BOM as it renders
          console.log(`🎨 Rendering BOM ${bom.id}:`, { 
            is_active: bom.is_active, 
            version: bom.version 
          })
          
          return (
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
                    {/* ✅ DEBUG: Show actual status */}
                    <span className="text-xs text-gray-500">
                      (is_active: {bom.is_active ? 'true' : 'false'})
                    </span>
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

                {/* Action Buttons */}
                <div className="flex gap-2 shrink-0">
                  {/* View button - always visible */}
                  <Button variant="outline" size="sm" onClick={() => handleViewBOM(bom.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {/* ACTIVE BOM: Show Deactivate button */}
                  {bom.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔘 Deactivate button clicked for:', bom.id)
                        setBomToDeactivate(bom)
                      }}
                      disabled={updateBOMMutation.isPending}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {updateBOMMutation.isPending ? "Processing..." : "Deactivate"}
                    </Button>
                  )}

                  {/* INACTIVE BOM: Show Activate and Delete buttons */}
                  {!bom.is_active && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🔘 Activate button clicked for:', bom.id)
                          setBomToActivate(bom)
                        }}
                        disabled={updateBOMMutation.isPending}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {updateBOMMutation.isPending ? "Processing..." : "Activate"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🔘 Delete button clicked for:', bom.id)
                          setBomToDelete(bom)
                        }}
                        disabled={deleteBOMMutation.isPending}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleteBOMMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ✅ NEW: Deactivate Confirmation Dialog */}
      <AlertDialog open={!!bomToDeactivate} onOpenChange={() => setBomToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{bomToDeactivate?.name || `Version ${bomToDeactivate?.version}`}
              ". The product will have no active BOM until you activate a different version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivate}
              disabled={updateBOMMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {updateBOMMutation.isPending ? "Deactivating..." : "Deactivate BOM"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={!!bomToActivate} onOpenChange={() => setBomToActivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate this BOM?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set "{bomToActivate?.name || `Version ${bomToActivate?.version}`}" as the
              active BOM. Any currently active BOM will be deactivated. This affects all future
              orders for this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActivate}
              disabled={updateBOMMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateBOMMutation.isPending ? "Activating..." : "Activate BOM"}
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBOMMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBOMMutation.isPending ? "Deleting..." : "Delete BOM"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ NEW: Create BOM Modal */}
      <CreateBOMModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        productId={productId}
        currentBOMsCount={allBOMs.length}
      />
    </div>
  )
}