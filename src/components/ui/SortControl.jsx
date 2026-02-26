import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

const DEFAULT_SORT_OPTIONS = [
  { value: "product_asc", label: "Product Name (A → Z)" },
  { value: "product_desc", label: "Product Name (Z → A)" },
  { value: "productionDate_asc", label: "Production Date (Earliest First)" },
  { value: "productionDate_desc", label: "Production Date (Latest First)" },
  { value: "fwd_asc", label: "FWD Date (Earliest First)" },
  { value: "fwd_desc", label: "FWD Date (Latest First)" },
]

export default function SortControl({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span>Sort by:</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[240px] h-9 text-sm">
          <SelectValue placeholder="Select sort order" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Export the default options for reuse
export { DEFAULT_SORT_OPTIONS }