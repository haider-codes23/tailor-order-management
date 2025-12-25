import { Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import MainLayout from "@/layouts/MainLayout"
import ProtectedRoute from "@/routes/ProtectedRoute"

// Import pages (we'll create placeholder pages next)
import LoginPage from "@/features/auth/pages/LoginPage"
import DashboardPage from "@/pages/DashboardPage"
import OrdersPage from "@/pages/OrdersPage"
import NotFoundPage from "@/pages/NotFoundPage"

// Admin pages
import { MeasurementChartsSettings } from "@/features/admin/pages/MeasurementChartsSettings"

// Inventory pages
import InventoryListPage from "@/features/inventory/pages/InventoryListPage"
import EditInventoryItemPage from "@/features/inventory/pages/EditInventoryItemPage"
import CreateInventoryItemPage from "@/features/inventory/pages/CreateInventoryItemPage"
import InventoryDetailPage from "@/features/inventory/pages/InventoryDetailPage"
import LowStockAlertsPage from "@/features/inventory/pages/LowStockAlertsPage"

// Products Pages
import ProductsListPage from "@/features/products/pages/ProductsListPage"
import ProductDetailPage from "@/features/products/pages/ProductDetailPage"
import ProductFormPage from "../features/products/pages/ProductFormPage"

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
 *   - Each protected by the ProtectedRoute guard
 *
 * - 404 route for unmatched paths
 *
 * The nested structure with layouts means:
 * - /login renders: AuthLayout > LoginPage
 * - /dashboard renders: ProtectedRoute > MainLayout > DashboardPage
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes - Main Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Orders */}
        <Route path="/orders" element={<OrdersPage />} />

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryListPage />} />
        <Route path="/inventory/new" element={<CreateInventoryItemPage />} />
        <Route path="/inventory/:id/edit" element={<EditInventoryItemPage />} />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        <Route path="/inventory/alerts/low-stock" element={<LowStockAlertsPage />} />

        {/* Products - ADD THIS SECTION ⬇️ */}
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/edit" element={<ProductFormPage />} />

        {/* Settings - Admin */}
        <Route path="/settings/measurement-charts" element={<MeasurementChartsSettings />} />

        {/* We'll add more routes in future phases:
         * /inventory
         * /production
         * /qa
         * /dispatch
         * /shopify
         * /users
         * /settings
         */}
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
