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

// Import mockInventoryItems to enrich the BOM items
const { mockInventoryItems } = await import("../data/mockInventory")

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

  // ==================== PRODUCT MEASUREMENT CHARTS HANDLERS ====================

  // GET /products/:productId/measurement-charts - Get product measurement charts
  http.get(`${appConfig.apiBaseUrl}/products/:productId/measurement-charts`, async ({ params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const { productId } = params
    const product = mockProducts.find((p) => p.id === productId)

    if (!product) {
      return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: product.measurement_charts || null,
    })
  }),

  // PUT /products/:productId/measurement-charts/size-chart - Update product size chart
  http.put(
    `${appConfig.apiBaseUrl}/products/:productId/measurement-charts/size-chart`,
    async ({ params, request }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { productId } = params
      const body = await request.json()
      const productIndex = mockProducts.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]

      // Initialize measurement_charts if not exists
      if (!product.measurement_charts) {
        product.measurement_charts = {
          has_size_chart: false,
          has_height_chart: false,
          enabled_size_fields: [],
          enabled_height_fields: [],
          size_chart: null,
          height_chart: null,
        }
      }

      // Validate rows
      if (!body.rows || !Array.isArray(body.rows)) {
        return HttpResponse.json(
          { success: false, error: "Invalid data format. Expected rows array." },
          { status: 400 }
        )
      }

      // Update size chart
      product.measurement_charts.has_size_chart = true
      product.measurement_charts.enabled_size_fields =
        body.enabled_fields || product.measurement_charts.enabled_size_fields
      product.measurement_charts.size_chart = {
        rows: body.rows,
        updated_at: new Date().toISOString(),
      }
      product.updated_at = new Date().toISOString()

      return HttpResponse.json({
        success: true,
        data: product.measurement_charts,
        message: "Size chart updated successfully",
      })
    }
  ),

  // PUT /products/:productId/measurement-charts/height-chart - Update product height chart
  http.put(
    `${appConfig.apiBaseUrl}/products/:productId/measurement-charts/height-chart`,
    async ({ params, request }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { productId } = params
      const body = await request.json()
      const productIndex = mockProducts.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]

      // Initialize measurement_charts if not exists
      if (!product.measurement_charts) {
        product.measurement_charts = {
          has_size_chart: false,
          has_height_chart: false,
          enabled_size_fields: [],
          enabled_height_fields: [],
          size_chart: null,
          height_chart: null,
        }
      }

      // Validate rows
      if (!body.rows || !Array.isArray(body.rows)) {
        return HttpResponse.json(
          { success: false, error: "Invalid data format. Expected rows array." },
          { status: 400 }
        )
      }

      // Update height chart
      product.measurement_charts.has_height_chart = true
      product.measurement_charts.enabled_height_fields =
        body.enabled_fields || product.measurement_charts.enabled_height_fields
      product.measurement_charts.height_chart = {
        rows: body.rows,
        updated_at: new Date().toISOString(),
      }
      product.updated_at = new Date().toISOString()

      return HttpResponse.json({
        success: true,
        data: product.measurement_charts,
        message: "Height chart updated successfully",
      })
    }
  ),

  // POST /products/:productId/measurement-charts/initialize - Initialize charts from template
  http.post(
    `${appConfig.apiBaseUrl}/products/:productId/measurement-charts/initialize`,
    async ({ params, request }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { productId } = params
      const body = await request.json()
      const productIndex = mockProducts.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]

      // Ensure base structure exists
      if (!product.measurement_charts) {
        product.measurement_charts = {
          has_size_chart: false,
          has_height_chart: false,
          enabled_size_fields: [],
          enabled_height_fields: [],
          size_chart: null,
          height_chart: null,
        }
      }

      // Initialize with template (placeholder values of 0)
      const defaultSizeRows = [
        {
          id: 1,
          size_code: "XS",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 6,
          us_size: 2,
          sequence: 1,
        },
        {
          id: 2,
          size_code: "S",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 8,
          us_size: 4,
          sequence: 2,
        },
        {
          id: 3,
          size_code: "M",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 12,
          us_size: 8,
          sequence: 3,
        },
        {
          id: 4,
          size_code: "L",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 14,
          us_size: 10,
          sequence: 4,
        },
        {
          id: 5,
          size_code: "XL",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 16,
          us_size: 12,
          sequence: 5,
        },
        {
          id: 6,
          size_code: "XXL",
          shoulder: 0,
          bust: 0,
          waist: 0,
          hip: 0,
          armhole: 0,
          uk_size: 18,
          us_size: 14,
          sequence: 6,
        },
      ]

      const defaultHeightRows = [
        {
          id: 1,
          height_range: "5'0\" - 5'2\"",
          height_min_inches: 60,
          height_max_inches: 62,
          kaftan_length: 0,
          sleeve_front_length: 0,
          sleeve_back_length: 0,
          sequence: 1,
        },
        {
          id: 2,
          height_range: "5'3\" - 5'5\"",
          height_min_inches: 63,
          height_max_inches: 65,
          kaftan_length: 0,
          sleeve_front_length: 0,
          sleeve_back_length: 0,
          sequence: 2,
        },
        {
          id: 3,
          height_range: "5'6\" - 5'8\"",
          height_min_inches: 66,
          height_max_inches: 68,
          kaftan_length: 0,
          sleeve_front_length: 0,
          sleeve_back_length: 0,
          sequence: 3,
        },
        {
          id: 4,
          height_range: "5'9\" - 5'11\"",
          height_min_inches: 69,
          height_max_inches: 71,
          kaftan_length: 0,
          sleeve_front_length: 0,
          sleeve_back_length: 0,
          sequence: 4,
        },
        {
          id: 5,
          height_range: "6'0\" - 6'2\"",
          height_min_inches: 72,
          height_max_inches: 74,
          kaftan_length: 0,
          sleeve_front_length: 0,
          sleeve_back_length: 0,
          sequence: 5,
        },
      ]

      const defaultEnabledSizeFields = ["shoulder", "bust", "waist", "hip", "armhole"]
      const defaultEnabledHeightFields = [
        "kaftan_length",
        "sleeve_front_length",
        "sleeve_back_length",
      ]

      // Initialize SIZE chart only if requested
      if (body.initialize_size_chart === true) {
        product.measurement_charts.has_size_chart = true
        product.measurement_charts.size_chart ??= {
          rows: defaultSizeRows,
          updated_at: new Date().toISOString(),
        }
        product.measurement_charts.enabled_size_fields =
          body.enabled_size_fields ||
          product.measurement_charts.enabled_size_fields ||
          defaultEnabledSizeFields
      }

      // Initialize HEIGHT chart only if requested
      if (body.initialize_height_chart === true) {
        product.measurement_charts.has_height_chart = true
        product.measurement_charts.height_chart ??= {
          rows: defaultHeightRows,
          updated_at: new Date().toISOString(),
        }
        product.measurement_charts.enabled_height_fields =
          body.enabled_height_fields ||
          product.measurement_charts.enabled_height_fields ||
          defaultEnabledHeightFields
      }

      product.updated_at = new Date().toISOString()

      return HttpResponse.json({
        success: true,
        data: product.measurement_charts,
        message: "Measurement charts initialized successfully",
      })
    }
  ),

  // DELETE /products/:productId/measurement-charts/size-chart - Remove size chart
  http.delete(
    `${appConfig.apiBaseUrl}/products/:productId/measurement-charts/size-chart`,
    async ({ params }) => {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const { productId } = params
      const productIndex = mockProducts.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]

      if (product.measurement_charts) {
        product.measurement_charts.has_size_chart = false
        product.measurement_charts.size_chart = null
        product.measurement_charts.enabled_size_fields = []
      }
      product.updated_at = new Date().toISOString()

      return HttpResponse.json({
        success: true,
        message: "Size chart removed successfully",
      })
    }
  ),

  // DELETE /products/:productId/measurement-charts/height-chart - Remove height chart
  http.delete(
    `${appConfig.apiBaseUrl}/products/:productId/measurement-charts/height-chart`,
    async ({ params }) => {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const { productId } = params
      const productIndex = mockProducts.findIndex((p) => p.id === productId)

      if (productIndex === -1) {
        return HttpResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      const product = mockProducts[productIndex]

      if (product.measurement_charts) {
        product.measurement_charts.has_height_chart = false
        product.measurement_charts.height_chart = null
        product.measurement_charts.enabled_height_fields = []
      }
      product.updated_at = new Date().toISOString()

      return HttpResponse.json({
        success: true,
        message: "Height chart removed successfully",
      })
    }
  ),

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

    // Enrich each BOM item with inventory details
    const enrichedItems = items.map((item) => {
      const inventoryItem = mockInventoryItems.find(
        (inv) =>
          inv.id === item.inventory_item_id ||
          inv.id === parseInt(item.inventory_item_id) ||
          inv.id.toString() === item.inventory_item_id?.toString()
      )

      return {
        ...item,
        // Add inventory details
        inventory_item_name: inventoryItem?.name || `Unknown Item ${item.inventory_item_id}`,
        inventory_item_sku: inventoryItem?.sku || "",
        inventory_item_category: inventoryItem?.category || "",
        // Use inventory item's unit if BOM item doesn't specify
        unit: item.unit || inventoryItem?.unit || "Unit",
        // Add remaining stock for reference
        available_stock: inventoryItem?.remaining_stock || 0,
      }
    })

    return HttpResponse.json({
      success: true,
      data: enrichedItems,
      total: enrichedItems.length,
    })
  }),

  // POST /boms/:bomId/items - Add item to BOM
  // POST /boms/:bomId/items - Add item to BOM
  http.post(`${appConfig.apiBaseUrl}/boms/:bomId/items`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { bomId } = params
    const body = await request.json()

    const bom = mockBOMs.find((b) => b.id === bomId)
    if (!bom) {
      return HttpResponse.json({ success: false, error: "BOM not found" }, { status: 404 })
    }

    // Validation - only inventory_item_id, quantity_per_unit, and piece are required
    // Unit will be derived from the inventory item
    if (!body.inventory_item_id || !body.quantity_per_unit || !body.piece) {
      return HttpResponse.json(
        {
          success: false,
          error: "inventory_item_id, quantity_per_unit, and piece are required",
        },
        { status: 400 }
      )
    }

    const inventoryItem = mockInventoryItems.find(
      (inv) =>
        inv.id === parseInt(body.inventory_item_id) ||
        inv.id.toString() === body.inventory_item_id?.toString()
    )

    if (!inventoryItem) {
      return HttpResponse.json(
        {
          success: false,
          error: `Inventory item with ID ${body.inventory_item_id} not found`,
        },
        { status: 400 }
      )
    }

    // Validate category - only allow FABRIC, RAW_MATERIAL, MULTI_HEAD, ADDA_MATERIAL
    const allowedCategories = ["FABRIC", "RAW_MATERIAL", "MULTI_HEAD", "ADA_MATERIAL"]
    if (!allowedCategories.includes(inventoryItem.category)) {
      return HttpResponse.json(
        {
          success: false,
          error: `Cannot add ${inventoryItem.category} items to BOM. Only FABRIC, RAW_MATERIAL, MULTI_HEAD, and ADDA_MATERIAL are allowed.`,
        },
        { status: 400 }
      )
    }

    const newItem = {
      id: `bom_item_${Date.now()}`,
      bom_id: bomId,
      inventory_item_id: parseInt(body.inventory_item_id), // Store as number
      quantity_per_unit: parseFloat(body.quantity_per_unit),
      unit: inventoryItem.unit, // Use the inventory item's unit!
      piece: body.piece,
      sequence_order: body.sequence_order || 1,
      notes: body.notes || "",
    }

    mockBOMItems.push(newItem)

    // Return enriched item
    return HttpResponse.json(
      {
        success: true,
        data: {
          ...newItem,
          inventory_item_name: inventoryItem.name,
          inventory_item_sku: inventoryItem.sku,
          inventory_item_category: inventoryItem.category,
          available_stock: inventoryItem.remaining_stock,
        },
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
