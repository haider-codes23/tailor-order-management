/**
 * QA Section Detail Page
 * src/features/qa/pages/QASectionDetailPage.jsx
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Detail page for QA user to add/view YouTube video link for a section
 */

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Video,
  CheckCircle,
  Calendar,
  User,
  Package,
  Loader2,
  AlertCircle,
  ExternalLink,
  Play,
  Link as LinkIcon,
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  useQASectionDetails,
  useAddSectionVideoLink,
  useYouTubeUrlValidation,
} from "../../../hooks/useQA"
import { SECTION_STATUS, SECTION_STATUS_CONFIG } from "@/constants/orderConstants"
import YouTubePreview from "../components/YouTubePreview"

export default function QASectionDetailPage() {
  const { orderItemId, sectionName } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState("")

  // Fetch section details
  const { data: section, isLoading, error } = useQASectionDetails(orderItemId, sectionName)

  // Video link mutation
  const addVideoMutation = useAddSectionVideoLink()

  // YouTube URL validation
  const { isValid: isValidUrl, embedUrl, thumbnailUrl } = useYouTubeUrlValidation(youtubeUrl)

  // Pre-fill URL if section already has one
  useEffect(() => {
    if (section?.qaData?.youtubeUrl) {
      setYoutubeUrl(section.qaData.youtubeUrl)
    }
  }, [section])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isValidUrl) {
      return
    }

    await addVideoMutation.mutateAsync({
      orderItemId,
      sectionName,
      youtubeUrl,
      uploadedBy: user?.id,
    })

    // Navigate back to dashboard on success
    navigate("/qa")
  }

  // Check if we can edit (only in QA_PENDING status)
  const canEdit = section?.status === SECTION_STATUS.QA_PENDING

  // Status config
  const statusConfig = section
    ? SECTION_STATUS_CONFIG[section.status] || { label: section.status, color: "bg-gray-100" }
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error || !section) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/qa")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to QA Dashboard
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">Section not found or failed to load</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/qa")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to QA Dashboard
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-gray-900">
            QA Review: {section.sectionDisplayName}
          </h1>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
        <p className="text-gray-500 text-sm">Add YouTube video link for client approval</p>
      </div>

      {/* Order Info Card */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Order:</span>
              <span className="font-medium">{section.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>{section.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{section.productName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>FWD: {section.fwdDate ? format(new Date(section.fwdDate), "MMM d, yyyy") : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Completed Summary */}
      <Card className="mb-4 bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Production Completed</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            All production tasks have been completed for this section.
          </p>
          {section.productionCompletedAt && (
            <p className="text-xs text-green-500 mt-1">
              Completed: {format(new Date(section.productionCompletedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* YouTube Link Form */}
      <Card className={canEdit ? "border-violet-200" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="h-5 w-5 text-violet-600" />
            QA Video Link
          </CardTitle>
          <CardDescription>
            {canEdit
              ? "Paste the YouTube video link showing the completed section"
              : "Video link has been added for this section"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL *</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={!canEdit}
                  className={`pl-10 ${
                    youtubeUrl && !isValidUrl
                      ? "border-red-300 focus:ring-red-500"
                      : youtubeUrl && isValidUrl
                        ? "border-green-300 focus:ring-green-500"
                        : ""
                  }`}
                />
              </div>
              {youtubeUrl && !isValidUrl && (
                <p className="text-sm text-red-600">Please enter a valid YouTube URL</p>
              )}
              {!canEdit && (
                <p className="text-xs text-gray-500">
                  Video link cannot be edited after submission
                </p>
              )}
            </div>

            {/* YouTube Preview */}
            {youtubeUrl && isValidUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <YouTubePreview url={youtubeUrl} />
              </div>
            )}

            {/* Help Text */}
            {canEdit && (
              <Alert>
                <Video className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Upload the QA video to YouTube first, then paste the video link here. 
                  The video will be sent to the client for approval.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            {canEdit && (
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={!isValidUrl || addVideoMutation.isPending}
              >
                {addVideoMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit QA Video Link
                  </>
                )}
              </Button>
            )}

            {/* View Video Button (if already submitted) */}
            {!canEdit && section.qaData?.youtubeUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.open(section.qaData.youtubeUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Video in YouTube
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
