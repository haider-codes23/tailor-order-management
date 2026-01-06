import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { getPieceLabel } from "@/constants/productConstants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "Bridal", label: "Bridal" },
  { value: "Formal", label: "Formal" },
  { value: "Semi-Formal", label: "Semi-Formal" },
  { value: "Casual", label: "Casual" },
  { value: "Party Wear", label: "Party Wear" },
]

export default function ProductsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")

  const {
    data: productsResponse,
    isLoading,
    error,
  } = useProducts({
    search,
    category,
  })

  const products = productsResponse?.data || []

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog and BOMs</p>
        </div>
        <Button onClick={() => navigate("/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg mb-6">
          Failed to load products. Please try again.
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-[4/5] w-full mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-1">{product.sku}</CardDescription>
                  </div>
                  <Badge variant={product.active ? "default" : "secondary"} className="shrink-0">
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Product Image */}
                {product.primary_image && (
                  <div className="mb-4 bg-muted rounded-lg overflow-hidden aspect-[3/4] max-w-[260px] mx-auto">
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  {/* Product Items */}
                  {product.product_items && product.product_items.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Includes: </span>
                      <span className="font-medium">
                        {product.product_items.map((item) => getPieceLabel(item.piece)).join(", ")}
                      </span>
                    </div>
                  )}
                  {/* Add-ons */}
                  {product.add_ons && product.add_ons.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Add-ons: </span>
                      <span className="font-medium">
                        {product.add_ons.map((item) => getPieceLabel(item.piece)).join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      PKR{" "}
                      {product.total_price?.toLocaleString() ||
                        product.base_price?.toLocaleString()}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {search || category !== "ALL"
                ? "Try adjusting your filters"
                : "Get started by creating your first product"}
            </p>
            <Button onClick={() => navigate("/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
