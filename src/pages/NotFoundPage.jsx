import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="text-xl text-slate-600 mt-4">Page not found</p>
        <p className="text-slate-500 mt-2">The page you're looking for doesn't exist.</p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
