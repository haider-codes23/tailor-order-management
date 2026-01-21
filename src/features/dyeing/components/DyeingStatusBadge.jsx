/**
 * DyeingStatusBadge.jsx
 * Status badge component for dyeing section statuses
 *
 * File: src/features/dyeing/components/DyeingStatusBadge.jsx
 */

import { Badge } from "@/components/ui/badge"
import { Droplets, UserCheck, Loader, CheckCircle2, XCircle, Clock, Factory } from "lucide-react"
import { SECTION_STATUS, SECTION_STATUS_CONFIG } from "@/constants/orderConstants"

const iconMap = {
  Droplets: Droplets,
  UserCheck: UserCheck,
  Loader: Loader,
  CheckCircle2: CheckCircle2,
  XCircle: XCircle,
  Clock: Clock,
  Factory: Factory,
}

export default function DyeingStatusBadge({ status, showIcon = true, size = "default" }) {
  const config = SECTION_STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
    icon: "Clock",
  }

  const IconComponent = iconMap[config.icon] || Clock

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  return (
    <Badge
      variant="secondary"
      className={`${config.color} ${sizeClasses[size]} font-medium inline-flex items-center gap-1.5`}
    >
      {showIcon && <IconComponent className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {config.label}
    </Badge>
  )
}
