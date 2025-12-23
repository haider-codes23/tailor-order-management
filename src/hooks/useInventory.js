import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventoryApi } from "@/services/api/inventoryApi"

/**
 * Inventory React Query Hooks
 *
 * This file provides React hooks that wrap our inventory API functions with
 * React Query's state management capabilities. These hooks give us:
 *
 * 1. Automatic caching: Data fetched once is available instantly on subsequent requests
 * 2. Background refetching: Stale data is updated automatically without blocking the UI
 * 3. Request deduplication: Multiple components requesting the same data share one request
 * 4. Optimistic updates: UI updates instantly while server request happens in background
 * 5. Automatic error handling: Loading and error states are provided automatically
 * 6. Smart invalidation: When data changes, related queries refetch automatically
 *
 * Architecture Note:
 * These hooks call the API service functions we built in Step 3, which in turn
 * use the httpClient to make requests, which MSW intercepts during development.
 * The three-layer architecture (MSW -> API -> Hooks -> Components) means each
 * layer has a clear responsibility and can be tested independently.
 */

/**
 * Query Keys
 *
 * React Query uses query keys to identify and cache different queries. Think of
 * query keys like addresses in a filing system. When you ask for inventory items
 * filtered by category "FABRIC", React Query stores that result under the key
 * ['inventory', 'list', { category: 'FABRIC' }]. When you ask for the same thing
 * again, React Query can immediately return the cached result.
 *
 * We define our keys in one place so we can reference them consistently when
 * invalidating queries after mutations. If a user adds new stock to an item,
 * we invalidate all queries with the key ['inventory'] to ensure any displayed
 * lists or details refetch and show the updated stock levels.
 *
 * The hierarchical structure is important. When we invalidate ['inventory'], it
 * invalidates all keys that start with 'inventory', including 'inventory.list',
 * 'inventory.detail', etc. This gives us both precision and convenience.
 */
export const inventoryKeys = {
  all: ["inventory"],
  lists: () => [...inventoryKeys.all, "list"],
  list: (filters) => [...inventoryKeys.lists(), filters],
  details: () => [...inventoryKeys.all, "detail"],
  detail: (id) => [...inventoryKeys.details(), id],
  lowStock: () => [...inventoryKeys.all, "lowStock"],
  movements: (id) => [...inventoryKeys.all, "movements", id],
}

/**
 * useInventoryItems
 *
 * Fetches a list of inventory items with optional filtering. This hook demonstrates
 * the power of React Query's caching. If you call this hook with { category: 'FABRIC' }
 * in multiple components, only one HTTP request goes out and all components share
 * the cached data.
 *
 * The staleTime option tells React Query how long to consider the data "fresh".
 * During that time, React Query will return cached data instantly without making
 * any background requests. After the stale time expires, React Query still returns
 * the cached data immediately (so the UI is fast) but also makes a background request
 * to check for updates.
 *
 * @param {Object} filters - Optional filters (category, search, low_stock)
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 *
 * Example usage in a component:
 *   const { data, isLoading, error } = useInventoryItems({ category: 'FABRIC' })
 *
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error message={error.message} />
 *
 *   return data.data.map(item => <InventoryCard key={item.id} item={item} />)
 */
export function useInventoryItems(filters = {}, options = {}) {
  return useQuery({
    // The query key includes the filters so different filter combinations cache separately
    queryKey: inventoryKeys.list(filters),

    // The query function makes the actual API call
    queryFn: () => inventoryApi.getInventoryItems(filters),

    // Consider data fresh for 2 minutes. During this time, if the same query runs
    // again in another component, React Query returns cached data with zero delay
    staleTime: 2 * 60 * 1000,

    // Keep unused cached data for 5 minutes before garbage collecting it
    // This means if a user navigates away from the inventory page and comes back
    // within 5 minutes, the data is still there instantly
    gcTime: 5 * 60 * 1000,

    // Allow caller to override any of these defaults
    ...options,
  })
}

/**
 * useInventoryItem
 *
 * Fetches a single inventory item by ID. This is the hook you use on the detail page
 * when displaying complete information about one item including all its variants.
 *
 * The enabled option is crucial here. If itemId is null or undefined (like when the
 * page is first loading and React Router hasn't parsed the URL parameter yet), we
 * tell React Query not to run the query. Without this, React Query would try to
 * fetch /inventory/undefined which would error. By conditionally enabling the query,
 * we ensure it only runs when we have a valid ID.
 *
 * @param {number} itemId - ID of the inventory item to fetch
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result with complete item data
 *
 * Example usage:
 *   const { id } = useParams() // From React Router
 *   const { data: item, isLoading } = useInventoryItem(id)
 *
 *   if (isLoading) return <DetailSkeleton />
 *
 *   return (
 *     <div>
 *       <h1>{item.data.name}</h1>
 *       <p>Stock: {item.data.remaining_stock}</p>
 *       {item.data.has_variants && (
 *         <SizeVariants variants={item.data.variants} />
 *       )}
 *     </div>
 *   )
 */
