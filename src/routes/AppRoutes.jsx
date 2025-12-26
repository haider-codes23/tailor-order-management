import { Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import MainLayout from "@/layouts/MainLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

// Auth pages
import LoginPage from "@/features/auth/pages/LoginPage"

// General pages
import DashboardPage from "@/pages/DashboardPage"
import OrdersPage from "@/pages/OrdersPage"
import NotFoundPage from "@/pages/NotFoundPage"

// Admin pages
import { MeasurementChartsSettings } from "@/features/admin/pages/MeasurementChartsSettings"
import UsersListPage from "@/features/admin/pages/UsersListPage"
import UserFormPage from "@/features/admin/pages/UserFormPage"

// Inventory pages
import InventoryListPage from "@/features/inventory/pages/InventoryListPage"
import InventoryDetailPage from "@/features/inventory/pages/InventoryDetailPage"
import CreateInventoryItemPage from "@/features/inventory/pages/CreateInventoryItemPage"
import EditInventoryItemPage from "@/features/inventory/pages/EditInventoryItemPage"
import LowStockAlertsPage from "@/features/inventory/pages/LowStockAlertsPage"

// Products pages
import ProductsListPage from "@/features/products/pages/ProductsListPage"
import ProductDetailPage from "@/features/products/pages/ProductDetailPage"
import ProductFormPage from "@/features/products/pages/ProductFormPage"

/**
 * AppRoutes - Central routing configuration
 *
 * This component defines all routes in your application.
 *
 * Structure:
 * - Public routes (no authentication required)
 *   - Login page wrapped in AuthLayout
 *
 * - Protected routes (require authentication)
 *   - All main app pages wrapped in MainLayout
 *   - Some routes also wrapped in ProtectedRoute for permission checks
 *
 * - 404 route for unmatched paths
 *
 * The nested structure with layouts means:
 * - /login renders: AuthLayout > LoginPage
 * - /dashboard renders: ProtectedRoute > MainLayout > DashboardPage
 * - /admin/users renders: ProtectedRoute (permissions) > MainLayout > UsersListPage
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      {/* Auth Layout - Login page */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ==================== PROTECTED ROUTES ==================== */}
      {/* Main Layout - All authenticated pages */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Everyone can access */}
        <Route path="/" element={<DashboardPage />} />

        {/* Orders - Placeholder for future */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* ==================== INVENTORY ROUTES ==================== */}
        <Route path="/inventory">
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["inventory.view"]}>
                <InventoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredPermissions={["inventory.create"]}>
                <CreateInventoryItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredPermissions={["inventory.view"]}>
                <InventoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredPermissions={["inventory.edit"]}>
                <EditInventoryItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="alerts/low-stock"
            element={
              <ProtectedRoute requiredPermissions={["inventory.view"]}>
                <LowStockAlertsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== PRODUCTS ROUTES ==================== */}
        <Route path="/products">
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["products.view"]}>
                <ProductsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredPermissions={["products.create"]}>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredPermissions={["products.view"]}>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredPermissions={["products.edit"]}>
                <ProductFormPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin">
          {/* Measurement Charts */}
          <Route
            path="measurements"
            element={
              <ProtectedRoute requiredPermissions={["measurements.view"]}>
                <MeasurementChartsSettings />
              </ProtectedRoute>
            }
          />

          {/* User Management */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredPermissions={["users.view"]}>
                <UsersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/new"
            element={
              <ProtectedRoute requiredPermissions={["users.create"]}>
                <UserFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users/:id/edit"
            element={
              <ProtectedRoute requiredPermissions={["users.edit"]}>
                <UserFormPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== FUTURE ROUTES ==================== */}
        {/* These will be added in future phases:
         * /production - Production management
         * /qa - Quality assurance
         * /dispatch - Dispatch management
         * /shopify - Shopify integration
         */}
      </Route>

      {/* ==================== 404 - NOT FOUND ==================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}