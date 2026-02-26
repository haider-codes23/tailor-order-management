/**
 * FabricationOrdersListPage
 * Displays list of orders that have custom size items needing BOM creation
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFabricationOrders } from "@/hooks/useFabrication"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Search, Scissors, Eye, Package } from "lucide-react"
import SortControl from "@/components/ui/SortControl"
import { applySortToTasks } from "@/utils/sortHelper"

export default function FabricationOrdersListPage() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState("fwd_asc")

  const { data: ordersData, isLoading, isError, error } = useFabricationOrders()

  const orders = Array.isArray(ordersData) ? ordersData : ordersData?.data || []

  const sortedOrders = [...orders].sort((a, b) => {
    switch (sortBy) {
      case "product_asc":
        // For fabrication, orders have multiple items, sort by order number or first item
        return (a.orderNumber || "").localeCompare(b.orderNumber || "")
      case "product_desc":
        return (b.orderNumber || "").localeCompare(a.orderNumber || "")
      case "productionDate_asc":
        return new Date(a.productionShippingDate || 0) - new Date(b.productionShippingDate || 0)
      case "productionDate_desc":
        return new Date(b.productionShippingDate || 0) - new Date(a.productionShippingDate || 0)
      case "fwd_asc":
        return new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0)
      case "fwd_desc":
        return new Date(b.fwdDate || 0) - new Date(a.fwdDate || 0)
      default:
        return 0
    }
  })

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading fabrication orders: {error?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 p-2">
            <Scissors className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fabrication Queue</h1>
            <p className="text-muted-foreground">
              Orders with custom size items requiring BOM creation
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </Badge>
      </div>

      <div className="flex justify-end">
        <SortControl value={sortBy} onChange={setSortBy} />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pending Custom BOMs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No orders in queue</h3>
              <p className="text-muted-foreground">All custom size items have their BOMs created</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Production Ship Date</TableHead>
                  <TableHead className="text-center">Custom Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.consultantName || "—"}</TableCell>
                    <TableCell>{formatDate(order.productionShippingDate)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {order.customItemsCount} {order.customItemsCount === 1 ? "item" : "items"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/fabrication/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
