/**
 * QA Rejection Modal - Phase 14 Redesign
 * src/features/qa/components/QARejectionModal.jsx
 *
 * Modal for rejecting a section with reason selection and required notes
 */

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useRejectSection } from "@/hooks/useQA"
import { QA_REJECTION_REASONS } from "@/constants/orderConstants"
import RoundBadge from "./RoundBadge"

export default function QARejectionModal({
  open,
  onOpenChange,
  orderItemId,
  section,
}) {
  const { user } = useAuth()
  const [reasonCode, setReasonCode] = useState("")
  const [notes, setNotes] = useState("")

  const rejectMutation = useRejectSection()

  const { name, displayName, qaData } = section
  const currentRound = qaData?.currentRound || 1

  const handleSubmit = () => {
    if (!reasonCode || !notes.trim()) return

    rejectMutation.mutate(
      {
        orderItemId,
        sectionName: name,
        rejectedBy: user?.id,
        reasonCode,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setReasonCode("")
          setNotes("")
        },
      }
    )
  }

  const handleClose = () => {
    onOpenChange(false)
    setReasonCode("")
    setNotes("")
  }

  const isValid = reasonCode && notes.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reject Section
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="text-sm">
              <span className="text-gray-500">Section:</span>{" "}
              <span className="font-medium">{displayName}</span>
            </div>
            <div className="text-sm flex items-center gap-2">
              <span className="text-gray-500">Current Round:</span>
              <RoundBadge round={currentRound} />
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QA_REJECTION_REASONS).map(([code, reason]) => (
                  <SelectItem key={code} value={code}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Rejection Notes * <span className="text-gray-400 font-normal">(Required)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Describe what needs to be fixed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              ⚠️ This section will be sent back to Production Head for rework.
              They will see your rejection reason and notes.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || rejectMutation.isPending}
          >
            {rejectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Confirm Rejection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}