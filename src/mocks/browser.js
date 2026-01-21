import { setupWorker } from "msw/browser"
import { authHandlers } from "./handlers/authHandlers"
import { measurementChartsHandlers } from "./handlers/measurementChartsHandlers"
import { inventoryHandlers } from "./handlers/inventoryHandlers"
import { productsHandlers } from "./handlers/productsHandlers"
import { usersHandlers } from "./handlers/usersHandlers"
import { ordersHandlers } from "./handlers/ordersHandlers"
import { fabricationHandlers } from "./handlers/fabricationHandlers"
import { procurementHandlers } from "./handlers/procurementHandlers"
import { packetHandlers } from "./handlers/packetHandlers"
import { dyeingHandlers } from "./handlers/dyeingHandlers"
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
  ...packetHandlers,
  ...dyeingHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
