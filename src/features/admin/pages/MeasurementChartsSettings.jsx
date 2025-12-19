import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SizeChartEditor } from "../components/SizeChartEditor"
import { HeightChartEditor } from "../components/HeightChartEditor"

/**
 * Measurement Charts Settings Page
 *
 * This is the admin interface for managing the global measurement charts
 * that are used when generating standard customer forms.
 *
 * The page has two tabs:
 * - Size Chart: Body measurements for each standard size (XS, S, M, L, XL, XXL)
 * - Height Chart: Garment lengths for each height range
 *
 * Only Admin users should have access to this page (enforced by routing).
 *
 * Architecture in action:
 * - This page component handles layout and tabs
 * - Individual editor components handle the actual chart editing
 * - Editors use React Query hooks (useStandardSizeChart, etc.)
 * - Hooks use API services (measurementChartsApi)
 * - API services make HTTP requests
 * - MSW intercepts and returns mock data (for now)
 *
 * When this moves to production with a real backend:
 * - Zero changes needed to this component
 * - Just disable MSW and point API to real backend
 * - Everything else works identically
 */
export function MeasurementChartsSettings() {
  const [activeTab, setActiveTab] = useState("size")

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Measurement Charts</h1>
        <p className="text-muted-foreground mt-2">
          Manage the standard measurement charts used for generating customer forms. These
          measurements are applied when customers select standard sizes.
        </p>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="size">Size Chart</TabsTrigger>
          <TabsTrigger value="height">Height Chart</TabsTrigger>
        </TabsList>

        {/* Size Chart Tab */}
        <TabsContent value="size" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Size Chart</CardTitle>
              <CardDescription>
                Define body measurements for each standard size. These measurements are shown to
                customers who select standard sizes (XS, S, M, L, XL, XXL) on their order forms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SizeChartEditor />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Height Chart Tab */}
        <TabsContent value="height" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Height Chart</CardTitle>
              <CardDescription>
                Define garment lengths based on customer height ranges. These lengths are applied
                automatically based on the height range the customer selects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeightChartEditor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
