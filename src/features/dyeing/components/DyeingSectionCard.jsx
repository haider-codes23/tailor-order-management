/**
 * DyeingSectionCard.jsx
 * Individual section display with materials and action buttons
 *
 * File: src/features/dyeing/components/DyeingSectionCard.jsx
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Check, X, Play, ChevronDown, ChevronUp, Package, RefreshCcw } from "lucide-react"
import { SECTION_STATUS } from "@/constants/orderConstants"
import DyeingStatusBadge from "./DyeingStatusBadge"

export default function DyeingSectionCard({
  sectionName,
  sectionData,
  materials = [],
  isSelected = false,
  onSelect,
  onAccept,
  onReject,
  onStart,
  onComplete,
  showActions = true,
  selectable = false,
  viewMode = "available", // "available" | "my-tasks" | "detail"
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  const status = sectionData?.status
  const round = sectionData?.dyeingRound || 1

  // Determine which actions are available based on status
  const canAccept = status === SECTION_STATUS.READY_FOR_DYEING
  const canReject = [
    SECTION_STATUS.READY_FOR_DYEING,
    SECTION_STATUS.DYEING_ACCEPTED,
    SECTION_STATUS.DYEING_IN_PROGRESS,
  ].includes(status)
  const canStart = status === SECTION_STATUS.DYEING_ACCEPTED
  const canComplete = status === SECTION_STATUS.DYEING_IN_PROGRESS

  // Format section name for display
  const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)

  return (
    <Card className={`border ${isSelected ? "border-fuchsia-400 bg-fuchsia-50/30" : ""}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectable && canAccept && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  aria-label={`Select ${displayName}`}
                />
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  <CardTitle className="text-base font-semibold">{displayName}</CardTitle>
                </Button>
              </CollapsibleTrigger>
              {round > 1 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  Round {round}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DyeingStatusBadge status={status} size="sm" />
              {materials.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  {materials.length} items
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2">
            {/* Materials Table */}
            {materials.length > 0 && (
              <div className="rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          <div>
                            <span>{material.name || material.materialName}</span>
                            {material.sku && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({material.sku})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {material.quantity} {material.unit || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                {viewMode === "available" && canAccept && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject?.(sectionName)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onAccept?.(sectionName)}
                      className="bg-fuchsia-600 hover:bg-fuchsia-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </>
                )}

                {viewMode === "my-tasks" && (
                  <>
                    {canStart && (
                      <Button
                        size="sm"
                        onClick={() => onStart?.(sectionName)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Dyeing
                      </Button>
                    )}
                    {canComplete && (
                      <Button
                        size="sm"
                        onClick={() => onComplete?.(sectionName)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject?.(sectionName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Rejection Info */}
            {sectionData?.dyeingRejectionReason && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Previously Rejected:</strong> {sectionData.dyeingRejectionReason}
                </p>
                {sectionData.dyeingRejectionNotes && (
                  <p className="text-sm text-red-700 mt-1">
                    Notes: {sectionData.dyeingRejectionNotes}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
