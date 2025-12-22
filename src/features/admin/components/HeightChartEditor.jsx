import { useState } from "react"
import { useStandardHeightChart, useUpdateStandardHeightChart } from "@/hooks/useMeasurementCharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/**
 * Height Chart Editor Component
 *
 * Similar to SizeChartEditor but for height-to-length mappings.
 * Allows admin to define garment lengths for different height ranges.
 */
export function HeightChartEditor() {
  const { toast } = useToast()

  const { data: heightChart, isLoading, isError, error } = useStandardHeightChart()
  const updateHeightChart = useUpdateStandardHeightChart()

  const [editedRows, setEditedRows] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  if (heightChart && editedRows.length === 0 && !hasChanges) {
    setEditedRows([...heightChart.rows])
  }

  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...editedRows] // create a new array
    newRows[rowIndex] = { // create a new object
      ...newRows[rowIndex],
      [field]: field === "height_range" ? value : parseFloat(value) || 0,
    }
    setEditedRows(newRows)
    setHasChanges(true)
  }

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      height_range: "",
      height_min_inches: 0,
      height_max_inches: 0,
      kaftan_length: 0,
      sleeve_front_length: 0,
      sleeve_back_length: 0,
      sequence: editedRows.length + 1,
    }
    setEditedRows([...editedRows, newRow])
    setHasChanges(true)
  }

  const handleDeleteRow = (rowIndex) => {
    const newRows = editedRows.filter((_, index) => index !== rowIndex)
    setEditedRows(newRows)
    setHasChanges(true)
  }

  const handleSave = () => {
    // Validation 1: Check for empty height ranges
    const hasEmptyRange = editedRows.some(
      (row) => !row.height_range || row.height_range.trim() === ""
    )
    if (hasEmptyRange) {
      toast({
        title: "Validation Error",
        description: "All height ranges must be filled in",
        variant: "destructive",
      })
      return
    }

    // Validation 2: Check for duplicate height ranges
    const heightRanges = editedRows.map((row) => row.height_range.trim().toUpperCase())
    const duplicates = heightRanges.filter((range, index) => heightRanges.indexOf(range) !== index)

    if (duplicates.length > 0) {
      toast({
        title: "Validation Error",
        description: `Duplicate height range found: ${duplicates[0]}. Each range must be unique.`,
        variant: "destructive",
      })
      return
    }

    // Validation 3: Check for invalid lengths
    const hasInvalidLength = editedRows.some((row) => {
      return row.kaftan_length <= 0 || row.sleeve_front_length <= 0 || row.sleeve_back_length <= 0
    })
    if (hasInvalidLength) {
      toast({
        title: "Validation Error",
        description: "All length measurements must be positive numbers",
        variant: "destructive",
      })
      return
    }

    // All validations passed - proceed with save
    updateHeightChart.mutate(
      { rows: editedRows },
      {
        onSuccess: () => {
          setHasChanges(false)
          toast({
            title: "Success",
            description: "Height chart updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update height chart",
            variant: "destructive",
          })
        },
      }
    )
  }

  const handleReset = () => {
    if (heightChart) {
      setEditedRows([...heightChart.rows])
      setHasChanges(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading height chart...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load height chart: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {updateHeightChart.isSuccess && !hasChanges && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Height chart has been updated successfully. Changes are now live for all new customer
            forms.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Height Range</TableHead>
              <TableHead>Kaftan Length (in)</TableHead>
              <TableHead>Sleeve Front (in)</TableHead>
              <TableHead>Sleeve Back (in)</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No height ranges defined yet. Click "Add Range" to create your first range.
                </TableCell>
              </TableRow>
            ) : (
              editedRows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.height_range}
                      onChange={(e) => handleCellChange(index, "height_range", e.target.value)}
                      placeholder={`5'0" - 5'2"`}
                      className="min-w-[140px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.kaftan_length}
                      onChange={(e) => handleCellChange(index, "kaftan_length", e.target.value)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.sleeve_front_length}
                      onChange={(e) =>
                        handleCellChange(index, "sleeve_front_length", e.target.value)
                      }
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.sleeve_back_length}
                      onChange={(e) =>
                        handleCellChange(index, "sleeve_back_length", e.target.value)
                      }
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRow(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleAddRow}>
          <Plus className="h-4 w-4 mr-2" />
          Add Range
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || updateHeightChart.isPending}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateHeightChart.isPending}>
            {updateHeightChart.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
