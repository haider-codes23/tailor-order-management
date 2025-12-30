/**
 * Hooks Barrel Export
 * 
 * This file re-exports all React Query hooks from a single entry point.
 * 
 * Benefits:
 * 1. Single import point: import { useStandardSizeChart } from '@/services/hooks'
 * 2. Easy to see all available hooks at a glance
 * 3. Consistent import paths across the application
 * 
 * As we build more features, this will grow to include:
 * - Product hooks (Phase 5)
 * - Inventory hooks (Phase 6)
 * - User management hooks (Phase 7)
 * - Order hooks (Phase 8)
 * - Production hooks (Phase 13)
 * - etc.
 */

// Measurement Charts Hooks
export {
  useStandardSizeChart,
  useUpdateStandardSizeChart,
  useStandardHeightChart,
  useUpdateStandardHeightChart,
  measurementChartsKeys,
} from "./useMeasurementCharts"

export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  userKeys,
} from "./useUsers"

export {
  // Orders
  useOrders,
  useOrder,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  orderKeys,
  // Payments
  useAddPayment,
  useDeletePayment,
  // Order Items
  useOrderItem,
  useUpdateOrderItem,
  useAddOrderItem,
  useDeleteOrderItem,
  useAddTimelineEntry,
  useGenerateOrderForm,
  useApproveOrderForm,
  useUpdateOrderItemStatus,
  orderItemKeys,
} from "./useOrders"

export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductBOMs,
  useActiveBOM,
  useBOM,
  useCreateBOM,
  useUpdateBOM,
  useDeleteBOM,
  useSetActiveBOM,
  productKeys,
} from "./useProducts"

// Future hook exports will be added here as we build more features:
// export { useProducts, useCreateProduct, useUpdateProduct } from "./useProducts"
// export { useInventoryItems, useStockMovements } from "./useInventory"
// export { useOrders, useCreateOrder, useUpdateOrder } from "./useOrders"