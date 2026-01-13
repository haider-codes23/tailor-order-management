import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CustomBOMViewModal({ open, onOpenChange, customBOM }) {
  if (!customBOM) return null

  // Group items by piece
  const groupedItems =
    customBOM.items?.reduce((acc, item) => {
      const piece = item.piece || "General"
      if (!acc[piece]) acc[piece] = []
      acc[piece].push(item)
      return acc
    }, {}) || {}

  // Get piece order from customBOM.pieces if available, otherwise use keys
  const pieceOrder = customBOM.pieces || Object.keys(groupedItems)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custom BOM Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* BOM Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created By:</span>{" "}
              <span className="font-medium">{customBOM.submittedBy || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created At:</span>{" "}
              <span className="font-medium">
                {customBOM.submittedAt ? new Date(customBOM.submittedAt).toLocaleString() : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <Badge variant="outline">{customBOM.status || "SUBMITTED"}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>{" "}
              <span className="font-medium">{customBOM.version || 1}</span>
            </div>
          </div>

          {/* BOM Items grouped by Piece */}
          {pieceOrder.map((piece) => {
            const items = groupedItems[piece]
            if (!items || items.length === 0) return null

            return (
              <div key={piece} className="space-y-2">
                <h4 className="font-semibold text-sm border-b pb-1 capitalize">{piece}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="font-medium">
                          {item.inventory_item_name ||
                            item.inventoryItemName ||
                            item.name ||
                            "Unknown"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.inventory_item_sku || item.inventoryItemSku || item.sku || "-"}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.unit || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })}

          {(!customBOM.items || customBOM.items.length === 0) && (
            <p className="text-muted-foreground text-center py-4">No BOM items found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
