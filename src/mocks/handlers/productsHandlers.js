import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import {
  mockProducts,
  mockBOMs,
  mockBOMItems,
  getActiveBOM,
  getAllActiveBOMs,
  getBOMItems,
  getProductBOMs,
  getAvailableSizes,
  getNextVersionNumber,
} from "../data/mockProducts"

// ==================== PRODUCTS HANDLERS ====================

export const productsHandlers = [
  // GET /products - List all products with filters
  http.get(`${appConfig.apiBaseUrl}/products`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const url = new URL(request.url)
    const search = url.searchParams.get("search")
    const category = url.searchParams.get("category")
    const active = url.searchParams.get("active")

    let filtered = [...mockProducts]

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
      )
    }

    // Apply category filter
    if (category && category !== "ALL") {
      filtered = filtered.filter((product) => product.category === category)
    }

    // Apply active filter
    if (active !== null && active !== undefined && active !== "") {
      const isActive = active === "true"
      filtered = filtered.filter((product) => product.active === isActive)
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    })
  }),

  // GET /products/:id - Get single product
  http.get(`${appConfig.apiBaseUrl}/products/:id`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { id } = params
    const product = mockProducts.find((p) => p.id === id)

    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      )
    }

    // Include available sizes
    const availableSizes = getAvailableSizes(id)

    return HttpResponse.json({
      success: true,
      data: {
        ...product,
        available_sizes: availableSizes, // NEW: List of sizes with BOMs
      },
    })
  }),

  // POST /products - Create new product
  http.post(`${appConfig.apiBaseUrl}/products`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const body = await request.json()

    // Validation
    if (!body.name || !body.sku || !body.category) {
      return HttpResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Name, SKU, and category are required",
        },
        { status: 400 }
      )
    }

    // Check for duplicate SKU
    const existingSKU = mockProducts.find((p) => p.sku === body.sku)
    if (existingSKU) {
      return HttpResponse.json(
        {
          success: false,
          error: "SKU already exists",
          message: `Product with SKU "${body.sku}" already exists`,
        },
        { status: 400 }
      )
    }

    // Calculate totals from product_items and add_ons
    const productItems = body.product_items || []
    const addOns = body.add_ons || []
    const subtotal = [...productItems, ...addOns].reduce((sum, item) => sum + (item.price || 0), 0)
    const discount = body.discount || 0
    const totalPrice = subtotal - discount

    const newProduct = {
      id: `prod_${Math.max(...mockProducts.map((p) => parseInt(p.id.split("_")[1])), 0) + 1}`,
      name: body.name,
      sku: body.sku,
      description: body.description || "",
      category: body.category,
      active: body.is_active !== undefined ? body.is_active : true,
      shopify_product_id: body.shopify_product_id || null,
      shopify_variant_id: body.shopify_variant_id || null,
      primary_image: body.image_url || null,

      // New structure
      product_items: productItems,
      add_ons: addOns,
      subtotal: subtotal,
      discount: discount,
      total_price: totalPrice,

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockProducts.push(newProduct)

    return HttpResponse.json(
      {
        success: true,
        data: newProduct,
        message: "Product created successfully",
      },
      { status: 201 }
    )
  }),

  // PUT /products/:id - Update product
  http.put(`${appConfig.apiBaseUrl}/products/:id`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { id } = params
    const body = await request.json()
    const productIndex = mockProducts.findIndex((p) => p.id === id)

    if (productIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      )
    }

    const product = mockProducts[productIndex]

    // If product_items or add_ons changed, recalculate totals
    let subtotal = product.subtotal
    let totalPrice = product.total_price

    if (body.product_items !== undefined || body.add_ons !== undefined) {
      const productItems =
        body.product_items !== undefined ? body.product_items : product.product_items
      const addOns = body.add_ons !== undefined ? body.add_ons : product.add_ons
      subtotal = [...productItems, ...addOns].reduce((sum, item) => sum + (item.price || 0), 0)
      const discount = body.discount !== undefined ? body.discount : product.discount
      totalPrice = subtotal - discount
    } else if (body.discount !== undefined) {
      totalPrice = subtotal - body.discount
    }

    // Check if removing items that have BOM data
    if (body.product_items !== undefined || body.add_ons !== undefined) {
      const oldPieces = [
        ...product.product_items.map((i) => i.piece),
        ...product.add_ons.map((a) => a.piece),
      ]
      const newProductItems =
        body.product_items !== undefined ? body.product_items : product.product_items
      const newAddOns = body.add_ons !== undefined ? body.add_ons : product.add_ons
      const newPieces = [...newProductItems.map((i) => i.piece), ...newAddOns.map((a) => a.piece)]

      const removedPieces = oldPieces.filter((p) => !newPieces.includes(p))

      // Remove BOM items for removed pieces
      if (removedPieces.length > 0) {
        const productBOMs = mockBOMs.filter((b) => b.product_id === id)
        productBOMs.forEach((bom) => {
          // Update BOM pieces array
          bom.pieces = bom.pieces.filter((p) => !removedPieces.includes(p))

          // Remove BOM items for removed pieces
          const itemsToRemove = mockBOMItems.filter(
            (item) => item.bom_id === bom.id && removedPieces.includes(item.piece)
          )
          itemsToRemove.forEach((item) => {
            const idx = mockBOMItems.findIndex((i) => i.id === item.id)
            if (idx !== -1) mockBOMItems.splice(idx, 1)
          })
        })
      }
    }

    mockProducts[productIndex] = {
      ...product,
      name: body.name !== undefined ? body.name : product.name,
      description: body.description !== undefined ? body.description : product.description,
      category: body.category !== undefined ? body.category : product.category,
      active: body.is_active !== undefined ? body.is_active : product.active,
      primary_image: body.image_url !== undefined ? body.image_url : product.primary_image,
      shopify_product_id:
        body.shopify_product_id !== undefined
          ? body.shopify_product_id
          : product.shopify_product_id,
      shopify_variant_id:
        body.shopify_variant_id !== undefined
          ? body.shopify_variant_id
          : product.shopify_variant_id,

      // New structure
      product_items: body.product_items !== undefined ? body.product_items : product.product_items,
      add_ons: body.add_ons !== undefined ? body.add_ons : product.add_ons,
      subtotal: subtotal,
      discount: body.discount !== undefined ? body.discount : product.discount,
      total_price: totalPrice,

      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json({
      success: true,
      data: mockProducts[productIndex],
      message: "Product updated successfully",
    })
  }),

  // DELETE /products/:id - Delete product
  http.delete(`${appConfig.apiBaseUrl}/products/:id`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { id } = params
    const productIndex = mockProducts.findIndex((p) => p.id === id)

    if (productIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      )
    }

    // Check if product has BOMs
    const productBOMs = getProductBOMs(id)
    if (productBOMs.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          error: "Cannot delete product with existing BOMs",
          message: "Please delete all BOMs first or mark the product as inactive",
        },
        { status: 400 }
      )
    }

    const deletedProduct = mockProducts[productIndex]
    mockProducts.splice(productIndex, 1)

    return HttpResponse.json({
      success: true,
      data: deletedProduct,
      message: "Product deleted successfully",
    })
  }),

  // ==================== BOM HANDLERS (SIZE-BASED) ====================

  // GET /products/:productId/boms - Get all BOMs for a product (with optional size filter)
  http.get(`${appConfig.apiBaseUrl}/products/:productId/boms`, async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { productId } = params
    const url = new URL(request.url)
    const size = url.searchParams.get("size") // NEW: Optional size filter

    let boms = getProductBOMs(productId, size)

    return HttpResponse.json({
      success: true,
      data: boms,
      total: boms.length,
      available_sizes: getAvailableSizes(productId), // NEW: Include available sizes
    })
  }),

  // GET /products/:productId/boms/active - Get active BOM(s)
  // If size is provided: returns single active BOM for that size
  // If size is NOT provided: returns all active BOMs (one per size)
  http.get(
    `${appConfig.apiBaseUrl}/products/:productId/boms/active`,
    async ({ request, params }) => {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const { productId } = params
      const url = new URL(request.url)
      const size = url.searchParams.get("size")

      if (size) {
        // Get active BOM for specific size
        const activeBOM = getActiveBOM(productId, size)

        if (!activeBOM) {
          return HttpResponse.json(
            {
              success: false,
              error: `No active BOM found for size ${size}`,
            },
            { status: 404 }
          )
        }

        // Include BOM items
        const items = getBOMItems(activeBOM.id)

        return HttpResponse.json({
          success: true,
          data: {
            ...activeBOM,
            items,
          },
        })
      } else {
        // Get all active BOMs (one per size)
        const activeBOMs = getAllActiveBOMs(productId)

        if (activeBOMs.length === 0) {
          return HttpResponse.json(
            {
              success: false,
              error: "No active BOMs found",
            },
            { status: 404 }
          )
        }

        // Include items for each BOM
        const bomsWithItems = activeBOMs.map((bom) => ({
          ...bom,
          items: getBOMItems(bom.id),
        }))

        return HttpResponse.json({
          success: true,
          data: bomsWithItems,
        })
      }
    }
  ),

  // GET /boms/:bomId - Get single BOM with items
  http.get(`${appConfig.apiBaseUrl}/boms/:bomId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { bomId } = params
    const bom = mockBOMs.find((b) => b.id === bomId)

    if (!bom) {
      return HttpResponse.json(
        {
          success: false,
          error: "BOM not found",
        },
        { status: 404 }
      )
    }

    const items = getBOMItems(bomId)

    return HttpResponse.json({
      success: true,
      data: {
        ...bom,
        items,
      },
    })
  }),

  // POST /products/:productId/boms - Create new BOM
  http.post(`${appConfig.apiBaseUrl}/products/:productId/boms`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { productId } = params
    const body = await request.json()

    // Find product
    const product = mockProducts.find((p) => p.id === productId)
    if (!product) {
      return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Validation
    if (!body.size) {
      return HttpResponse.json({ success: false, error: "Size is required" }, { status: 400 })
    }

    // Get pieces from product (auto-populate)
    const pieces = [
      ...product.product_items.map((i) => i.piece),
      ...product.add_ons.map((a) => a.piece),
    ]

    // Get next version number
    const existingBOMs = mockBOMs.filter((b) => b.product_id === productId && b.size === body.size)
    const nextVersion =
      existingBOMs.length > 0 ? Math.max(...existingBOMs.map((b) => b.version)) + 1 : 1

    // If setting as active, deactivate others for same size
    if (body.is_active) {
      existingBOMs.forEach((bom) => {
        bom.is_active = false
      })
    }

    const newBOM = {
      id: `bom_${Date.now()}`,
      product_id: productId,
      size: body.size,
      version: nextVersion,
      name: body.name || `Size ${body.size} - Version ${nextVersion}`,
      is_active: body.is_active || false,
      notes: body.notes || "",
      pieces: pieces, // Auto-populated from product
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockBOMs.push(newBOM)

    return HttpResponse.json(
      {
        success: true,
        data: newBOM,
        message: "BOM created successfully",
      },
      { status: 201 }
    )
  }),

  // PUT /boms/:bomId - Update BOM
  http.put(`${appConfig.apiBaseUrl}/boms/:bomId`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { bomId } = params
    const body = await request.json()

    const bomIndex = mockBOMs.findIndex((b) => b.id === bomId)

    if (bomIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "BOM not found",
        },
        { status: 404 }
      )
    }

    const bom = mockBOMs[bomIndex]

    // ✅ FIX: If activating this BOM, deactivate others for SAME product+size ONLY
    if (body.is_active === true) {
      console.log(`🔄 Activating BOM ${bomId} for product ${bom.product_id}, size ${bom.size}`)

      mockBOMs.forEach((b) => {
        // ✅ Only deactivate if SAME product AND SAME size
        if (b.product_id === bom.product_id && b.size === bom.size && b.id !== bomId) {
          console.log(`  → Deactivating BOM ${b.id} (${b.size})`)
          b.is_active = false
        }
      })
    }

    // Update the BOM
    mockBOMs[bomIndex] = {
      ...bom,
      ...body,
      id: bomId, // Prevent ID change
      product_id: bom.product_id, // Prevent product ID change
      size: bom.size, // Prevent size change
      updated_at: new Date().toISOString(),
    }

    console.log(`✅ BOM ${bomId} updated:`, mockBOMs[bomIndex])

    return HttpResponse.json({
      success: true,
      data: mockBOMs[bomIndex],
      message: "BOM updated successfully",
    })
  }),

  // DELETE /boms/:bomId - Delete BOM
  http.delete(`${appConfig.apiBaseUrl}/boms/:bomId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { bomId } = params
    const bomIndex = mockBOMs.findIndex((b) => b.id === bomId)

    if (bomIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "BOM not found",
        },
        { status: 404 }
      )
    }

    const bom = mockBOMs[bomIndex]

    // Prevent deletion of active BOM
    if (bom.is_active) {
      return HttpResponse.json(
        {
          success: false,
          error: "Cannot delete active BOM",
          message: "Please deactivate the BOM before deleting",
        },
        { status: 400 }
      )
    }

    // Delete associated BOM items
    const itemsToDelete = mockBOMItems.filter((item) => item.bom_id === bomId)
    itemsToDelete.forEach((item) => {
      const itemIndex = mockBOMItems.indexOf(item)
      if (itemIndex > -1) {
        mockBOMItems.splice(itemIndex, 1)
      }
    })

    // Delete BOM
    const deletedBOM = mockBOMs[bomIndex]
    mockBOMs.splice(bomIndex, 1)

    return HttpResponse.json({
      success: true,
      data: deletedBOM,
      message: "BOM deleted successfully",
    })
  }),

  // ==================== BOM ITEMS HANDLERS ====================
  // (No changes needed - these remain the same)

  // GET /boms/:bomId/items - Get all items for a BOM
  http.get(`${appConfig.apiBaseUrl}/boms/:bomId/items`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { bomId } = params
    const items = getBOMItems(bomId)

    return HttpResponse.json({
      success: true,
      data: items,
      total: items.length,
    })
  }),

  // POST /boms/:bomId/items - Add item to BOM
  http.post(`${appConfig.apiBaseUrl}/boms/:bomId/items`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { bomId } = params
    const body = await request.json()

    const bom = mockBOMs.find((b) => b.id === bomId)
    if (!bom) {
      return HttpResponse.json({ success: false, error: "BOM not found" }, { status: 404 })
    }

    // Validation
    if (!body.inventory_item_id || !body.quantity_per_unit || !body.unit || !body.piece) {
      return HttpResponse.json(
        {
          success: false,
          error: "inventory_item_id, quantity_per_unit, unit, and piece are required",
        },
        { status: 400 }
      )
    }

    const newItem = {
      id: `bom_item_${Date.now()}`,
      bom_id: bomId,
      inventory_item_id: body.inventory_item_id.toString(),
      quantity_per_unit: parseFloat(body.quantity_per_unit),
      unit: body.unit,
      piece: body.piece, // Required now
      sequence_order: body.sequence_order || 1,
      notes: body.notes || "",
    }

    mockBOMItems.push(newItem)

    return HttpResponse.json(
      {
        success: true,
        data: newItem,
        message: "BOM item added successfully",
      },
      { status: 201 }
    )
  }),

  // PUT /boms/:bomId/items/:itemId - Update BOM item
  http.put(`${appConfig.apiBaseUrl}/boms/:bomId/items/:itemId`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { bomId, itemId } = params
    const body = await request.json()

    const itemIndex = mockBOMItems.findIndex((i) => i.id === itemId && i.bom_id === bomId)

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "BOM item not found",
        },
        { status: 404 }
      )
    }

    const item = mockBOMItems[itemIndex]

    mockBOMItems[itemIndex] = {
      ...item,
      ...body,
      id: itemId, // Prevent ID change
      bom_id: bomId, // Prevent BOM ID change
    }

    return HttpResponse.json({
      success: true,
      data: mockBOMItems[itemIndex],
      message: "BOM item updated successfully",
    })
  }),

  // DELETE /boms/:bomId/items/:itemId - Delete BOM item
  http.delete(`${appConfig.apiBaseUrl}/boms/:bomId/items/:itemId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { bomId, itemId } = params

    const itemIndex = mockBOMItems.findIndex((i) => i.id === itemId && i.bom_id === bomId)

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "BOM item not found",
        },
        { status: 404 }
      )
    }

    const deletedItem = mockBOMItems[itemIndex]
    mockBOMItems.splice(itemIndex, 1)

    return HttpResponse.json({
      success: true,
      data: deletedItem,
      message: "BOM item deleted successfully",
    })
  }),
]
