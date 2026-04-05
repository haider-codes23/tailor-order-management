/**
 * QA Section Row - Phase 14 Redesign
 * src/features/qa/components/QASectionRow.jsx
 *
 * Individual section row within an order item card
 * Shows section status and approve/reject buttons for pending sections
 * Shows rework context (alteration notes, round info) when round > 1
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Scissors } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useApproveSection } from "@/hooks/useQA"
import QARejectionModal from "./QARejectionModal"
import RoundBadge from "./RoundBadge"

export default function QASectionRow({ orderItemId, section, status }) {
  const { user } = useAuth()
  const [showRejectModal, setShowRejectModal] = useState(false)

  const approveMutation = useApproveSection()

  const { name, displayName, qaData } = section
  const currentRound = qaData?.currentRound || 1

  const handleApprove = () => {
    approveMutation.mutate({
      orderItemId,
      sectionName: name,
      approvedBy: user?.id,
    })
  }

  return (
    <>
      <div className="py-2 border-b border-gray-100 last:border-0">
        {/* Main row: name + badge + buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm">{displayName}</span>
            {currentRound > 1 && <RoundBadge round={currentRound} />}
          </div>

          {status === "pending" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "..." : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-3 text-red-600 border-red-200 hover:bg-red-50 text-xs"
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
            </div>
          ) : status === "approved" ? (
            <span className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Approved {currentRound > 1 ? `(Round ${currentRound - 1})` : ""}
            </span>
          ) : null}
        </div>

        {/* Rework context — shown when round > 1 */}
        {currentRound > 1 && (section.isAlteration || section.alterationNotes) && (
          <div className="mt-1.5 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <div className="font-medium text-orange-800 flex items-center gap-1">
              <Scissors className="h-3 w-3" />
              Client requested alteration
            </div>
            {section.alterationNotes && (
              <div className="text-orange-700 mt-1">
                Notes: {section.alterationNotes}
              </div>
            )}
          </div>
        )}
        {currentRound > 1 && !section.isAlteration && !section.alterationNotes && (
          <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            <div className="font-medium text-amber-700 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Round {currentRound} — Re-review after rework
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <QARejectionModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        orderItemId={orderItemId}
        section={section}
      />
    </>
  )
}