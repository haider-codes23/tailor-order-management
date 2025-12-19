import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { measurementChartsApi } from "@/services/api"

/**
 * React Query Hooks for Measurement Charts
 * 
 * These hooks integrate the measurementChartsApi service functions with
 * React Query's powerful caching and state management capabilities.
 * 
 * Architecture flow when a component uses these hooks:
 * Component calls hook → Hook calls API service → API service calls httpClient
 * → httpClient makes request → MSW intercepts → Handler returns data
 * → Response flows back through layers → Component receives data
 * 
 * React Query provides:
 * - Automatic caching (same data fetched once, shared across components)
 * - Loading and error states (no manual useState needed)
 * - Automatic refetching (when data becomes stale or window regains focus)
 * - Optimistic updates (UI updates immediately, syncs with server later)
 * - Request deduplication (multiple components requesting same data = one request)
 * 
 * Query keys are crucial for caching. They uniquely identify each piece of data.
 * When you mutate data, you invalidate related query keys to trigger refetches.
 */

/**
 * Query keys for measurement charts
 * 
 * Centralized query key management prevents typos and makes refactoring easier.
 * Each key is an array where the first element identifies the feature and
 * subsequent elements provide more specific identification.
 * 
 * Examples:
 * ['measurementCharts'] - All measurement chart data
 * ['measurementCharts', 'sizeChart'] - Specifically the size chart
 * ['measurementCharts', 'heightChart'] - Specifically the height chart
 * 
 * Why arrays? React Query uses JSON.stringify to compare keys, and arrays
 * make it easy to create hierarchical keys and partial matching.
 */
export const measurementChartsKeys = {
  all: ["measurementCharts"],
  sizeChart: ["measurementCharts", "sizeChart"],
  heightChart: ["measurementCharts", "heightChart"],
}

/**
 * Fetch the Standard Size Chart
 * 
 * This is a query hook that fetches and caches the size chart data.
 * Components that need to display or edit size chart measurements use this hook.
 * 
 * React Query features in action:
 * - Data is cached with key ['measurementCharts', 'sizeChart']
 * - If multiple components call this hook, only one request is made
 * - Cached data is considered fresh for 5 minutes (from queryClient config)
 * - If data is stale, it refetches in background while showing cached data
 * - Loading state is tracked automatically (isLoading, isFetching)
 * - Errors are tracked automatically (isError, error)
 * 
 * @returns {Object} React Query result object
 * @returns {Object} return.data - The size chart with rows array (undefined while loading)
 * @returns {boolean} return.isLoading - True on first fetch (no cached data)
 * @returns {boolean} return.isFetching - True whenever fetching (even with cached data)
 * @returns {boolean} return.isError - True if fetch failed
 * @returns {Error} return.error - Error object if fetch failed
 * @returns {Function} return.refetch - Manually trigger a refetch
 * 
 * Usage in component:
 * ```jsx
 * function SizeChartSettings() {
 *   const { data: sizeChart, isLoading, isError, error } = useStandardSizeChart()
 *   
 *   if (isLoading) return <div>Loading chart...</div>
 *   if (isError) return <div>Error: {error.message}</div>
 *   
 *   return (
 *     <div>
 *       {sizeChart.rows.map(row => (
 *         <div key={row.id}>{row.size_code}: {row.bust}"</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useStandardSizeChart() {
  return useQuery({
    queryKey: measurementChartsKeys.sizeChart,
    queryFn: measurementChartsApi.getStandardSizeChart,
  })
}

/**
 * Update the Standard Size Chart
 * 
 * This is a mutation hook that saves changes to the size chart.
 * When the mutation succeeds, it automatically invalidates and refetches
 * the size chart query so all components show the updated data.
 * 
 * React Query features in action:
 * - Mutation status tracked (isPending, isSuccess, isError)
 * - Automatic query invalidation on success (all components refetch)
 * - Error handling with automatic retry on network failures
 * - Can be triggered from any component without prop drilling
 * 
 * @returns {Object} React Query mutation result object
 * @returns {Function} return.mutate - Trigger the mutation (fire and forget)
 * @returns {Function} return.mutateAsync - Trigger mutation and await result
 * @returns {boolean} return.isPending - True while mutation is in progress
 * @returns {boolean} return.isSuccess - True after successful mutation
 * @returns {boolean} return.isError - True if mutation failed
 * @returns {Error} return.error - Error object if mutation failed
 * @returns {Object} return.data - Response data after successful mutation
 * 
 * Usage in component:
 * ```jsx
 * function SizeChartEditor() {
 *   const updateChart = useUpdateStandardSizeChart()
 *   
 *   const handleSave = (updatedRows) => {
 *     updateChart.mutate(
 *       { rows: updatedRows },
 *       {
 *         onSuccess: () => {
 *           toast.success("Size chart updated successfully")
 *         },
 *         onError: (error) => {
 *           toast.error(`Failed to update: ${error.message}`)
 *         }
 *       }
 *     )
 *   }
 *   
 *   return (
 *     <button 
 *       onClick={() => handleSave(modifiedRows)}
 *       disabled={updateChart.isPending}
 *     >
 *       {updateChart.isPending ? "Saving..." : "Save Changes"}
 *     </button>
 *   )
 * }
 * ```
 */
