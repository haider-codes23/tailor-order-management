/**
 * Rejection Options Modal - Phase 14 Redesign
 * src/features/sales/components/RejectionOptionsModal.jsx
 *
 * Shown when Sales clicks "✗ Client Not Satisfied" on Tab 2 (Awaiting Response).
 * Presents 4 options as large clickable cards:
 *   1. Request New Video   → opens ReVideoRequestModal
 *   2. Request Alteration  → opens AlterationRequestModal
 *   3. Start from Scratch  → opens StartFromScratchModal
 *   4. Cancel Order        → opens CancellationConfirmModal
 *
 * Props:
 *   open            — boolean
 *   order           — the order object
 *   onClose         — callback to close the modal
 *   onSelectOption  — callback(option) where option is one of:
 *                     "revideo" | "alteration" | "scratch" | "cancel"
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Video, Scissors, RefreshCw, XCircle } from "lucide-react"

const OPTIONS = [
  {
    key: "revideo",
    icon: Video,
    label: "Request New Video",
    description: "Client wants to see different sections highlighted",
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50",
    hoverColor: "hover:bg-amber-100",
  },
  {
    key: "alteration",
    icon: Scissors,
    label: "Request Alteration",
    description: "Send back to Production for changes",
    borderColor: "border-orange-300",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
  },
  {
    key: "scratch",
    icon: RefreshCw,
    label: "Start from Scratch",
    description: "Reset order and redo everything",
    borderColor: "border-blue-300",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
  },
  {
    key: "cancel",
    icon: XCircle,
    label: "Cancel Order",
    description: "Client rejected, cancel the order",
    borderColor: "border-red-300",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
  },
]

export default function RejectionOptionsModal({ open, order, onClose, onSelectOption }) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Client Not Satisfied</DialogTitle>
        </DialogHeader>

        {/* Order context */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm mb-1">
          <span className="text-gray-500">Order:</span>{" "}
          <span className="font-medium">{order.orderNumber}</span>
          <span className="text-gray-500 ml-2">•</span>{" "}
          <span className="text-gray-600">{order.customerName}</span>
        </div>

        <p className="text-sm text-gray-600">What would you like to do?</p>

        <div className="space-y-3">
          {OPTIONS.map(
            ({ key, icon: Icon, label, description, borderColor, bgColor, hoverColor }) => (
              <button
                key={key}
                onClick={() => onSelectOption(key)}
                className={`w-full p-3 border-2 ${borderColor} rounded-lg text-left ${bgColor} ${hoverColor} transition-colors`}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 ml-6">{description}</div>
              </button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
