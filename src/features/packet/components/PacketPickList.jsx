/**
 * PacketPickList.jsx
 * Material checklist for packet creation
 * Shows all materials to gather with rack locations and pick status
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Package, MapPin, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { usePickItem } from "@/hooks/usePacket"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PACKET_STATUS } from "@/constants/orderConstants"

export default function PacketPickList({ packet, canPick = false, onItemPicked }) {
  const { user } = useAuth()
  const pickItem = usePickItem()
  const [pickingItemId, setPickingItemId] = useState(null)

  if (!packet || !packet.pickList) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No pick list available</p>
        </CardContent>
      </Card>
    )
  }

  const { pickList, pickedItems, totalItems } = packet
  const progress = totalItems > 0 ? (pickedItems / totalItems) * 100 : 0

  const handlePickItem = async (item) => {
    if (!canPick || item.isPicked) return

    setPickingItemId(item.id)

    try {
      await pickItem.mutateAsync({
        orderItemId: packet.orderItemId,
        pickItemId: item.id,
        pickedQty: item.requiredQty,
        userId: user?.id,
      })
      onItemPicked?.(item)
    } finally {
      setPickingItemId(null)
    }
  }

  // Group items by piece for better organization
  const groupedItems = pickList.reduce((acc, item) => {
    const piece = item.piece || "General"
    if (!acc[piece]) acc[piece] = []
    acc[piece].push(item)
    return acc
  }, {})

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pick List
          </CardTitle>
          <Badge variant="outline">
            {pickedItems}/{totalItems} picked
          </Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {Object.entries(groupedItems).map(([piece, items]) => (
          <div key={piece} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground capitalize">{piece}</h4>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Rack
                      </span>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className={item.isPicked ? "bg-green-50/50" : ""}>
                      <TableCell>
                        {canPick && packet.status === PACKET_STATUS.IN_PROGRESS ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handlePickItem(item)}
                            disabled={item.isPicked || pickingItemId === item.id}
                          >
                            {pickingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : item.isPicked ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-300" />
                            )}
                          </Button>
                        ) : item.isPicked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.inventoryItemName}</p>
                          <p className="text-xs text-muted-foreground">{item.inventoryItemSku}</p>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="font-medium">{item.requiredQty}</span>
                        <span className="text-muted-foreground ml-1 text-xs">{item.unit}</span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {item.rackLocation || "TBD"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {item.isPicked ? (
                          <Badge className="bg-green-100 text-green-800">Picked</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Total: {totalItems} materials from {Object.keys(groupedItems).length} pieces
          </span>
          {pickedItems === totalItems && totalItems > 0 && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All items picked
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
