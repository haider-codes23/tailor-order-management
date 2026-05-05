/**
 * Shopify Settings Panel — Phase 15
 * src/features/shopify/components/ShopifySettingsPanel.jsx
 *
 * Admin-only settings panel showing:
 *   - Connection status & test button
 *   - Webhook registration status & re-register button
 *   - Product sync button
 *   - Sync stats (24h)
 */

import { useState } from "react"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Wifi,
  Bell,
  RefreshCw,
  Package,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useShopifySettings,
  useTestConnection,
  useRegisterWebhooks,
  useSyncProducts,
} from "@/hooks/useShopify"

export default function ShopifySettingsPanel() {
  const { data: settings, isLoading, isError } = useShopifySettings()
  const testConnectionMutation = useTestConnection()
  const registerWebhooksMutation = useRegisterWebhooks()
  const syncProductsMutation = useSyncProducts()
  const [webhookUrl, setWebhookUrl] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-pink-600 mr-2" />
        <span className="text-gray-500">Loading settings...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 inline mr-1" />
        Failed to load Shopify settings. Make sure you have admin permissions.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Connection Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Connection</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Store URL</span>
            <span className="font-medium text-gray-700">{settings?.storeUrl || "Not configured"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">API Configured</span>
            {settings?.configured ? (
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle className="h-4 w-4" /> Yes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" /> No
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            className="mt-2"
          >
            {testConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4 mr-1.5" />
            )}
            Test Connection
          </Button>
        </div>
      </div>

      {/* Webhook Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Webhooks</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Webhooks Registered</span>
            {settings?.webhooks?.registered ? (
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle className="h-4 w-4" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-4 w-4" /> Not registered
              </span>
            )}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                Backend URL (e.g., your ngrok URL)
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => registerWebhooksMutation.mutate(webhookUrl)}
              disabled={registerWebhooksMutation.isPending || !webhookUrl}
            >
              {registerWebhooksMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-1.5" />
              )}
              Register
            </Button>
          </div>
        </div>
      </div>

      {/* Product Sync */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Product Sync</h3>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Import products from your Shopify store into the internal product catalog.
          Existing products are matched by Shopify ID or name.
        </p>

        <Button
          size="sm"
          variant="outline"
          onClick={() => syncProductsMutation.mutate()}
          disabled={syncProductsMutation.isPending}
        >
          {syncProductsMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1.5" />
          )}
          Sync Products from Shopify
        </Button>

        {syncProductsMutation.data && (
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 border rounded p-3">
            <p>Created: {syncProductsMutation.data.summary?.created || 0}</p>
            <p>Linked: {syncProductsMutation.data.summary?.linked || 0}</p>
            <p>Skipped: {syncProductsMutation.data.summary?.skipped || 0}</p>
          </div>
        )}
      </div>

      {/* Sync Stats */}
      {settings?.syncStats && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Sync Stats (24h)</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {settings.syncStats.total || 0}
              </div>
              <div className="text-xs text-gray-500">Total Syncs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {settings.syncStats.success || 0}
              </div>
              <div className="text-xs text-gray-500">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {settings.syncStats.failed || 0}
              </div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
