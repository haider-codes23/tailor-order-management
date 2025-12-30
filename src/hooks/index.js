/**
 * Hooks Barrel Export
 * 
 * This file re-exports all React Query hooks from a single entry point.
 */

// Measurement Charts Hooks
export {
  useStandardSizeChart,
  useUpdateStandardSizeChart,
  useStandardHeightChart,
  useUpdateStandardHeightChart,
  measurementChartsKeys,
} from "./useMeasurementCharts"

// User Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  userKeys,
} from "./useUsers"

// Order Hooks
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

// Product Hooks
export {
  // Products
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  // BOMs
  useProductBOMs,
  useActiveBOM,
  useBOM,
  useCreateBOM,
  useUpdateBOM,
  useDeleteBOM,
  // BOM Items
  useCreateBOMItem,
  useUpdateBOMItem,
  useDeleteBOMItem,
  // Keys
  productKeys,
} from "./useProducts"