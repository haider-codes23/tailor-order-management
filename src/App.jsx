import { formatCurrency, formatDate, formatOrderStatus, timeAgo } from "@/utils/formatters"
import { ORDER_STATUSES } from "@/utils/constants"

function App() {
  return (
    <div className="min-h-screen p-8 bg-slate-100">
      <div className="max-w-2xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Formatter Tests</h1>

        <div className="space-y-2">
          <p>
            <strong>Currency:</strong> {formatCurrency(1500)}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(new Date())}
          </p>
          <p>
            <strong>Date (long):</strong> {formatDate(new Date(), "long")}
          </p>
          <p>
            <strong>Status:</strong> {formatOrderStatus(ORDER_STATUSES.IN_PRODUCTION)}
          </p>
          <p>
            <strong>Time ago:</strong> {timeAgo(new Date(Date.now() - 3600000))}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
