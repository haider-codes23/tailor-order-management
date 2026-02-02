/**
 * Round Badge - Phase 14 Redesign
 * src/features/qa/components/RoundBadge.jsx
 *
 * Small badge showing the QA round number (Round 1, Round 2, etc.)
 */

import { Badge } from "@/components/ui/badge"

export default function RoundBadge({ round }) {
  if (!round || round === 1) return null

  return (
    <Badge
      variant="outline"
      className="text-xs px-1.5 py-0 bg-orange-100 text-orange-700 border-orange-200"
    >
      Round {round}
    </Badge>
  )
}