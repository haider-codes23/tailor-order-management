import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/authHandlers"
import { measurementChartsHandlers } from "./handlers/measurementChartsHandlers"
// Combine all handlers as we add more features
// For now, we only have auth handlers
const handlers = [
  ...authHandlers,
  ...measurementChartsHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
