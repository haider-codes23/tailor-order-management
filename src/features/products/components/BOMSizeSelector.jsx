import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

// Standard sizes from measurement chart
const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

/**
 * BOMSizeSelector - Reusable size dropdown for BOM filtering
 * 
 * @param {string} value - Currently selected size (or "ALL")
 * @param {Function} onValueChange - Callback when size changes
 * @param {Array} availableSizes - Array of sizes that have BOMs (optional filter)
 * @param {boolean} includeAll - Whether to show "All Sizes" option
 * @param {string} placeholder - Placeholder text
 */
export default function BOMSizeSelector({
  value,
  onValueChange,
  availableSizes = null,
  includeAll = true,
  placeholder = "Select size...",
}) {
  // Determine which sizes to show
  const sizesToShow = availableSizes && availableSizes.length > 0
    ? availableSizes.filter(size => STANDARD_SIZES.includes(size))
    : STANDARD_SIZES

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="ALL">All Sizes</SelectItem>
        )}
        {sizesToShow.map((size) => (
          <SelectItem key={size} value={size}>
            Size {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}