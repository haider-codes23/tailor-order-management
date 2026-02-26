// ============================================================
// SHARED: Sort helper function
// Add this to each page that sorts, or put in a utils file
// e.g. src/utils/sortHelpers.js
// ============================================================

/**
 * sortHelpers.js
 * File: src/utils/sortHelpers.js
 */

export function applySortToTasks(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "product_asc":
        return (a.productName || "").localeCompare(b.productName || "")
      case "product_desc":
        return (b.productName || "").localeCompare(a.productName || "")
      case "productionDate_asc":
        return (
          new Date(a.productionShippingDate || a.productionShipDate || 0) -
          new Date(b.productionShippingDate || b.productionShipDate || 0)
        )
      case "productionDate_desc":
        return (
          new Date(b.productionShippingDate || b.productionShipDate || 0) -
          new Date(a.productionShippingDate || a.productionShipDate || 0)
        )
      case "fwd_asc":
        return new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0)
      case "fwd_desc":
        return new Date(b.fwdDate || 0) - new Date(a.fwdDate || 0)
      default:
        return 0
    }
  })
}
