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
  boms: (productId) => [...productKeys.detail(productId), "boms"],
  activeBom: (productId) => [...productKeys.detail(productId), "active-bom"],
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
      const message = error.response?.data?.error || "Failed to delete product"
      toast.error(message)
    },
  })
}

// ==================== BOMs QUERIES ====================

/**
 * Get all BOMs for a product (including inactive versions)
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export function useProductBOMs(productId, options = {}) {
  return useQuery({
    queryKey: productKeys.boms(productId),
    queryFn: () => productsApi.getProductBOMs(productId),
    enabled: !!productId && options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get the active BOM for a product
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export function useActiveBOM(productId, options = {}) {
  return useQuery({
    queryKey: productKeys.activeBom(productId),
    queryFn: () => productsApi.getActiveBOM(productId),
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

// ==================== BOMs MUTATIONS ====================

/**
 * Create a new BOM for a product
 */
export function useCreateBOM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, bomData }) => productsApi.createBOM(productId, bomData),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.activeBom(variables.productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId) })
      queryClient.refetchQueries({ queryKey: productKeys.activeBom(variables.productId) })

      toast.success("BOM created successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to create BOM"
      toast.error(message)
    },
  })
}

/**
 * Update a BOM
 */
export function useUpdateBOM() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bomId, updates }) => productsApi.updateBOM(bomId, updates),
    onSuccess: (data) => {
      const bom = data.data

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: productKeys.bom(bom.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.boms(bom.product_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.activeBom(bom.product_id) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(bom.product_id) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bom(bom.id) })
      queryClient.refetchQueries({ queryKey: productKeys.boms(bom.product_id) })
      queryClient.refetchQueries({ queryKey: productKeys.activeBom(bom.product_id) })

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
    mutationFn: ({ bomId, productId }) => productsApi.deleteBOM(bomId),
    onSuccess: (data, variables) => {
      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: productKeys.bom(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.boms(variables.productId) })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.boms(variables.productId) })

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
    mutationFn: ({ bomId, itemData }) => productsApi.createBOMItem(bomId, itemData),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })

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
    mutationFn: ({ bomId, itemId, updates }) => productsApi.updateBOMItem(bomId, itemId, updates),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })

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
    mutationFn: ({ bomId, itemId, productId }) => productsApi.deleteBOMItem(bomId, itemId),
    onSuccess: (data, variables) => {
      // Invalidate BOM items and the BOM itself
      queryClient.invalidateQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.invalidateQueries({ queryKey: productKeys.bom(variables.bomId) })

      // ✅ FIX: Also invalidate activeBOM query
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: productKeys.activeBom(variables.productId) })
      }

      // Refetch
      queryClient.refetchQueries({ queryKey: productKeys.bomItems(variables.bomId) })
      queryClient.refetchQueries({ queryKey: productKeys.bom(variables.bomId) })

      if (variables.productId) {
        queryClient.refetchQueries({ queryKey: productKeys.activeBom(variables.productId) })
      }

      toast.success("BOM item deleted successfully")
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to delete BOM item"
      toast.error(message)
    },
  })
}
