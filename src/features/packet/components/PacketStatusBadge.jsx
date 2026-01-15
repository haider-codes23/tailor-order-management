/**
 * PacketStatusBadge.jsx
 * Visual status indicator for packet workflow
 */

import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  UserCheck, 
  Package, 
  CheckSquare, 
  CheckCircle, 
  XCircle 
} from "lucide-react"
import { PACKET_STATUS, PACKET_STATUS_CONFIG } from "@/constants/orderConstants"

const iconMap = {
  Clock,
  UserCheck,
  Package,
  CheckSquare,
  CheckCircle,
  XCircle,
}

export default function PacketStatusBadge({ status, showIcon = true, className = "" }) {
  const config = PACKET_STATUS_CONFIG[status]
  
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status || "Unknown"}
      </Badge>
    )
  }

  const Icon = iconMap[config.icon]

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  )
}

/**
 * Compact version for tables/lists
 */
export function PacketStatusDot({ status }) {
  const colorMap = {
    [PACKET_STATUS.PENDING]: "bg-gray-400",
    [PACKET_STATUS.ASSIGNED]: "bg-blue-500",
    [PACKET_STATUS.IN_PROGRESS]: "bg-amber-500",
    [PACKET_STATUS.COMPLETED]: "bg-cyan-500",
    [PACKET_STATUS.APPROVED]: "bg-green-500",
    [PACKET_STATUS.REJECTED]: "bg-red-500",
  }

  return (
    <span 
      className={`inline-block w-2 h-2 rounded-full ${colorMap[status] || "bg-gray-400"}`}
      title={PACKET_STATUS_CONFIG[status]?.label || status}
    />
  )
}
