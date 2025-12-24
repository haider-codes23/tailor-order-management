import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Search, Filter, Package } from "lucide-react"
import { useProducts } from "../../../hooks/useProducts"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Skeleton } from "../../../components/ui/skeleton"

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "FORMAL", label: "Formal" },
  { value: "SEMI_FORMAL", label: "Semi-Formal" },
  { value: "CASUAL", label: "Casual" },
  { value: "BRIDAL", label: "Bridal" },
]

export default function ProductsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("all")

  // Build filter object
  const filters = {}
  if (search) filters.search = search
  if (category !== "ALL") filters.category = category
  if (activeFilter === "active") filters.active = true
  if (activeFilter === "inactive") filters.active = false

  const { data: products, isLoading, error } = useProducts(filters)

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`)
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog and BOMs</p>
        </div>
        <Link to="/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
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

            {/* Active Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="flex-1"
              >
                All
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("active")}
                className="flex-1"
              >
                Active
              </Button>
              <Button
                variant={activeFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("inactive")}
                className="flex-1"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-2">Failed to load products</div>
            <p className="text-sm text-gray-600">{error.message}</p>
          </CardContent>
        </Card>
      ) : products?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {search || category !== "ALL"
                ? "Try adjusting your filters"
                : "Get started by creating your first product"}
            </p>
            {!search && category === "ALL" && (
              <Link to="/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  {product.primary_image ? (
                    <div className="relative h-48 w-full bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      {!product.active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">
                        {product.name}
                      </h3>
                      {product.active && (
                        <Badge variant="outline" className="ml-2 shrink-0">
                          Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{product.category}</Badge>
                      {product.base_price && (
                        <span className="text-sm font-medium text-gray-900">
                          PKR {product.base_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
