import { useState, useEffect } from "react"
import {
  useProductMeasurementCharts,
  useUpdateProductSizeChart,
  useInitializeProductMeasurementCharts,
} from "@/hooks/useProducts"
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
import { Loader2, Save, Plus, Trash2, AlertCircle, CheckCircle2, Settings } from "lucide-react"
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
 * Available measurement fields for size chart
 */
const SIZE_CHART_FIELDS = [
  { id: "shoulder", label: "Shoulder", unit: "inches" },
  { id: "bust", label: "Bust", unit: "inches" },
  { id: "waist", label: "Waist", unit: "inches" },
  { id: "hip", label: "Hip", unit: "inches" },
  { id: "armhole", label: "Armhole", unit: "inches" },
  { id: "sleeve_length", label: "Sleeve Length", unit: "inches" },
  { id: "shirt_length", label: "Shirt Length", unit: "inches" },
  { id: "trouser_length", label: "Trouser Length", unit: "inches" },
  { id: "trouser_waist", label: "Trouser Waist", unit: "inches" },
  { id: "inseam", label: "Inseam", unit: "inches" },
]

const DEFAULT_ENABLED_FIELDS = ["shoulder", "bust", "waist", "hip", "armhole"]

/**
 * Product Size Chart Editor Component
 */
export function ProductSizeChartEditor({ productId, productName }) {
  const { data: chartsData, isLoading, isError } = useProductMeasurementCharts(productId)
  const updateSizeChart = useUpdateProductSizeChart()
  const initializeCharts = useInitializeProductMeasurementCharts()

  const [editedRows, setEditedRows] = useState([])
  const [enabledFields, setEnabledFields] = useState(DEFAULT_ENABLED_FIELDS)
  const [hasChanges, setHasChanges] = useState(false)
  const [showFieldsDialog, setShowFieldsDialog] = useState(false)
  const [tempEnabledFields, setTempEnabledFields] = useState([])

  const charts = chartsData?.data
  const hasSizeChart = charts?.has_size_chart && charts?.size_chart?.rows

  // Initialize state when data loads
  useEffect(() => {
    if (charts?.size_chart?.rows && !hasChanges) {
      setEditedRows([...charts.size_chart.rows])
      setEnabledFields(charts.enabled_size_fields || DEFAULT_ENABLED_FIELDS)
    }
  }, [charts, hasChanges])

  const handleCellChange = (rowIndex, field, value) => {
    const newRows = [...editedRows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [field]: field === "size_code" ? value : parseFloat(value) || 0,
    }
    setEditedRows(newRows)
    setHasChanges(true)
  }

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      size_code: "",
      shoulder: 0,
      bust: 0,
      waist: 0,
      hip: 0,
      armhole: 0,
      sleeve_length: 0,
      shirt_length: 0,
      trouser_length: 0,
      trouser_waist: 0,
      inseam: 0,
      uk_size: 0,
      us_size: 0,
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
    const hasEmptySize = editedRows.some((row) => !row.size_code || row.size_code.trim() === "")
    if (hasEmptySize) {
      toast.error("All size codes must be filled in")
      return
    }

    // Check for duplicates
    const sizeCodes = editedRows.map((row) => row.size_code.trim().toUpperCase())
    const duplicates = sizeCodes.filter((code, index) => sizeCodes.indexOf(code) !== index)
    if (duplicates.length > 0) {
      toast.error(`Duplicate size code found: ${duplicates[0]}`)
      return
    }

    try {
      await updateSizeChart.mutateAsync({
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
          initialize_size_chart: true,
          initialize_height_chart: false,
          enabled_size_fields: DEFAULT_ENABLED_FIELDS,
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
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
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

  // Show initialize button if no size chart exists
  if (!hasSizeChart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Size Chart</CardTitle>
          <CardDescription>No size chart has been created for this product yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A size chart is required to generate standard customer order forms. Initialize a size
              chart with default template values to get started.
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
                Initialize Size Chart
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
          <h3 className="text-lg font-semibold">Size Chart for {productName}</h3>
          <p className="text-sm text-muted-foreground">
            Define body measurements for each standard size
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenFieldsDialog}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Fields
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Size
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSizeChart.isPending}
            size="sm"
          >
            {updateSizeChart.isPending ? (
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
              <TableHead className="w-20">Size</TableHead>
              {enabledFields.map((fieldId) => {
                const field = SIZE_CHART_FIELDS.find((f) => f.id === fieldId)
                return (
                  <TableHead key={fieldId} className="text-center min-w-24">
                    {field?.label || fieldId}
                  </TableHead>
                )
              })}
              <TableHead className="text-center w-16">UK</TableHead>
              <TableHead className="text-center w-16">US</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedRows.map((row, rowIndex) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    value={row.size_code}
                    onChange={(e) => handleCellChange(rowIndex, "size_code", e.target.value)}
                    className="w-16 text-center font-medium"
                    placeholder="Size"
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
                  <Input
                    type="number"
                    min="0"
                    value={row.uk_size || 0}
                    onChange={(e) => handleCellChange(rowIndex, "uk_size", e.target.value)}
                    className="w-16 text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    value={row.us_size || 0}
                    onChange={(e) => handleCellChange(rowIndex, "us_size", e.target.value)}
                    className="w-16 text-center"
                  />
                </TableCell>
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
            <DialogTitle>Configure Measurement Fields</DialogTitle>
            <DialogDescription>
              Select which measurement fields apply to this product's size chart.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {SIZE_CHART_FIELDS.map((field) => (
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
