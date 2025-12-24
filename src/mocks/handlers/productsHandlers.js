import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import {
  mockProducts,
  mockBOMs,
  mockBOMItems,
  getActiveBOM,
  getBOMItems,
  getProductBOMs,
} from "../data/mockProducts"

// ==================== PRODUCTS HANDLERS ====================

export const productsHandlers = [
  // GET /products - List all products with filters
  http.get(`${appConfig.apiBaseUrl}/products`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase()
    const category = url.searchParams.get("category")
    const active = url.searchParams.get("active")

    let filtered = [...mockProducts]

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search)
      )
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter((product) => product.category === category)
    }

    // Apply active filter
    if (active !== null && active !== undefined) {
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

    // Include active BOM info
    const activeBOM = getActiveBOM(id)

    return HttpResponse.json({
      success: true,
      data: {
        ...product,
        active_bom: activeBOM || null,
      },
    })
  }),

  // POST /products - Create new product
  http.post(`${appConfig.apiBaseUrl}/products`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const body = await request.json()

    // Validation
    if (!body.name || !body.sku) {
      return HttpResponse.json(
        {
          success: false,
          error: "Name and SKU are required",
        },
        { status: 400 }
      )
    }

    // Check SKU uniqueness
    const existingSKU = mockProducts.find((p) => p.sku === body.sku)
    if (existingSKU) {
      return HttpResponse.json(
        {
          success: false,
          error: "SKU already exists",
        },
        { status: 400 }
      )
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      name: body.name,
      sku: body.sku,
      description: body.description || "",
      category: body.category || "CASUAL",
      active: body.active !== undefined ? body.active : true,
      base_price: body.base_price || 0,
      shopify_product_id: body.shopify_product_id || null,
      shopify_variant_id: body.shopify_variant_id || null,
      image_url: body.image_url || "/images/products/placeholder.jpg",
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

    // Check SKU uniqueness (excluding current product)
    if (body.sku) {
      const existingSKU = mockProducts.find((p) => p.sku === body.sku && p.id !== id)
      if (existingSKU) {
        return HttpResponse.json(
          {
            success: false,
            error: "SKU already exists",
          },
          { status: 400 }
        )
      }
    }

    // Update product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...body,
      id, // Prevent ID change
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

  // ==================== BOM HANDLERS ====================

  // GET /products/:productId/boms - Get all BOMs for a product
  http.get(`${appConfig.apiBaseUrl}/products/:productId/boms`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { productId } = params
    const boms = getProductBOMs(productId)

    return HttpResponse.json({
      success: true,
      data: boms,
      total: boms.length,
    })
  }),

  // GET /products/:productId/boms/active - Get active BOM
  http.get(`${appConfig.apiBaseUrl}/products/:productId/boms/active`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { productId } = params
    const activeBOM = getActiveBOM(productId)

    if (!activeBOM) {
      return HttpResponse.json(
        {
          success: false,
          error: "No active BOM found",
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
  }),

  // GET /boms/:bomId - Get single BOM with items
  http.get(`${appConfig.apiBaseUrl}/boms/:bomId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const bomId = parseInt(params.bomId)
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

    // Verify product exists
    const product = mockProducts.find((p) => p.id === productId)
    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      )
    }

    const newBOM = {
      id: Math.max(...mockBOMs.map((b) => b.id), 0) + 1,
      product_id: productId,
      version: body.version || `v${mockBOMs.filter((b) => b.product_id === productId).length + 1}`,
      is_active: body.is_active || false,
      notes: body.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // If setting as active, deactivate others
    if (newBOM.is_active) {
      mockBOMs.forEach((bom) => {
        if (bom.product_id === productId) {
          bom.is_active = false
        }
      })
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

    const bomId = parseInt(params.bomId)
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

    // If activating this BOM, deactivate others for same product
    if (body.is_active === true) {
      mockBOMs.forEach((b) => {
        if (b.product_id === bom.product_id && b.id !== bomId) {
          b.is_active = false
        }
      })
    }

    mockBOMs[bomIndex] = {
      ...bom,
      ...body,
      id: bomId, // Prevent ID change
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json({
      success: true,
      data: mockBOMs[bomIndex],
      message: "BOM updated successfully",
    })
  }),

  // DELETE /boms/:bomId - Delete BOM
  http.delete(`${appConfig.apiBaseUrl}/boms/:bomId`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const bomId = parseInt(params.bomId)
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
      mockBOMItems.splice(itemIndex, 1)
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

  // GET /boms/:bomId/items - Get all items for a BOM
  http.get(`${appConfig.apiBaseUrl}/boms/:bomId/items`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const bomId = parseInt(params.bomId)
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

    const bomId = parseInt(params.bomId)
    const body = await request.json()

    // Verify BOM exists
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

    // Validation
    if (!body.inventory_item_id || !body.quantity_per_unit || !body.unit) {
      return HttpResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "inventory_item_id, quantity_per_unit, and unit are required",
        },
        { status: 400 }
      )
    }

    const newItem = {
      id: Math.max(...mockBOMItems.map((i) => i.id), 0) + 1,
      bom_id: bomId,
      inventory_item_id: body.inventory_item_id,
      quantity_per_unit: body.quantity_per_unit,
      unit: body.unit,
      garment_piece: body.garment_piece || null,
      sequence_order:
        body.sequence_order || mockBOMItems.filter((i) => i.bom_id === bomId).length + 1,
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

    const bomId = parseInt(params.bomId)
    const itemId = parseInt(params.itemId)
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

    mockBOMItems[itemIndex] = {
      ...mockBOMItems[itemIndex],
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

    const bomId = parseInt(params.bomId)
    const itemId = parseInt(params.itemId)

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
