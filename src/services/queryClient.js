import { QueryClient } from "@tanstack/react-query"

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Queries will not refetch on window focus by default
      refetchOnWindowFocus: false,

      // Queries will not refetch on reconnect by default
      refetchOnReconnect: false,

      // Queries will be considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,

      // Failed queries will retry once
      retry: 1,

      // Default error handler
      onError: (error) => {
        console.error("Query error:", error)
      },
    },
    mutations: {
      // Default error handler for mutations
      onError: (error) => {
        console.error("Mutation error:", error)
      },
    },
  },
})
