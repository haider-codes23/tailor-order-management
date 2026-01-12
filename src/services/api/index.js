/**
 * API Services Barrel Export
 * 
 * This file re-exports all API service modules from a single entry point.
 * As we build more features, we'll add more exports here.
 * 
 * Benefits of this barrel pattern:
 * 1. Single import point for all APIs: import { measurementChartsApi } from '@/services/api'
 * 2. Easy to see all available APIs at a glance
 * 3. Consistent import paths across the application
 * 4. Easy to refactor internal file structure without breaking imports
 * 
 * As we progress through phases, this file will grow to include:
 * - productsApi (Phase 5)
 * - inventoryApi (Phase 6)
 * - usersApi (Phase 7)
 * - ordersApi (Phase 8)
 * - productionApi (Phase 13)
 * - etc.
 */

export { measurementChartsApi } from "./measurementChartsApi"
export { fabricationApi } from "./fabricationApi"

// Future API exports will be added here as we build more features:
// export { productsApi } from "./productsApi"
// export { inventoryApi } from "./inventoryApi"
// export { usersApi } from "./usersApi"
// export { ordersApi } from "./ordersApi"