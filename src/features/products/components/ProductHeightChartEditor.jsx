import { useState, useEffect } from "react"
import { useProductMeasurementCharts, useUpdateProductHeightChart, useInitializeProductMeasurementCharts } from "@/hooks/useProducts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Plus, Trash2, AlertCircle, Settings } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Available measurement fields for height chart
 */
const HEIGHT_CHART_FIELDS = [
  { id: "kaftan_length", label: "Kaftan Length", unit: "inches" },
  { id: "sleeve_front_length", label: "Sleeve Front", unit: "inches" },
  { id: "sleeve_back_length", label: "Sleeve Back", unit: "inches" },
  { id: "gown_length", label: "Gown Length", unit: "inches" },
  { id: "lehnga_length", label: "Lehnga Length", unit: "inches" },
  { id: "sharara_length", label: "Sharara Length", unit: "inches" },
  { id: "peshwas_length", label: "Peshwas Length", unit: "inches" },
  { id: "shirt_length", label: "Shirt Length", unit: "inches" },
  { id: "trouser_length", label: "Trouser Length", unit: "inches" },
]

const DEFAULT_ENABLED_FIELDS = ["kaftan_length", "sleeve_front_length", "sleeve_back_length"]

/**
 * Product Height Chart Editor Component
 */
export function ProductHeightChartEditor({ productId, productName }) {
  const { data: chartsData, isLoading, isError } = useProductMeasurementCharts(productId)
  const updateHeightChart = useUpdateProductHeightChart()
  const initializeCharts = useInitializeProductMeasurementCharts()

  const [editedRows, setEditedRows] = useState([])
  const [enabledFields, setEnabledFields] = useState(DEFAULT_ENABLED_FIELDS)
  const [hasChanges, setHasChanges] = useState(false)
  const [showFieldsDialog, setShowFieldsDialog] = useState(false)
  const [tempEnabledFields, setTempEnabledFields] = useState([])

  const charts = chartsData?.data
  const hasHeightChart = charts?.has_height_chart && charts?.height_chart?.rows

  // Initialize state when data loads
  useEffect(() => {
    if (charts?.height_chart?.rows && !hasChanges) {
      setEditedRows([...charts.height_chart.rows])
      setEnabledFields(charts.enabled_height_fields || DEFAULT_ENABLED_FIELDS)
    }
  }, [charts, hasChanges])

  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...editedRows]
    newRows[rowIndex] = {
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
      gown_length: 0,
      lehnga_length: 0,
      sharara_length: 0,
      peshwas_length: 0,
      shirt_length: 0,
      trouser_length: 0,
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

  const handleSave = async () => {
    // Validation
    const hasEmptyRange = editedRows.some(
      (row) => !row.height_range || row.height_range.trim() === ""
    )
    if (hasEmptyRange) {
      toast.error("All height ranges must be filled in")
      return
    }

    // Check for duplicates
    const heightRanges = editedRows.map((row) => row.height_range.trim().toLowerCase())
    const duplicates = heightRanges.filter((range, index) => heightRanges.indexOf(range) !== index)
    if (duplicates.length > 0) {
      toast.error(`Duplicate height range found: ${duplicates[0]}`)
      return
    }

    try {
      await updateHeightChart.mutateAsync({
        productId,
        data: {
          rows: editedRows,
          enabled_fields: enabledFields,
        },
      })
      setHasChanges(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleInitialize = async () => {
    try {
      await initializeCharts.mutateAsync({
        productId,
        options: {
          initialize_size_chart: false,
          initialize_height_chart: true,
          enabled_height_fields: DEFAULT_ENABLED_FIELDS,
        },
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleOpenFieldsDialog = () => {
    setTempEnabledFields([...enabledFields])
    setShowFieldsDialog(true)
  }

  const handleSaveFields = () => {
    if (tempEnabledFields.length === 0) {
      toast.error("Please select at least one measurement field")
      return
    }
    setEnabledFields(tempEnabledFields)
    setHasChanges(true)
    setShowFieldsDialog(false)
  }

  const toggleField = (fieldId) => {
    setTempEnabledFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load measurement charts</AlertDescription>
      </Alert>
    )
  }

  // Show initialize button if no height chart exists
  if (!hasHeightChart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Height Chart</CardTitle>
          <CardDescription>
            No height chart has been created for this product yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A height chart defines garment lengths based on customer height.
              Some products may not need a height chart (e.g., kaftans need it, but simple shirts may not).
            </AlertDescription>
          </Alert>
          <Button onClick={handleInitialize} disabled={initializeCharts.isPending}>
            {initializeCharts.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Initialize Height Chart
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Height Chart for {productName}</h3>
          <p className="text-sm text-muted-foreground">
            Define garment lengths based on customer height ranges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFieldsDialog}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Fields
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Height Range
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateHeightChart.isPending}
            size="sm"
          >
            {updateHeightChart.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Unsaved changes alert */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to persist them.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-32">Height Range</TableHead>
              {enabledFields.map((fieldId) => {
                const field = HEIGHT_CHART_FIELDS.find((f) => f.id === fieldId)
                return (
                  <TableHead key={fieldId} className="text-center min-w-24">
                    {field?.label || fieldId}
                  </TableHead>
                )
              })}
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedRows.map((row, rowIndex) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    value={row.height_range}
                    onChange={(e) => handleCellChange(rowIndex, "height_range", e.target.value)}
                    className="min-w-32"
                    placeholder={"e.g., 5'0\" - 5'2\""}
                  />
                </TableCell>
                {enabledFields.map((fieldId) => (
                  <TableCell key={fieldId}>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={row[fieldId] || 0}
                      onChange={(e) => handleCellChange(rowIndex, fieldId, e.target.value)}
                      className="w-20 text-center"
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Configure Fields Dialog */}
      <Dialog open={showFieldsDialog} onOpenChange={setShowFieldsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Height Chart Fields</DialogTitle>
            <DialogDescription>
              Select which length measurements apply to this product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {HEIGHT_CHART_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={tempEnabledFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFields}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}