export function useInventoryItem(itemId, options = {}) {
  return useQuery({
    queryKey: inventoryKeys.detail(itemId),
    queryFn: () => inventoryApi.getInventoryItem(itemId),
    staleTime: 2 * 60 * 1000,

    // Only run this query if we have a valid itemId
    // This prevents errors when the component first mounts and ID is undefined
    enabled: !!itemId,

    ...options,
  })
}

/**
 * useLowStockItems
 *
 * Fetches items that are below their reorder threshold. This hook might be used
 * on a dashboard widget showing critical inventory levels, or on a dedicated page
 * for purchasers to review what needs ordering.
 *
 * Notice the shorter staleTime here. Low stock status can change frequently as
 * production consumes materials and stock-in transactions add inventory, so we
 * want to refresh this data more often than general inventory lists.
 *
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result with low stock items sorted by urgency
 *
 * Example usage:
 *   const { data: lowStock } = useLowStockItems()
 *
 *   return (
 *     <Alert severity="warning">
 *       <h3>{lowStock.data.length} items need reordering</h3>
 *       <ul>
 *         {lowStock.data.slice(0, 5).map(item => (
 *           <li key={item.id}>{item.name} - {item.urgency_score}% critical</li>
 *         ))}
 *       </ul>
 *     </Alert>
 *   )
 */
export function useLowStockItems(options = {}) {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryApi.getLowStockItems(),

    // Shorter stale time because low stock status changes frequently
    staleTime: 30 * 1000, // 30 seconds

    // Refetch when the window regains focus so purchasers always see current data
    refetchOnWindowFocus: true,

    ...options,
  })
}

/**
 * useStockMovements
 *
 * Fetches the transaction history for a specific inventory item. This query is
 * typically used on the item detail page in a tab or expandable section showing
 * the complete audit trail of stock-in and stock-out transactions.
 *
 * The movement history rarely changes, so we use a longer stale time here. Once
 * loaded, the history stays cached and fresh until a new stock transaction occurs,
 * at which point the useRecordStockIn mutation will invalidate this query.
 *
 * @param {number} itemId - ID of the inventory item
 * @param {Object} options - Additional React Query options
 * @returns {Object} Query result with movements array
 *
 * Example usage:
 *   const { data: history } = useStockMovements(itemId)
 *
 *   return (
 *     <Table>
 *       <thead>
 *         <tr><th>Date</th><th>Type</th><th>Quantity</th><th>Notes</th></tr>
 *       </thead>
 *       <tbody>
 *         {history.data.movements.map(movement => (
 *           <tr key={movement.id}>
 *             <td>{formatDate(movement.transaction_date)}</td>
 *             <td><Badge>{movement.movement_type}</Badge></td>
 *             <td>{movement.quantity}</td>
 *             <td>{movement.notes}</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </Table>
 *   )
 */
export function useStockMovements(itemId, options = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements(itemId),
    queryFn: () => inventoryApi.getStockMovements(itemId),

    // Movement history rarely changes, so we can cache it for longer
    staleTime: 5 * 60 * 1000, // 5 minutes

    enabled: !!itemId,

    ...options,
  })
}

/**
 * useCreateInventoryItem
 *
 * Creates a new inventory item. This is our first mutation hook, which is different
 * from query hooks. Mutations change data on the server rather than just fetching it.
 *
 * The mutation pattern in React Query is powerful. When you call the mutate function,
 * React Query tracks the loading state automatically (isPending becomes true). If the
 * request succeeds, it calls your onSuccess callback. If it fails, it calls onError.
 * You can use these callbacks to show success toasts, redirect to the new item's
 * detail page, or handle errors gracefully.
 *
 * The most important part is query invalidation in onSuccess. After creating a new
 * item, we invalidate all inventory list queries. This tells React Query "that cached
 * inventory list data is now outdated because a new item exists." React Query then
 * refetches those lists automatically, so if a user is viewing the inventory page
 * in another tab or component, they see the new item appear without manually refreshing.
 *
 * @returns {Object} Mutation object with mutate function and state
 *
 * Example usage:
 *   const createItem = useCreateInventoryItem()
 *
 *   const handleSubmit = (formData) => {
 *     createItem.mutate(formData, {
 *       onSuccess: (newItem) => {
 *         toast.success(`Created ${newItem.data.name}`)
 *         navigate(`/inventory/${newItem.data.id}`)
 *       },
 *       onError: (error) => {
 *         toast.error(`Failed to create: ${error.message}`)
 *       }
 *     })
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Button type="submit" disabled={createItem.isPending}>
 *         {createItem.isPending ? 'Creating...' : 'Create Item'}
 *       </Button>
 *     </form>
 *   )
 */
