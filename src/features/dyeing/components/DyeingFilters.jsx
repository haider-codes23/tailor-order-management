/**
 * DyeingFilters.jsx
 * Filter and sort controls for dyeing task lists
 *
 * File: src/features/dyeing/components/DyeingFilters.jsx
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Calendar as CalendarIcon, SortAsc, SortDesc } from "lucide-react"
import { format } from "date-fns"

const SORT_OPTIONS = [
  { value: "fwd_asc", label: "FWD Date (Earliest First)" },
  { value: "fwd_desc", label: "FWD Date (Latest First)" },
  { value: "priority_desc", label: "Priority (High First)" },
  { value: "accepted_asc", label: "Date Accepted (Oldest First)" },
  { value: "accepted_desc", label: "Date Accepted (Newest First)" },
  { value: "completed_desc", label: "Date Completed (Recent First)" },
]

export default function DyeingFilters({
  filters,
  onFiltersChange,
  showDateRange = false,
  showCompletedFilters = false,
  sortOptions = SORT_OPTIONS.slice(0, 3), // Default to first 3 options
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearchChange = (value) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleSortChange = (value) => {
    onFiltersChange({ ...filters, sortBy: value })
  }

  const handlePriorityChange = (value) => {
    onFiltersChange({ ...filters, priority: value === "all" ? null : value })
  }

  const handleDateFromChange = (date) => {
    onFiltersChange({ ...filters, dateFrom: date })
  }

  const handleDateToChange = (date) => {
    onFiltersChange({ ...filters, dateTo: date })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      sortBy: sortOptions[0]?.value || "fwd_asc",
      priority: null,
      dateFrom: null,
      dateTo: null,
    })
  }

  const activeFilterCount = [
    filters.search,
    filters.priority,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Main Row: Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer, product..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</Label>
              <Select
                value={filters.sortBy || sortOptions[0]?.value}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Toggle More Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Priority Filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Priority</Label>
                  <Select value={filters.priority || "all"} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range (for Completed Tasks) */}
                {showDateRange && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? (
                              format(filters.dateFrom, "PPP")
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom}
                            onSelect={handleDateFromChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? (
                              format(filters.dateTo, "PPP")
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo}
                            onSelect={handleDateToChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
