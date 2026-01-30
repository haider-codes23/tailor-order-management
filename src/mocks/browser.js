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
import { productionHandlers } from "./handlers/productionHandlers"
import { qaHandlers } from "./handlers/qaHandlers"
import { salesApprovalHandlers } from "./handlers/salesApprovalHandlers"
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
  ...productionHandlers,
  ...qaHandlers,
  ...salesApprovalHandlers,
  // Future handlers will be added here:
  // ...orderHandlers,
  // ...inventoryHandlers,
  // etc.
]

export const worker = setupWorker(...handlers)