export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemData) => inventoryApi.createInventoryItem(itemData),

    onSuccess: () => {
      // Invalidate all inventory lists so they refetch and include the new item
      // This keeps all components displaying inventory lists automatically up to date
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
    },
  })
}

/**
 * useUpdateInventoryItem
 *
 * Updates an existing inventory item. This mutation needs to invalidate both list
 * queries and the specific detail query for the updated item.
 *
 * Think about the user flow: A user is on the detail page for "Tissue Silk" and
 * updates the vendor information. After the update succeeds, we want:
 * 1. The detail page they're on to show the new vendor info (invalidate detail query)
 * 2. If they navigate back to the list page, the updated info appears there too (invalidate list queries)
 * 3. If the update changed stock levels, low stock alerts update (invalidate low stock query)
 *
 * By invalidating all these queries, React Query refetches them automatically and
 * ensures consistency across the entire application.
 *
 * @returns {Object} Mutation object with mutate function and state
 *
 * Example usage:
 *   const updateItem = useUpdateInventoryItem()
 *
 *   const handleSave = (updates) => {
 *     updateItem.mutate(
 *       { itemId: item.id, updates },
 *       {
 *         onSuccess: () => {
 *           toast.success('Changes saved')
 *           setEditMode(false)
 *         }
 *       }
 *     )
 *   }
 */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, updates }) => inventoryApi.updateInventoryItem(itemId, updates),

    onSuccess: (data, variables) => {
      // Invalidate the specific item's detail query
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.itemId) })

      // Invalidate list queries in case the update affects how the item appears in lists
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })

      // Invalidate low stock if the update might have changed stock levels
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
    },
  })
}

/**
 * useRecordStockIn
 *
 * Records a stock-in transaction. This mutation is complex because it affects multiple
 * aspects of the data model:
 * 1. The item's stock level increases (affects detail query)
 * 2. A new movement record is created (affects movements query)
 * 3. The item might move from low stock to adequate stock (affects low stock query)
 * 4. The item appears updated in any lists (affects list queries)
 *
 * We invalidate all of these to ensure complete consistency across the application.
 * This might seem like overkill, but React Query is smart about only refetching
 * queries that are actively being used. If no component is currently displaying
 * the movements list for this item, React Query won't waste resources refetching it.
 *
 * @returns {Object} Mutation object with mutate function and state
 *
 * Example usage:
 *   const recordStockIn = useRecordStockIn()
 *
 *   const handleStockIn = (formData) => {
 *     recordStockIn.mutate(
 *       {
 *         itemId: item.id,
 *         stockData: {
 *           quantity: formData.quantity,
 *           variant_id: formData.variantId, // Only for variant items
 *           reference_number: formData.poNumber,
 *           notes: formData.notes
 *         }
 *       },
 *       {
 *         onSuccess: (result) => {
 *           toast.success(`Added ${result.data.quantity} ${item.unit}`)
 *           onClose() // Close the stock-in modal
 *         }
 *       }
 *     )
 *   }
 */
export function useRecordStockIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, stockData }) => inventoryApi.recordStockIn(itemId, stockData),

    onSuccess: (data, variables) => {
      // Invalidate the item's detail query to show updated stock level
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.itemId) })

      // Invalidate movements query to show the new transaction in the history
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements(variables.itemId) })

      // Invalidate lists in case stock level change affects how item is displayed
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })

      // Invalidate low stock query since this item might no longer be low stock
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
    },
  })
}

/**
 * useDeleteInventoryItem
 *
 * Deletes an inventory item. This is the most aggressive invalidation because the
 * item no longer exists anywhere in the system. We invalidate all inventory-related
 * queries to ensure the deleted item disappears from every view.
 *
 * In a production system, you might want to navigate the user away from the detail
 * page after deletion, show a confirmation dialog, or implement soft delete with an
 * "is_active" flag instead of hard deletion.
 *
 * @returns {Object} Mutation object with mutate function and state
 *
 * Example usage:
 *   const deleteItem = useDeleteInventoryItem()
 *
 *   const handleDelete = () => {
 *     if (window.confirm('Are you sure? This cannot be undone.')) {
 *       deleteItem.mutate(itemId, {
 *         onSuccess: () => {
 *           toast.success('Item deleted')
 *           navigate('/inventory')
 *         }
 *       })
 *     }
 *   }
 */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId) => inventoryApi.deleteInventoryItem(itemId),

    onSuccess: () => {
      // Invalidate all inventory queries since the deleted item should disappear everywhere
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
    },
  })
}
