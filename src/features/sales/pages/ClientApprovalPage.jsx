/**
 * Client Approval Detail Page
 * src/features/sales/pages/ClientApprovalPage.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Detail page for managing client approval of an order item's sections
 */

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Send,
  ThumbsUp,
  Clock,
  CheckCircle,
  User,
  Phone,
  Calendar,
  Package,
  Video,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useOrderItemApprovalDetails,
  useSendSectionToClient,
  useMarkSectionClientApproved,
  useSendAllSectionsToClient,
  useApproveAllSections,
} from "../../../hooks/useSalesApproval"
import { SECTION_STATUS, SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import YouTubePreview from "@/features/qa/components/YouTubePreview"

export default function ClientApprovalPage() {
  const { orderItemId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [selectedSection, setSelectedSection] = useState(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [clientNotes, setClientNotes] = useState("")
  const [copiedUrl, setCopiedUrl] = useState(null)

  // Fetch order item details
  const { data: orderItem, isLoading, error } = useOrderItemApprovalDetails(orderItemId)

  // Mutations
  const sendToClientMutation = useSendSectionToClient()
  const approveClientMutation = useMarkSectionClientApproved()
  const sendAllMutation = useSendAllSectionsToClient()
  const approveAllMutation = useApproveAllSections()

  // Handle send section to client
  const handleSendToClient = (sectionName) => {
    sendToClientMutation.mutate({
      orderItemId,
      sectionName,
      sentBy: user?.id,
    })
  }

  // Handle approve section
  const handleApproveSection = () => {
    if (!selectedSection) return

    approveClientMutation.mutate(
      {
        orderItemId,
        sectionName: selectedSection.sectionName,
        approvedBy: user?.id,
        clientNotes: clientNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowApproveDialog(false)
          setSelectedSection(null)
          setClientNotes("")
        },
      }
    )
  }

  // Handle send all to client
  const handleSendAllToClient = () => {
    sendAllMutation.mutate({
      orderItemId,
      sentBy: user?.id,
    })
  }

  // Handle approve all
  const handleApproveAll = () => {
    approveAllMutation.mutate({
      orderItemId,
      approvedBy: user?.id,
    })
  }

  // Copy video URL
  const handleCopyUrl = (url, sectionName) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(sectionName)
    toast.success("Video link copied to clipboard")
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  // Count sections by status
  const countByStatus = (status) =>
    orderItem?.sections?.filter((s) => s.status === status).length || 0

  const readyCount = countByStatus(SECTION_STATUS.READY_FOR_CLIENT_APPROVAL)
  const awaitingCount = countByStatus(SECTION_STATUS.AWAITING_CLIENT_APPROVAL)
  const approvedCount = countByStatus(SECTION_STATUS.CLIENT_APPROVED)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !orderItem) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/sales/approval")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">Order item not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/sales/approval")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Client Approval: {orderItem.orderNumber}
        </h1>
        <p className="text-gray-500 text-sm">Manage client approval for this order item</p>
      </div>

      {/* Customer Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{orderItem.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{orderItem.customerPhone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{orderItem.productName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>
                FWD: {orderItem.fwdDate ? format(new Date(orderItem.fwdDate), "MMM d, yyyy") : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-lg font-bold text-blue-700">{readyCount}</div>
          <div className="text-xs text-blue-600">Ready</div>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded">
          <div className="text-lg font-bold text-amber-700">{awaitingCount}</div>
          <div className="text-xs text-amber-600">Awaiting</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-bold text-green-700">{approvedCount}</div>
          <div className="text-xs text-green-600">Approved</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {(readyCount > 0 || awaitingCount > 0) && (
        <div className="flex gap-2 mb-4">
          {readyCount > 0 && (
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSendAllToClient}
              disabled={sendAllMutation.isPending}
            >
              {sendAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send All ({readyCount})
            </Button>
          )}
          {awaitingCount > 0 && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApproveAll}
              disabled={approveAllMutation.isPending}
            >
              {approveAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Approve All ({awaitingCount})
            </Button>
          )}
        </div>
      )}

      {/* Sections List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItem.sections?.map((section) => {
            const statusConfig = SECTION_STATUS_CONFIG[section.status] || {
              label: section.status,
              color: "bg-gray-100 text-gray-800",
            }
            const isReady = section.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL
            const isAwaiting = section.status === SECTION_STATUS.AWAITING_CLIENT_APPROVAL
            const isApproved = section.status === SECTION_STATUS.CLIENT_APPROVED

            return (
              <div
                key={section.sectionName}
                className={`p-4 rounded-lg border ${
                  isApproved
                    ? "bg-green-50 border-green-200"
                    : isAwaiting
                      ? "bg-amber-50 border-amber-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{section.sectionDisplayName}</span>
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  </div>
                  {isApproved && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>

                {/* Video Preview */}
                {section.qaData?.youtubeUrl && (
                  <div className="mb-3">
                    <YouTubePreview url={section.qaData.youtubeUrl} />
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleCopyUrl(section.qaData.youtubeUrl, section.sectionName)
                        }
                      >
                        {copiedUrl === section.sectionName ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => window.open(section.qaData.youtubeUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isReady && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSendToClient(section.sectionName)}
                      disabled={sendToClientMutation.isPending}
                    >
                      {sendToClientMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-1" />
                      )}
                      Send to Client
                    </Button>
                  )}
                  {isAwaiting && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedSection(section)
                        setShowApproveDialog(true)
                      }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Mark Approved
                    </Button>
                  )}
                  {isApproved && section.clientNotes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Client notes:</span> {section.clientNotes}
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="mt-2 text-xs text-gray-500">
                  {section.sentToClientAt && (
                    <div>Sent: {format(new Date(section.sentToClientAt), "MMM d, h:mm a")}</div>
                  )}
                  {section.clientApprovedAt && (
                    <div>
                      Approved: {format(new Date(section.clientApprovedAt), "MMM d, h:mm a")}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Client Approval</DialogTitle>
            <DialogDescription>
              Mark {selectedSection?.sectionDisplayName} as approved by the client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-notes">Client Notes (optional)</Label>
              <Textarea
                id="client-notes"
                placeholder="Any feedback from the client..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApproveSection}
              disabled={approveClientMutation.isPending}
            >
              {approveClientMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-2" />
              )}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
