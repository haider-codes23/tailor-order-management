import { useNavigate } from "react-router-dom"
import { useLowStockItems } from "@/hooks/useInventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Loader2, AlertTriangle, Package, TrendingDown, ArrowRight, CheckCircle} from "lucide-react"

/**
 * Low Stock Alerts Page
 *
 * This page provides a prioritized view of inventory items that are below their
 * reorder threshold. It is designed specifically for purchasers who need to know
 * what to order from vendors.
 *
 * The page demonstrates several concepts that make it valuable for operations:
 *
 * 1. Automatic filtering - only shows items that need attention
 * 2. Urgency sorting - most critical items appear first
 * 3. Visual hierarchy - color coding and icons communicate priority at a glance
 * 4. Quick navigation - click any item to see details and record stock-in
 * 5. Real-time updates - refetches data regularly so alerts are current
 *
 * The backend calculates an urgency score for each low stock item based on how far
 * below the reorder threshold it has fallen. Items at 10% of their reorder level are
 * more urgent than items at 90% of their reorder level. This scoring helps purchasers
 * make intelligent decisions about ordering priority when they have limited budget or
 * vendor capacity.
 *
 * For variant items like ready stock, if any size is low, the entire item appears in
 * the alerts with details about which specific sizes need restocking. This prevents
 * the problem where a purchaser might order more of a size that is actually adequately
 * stocked while missing that a different size is critically low.
 */
export default function LowStockAlertsPage() {
  const navigate = useNavigate()

  // Fetch low stock items with automatic refetching
  // The hook configuration includes refetchOnWindowFocus so when a purchaser
  // comes back to this page after working in another tab, they see current data
  const { data, isLoading, isError, error } = useLowStockItems()

  /**
   * Loading state while fetching alerts
   * This initial load might take a moment because the backend is calculating
   * urgency scores for all low stock items
   */
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking inventory levels...</p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Error state if the query fails
   */
  if (isError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load low stock alerts: {error?.message || "Unknown error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Extract alerts and metadata from response
  const alerts = data?.data || []
  const meta = data?.meta || {}

  /**
   * Calculate summary statistics for the dashboard header
   * These numbers help purchasers quickly understand the scope of work
   */
  const criticalCount = meta.requires_immediate_attention || 0
  const totalAlerts = meta.total_low_stock_items || 0

  /**
   * Determine severity level based on urgency score
   * This function translates the numeric urgency score into a visual severity
   * that users can understand at a glance through color coding
   */
  const getSeverity = (urgencyScore) => {
    if (urgencyScore >= 75)
      return { label: "Critical", variant: "destructive", color: "text-red-600" }
    if (urgencyScore >= 50)
      return { label: "High", variant: "destructive", color: "text-orange-600" }
    if (urgencyScore >= 25)
      return { label: "Medium", variant: "secondary", color: "text-yellow-600" }
    return { label: "Low", variant: "secondary", color: "text-blue-600" }
  }

  /**
   * Navigate to item detail page
   * From there, the user can see full details and record stock-in
   */
  const handleViewDetails = (item) => {
    navigate(`/inventory/${item.id}`)
  }

  /**
   * Main render with alert summary and prioritized table
   */
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Page Header with Summary Statistics */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
            <p className="text-muted-foreground">
              Items below reorder threshold requiring attention
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Total Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAlerts}</div>
              <p className="text-sm text-muted-foreground mt-1">Items below reorder level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{criticalCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Require immediate ordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Adequate Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {/* This would come from a separate query in a real system */}—
              </div>
              <p className="text-sm text-muted-foreground mt-1">Items with sufficient stock</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alerts Table or Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Alerts</CardTitle>
          <CardDescription>Items sorted by urgency - address critical items first</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            // Happy empty state - no items are low stock!
            <div className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Stock Levels Healthy</h3>
              <p className="text-muted-foreground mb-4">
                No items are currently below their reorder threshold. Great job keeping inventory
                stocked!
              </p>
              <Button variant="outline" onClick={() => navigate("/inventory")}>
                View All Inventory
              </Button>
            </div>
          ) : (
            // Table of low stock items sorted by urgency
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Shortage</TableHead>
                    <TableHead>Affected Sizes</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((item) => {
                    const severity = getSeverity(item.urgency_score)
                    const shortage = item.has_variants
                      ? item.critical_variants.reduce(
                          (sum, v) => sum + (v.reorder_level - v.remaining_stock),
                          0
                        )
                      : item.reorder_level - item.remaining_stock

                    return (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                        {/* Priority Badge */}
                        <TableCell>
                          <Badge variant={severity.variant} className="gap-1 font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            {severity.label}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round(item.urgency_score)}% below
                          </div>
                        </TableCell>

                        {/* Item Name and Image */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-full w-full p-2 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <code className="text-xs text-muted-foreground">{item.sku}</code>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <Badge variant="outline">{item.category.replace("_", " ")}</Badge>
                        </TableCell>

                        {/* Current Stock - highlighted in red */}
                        <TableCell>
                          <div className={`font-semibold ${severity.color}`}>
                            {item.total_stock} {item.unit}
                          </div>
                        </TableCell>

                        {/* Reorder Level */}
                        <TableCell className="text-muted-foreground">
                          {item.reorder_level} {item.unit}
                        </TableCell>

                        {/* Shortage Amount */}
                        <TableCell>
                          <div className="font-medium text-destructive">
                            -{shortage} {item.unit}
                          </div>
                        </TableCell>

                        {/* Critical Variants (for ready stock with sizes) */}
                        <TableCell>
                          {item.critical_variants && item.critical_variants.length > 0 ? (
                            <div className="space-y-1">
                              {item.critical_variants.map((variant) => (
                                <Badge key={variant.variant_id} variant="outline" className="mr-1">
                                  {variant.size}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Action Button */}
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(item)}
                          >
                            View Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful Tips Card */}
      {alerts.length > 0 && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm">Purchasing Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Critical items</strong> are more than seventy-five percent below their
                reorder level and should be ordered immediately.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Package className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                Click <strong>View Details</strong> on any item to see full information, vendor
                contacts, and record stock-in when materials arrive.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <TrendingDown className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                For items with size variants, the <strong>Affected Sizes</strong> column shows which
                specific sizes need restocking.
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
