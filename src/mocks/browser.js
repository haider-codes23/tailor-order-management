import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/authHandlers"
import { measurementChartsHandlers } from "./handlers/measurementChartsHandlers"
import { inventoryHandlers } from "./handlers/inventoryHandlers"
import { productsHandlers } from "./handlers/productsHandlers"
import { usersHandlers } from "./handlers/usersHandlers"
// Combine all handlers as we add more features
// For now, we only have auth handlers
const handlers = [
  ...authHandlers,
  ...measurementChartsHandlers,
  ...inventoryHandlers,
  ...productsHandlers,
  ...usersHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
