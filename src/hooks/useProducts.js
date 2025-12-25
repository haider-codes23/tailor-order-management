import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as productsApi from "../services/api/productsApi"

// ==================== QUERY KEYS ====================
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, "detail"],
  detail: (id) => [...productKeys.details(), id],
  // ✅ SIZE-BASED: BOM keys now include size parameter
  boms: (productId, size = null) => 
    size ? [...productKeys.detail(productId), "boms", size] : [...productKeys.detail(productId), "boms"],
  activeBom: (productId, size = null) => 
    size ? [...productKeys.detail(productId), "active-bom", size] : [...productKeys.detail(productId), "active-bom"],
  bom: (bomId) => ["boms", bomId],
  bomItems: (bomId) => [...productKeys.bom(bomId), "items"],
}

// ==================== PRODUCTS QUERIES ====================

/**
 * Get all products with optional filters
 * @param {Object} options
 * @param {string} [options.search] - Search term
 * @param {string} [options.category] - Category filter
 * @param {boolean} [options.active] - Active status filter
 */
export function useProducts(options = {}) {
  return useQuery({
    queryKey: productKeys.list(options),
    queryFn: () => productsApi.getProducts(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export function useProduct(productId, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productsApi.getProduct(productId),
    enabled: !!productId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== PRODUCTS MUTATIONS ====================

/**
 * Create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.refetchQueries({ queryKey: productKeys.lists() })

      toast.success("Product created successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to create product"
      toast.error(message)
    },
  })
}

/**
 * Update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, updates }) => productsApi.updateProduct(productId, updates),
    onSuccess: (data, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })

      // Refetch to update UI immediately
      queryClient.refetchQueries({ queryKey: productKeys.detail(variables.productId) })
      queryClient.refetchQueries({ queryKey: productKeys.lists() })

      toast.success("Product updated successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to update product"
      toast.error(message)
    },
  })
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: (data, productId) => {
      // Remove from cache and refetch lists
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.refetchQueries({ queryKey: productKeys.lists() })

      toast.success("Product deleted successfully")
    },
    onError: (error) => {
      let message = "Failed to delete product"

      // Try to extract error message from different possible locations
      if (error.response?.data?.error) {
        message = error.response.data.error
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }

      toast.error(message)
    },
  })
}

// ==================== BOMs QUERIES (SIZE-BASED) ====================

/**
 * Get all BOMs for a product, optionally filtered by size
 * @param {string} productId - Product ID
 * @param {string|null} size - Size to filter (null = all sizes)
 * @param {Object} options - React Query options
 */
export function useProductBOMs(productId, size = null, options = {}) {
  return useQuery({
    queryKey: productKeys.boms(productId, size),
    queryFn: () => productsApi.getProductBOMs(productId, size),
    enabled: !!productId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get the active BOM for a product and size
 * @param {string} productId - Product ID
 * @param {string|null} size - Size (required for size-specific active BOM)
 * @param {Object} options - React Query options
 */
export function useActiveBOM(productId, size = null, options = {}) {
  return useQuery({
    queryKey: productKeys.activeBom(productId, size),
    queryFn: () => productsApi.getActiveBOM(productId, size),
    enabled: !!productId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get a specific BOM by ID
 * @param {string} bomId - BOM ID
 * @param {Object} options - React Query options
 */
export function useBOM(bomId, options = {}) {
  return useQuery({
    queryKey: productKeys.bom(bomId),
    queryFn: () => productsApi.getBOM(bomId),
    enabled: !!bomId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== BOMs MUTATIONS (SIZE-BASED) ====================

/**
 * Create a new BOM for a product (now requires size)
 */
export function useCreateBOM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, bomData }) => productsApi.createBOM(productId, bomData),
    onSuccess: (data, variables) => {
      const size = data.size

      // Invalidate related queries for this product+size
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, size) })
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, null) }) // All sizes
      queryClient.invalidateQueries({ queryKey: productKeys.activeBom(variables.productId, size) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, size) })
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, null) })
      queryClient.refetchQueries({ queryKey: productKeys.activeBom(variables.productId, size) })

      toast.success("BOM created successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to create BOM"
      toast.error(message)
    },
  })
}

/**
 * Update a BOM (activate/deactivate, edit details)
 * NOTE: Activating a BOM will deactivate other BOMs for the SAME product+size only
 */
