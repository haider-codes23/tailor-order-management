import { useAuth } from "@/features/auth/hooks/useAuth"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards - we'll build real widgets in future phases */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="text-3xl font-bold mt-2">42</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">In Production</div>
          <div className="text-3xl font-bold mt-2">12</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Awaiting QA</div>
          <div className="text-3xl font-bold mt-2">5</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-slate-600">Low Stock Items</div>
          <div className="text-3xl font-bold mt-2">8</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-slate-600">Activity feed will appear here in future phases...</p>
      </div>
    </div>
  )
}
