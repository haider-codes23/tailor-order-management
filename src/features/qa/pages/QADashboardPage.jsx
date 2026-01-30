/**
 * QA Dashboard Page
 * src/features/qa/pages/QADashboardPage.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Dashboard for QA users to view and process sections awaiting video links
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Camera,
  Video,
  Clock,
  CheckCircle,
  Calendar,
  User,
  Package,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { useQAQueue, useQAStats, useSectionsReadyForClient } from "../../../hooks/useQA"
import { SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import QASectionCard from "../components/QASectionCard"

export default function QADashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch data
  const { data: queueData, isLoading: queueLoading, error: queueError } = useQAQueue()
  const { data: stats, isLoading: statsLoading } = useQAStats()
  const { data: readyForClient, isLoading: readyLoading } = useSectionsReadyForClient()

  // Filter sections based on search
  const filterSections = (sections) => {
    if (!searchQuery.trim()) return sections || []
    const query = searchQuery.toLowerCase()
    return (sections || []).filter(
      (s) =>
        s.orderNumber?.toLowerCase().includes(query) ||
        s.customerName?.toLowerCase().includes(query) ||
        s.productName?.toLowerCase().includes(query) ||
        s.sectionDisplayName?.toLowerCase().includes(query)
    )
  }

  const filteredQueue = filterSections(queueData)
  const filteredReady = filterSections(readyForClient)

  // Handle section click
  const handleSectionClick = (section) => {
    navigate(`/qa/section/${section.orderItemId}/${section.sectionName}`)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QA Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review completed sections and add QA video links
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-4 text-center">
            <Camera className="h-5 w-5 text-violet-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-violet-700">
              {statsLoading ? "..." : stats?.pendingReview || 0}
            </div>
            <div className="text-xs text-violet-600">Pending Review</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Video className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? "..." : stats?.readyForClient || 0}
            </div>
            <div className="text-xs text-blue-600">Ready for Client</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">
              {statsLoading ? "..." : stats?.completedToday || 0}
            </div>
            <div className="text-xs text-green-600">Completed Today</div>
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
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            QA Pending ({filteredQueue.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Ready for Client ({filteredReady.length})
          </TabsTrigger>
        </TabsList>

        {/* QA Pending Tab */}
        <TabsContent value="pending">
          {queueLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : queueError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">Failed to load QA queue</p>
              </CardContent>
            </Card>
          ) : filteredQueue.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No sections match your search" : "No sections pending QA review"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map((section) => (
                <QASectionCard
                  key={`${section.orderItemId}-${section.sectionName}`}
                  section={section}
                  onClick={() => handleSectionClick(section)}
                  showVideoButton
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ready for Client Tab */}
        <TabsContent value="ready">
          {readyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredReady.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? "No sections match your search" : "No sections ready for client"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReady.map((section) => (
                <QASectionCard
                  key={`${section.orderItemId}-${section.sectionName}`}
                  section={section}
                  onClick={() => handleSectionClick(section)}
                  showVideoLink
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
