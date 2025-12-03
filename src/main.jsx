import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/features/auth/hooks/useAuth"
import App from "./App.jsx"
import { queryClient } from "./services/queryClient"
import "./index.css"

// Initialize MSW in development
if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser")
  worker.start()
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
