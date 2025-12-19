import { useState } from "react"
import { useStandardSizeChart, useUpdateStandardSizeChart } from "@/hooks/useMeasurementCharts"
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
 * Size Chart Editor Component
 *
 * This component displays and allows editing of the Standard Size Chart.
 * It demonstrates the complete data flow through our three-layer architecture.
 *
 * Data Flow:
 * 1. Component mounts and calls useStandardSizeChart()
 * 2. Hook triggers API call through measurementChartsApi.getStandardSizeChart()
 * 3. API service calls httpClient.get('/settings/standard-size-chart')
 * 4. MSW intercepts request and returns mock data
 * 5. React Query caches the data and provides it to this component
 * 6. Component renders table with editable cells
 * 7. Admin edits measurements and clicks Save
 * 8. Component calls updateSizeChart.mutate() from useUpdateStandardSizeChart()
 * 9. Mutation triggers API call through measurementChartsApi.updateStandardSizeChart()
 * 10. MSW intercepts, validates, and returns success
 * 11. Mutation's onSuccess callback invalidates the query
 * 12. React Query refetches the size chart automatically
 * 13. Component re-renders with fresh data from "backend"
 *
 * Features:
 * - Inline editing of measurements
 * - Add new size rows
 * - Delete existing size rows
 * - Validation (positive numbers only)
 * - Loading states during fetch and save
 * - Error handling with user-friendly messages
 * - Success confirmation
 */
export function SizeChartEditor() {
  const { toast } = useToast()

  // Fetch the current size chart using React Query
  const { data: sizeChart, isLoading, isError, error } = useStandardSizeChart()

  // Mutation hook for updating the size chart
  const updateSizeChart = useUpdateStandardSizeChart()

  // Local state for editing - we maintain a copy of the rows that can be edited
  // This separates the "current saved state" (from React Query) from "editing state" (local)
  const [editedRows, setEditedRows] = useState([])
  const [hasChanges, setHasChanges] = useState(false)

  // When data loads from React Query, initialize our local editing state
  // We only do this if we don't have changes yet, to avoid overwriting user edits
  if (sizeChart && editedRows.length === 0 && !hasChanges) {
    setEditedRows([...sizeChart.rows])
  }

  /**
   * Handle changes to individual cells in the table
   */
  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...editedRows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [field]: field === "size_code" ? value : parseFloat(value) || 0,
    }
    setEditedRows(newRows)
    setHasChanges(true)
  }

  /**
   * Add a new size row with default values
   */
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), // Temporary ID for new rows
      size_code: "",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      uk_size: 0,
      us_size: 0,
      sequence: editedRows.length + 1,
    }
    setEditedRows([...editedRows, newRow])
    setHasChanges(true)
  }

  /**
   * Remove a size row
   */
  const handleDeleteRow = (rowIndex) => {
    const newRows = editedRows.filter((_, index) => index !== rowIndex)
    setEditedRows(newRows)
    setHasChanges(true)
  }

  /**
   * Save changes to the backend
   */
  const handleSave = () => {
    // Basic validation before saving
    const hasEmptySize = editedRows.some((row) => !row.size_code || row.size_code.trim() === "")
    if (hasEmptySize) {
      toast({
        title: "Validation Error",
        description: "All size codes must be filled in",
        variant: "destructive",
      })
      return
    }

    const hasInvalidMeasurement = editedRows.some((row) => {
      return (
        row.shoulder <= 0 || row.bust <= 0 || row.waist <= 0 || row.hip <= 0 || row.armhole <= 0
      )
    })
    if (hasInvalidMeasurement) {
      toast({
        title: "Validation Error",
        description: "All measurements must be positive numbers",
        variant: "destructive",
      })
      return
    }

    // Call the mutation with the edited rows
    updateSizeChart.mutate(
      { rows: editedRows },
      {
        onSuccess: () => {
          setHasChanges(false)
          toast({
            title: "Success",
            description: "Size chart updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update size chart",
            variant: "destructive",
          })
        },
      }
    )
  }

  /**
   * Reset to original data from server
   */
  const handleReset = () => {
    if (sizeChart) {
      setEditedRows([...sizeChart.rows])
      setHasChanges(false)
    }
  }

  // Loading state - show spinner while fetching initial data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading size chart...</span>
      </div>
    )
  }

  // Error state - show error message if fetch failed
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load size chart: {error?.message || "Unknown error"}
        </AlertDescription>
      </Alert>
    )
  }

  // Main editing interface
  return (
    <div className="space-y-4">
      {/* Success message after saving */}
      {updateSizeChart.isSuccess && !hasChanges && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Size chart has been updated successfully. Changes are now live for all new customer
            forms.
          </AlertDescription>
        </Alert>
      )}

      {/* Editable table */}
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Shoulder (in)</TableHead>
              <TableHead>Bust (in)</TableHead>
              <TableHead>Waist (in)</TableHead>
              <TableHead>Hip (in)</TableHead>
              <TableHead>Armhole (in)</TableHead>
              <TableHead>UK Size</TableHead>
              <TableHead>US Size</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No sizes defined yet. Click "Add Size" to create your first size.
                </TableCell>
              </TableRow>
            ) : (
              editedRows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.size_code}
                      onChange={(e) => handleCellChange(index, "size_code", e.target.value)}
                      className="w-20"
                      placeholder="XS"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.shoulder}
                      onChange={(e) => handleCellChange(index, "shoulder", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.bust}
                      onChange={(e) => handleCellChange(index, "bust", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.waist}
                      onChange={(e) => handleCellChange(index, "waist", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.hip}
                      onChange={(e) => handleCellChange(index, "hip", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      value={row.armhole}
                      onChange={(e) => handleCellChange(index, "armhole", e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.uk_size}
                      onChange={(e) => handleCellChange(index, "uk_size", e.target.value)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.us_size}
                      onChange={(e) => handleCellChange(index, "us_size", e.target.value)}
                      className="w-20"
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

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleAddRow}>
          <Plus className="h-4 w-4 mr-2" />
          Add Size
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || updateSizeChart.isPending}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateSizeChart.isPending}>
            {updateSizeChart.isPending ? (
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