export function useUpdateStandardSizeChart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: measurementChartsApi.updateStandardSizeChart,
    onSuccess: () => {
      // Invalidate and refetch the size chart query
      // This ensures all components using useStandardSizeChart get fresh data
      queryClient.invalidateQueries({
        queryKey: measurementChartsKeys.sizeChart,
      })
    },
  })
}

/**
 * Fetch the Standard Height Chart
 * 
 * This is a query hook that fetches and caches the height chart data.
 * Components that need to display or edit height-to-length mappings use this hook.
 * 
 * Functionally identical to useStandardSizeChart but for the height chart.
 * See useStandardSizeChart documentation for detailed explanation of query hooks.
 * 
 * @returns {Object} React Query result object with height chart data
 * 
 * Usage in component:
 * ```jsx
 * function HeightChartSettings() {
 *   const { data: heightChart, isLoading } = useStandardHeightChart()
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <Table>
 *       {heightChart.rows.map(row => (
 *         <TableRow key={row.id}>
 *           <TableCell>{row.height_range}</TableCell>
 *           <TableCell>{row.kaftan_length}"</TableCell>
 *         </TableRow>
 *       ))}
 *     </Table>
 *   )
 * }
 * ```
 */
export function useStandardHeightChart() {
  return useQuery({
    queryKey: measurementChartsKeys.heightChart,
    queryFn: measurementChartsApi.getStandardHeightChart,
  })
}

/**
 * Update the Standard Height Chart
 * 
 * This is a mutation hook that saves changes to the height chart.
 * Functionally identical to useUpdateStandardSizeChart but for the height chart.
 * 
 * See useUpdateStandardSizeChart documentation for detailed explanation of mutation hooks.
 * 
 * @returns {Object} React Query mutation result object
 * 
 * Usage in component:
 * ```jsx
 * function HeightChartEditor() {
 *   const updateChart = useUpdateStandardHeightChart()
 *   
 *   const handleSubmit = async (formData) => {
 *     try {
 *       await updateChart.mutateAsync({ rows: formData.rows })
 *       navigate("/settings/measurement-charts")
 *     } catch (error) {
 *       console.error("Update failed:", error)
 *     }
 *   }
 *   
 *   return <Form onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useUpdateStandardHeightChart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: measurementChartsApi.updateStandardHeightChart,
    onSuccess: () => {
      // Invalidate and refetch the height chart query
      queryClient.invalidateQueries({
        queryKey: measurementChartsKeys.heightChart,
      })
    },
  })
}