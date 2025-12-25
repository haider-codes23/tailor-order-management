import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react"
import {
  useProduct,
  useProductBOMs,
  useActiveBOM,
  useDeleteProduct,
} from "../../../hooks/useProducts"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
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
import BOMItemsTable from "../components/BOMItemsTable"
import BOMVersionsList from "../components/BOMVersionsList"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: product, isLoading, error } = useProduct(id)
  const { data: activeBOM, isLoading: bomLoading } = useActiveBOM(id)
  const { data: allBOMs } = useProductBOMs(id)
  const deleteProductMutation = useDeleteProduct()

  // ✅ NEW: Check if product has BOMs
  const hasBOMs = allBOMs && allBOMs.length > 0
  const canDeleteProduct = !hasBOMs

  const handleBack = () => {
    navigate(-1)
  }

  const handleEdit = () => {
    navigate(`/products/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      console.log("Deleting product:", id)
      await deleteProductMutation.mutateAsync(id)
      setShowDeleteDialog(false)
      navigate("/products")
    } catch (error) {
      console.error("Delete error:", error)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="w-full md:w-64 h-64" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Product</h2>
            <p className="text-gray-600 mb-4">{error.message || "Product not found"}</p>
            <Button onClick={() => navigate("/products")}>Back to Products</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/products")}>Back to Products</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>

      {/* Product Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img
                src={
                  product.primary_image || product.image_url || "/images/products/placeholder.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-gray-600">SKU: {product.sku}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Category</p>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div>
                  <p className="text-gray-600">Base Price</p>
                  <p className="font-medium text-gray-900">
                    {product.base_price ? `PKR ${product.base_price.toLocaleString()}` : "Not set"}
                  </p>
                </div>
                {product.description && (
                  <div className="col-span-2">
                    <p className="text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{product.description}</p>
                  </div>
                )}
              </div>

              {/* ✅ NEW: Action Buttons with conditional delete */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={!canDeleteProduct}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {/* ✅ NEW: Warning message when delete is disabled */}
                {hasBOMs && (
                  <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Cannot delete this product.</strong> Please delete all{" "}
                      {allBOMs.length} BOM version{allBOMs.length > 1 ? "s" : ""} first in the "BOM
                      Versions" tab.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bom">BOM {activeBOM && "(Active)"}</TabsTrigger>
              <TabsTrigger value="versions">
                BOM Versions {allBOMs && `(${allBOMs.length})`}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Product ID</p>
                    <p className="font-mono text-xs text-gray-900">{product.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="text-gray-900">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Active BOM</p>
                    <p className="text-gray-900">
                      {activeBOM ? `Version ${activeBOM.version}` : "No active BOM"}
                    </p>
                  </div>
                </div>
              </div>

              {product.shopify_product_id && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shopify Integration</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Product ID</p>
                      <p className="font-mono text-xs text-gray-900">
                        {product.shopify_product_id}
                      </p>
                    </div>
                    {product.shopify_variant_id && (
                      <div>
                        <p className="text-gray-600">Variant ID</p>
                        <p className="font-mono text-xs text-gray-900">
                          {product.shopify_variant_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* BOM Tab */}
            <TabsContent value="bom" className="mt-0">
              {bomLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading BOM...</p>
                </div>
              ) : activeBOM ? (
                <BOMItemsTable bom={activeBOM} productId={id} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No active BOM for this product</p>
                  <Button>Create First BOM</Button>
                </div>
              )}
            </TabsContent>

            {/* BOM Versions Tab */}
            <TabsContent value="versions" className="mt-0">
              <BOMVersionsList productId={id} allBOMs={allBOMs || []} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Delete Confirmation Dialog - Only opens if BOMs are deleted */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{product.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProductMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
