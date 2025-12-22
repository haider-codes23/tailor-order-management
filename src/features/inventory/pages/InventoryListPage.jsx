import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInventoryItems } from "@/hooks/useInventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Plus, AlertCircle, Package } from "lucide-react"

/**
 * Inventory List Page
 *
 * This page displays all inventory items in a searchable, filterable table.
 * It demonstrates how simple components become when React Query handles all
 * the data fetching complexity.
 *
 * Key Features:
 * - Real-time filtering by category
 * - Search by name or SKU
 * - Visual indicators for low stock items
 * - Click any row to navigate to detail page
 * - Responsive table that works on mobile devices
 *
 * Notice how this entire component is just UI logic. There are no useEffect
 * hooks managing when to fetch data. No complex state management for loading
 * and errors. React Query provides all of that automatically through the
 * useInventoryItems hook.
 *
 * The component rerenders whenever the filters change, which triggers the hook
 * to fetch new data with those filters. If the data for those filters is already
 * cached, React Query returns it instantly. If not, it fetches it and caches
 * the result for next time. All of this happens automatically without any code
 * in this component.
 */
export default function InventoryListPage() {
  const navigate = useNavigate()

  // Local state for filter controls
  // These are UI state, not server state, so useState is appropriate
  const [category, setCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Build filters object to pass to the hook
  // We only include filters that are actually set to avoid unnecessary query params
  const filters = {}
  if (category !== "all") {
    filters.category = category
  }
  if (searchTerm.trim() !== "") {
    filters.search = searchTerm.trim()
  }

  // Fetch inventory items with current filters
  // The hook returns loading state, error state, and data automatically
  const { data, isLoading, isError, error } = useInventoryItems(filters)

  /**
   * Handle row click to navigate to detail page
   * This is a pattern you will use throughout your application where list items
   * are clickable and take you to a detail view
   */
  const handleRowClick = (item) => {
    navigate(`/inventory/${item.id}`)
  }

  /**
   * Navigate to the create new item page
   * In a future step, we might build an inline creation modal instead
   */
  const handleCreateNew = () => {
    navigate("/inventory/new")
  }

  /**
   * Render loading state
   * While React Query is fetching data, we show a centered spinner
   * This only happens on the initial load or when switching to a completely
   * new filter combination that is not cached
   */
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render error state
   * If the query fails, React Query provides the error automatically
   * We display it in a user-friendly way with an option to retry
   */
  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load inventory: {error?.message || "Unknown error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract the items array from the response
  // Our API returns { success: true, data: [...items], meta: {...} }
  const items = data?.data || []

  /**
   * Main render with filters and table
   * The UI is straightforward because all the complex data management happens
   * in the layers beneath this component
   */
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track all materials, fabrics, embellishments, and ready stock items
          </p>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter inventory items by category, name, or SKU
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="FABRIC">Fabrics</SelectItem>
                  <SelectItem value="MULTI_HEAD">Multi-Head Embroidery</SelectItem>
                  <SelectItem value="ADA_MATERIAL">ADA Materials</SelectItem>
                  <SelectItem value="RAW_MATERIAL">Raw Materials</SelectItem>
                  <SelectItem value="READY_STOCK">Ready Stock</SelectItem>
                  <SelectItem value="READY_SAMPLE">Ready Samples</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              Showing {items.length} item{items.length !== 1 ? "s" : ""}
              {category !== "all" && ` in ${category.replace("_", " ")}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            // Empty state when no items match filters
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || category !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "Get started by adding your first inventory item"}
              </p>
              {!searchTerm && category === "all" && (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          ) : (
            // Table with inventory items
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {/* Item Name with Image */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  e.target.style.display = "none"
                                  e.target.parentElement.innerHTML =
                                    '<Package class="h-full w-full p-2 text-muted-foreground" />'
                                }}
                              />
                            ) : (
                              <Package className="h-full w-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            {item.has_variants && (
                              <p className="text-xs text-muted-foreground">
                                {item.variants.length} size variants
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* SKU */}
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
                      </TableCell>

                      {/* Category Badge */}
                      <TableCell>
                        <Badge variant="outline">{item.category.replace("_", " ")}</Badge>
                      </TableCell>

                      {/* Stock Level */}
                      <TableCell>
                        <div className="font-medium">
                          {item.has_variants ? (
                            // For variant items, show total across all sizes
                            <span>{item.total_stock} total</span>
                          ) : (
                            // For simple items, show the stock value
                            <span>{item.remaining_stock}</span>
                          )}
                        </div>
                        {item.has_variants && (
                          <div className="text-xs text-muted-foreground">
                            Across {item.variants.length} sizes
                          </div>
                        )}
                      </TableCell>

                      {/* Unit */}
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>

                      {/* Rack Location */}
                      <TableCell>
                        {item.rack_location || <span className="text-muted-foreground">—</span>}
                      </TableCell>

                      {/* Stock Status */}
                      <TableCell>
                        {item.is_low_stock ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" className="bg-green-100 text-green-800">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
