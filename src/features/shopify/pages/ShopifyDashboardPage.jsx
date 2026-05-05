/**
 * Shopify Dashboard Page — Phase 15
 * src/features/shopify/pages/ShopifyDashboardPage.jsx
 *
 * Tabbed layout:
 *   Tab 1: "Orders" — View & import Shopify orders (orders.view)
 *   Tab 2: "Settings" — Connection status, webhooks, product sync (admin only)
 */

import { useState } from "react"
import { ShoppingBag, Settings, Package, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/hooks/useAuth"
import ShopifyOrdersTable from "../components/ShopifyOrdersTable"
import ShopifySettingsPanel from "../components/ShopifySettingsPanel"

const TABS = [
  { id: "orders", label: "Shopify Orders", icon: Package },
  { id: "settings", label: "Settings", icon: Settings, adminOnly: true },
]

export default function ShopifyDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("orders")

  const isAdmin = user?.role === "ADMIN"

  // Filter tabs based on role
  const visibleTabs = TABS.filter((tab) => !tab.adminOnly || isAdmin)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-xl">
            <ShoppingBag className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopify Integration</h1>
            <p className="text-sm text-gray-500">
              View, import, and sync orders with your Shopify store
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? "border-pink-600 text-pink-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && <ShopifyOrdersTable />}
      {activeTab === "settings" && isAdmin && <ShopifySettingsPanel />}
    </div>
  )
}
