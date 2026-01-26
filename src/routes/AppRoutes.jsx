import { Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import MainLayout from "@/layouts/MainLayout"
import ProtectedRoute from "@/routes/ProtectedRoute"

// Auth pages
import LoginPage from "@/features/auth/pages/LoginPage"

// General pages
import DashboardPage from "@/pages/DashboardPage"
import NotFoundPage from "@/pages/NotFoundPage"

// Admin pages
import { MeasurementChartsSettings } from "@/features/admin/pages/MeasurementChartsSettings"
import UserListPage from "@/features/admin/pages/UserListPage"
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

// Orders pages
import OrdersListPage from "@/features/orders/pages/OrdersListPage"

import OrderDetailPage from "@/features/orders/pages/OrderDetailsPage"
import OrderItemDetailPage from "@/features/orders/pages/OrderItemDetailPage"
import OrderFormGeneratorPage from "@/features/orders/pages/OrderFormGeneratorPage"
import CreateOrderPage from "@/features/orders/pages/CreateOrderPage"
import EditOrderPage from "@/features/orders/pages/EditOrderPage"

// Fabrication pages
import FabricationOrdersListPage from "@/features/fabrication/pages/FabricationOrdersListPage"
import FabricationOrderDetailPage from "@/features/fabrication/pages/FabricationOrderDetailPage"
import FabricationItemDetailPage from "@/features/fabrication/pages/FabricationItemDetailPage"

import ProcurementDashboardPage from "../features/procurement/pages/ProcurementDashBoard"

import PacketCreatorQueuePage from "@/features/packet/pages/PacketCreatorQueuePage"
import PacketCheckQueuePage from "@/features/packet/pages/PacketCheckQueuePage"

// Dyeing pages (Phase 12.5)
import DyeingDashboardPage from "@/features/dyeing/pages/DyeingDashboardPage"
import DyeingAvailableTasksPage from "@/features/dyeing/pages/DyeingAvailableTasksPage"
import DyeingMyTasksPage from "@/features/dyeing/pages/DyeingMyTasksPage"
import DyeingCompletedTasksPage from "@/features/dyeing/pages/DyeingCompletedTasksPage"
import DyeingTaskDetailPage from "@/features/dyeing/pages/DyeingTaskDetailPage"

import ProductionDashboardPage from "@/features/production/pages/ProductionDashboardPage"
// import ProductionAssignmentPage from "@/features/production/pages/ProductionAssignmentPage"
import ProductionOrderItemPage from "@/features/production/pages/ProductionOrderItemPage"
// import WorkerTasksPage from "@/features/production/pages/WorkerTasksPage"

/**
 * AppRoutes - Central routing configuration
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================== ROOT REDIRECT ==================== */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Everyone can access */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ==================== ORDERS ROUTES ==================== */}
        <Route path="/orders">
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["orders.view"]}>
                <OrdersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredPermissions={["orders.create"]}>
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredPermissions={["orders.view"]}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredPermissions={["orders.edit"]}>
                <EditOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/items/:itemId"
            element={
              <ProtectedRoute requiredPermissions={["orders.view"]}>
                <OrderItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/items/:itemId/form"
            element={
              <ProtectedRoute requiredPermissions={["orders.edit"]}>
                <OrderFormGeneratorPage />
              </ProtectedRoute>
            }
          />
        </Route>

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

        <Route path="/procurement" element={<ProcurementDashboardPage />} />

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

        {/* ==================== FABRICATION ROUTES ==================== */}
        <Route path="/fabrication">
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["fabrication.view"]}>
                <FabricationOrdersListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId"
            element={
              <ProtectedRoute requiredPermissions={["fabrication.view"]}>
                <FabricationOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:orderId/items/:itemId"
            element={
              <ProtectedRoute requiredPermissions={["fabrication.view", "fabrication.create_bom"]}>
                <FabricationItemDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== PACKET ROUTES (Phase 12) ==================== */}
        <Route path="/packet">
          <Route
            path="my-tasks"
            element={
              <ProtectedRoute requiredPermissions={["fabrication.view"]}>
                <PacketCreatorQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="check-queue"
            element={
              <ProtectedRoute requiredPermissions={["production.approve_packets"]}>
                <PacketCheckQueuePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== DYEING ROUTES (Phase 12.5) ==================== */}
        <Route path="/dyeing">
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["dyeing.view"]}>
                <DyeingDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="available"
            element={
              <ProtectedRoute requiredPermissions={["dyeing.view"]}>
                <DyeingAvailableTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-tasks"
            element={
              <ProtectedRoute requiredPermissions={["dyeing.view"]}>
                <DyeingMyTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="completed"
            element={
              <ProtectedRoute requiredPermissions={["dyeing.view"]}>
                <DyeingCompletedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="task/:orderItemId"
            element={
              <ProtectedRoute requiredPermissions={["dyeing.view"]}>
                <DyeingTaskDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== PRODUCTION ROUTES (Phase 13) ==================== */}
        <Route path="/production">
          {/* Main dashboard - shows different views based on user role */}
          {/* Admin sees assignment panel, Production Head sees their assignments, Worker sees their tasks */}
          <Route
            index
            element={
              <ProtectedRoute requiredPermissions={["production.view"]}>
                <ProductionDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Production Head: Order item detail with task creation and management */}
          <Route
            path="order-item/:orderItemId"
            element={
              <ProtectedRoute requiredPermissions={["production.manage"]}>
                <ProductionOrderItemPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin">
          <Route
            path="measurements"
            element={
              <ProtectedRoute requiredPermissions={["measurements.view"]}>
                <MeasurementChartsSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredPermissions={["users.view"]}>
                <UserListPage />
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