export function useUpdateBOM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, updates }) => productsApi.updateBOM(bomId, updates),
    onSuccess: (data) => {
      const bom = data
      const productId = bom.product_id
      const size = bom.size

      console.log("🔄 BOM Updated - Starting AGGRESSIVE cache clear", {
        bomId: bom.id,
        productId,
        size,
        isActive: bom.is_active,
        updates: bom,
      })

      // STEP 1: Remove ALL related queries from cache completely
      console.log("Step 1: Removing queries from cache...")
      queryClient.removeQueries({ queryKey: productKeys.bom(bom.id), exact: true })
      queryClient.removeQueries({ queryKey: productKeys.boms(productId, size), exact: true })
      queryClient.removeQueries({ queryKey: productKeys.boms(productId, null), exact: true })
      queryClient.removeQueries({ queryKey: productKeys.activeBom(productId, size), exact: true })
      queryClient.removeQueries({ queryKey: productKeys.detail(productId), exact: true })

      // STEP 2: Invalidate with type: 'all' to mark stale
      console.log("Step 2: Invalidating queries...")
      queryClient.invalidateQueries({ 
        queryKey: productKeys.boms(productId),
        exact: false, // Match all size variations
        refetchType: 'all'
      })
      queryClient.invalidateQueries({ 
        queryKey: productKeys.activeBom(productId),
        exact: false,
        refetchType: 'all'
      })

      // STEP 3: Force immediate refetch
      console.log("Step 3: Forcing refetch...")
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: productKeys.boms(productId, size),
          exact: true,
          type: 'active'
        })
        queryClient.refetchQueries({ 
          queryKey: productKeys.boms(productId, null),
          exact: true,
          type: 'active'
        })
        console.log("✅ Refetch complete!")
      }, 0)

      toast.success("BOM updated successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to update BOM"
      toast.error(message)
    },
  })
}

/**
 * Delete a BOM
 */
export function useDeleteBOM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, productId, size }) => productsApi.deleteBOM(bomId),
    onSuccess: (data, variables) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: productKeys.bom(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, null) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, null) })

      toast.success("BOM deleted successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to delete BOM"
      toast.error(message)
    },
  })
}

// ==================== BOM ITEMS QUERIES ====================

/**
 * Get all items for a BOM
 * @param {string} bomId - BOM ID
 * @param {Object} options - React Query options
 */
export function useBOMItems(bomId, options = {}) {
  return useQuery({
    queryKey: productKeys.bomItems(bomId),
    queryFn: () => productsApi.getBOMItems(bomId),
    enabled: !!bomId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

// ==================== BOM ITEMS MUTATIONS ====================

/**
 * Add an item to a BOM
 */
export function useCreateBOMItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, itemData, productId, size }) => 
      productsApi.createBOMItem(bomId, itemData),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // Also invalidate BOMs list for this product+size
      if (variables.productId && variables.size) {
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, null) })
        queryClient.invalidateQueries({ queryKey: productKeys.activeBom(variables.productId, variables.size) })
      }

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })
      
      if (variables.productId && variables.size) {
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, null) })
      }

      toast.success("BOM item added successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to add BOM item"
      toast.error(message)
    },
  })
}

/**
 * Update a BOM item
 */
export function useUpdateBOMItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, itemId, updates, productId, size }) => 
      productsApi.updateBOMItem(bomId, itemId, updates),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // Also invalidate BOMs list for this product+size
      if (variables.productId && variables.size) {
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, null) })
      }

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })
      
      if (variables.productId && variables.size) {
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, null) })
      }

      toast.success("BOM item updated successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to update BOM item"
      toast.error(message)
    },
  })
}

/**
 * Delete a BOM item
 */
export function useDeleteBOMItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, itemId, productId, size }) => 
      productsApi.deleteBOMItem(bomId, itemId),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // Also invalidate BOMs list for this product+size
      if (variables.productId && variables.size) {
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId, null) })
        queryClient.invalidateQueries({ queryKey: productKeys.activeBom(variables.productId, variables.size) })
      }

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })
      
      if (variables.productId && variables.size) {
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, variables.size) })
        queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId, null) })
      }

      toast.success("BOM item deleted successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to delete BOM item"
      toast.error(message)
    },
  })
}