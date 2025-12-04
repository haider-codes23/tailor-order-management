import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/features/auth/hooks/useAuth"
import App from "./App.jsx"
import { queryClient } from "./services/queryClient"
import "./index.css"

import "./index.css"

// Initialize MSW in development
if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser")
  worker.start()
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
