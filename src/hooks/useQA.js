/**
 * QA React Query Hooks
 * src/features/qa/hooks/useQA.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * React Query hooks for QA operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { qaApi } from "@/services/api/qaApi"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const qaKeys = {
  all: ["qa"],
  queue: () => [...qaKeys.all, "queue"],
  stats: () => [...qaKeys.all, "stats"],
  section: (orderItemId, sectionName) => [...qaKeys.all, "section", orderItemId, sectionName],
  readyForClient: () => [...qaKeys.all, "ready-for-client"],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch QA queue (sections in QA_PENDING status)
 */
export function useQAQueue() {
  return useQuery({
    queryKey: qaKeys.queue(),
    queryFn: qaApi.getQAQueue,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch QA statistics
 */
export function useQAStats() {
  return useQuery({
    queryKey: qaKeys.stats(),
    queryFn: qaApi.getQAStats,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch section details for QA review
 * @param {string} orderItemId - Order item ID
 * @param {string} sectionName - Section name
 */
export function useQASectionDetails(orderItemId, sectionName) {
  return useQuery({
    queryKey: qaKeys.section(orderItemId, sectionName),
    queryFn: () => qaApi.getQASectionDetails(orderItemId, sectionName),
    enabled: !!orderItemId && !!sectionName,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch sections ready for client approval
 */
export function useSectionsReadyForClient() {
  return useQuery({
    queryKey: qaKeys.readyForClient(),
    queryFn: qaApi.getSectionsReadyForClient,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to add YouTube video link to a section
 */
export function useAddSectionVideoLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, youtubeUrl, uploadedBy }) =>
      qaApi.addSectionVideoLink(orderItemId, sectionName, { youtubeUrl, uploadedBy }),

    onSuccess: (data, variables) => {
      const { orderItemId, sectionName } = variables
      const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)

      toast.success(`Video link added for ${displayName}`, {
        description: "Section is now ready for client approval.",
      })

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: qaKeys.queue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: qaKeys.section(orderItemId, sectionName) })
      queryClient.invalidateQueries({ queryKey: qaKeys.readyForClient() })
      
      // Also invalidate order queries to reflect status changes
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["order-items", orderItemId] })

      // Force refetch to ensure immediate UI update
      queryClient.refetchQueries({ queryKey: qaKeys.queue() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      console.error("Failed to add video link:", error)
      toast.error("Failed to add video link", {
        description: error.message || "Please try again.",
      })
    },
  })
}

/**
 * Hook to update YouTube video link for a section
 */
export function useUpdateSectionVideoLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, youtubeUrl, updatedBy }) =>
      qaApi.updateSectionVideoLink(orderItemId, sectionName, { youtubeUrl, updatedBy }),

    onSuccess: (data, variables) => {
      const { orderItemId, sectionName } = variables
      const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)

      toast.success(`Video link updated for ${displayName}`)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: qaKeys.section(orderItemId, sectionName) })
      queryClient.invalidateQueries({ queryKey: qaKeys.readyForClient() })
    },

    onError: (error) => {
      console.error("Failed to update video link:", error)
      toast.error("Failed to update video link", {
        description: error.message || "Please try again.",
      })
    },
  })
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get QA queue grouped by order
 */
export function useQAQueueGroupedByOrder() {
  const { data: sections, ...rest } = useQAQueue()

  const groupedData = sections
    ? sections.reduce((acc, section) => {
        const orderKey = section.orderId
        if (!acc[orderKey]) {
          acc[orderKey] = {
            orderId: section.orderId,
            orderNumber: section.orderNumber,
            customerName: section.customerName,
            fwdDate: section.fwdDate,
            sections: [],
          }
        }
        acc[orderKey].sections.push(section)
        return acc
      }, {})
    : {}

  return {
    ...rest,
    data: Object.values(groupedData),
  }
}

/**
 * Hook to check if a YouTube URL is valid
 */
export function useYouTubeUrlValidation(url) {
  const isValid = qaApi.isValidYouTubeUrl(url)
  const videoId = qaApi.extractYouTubeVideoId(url)
  const embedUrl = qaApi.getYouTubeEmbedUrl(url)

  return {
    isValid,
    videoId,
    embedUrl,
    thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
  }
}