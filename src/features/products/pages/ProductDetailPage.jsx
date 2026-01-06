import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { useProduct, useDeleteProduct, useProductBOMs } from "../../../hooks/useProducts"
import { getPieceLabel, isMainGarment, isAddOn } from "@/constants/productConstants"
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
import { toast } from "sonner"
import BOMVersionsList from "../components/BOMVersionsList"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: productResponse, isLoading, error } = useProduct(id)
  const deleteProductMutation = useDeleteProduct()

  // Fetch all BOMs for this product to check if deletion is allowed
  const { data: bomsResponse } = useProductBOMs(id, null)
  const productBOMs = bomsResponse?.data || []
  const hasBOMs = productBOMs.length > 0

  const product = productResponse?.data

  const handleBack = () => {
    navigate("/products")
  }

  const handleEdit = () => {
    navigate(`/products/${id}/edit`)
  }

  const handleDeleteClick = () => {
    // Check if product has BOMs
    if (hasBOMs) {
      toast.error("Cannot delete product", {
        description: `This product has ${productBOMs.length} BOM${productBOMs.length !== 1 ? "s" : ""}. Delete all BOMs first.`,
        duration: 5000,
      })
      return
    }
    // No BOMs, proceed to confirmation dialog
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(id)
      navigate("/products")
    } catch (error) {
      // Error toast already shown by mutation
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (error || !product) {
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
            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
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
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-medium text-gray-900 text-lg">
                    PKR {product.total_price?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Product Items */}
              {product.product_items && product.product_items.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">Includes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.product_items.map((item) => (
                      <Badge key={item.piece} variant="outline" className="bg-blue-50">
                        {getPieceLabel(item.piece)} - PKR {item.price?.toLocaleString() || 0}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {product.add_ons && product.add_ons.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {product.add_ons.map((item) => (
                      <Badge key={item.piece} variant="outline" className="bg-green-50">
                        {getPieceLabel(item.piece)}
                        {item.price > 0 ? ` - PKR ${item.price.toLocaleString()}` : " (Included)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              {product.subtotal > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>PKR {product.subtotal?.toLocaleString()}</span>
                  </div>
                  {product.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- PKR {product.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>PKR {product.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {product.description && (
                <div>
                  <p className="text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button variant="destructive" onClick={handleDeleteClick}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - ONLY 2 TABS! */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="border-b">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="versions">BOM Versions</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Additional Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Created At</p>
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
                  </div>
                </div>

                {/* Available Sizes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.available_sizes && product.available_sizes.length > 0 ? (
                      product.available_sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">No sizes defined</span>
                    )}
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

            {/* BOM Versions Tab - ONLY THIS ONE! */}
            <TabsContent value="versions" className="mt-0">
              <BOMVersionsList productId={id} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Delete Confirmation Dialog */}
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
