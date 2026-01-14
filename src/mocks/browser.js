import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/authHandlers"
import { measurementChartsHandlers } from "./handlers/measurementChartsHandlers"
import { inventoryHandlers } from "./handlers/inventoryHandlers"
import { productsHandlers } from "./handlers/productsHandlers"
import { usersHandlers } from "./handlers/usersHandlers"
import { ordersHandlers } from "./handlers/ordersHandlers"
import { fabricationHandlers } from "./handlers/fabricationHandlers"
import { procurementHandlers } from "./handlers/procurementHandlers"
// Combine all handlers as we add more features
// For now, we only have auth handlers
const handlers = [
  ...authHandlers,
  ...measurementChartsHandlers,
  ...inventoryHandlers,
  ...productsHandlers,
  ...usersHandlers,
  ...ordersHandlers,
  ...fabricationHandlers,
  ...procurementHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
