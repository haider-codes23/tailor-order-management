import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/authHandlers"
import { measurementChartsHandlers } from "./handlers/measurementChartsHandlers"
import { inventoryHandlers } from "./handlers/inventoryHandlers"
// Combine all handlers as we add more features
// For now, we only have auth handlers
const handlers = [
  ...authHandlers,
  ...measurementChartsHandlers,
  ...inventoryHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
