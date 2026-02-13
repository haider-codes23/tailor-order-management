/**
 * QA Dashboard Page - Phase 14 Redesign
 * src/features/qa/pages/QADashboardPage.jsx
 *
 * Two tabs:
 * 1. Production Queue - Order items with sections to approve/reject + video upload
 * 2. Sales Requests - Re-video requests from Sales team
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  ClipboardCheck,
  Video,
  MessageSquare,
  Search,
  Loader2,
  AlertCircle,
  Package,
  Send,
} from "lucide-react"
import { useQAProductionQueue, useQASalesRequests, useQAStats } from "@/hooks/useQA"
import QAOrderItemCard from "../components/QAOrderItemCard"
import SalesRequestCard from "../components/SalesRequestCard"

export default function QADashboardPage() {
  const [activeTab, setActiveTab] = useState("production")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  const {
    data: productionQueue,
    isLoading: productionLoading,
    error: productionError,
  } = useQAProductionQueue()

  const { data: salesRequests, isLoading: salesLoading, error: salesError } = useQASalesRequests()

  const { data: stats, isLoading: statsLoading } = useQAStats()

  // Filter based on search
  const filterItems = (items) => {
    if (!searchQuery.trim()) return items || []
    const query = searchQuery.toLowerCase()
    return (items || []).filter(
      (item) =>
        item.orderNumber?.toLowerCase().includes(query) ||
        item.customerName?.toLowerCase().includes(query) ||
        item.productName?.toLowerCase().includes(query)
    )
  }

  const filteredProduction = filterItems(productionQueue)
  const filteredSalesRequests = filterItems(salesRequests)

  // Separate production queue into pending review and ready for video
  // Separate production queue into 3 groups
  const pendingReview = filteredProduction.filter(
    (item) => !item.allSectionsApproved || item.pendingSections?.length > 0
  )
  const readyForVideo = filteredProduction.filter(
    (item) => item.allSectionsApproved && !item.hasVideo
  )
  const videoUploaded = filteredProduction.filter(
    (item) => item.allSectionsApproved && item.hasVideo
  )

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QA Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Review sections and upload videos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-3 text-center">
            <ClipboardCheck className="h-5 w-5 text-violet-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-violet-700">
              {statsLoading ? "..." : stats?.pendingReview || 0}
            </div>
            <div className="text-xs text-violet-600">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <Video className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? "..." : stats?.readyForVideo || 0}
            </div>
            <div className="text-xs text-blue-600">Ready for Video</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 text-center">
            <MessageSquare className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">
              {statsLoading ? "..." : stats?.salesRequests || 0}
            </div>
            <div className="text-xs text-amber-600">Sales Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="production" className="flex items-center gap-2 text-sm">
            <ClipboardCheck className="h-4 w-4" />
            Production Queue ({filteredProduction.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Sales Requests ({filteredSalesRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Production Queue */}
        <TabsContent value="production">
          {productionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : productionError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">Failed to load QA queue</p>
              </CardContent>
            </Card>
          ) : filteredProduction.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No items match your search" : "No items pending QA review"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Video Uploaded — Ready to Send to Sales */}
              {videoUploaded.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Ready to Send to Sales ({videoUploaded.length})
                  </h3>
                  {videoUploaded.map((item) => (
                    <QAOrderItemCard
                      key={item.orderItemId}
                      orderItem={item}
                      variant="video-uploaded"
                    />
                  ))}
                </div>
              )}

              {/* Ready for Video Section */}
              {readyForVideo.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Ready for Video Upload ({readyForVideo.length})
                  </h3>
                  {readyForVideo.map((item) => (
                    <QAOrderItemCard
                      key={item.orderItemId}
                      orderItem={item}
                      variant="ready-for-video"
                    />
                  ))}
                </div>
              )}

              {/* Pending Review Section */}
              {pendingReview.length > 0 && (
                <div className="space-y-3">
                  {readyForVideo.length > 0 && (
                    <h3 className="text-sm font-medium text-violet-700 flex items-center gap-2 mt-6">
                      <ClipboardCheck className="h-4 w-4" />
                      Pending Section Review ({pendingReview.length})
                    </h3>
                  )}
                  {pendingReview.map((item) => (
                    <QAOrderItemCard
                      key={item.orderItemId}
                      orderItem={item}
                      variant="pending-review"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Sales Requests */}
        <TabsContent value="sales">
          {salesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : salesError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">Failed to load sales requests</p>
              </CardContent>
            </Card>
          ) : filteredSalesRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery
                    ? "No requests match your search"
                    : "No re-video requests from Sales"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSalesRequests.map((request) => (
                <SalesRequestCard key={request.orderItemId} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
