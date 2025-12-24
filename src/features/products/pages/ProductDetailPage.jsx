import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Plus, Check, X } from "lucide-react"
import {
  useProduct,
  useProductBOMs,
  useActiveBOM,
  useDeleteProduct,
  useUpdateBOM,
} from "../../../hooks/useProducts"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
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
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog"
import BOMItemsTable from "../components/BOMItemsTable"
import BOMVersionsList from "../components/BOMVersionsList"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  const { data: product, isLoading, error } = useProduct(id)
  const { data: activeBOM, isLoading: bomLoading } = useActiveBOM(id)
  const { data: allBOMs } = useProductBOMs(id)
  const deleteProductMutation = useDeleteProduct()

  const handleBack = () => {
    navigate("/products")
  }

  const handleEdit = () => {
    navigate(`/products/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(id)
      navigate("/products")
    } catch (error) {
      // Error toast already shown by mutation
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

  if (error || !product) {
    return (
      <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-2">Failed to load product</div>
            <p className="text-sm text-gray-600">{error?.message || "Product not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      {/* Product Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              {product.primary_image ? (
                <img
                  src={product.primary_image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
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

              <div className="flex gap-2">
                <Button onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{product.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Product
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                      {activeBOM ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-600" />
                          {activeBOM.name || `Version ${activeBOM.version}`}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600">
                          <X className="h-3 w-3" />
                          No active BOM
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shopify Integration */}
              {(product.shopify_product_id || product.shopify_variant_id) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shopify Integration</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {product.shopify_product_id && (
                      <div>
                        <p className="text-gray-600">Shopify Product ID</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {product.shopify_product_id}
                        </p>
                      </div>
                    )}
                    {product.shopify_variant_id && (
                      <div>
                        <p className="text-gray-600">Shopify Variant ID</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {product.shopify_variant_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Active BOM Tab */}
            <TabsContent value="bom" className="mt-0">
              {bomLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : activeBOM ? (
                <BOMItemsTable bom={activeBOM} productId={id} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No active BOM found for this product</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create BOM
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* BOM Versions Tab */}
            <TabsContent value="versions" className="mt-0">
              <BOMVersionsList productId={id} allBOMs={allBOMs} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
