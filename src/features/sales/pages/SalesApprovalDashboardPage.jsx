/**
 * Sales Approval Dashboard Page
 * src/features/sales/pages/SalesApprovalDashboardPage.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Dashboard for Sales users to manage client approvals
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Send,
  Clock,
  CheckCircle,
  Search,
  Loader2,
  AlertCircle,
  Video,
  User,
  Calendar,
  Package,
  ThumbsUp,
  ExternalLink,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useSectionsReadyForClient,
  useSectionsAwaitingApproval,
  useSalesApprovalStats,
  useSendAllSectionsToClient,
  useApproveAllSections,
  useSectionsGroupedByOrderItem,
} from "../../../hooks/useSalesApproval"
import { SECTION_STATUS, SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import OrderItemApprovalCard from "../components/OrderItemApprovalCard"

export default function SalesApprovalDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("ready")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useSalesApprovalStats()
  const {
    data: readyGroups,
    isLoading: readyLoading,
    error: readyError,
  } = useSectionsGroupedByOrderItem("ready")
  const {
    data: awaitingGroups,
    isLoading: awaitingLoading,
    error: awaitingError,
  } = useSectionsGroupedByOrderItem("awaiting")

  // Mutations
  const sendAllMutation = useSendAllSectionsToClient()
  const approveAllMutation = useApproveAllSections()

  // Filter groups based on search
  const filterGroups = (groups) => {
    if (!searchQuery.trim()) return groups || []
    const query = searchQuery.toLowerCase()
    return (groups || []).filter(
      (g) =>
        g.orderNumber?.toLowerCase().includes(query) ||
        g.customerName?.toLowerCase().includes(query) ||
        g.productName?.toLowerCase().includes(query)
    )
  }

  const filteredReady = filterGroups(readyGroups)
  const filteredAwaiting = filterGroups(awaitingGroups)

  // Handle send all sections to client
  const handleSendAllToClient = (orderItemId) => {
    sendAllMutation.mutate({
      orderItemId,
      sentBy: user?.id,
    })
  }

  // Handle approve all sections
  const handleApproveAll = (orderItemId) => {
    approveAllMutation.mutate({
      orderItemId,
      approvedBy: user?.id,
    })
  }

  // Navigate to detail page
  const handleViewDetails = (orderItemId) => {
    navigate(`/sales/approval/${orderItemId}`)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Approval Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Send QA videos to clients and track approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Send className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? "..." : stats?.readyToSend || 0}
            </div>
            <div className="text-xs text-blue-600">Ready to Send</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-700">
              {statsLoading ? "..." : stats?.awaitingResponse || 0}
            </div>
            <div className="text-xs text-amber-600">Awaiting Response</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">
              {statsLoading ? "..." : stats?.approvedToday || 0}
            </div>
            <div className="text-xs text-green-600">Approved Today</div>
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
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Ready for Client ({filteredReady.length})
          </TabsTrigger>
          <TabsTrigger value="awaiting" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Awaiting Approval ({filteredAwaiting.length})
          </TabsTrigger>
        </TabsList>

        {/* Ready for Client Tab */}
        <TabsContent value="ready">
          {readyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : readyError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">Failed to load data</p>
              </CardContent>
            </Card>
          ) : filteredReady.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No orders match your search" : "No sections ready to send"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReady.map((group) => (
                <OrderItemApprovalCard
                  key={group.orderItemId}
                  orderItem={group}
                  mode="ready"
                  onSendAll={() => handleSendAllToClient(group.orderItemId)}
                  onViewDetails={() => handleViewDetails(group.orderItemId)}
                  isLoading={sendAllMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Awaiting Approval Tab */}
        <TabsContent value="awaiting">
          {awaitingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : awaitingError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">Failed to load data</p>
              </CardContent>
            </Card>
          ) : filteredAwaiting.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No orders match your search" : "No sections awaiting approval"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAwaiting.map((group) => (
                <OrderItemApprovalCard
                  key={group.orderItemId}
                  orderItem={group}
                  mode="awaiting"
                  onApproveAll={() => handleApproveAll(group.orderItemId)}
                  onViewDetails={() => handleViewDetails(group.orderItemId)}
                  isLoading={approveAllMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
