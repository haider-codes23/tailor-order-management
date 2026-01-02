import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useInventoryItem, useStockMovements } from "@/hooks/useInventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Loader2,
  ArrowLeft,
  Package,
  Edit,
  Plus,
  AlertCircle,
  TrendingUp,
  Clock,
  TrendingDown,
} from "lucide-react"
import { StockInModal } from "../components/StockInModal"
import { StockOutModal } from "../components/StockOutModal"

/**
 * Inventory Detail Page
 *
 * This page displays comprehensive information about a single inventory item.
 * Enhanced with visual feedback during background refetching to show users
 * that their actions (like stock-in) are being processed and data is updating.
 */
export default function InventoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Local state for UI controls
  const [showStockInModal, setShowStockInModal] = useState(false)
  const [showStockOutModal, setShowStockOutModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch the inventory item with isFetching state for background refetch indicator
  const {
    data: itemData,
    isLoading: itemLoading,
    isFetching: itemFetching,
    isError: itemError,
    error,
  } = useInventoryItem(parseInt(id))

  // Fetch stock movements with isFetching state
  const {
    data: movementsData,
    isLoading: movementsLoading,
    isFetching: movementsFetching,
  } = useStockMovements(parseInt(id))

  /**
   * Loading State
   * We show a loading spinner while the initial item data loads
   * The movements can load in the background since they are in a tab
   */
  if (itemLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading item details...</p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Error State
   * If the item doesn't exist or the fetch failed, show error with back button
   */
  if (itemError) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/inventory")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || "Failed to load inventory item"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract item from response
  const item = itemData?.data

  if (!item) {
    return null
  }

  /**
   * Calculate display values
   * For variant items, we need to compute totals and identify low stock sizes
   */
  const totalStock = item.has_variants
    ? item.variants.reduce((sum, v) => sum + v.remaining_stock, 0)
    : item.remaining_stock

  const lowStockVariants = item.has_variants
    ? item.variants.filter((v) => v.remaining_stock < v.reorder_level)
    : []

  /**
   * Main render with tabbed interface and refetch indicators
   * Overview tab shows basic info and stock levels
   * History tab shows transaction timeline
   */
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/inventory")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>

        {/* Visual indicator when data is being refetched in background */}
        {itemFetching && !itemLoading && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">Refreshing item data...</AlertDescription>
          </Alert>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Item Image */}
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-full w-full p-4 text-muted-foreground" />
              )}
            </div>

            {/* Item Title and Metadata */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{item.name}</h1>
              <div className="flex items-center gap-3 text-sm">
                <code className="bg-muted px-2 py-1 rounded">{item.sku}</code>
                <Badge variant="outline">{item.category.replace("_", " ")}</Badge>
                {item.is_low_stock && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/inventory/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setShowStockOutModal(true)}>
              <TrendingDown className="h-4 w-4 mr-2" />
              Stock Out
            </Button>
            <Button onClick={() => setShowStockInModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Stock In
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">
            Transaction History
            {movementsData?.data.movements && ` (${movementsData.data.movements.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stock Summary Cards with pulsing animation during refetch */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={itemFetching && !itemLoading ? "animate-pulse" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalStock}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.unit}
                  {totalStock !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card className={itemFetching && !itemLoading ? "animate-pulse" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reorder Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {item.has_variants
                    ? Math.max(...item.variants.map((v) => v.reorder_level))
                    : item.reorder_level}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.unit}
                  {item.has_variants ? "s per size" : "s"}
                </p>
              </CardContent>
            </Card>
            {/* Reorder Amount Card */}
            <Card className={itemFetching && !itemLoading ? "animate-pulse" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Reorder Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {item.has_variants
                    ? item.variants.reduce((sum, v) => sum + v.reorder_amount, 0)
                    : item.reorder_amount || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.unit}s to order{item.has_variants ? " (total)" : ""}
                </p>
              </CardContent>
            </Card>

            {/* Total Value Card */}
            <Card className={itemFetching && !itemLoading ? "animate-pulse" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {item.has_variants
                    ? item.variants
                        .reduce(
                          (sum, v) => sum + v.remaining_stock * (v.price || item.base_price || 0),
                          0
                        )
                        .toLocaleString()
                    : ((item.remaining_stock || 0) * (item.unit_price || 0)).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">PKR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unit Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {item.has_variants
                    ? item.base_price?.toLocaleString() || 0
                    : item.unit_price?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">PKR per {item.unit}</p>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert for Variants */}
          {lowStockVariants.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Low stock alert:</strong> The following sizes are below reorder level:{" "}
                {lowStockVariants.map((v) => v.size).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          {/* Size Variants Table (for Ready Stock) with pulsing during refetch */}
          {item.has_variants && item.variants && (
            <Card className={itemFetching && !itemLoading ? "animate-pulse" : ""}>
              <CardHeader>
                <CardTitle>Size Availability</CardTitle>
                <CardDescription>Stock levels for each size variant of this item</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Reorder Amount</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.variants.map((variant) => {
                      const isLow = variant.remaining_stock < variant.reorder_level
                      return (
                        <TableRow key={variant.variant_id}>
                          <TableCell className="font-medium">{variant.size}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {variant.sku}
                            </code>
                          </TableCell>
                          <TableCell>{variant.remaining_stock}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {variant.reorder_level}
                          </TableCell>
                          <TableCell>{variant.reorder_amount}</TableCell>
                          <TableCell>PKR {variant.price?.toLocaleString()}</TableCell>
                          <TableCell>
                            {isLow ? (
                              <Badge variant="destructive">Low</Badge>
                            ) : variant.remaining_stock === 0 ? (
                              <Badge variant="secondary">Out of Stock</Badge>
                            ) : (
                              <Badge variant="success" className="bg-green-100 text-green-800">
                                Available
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Item Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{item.description || "No description provided"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="mt-1">{item.category.replace("_", " ")}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Unit of Measurement
                  </label>
                  <p className="mt-1">{item.unit}</p>
                </div>

                {item.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="mt-1">{item.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                  <p className="mt-1">{item.vendor_name || "Not specified"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Vendor Contact
                  </label>
                  <p className="mt-1">{item.vendor_contact || "Not specified"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rack Location</label>
                  <p className="mt-1">{item.rack_location || "Not assigned"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Stock Movement History
                {movementsFetching && !movementsLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
                )}
              </CardTitle>
              <CardDescription>
                Complete audit trail of all stock-in and stock-out transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : movementsData?.data.movements && movementsData.data.movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>After Transaction</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsData.data.movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {new Date(movement.transaction_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.movement_type === "STOCK_IN" ? "default" : "secondary"
                            }
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {movement.movement_type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.movement_type === "STOCK_IN" ? "+" : "-"}
                          {movement.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.remaining_stock_after} {item.unit}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {movement.reference_number}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {movement.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transaction history yet</p>
                  <p className="text-sm mt-1">Stock movements will appear here once recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock-In Modal */}
      {showStockInModal && (
        <StockInModal
          item={item}
          open={showStockInModal}
          onClose={() => setShowStockInModal(false)}
        />
      )}

      {/* Stock-Out Modal */}
      {showStockOutModal && (
        <StockOutModal
          item={item}
          open={showStockOutModal}
          onClose={() => setShowStockOutModal(false)}
        />
      )}
    </div>
  )
}
