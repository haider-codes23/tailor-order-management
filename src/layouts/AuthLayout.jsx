import { Outlet } from "react-router-dom"

/**
 * AuthLayout - Used for authentication pages (login, register, etc.)
 *
 * This layout provides a clean, centered card on a gradient background.
 * It uses React Router's <Outlet /> to render child routes.
 *
 * Think of this as the "logged out" experience - simple and focused.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding area - you can replace this with your actual logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Tailor Order Management</h1>
          <p className="text-slate-600 mt-2">Manage your tailoring business efficiently</p>
        </div>

        {/* This is where child routes (like LoginPage) will render */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600">
          <p>&copy; 2024 Tailor Order Management. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
