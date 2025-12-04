import Sidebar from "@/components/navigation/Sidebar"
import Topbar from "@/components/navigation/Topbar"

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Navigation Test</h1>
            <p className="text-slate-600">
              If you can see the sidebar on the left and the topbar above, navigation components are
              working! We'll wire up the actual routing in the next step.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
