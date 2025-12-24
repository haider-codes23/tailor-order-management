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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and BOMs</p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
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

        {/* Active Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            onClick={() => setActiveFilter("active")}
            className="flex-1"
          >
            Active
          </Button>
          <Button
            variant={activeFilter === "inactive" ? "default" : "outline"}
            onClick={() => setActiveFilter("inactive")}
            className="flex-1"
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden p-0">
              <Skeleton className="aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] w-full" />
              <CardContent className="p-3">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-destructive">Failed to load products</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      ) : products?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No products found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {search || category !== "ALL"
                ? "Try adjusting your filters"
                : "Get started by creating your first product"}
            </p>
            {!search && category === "ALL" && (
              <Button asChild>
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </div>

          {/* Products Grid - Responsive */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg p-0"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Product Image - Responsive aspect ratios */}
                {product.primary_image ? (
                  <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] overflow-hidden bg-gray-100">
                    {!product.active && (
                      <div className="absolute left-2 top-2 z-10">
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      </div>
                    )}
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] items-center justify-center bg-gray-100">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                  </div>
                )}

                {/* Product Info */}
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm sm:text-base font-semibold">
                      {product.name}
                    </h3>
                    {product.active && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>

                  <p className="mb-2 text-xs sm:text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {product.category}
                    </span>
                    {product.base_price && (
                      <span className="text-sm sm:text-base font-semibold">
                        PKR {product.base_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
