import { http, HttpResponse, delay } from 'msw';
import {
  mockProducts,
  mockBOMs,
  mockBOMItems,
  getActiveBOM,
  getBOMItems,
  getProductBOMs,
} from '../data/mockProducts';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== PRODUCTS HANDLERS ====================

export const productsHandlers = [
  // GET /products - List all products with filters
  http.get(`${BASE_URL}/products`, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const category = url.searchParams.get('category');
    const active = url.searchParams.get('active');

    let filtered = [...mockProducts];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.sku.toLowerCase().includes(search) ||
          product.description.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    // Apply active filter
    if (active !== null && active !== undefined) {
      const isActive = active === 'true';
      filtered = filtered.filter((product) => product.active === isActive);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  }),

  // GET /products/:id - Get single product
  http.get(`${BASE_URL}/products/:id`, async ({ params }) => {
    await delay(200);

    const { id } = params;
    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Include active BOM info
    const activeBOM = getActiveBOM(id);

    return HttpResponse.json({
      success: true,
      data: {
        ...product,
        active_bom: activeBOM || null,
      },
    });
  }),

  // POST /products - Create new product
  http.post(`${BASE_URL}/products`, async ({ request }) => {
    await delay(400);

    const body = await request.json();

    // Validation
    if (!body.name || !body.sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Name and SKU are required',
        },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existingSKU = mockProducts.find((p) => p.sku === body.sku);
    if (existingSKU) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU already exists',
        },
        { status: 400 }
      );
    }

    const newProduct = {
      id: `prod_${Date.now()}`,
      name: body.name,
      sku: body.sku,
      description: body.description || '',
      category: body.category || 'CASUAL',
      active: body.active !== undefined ? body.active : true,
      shopify_product_id: body.shopify_product_id || null,
      shopify_variant_id: body.shopify_variant_id || null,
      images: body.images || [],
      primary_image: body.primary_image || body.images?.[0] || null,
      base_price: body.base_price || 0,
      active_bom_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    return HttpResponse.json({
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    });
  }),

  // PUT /products/:id - Update product
  http.put(`${BASE_URL}/products/:id`, async ({ params, request }) => {
    await delay(350);

    const { id } = params;
    const body = await request.json();

    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Check SKU uniqueness (if changing SKU)
    if (body.sku && body.sku !== mockProducts[productIndex].sku) {
      const existingSKU = mockProducts.find((p) => p.sku === body.sku);
      if (existingSKU) {
        return HttpResponse.json(
          {
            success: false,
            error: 'SKU already exists',
          },
          { status: 400 }
        );
      }
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...body,
      id, // Prevent ID change
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockProducts[productIndex],
      message: 'Product updated successfully',
    });
  }),

  // DELETE /products/:id - Delete product
  http.delete(`${BASE_URL}/products/:id`, async ({ params }) => {
    await delay(300);

    const { id } = params;
    const productIndex = mockProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Check if product has active orders (in real app)
    // For now, just delete

    mockProducts.splice(productIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  }),

  // ==================== BOM HANDLERS ====================

  // GET /products/:productId/boms - Get all BOMs for a product (including versions)
  http.get(`${BASE_URL}/products/:productId/boms`, async ({ params }) => {
    await delay(200);

    const { productId } = params;
    const boms = getProductBOMs(productId);

    return HttpResponse.json({
      success: true,
      data: boms,
    });
  }),

  // GET /products/:productId/boms/active - Get active BOM for a product
  http.get(`${BASE_URL}/products/:productId/boms/active`, async ({ params }) => {
    await delay(200);

    const { productId } = params;
    const activeBOM = getActiveBOM(productId);

    if (!activeBOM) {
      return HttpResponse.json(
        {
          success: false,
          error: 'No active BOM found for this product',
        },
        { status: 404 }
      );
    }

    // Include BOM items
    const bomItems = getBOMItems(activeBOM.id);

    return HttpResponse.json({
      success: true,
      data: {
        ...activeBOM,
        items: bomItems,
      },
    });
  }),

  // GET /boms/:bomId - Get specific BOM with items
  http.get(`${BASE_URL}/boms/:bomId`, async ({ params }) => {
    await delay(200);

    const { bomId } = params;
    const bom = mockBOMs.find((b) => b.id === bomId);

    if (!bom) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM not found',
        },
        { status: 404 }
      );
    }

    const bomItems = getBOMItems(bomId);

    return HttpResponse.json({
      success: true,
      data: {
        ...bom,
        items: bomItems,
      },
    });
  }),

  // POST /products/:productId/boms - Create new BOM
  http.post(`${BASE_URL}/products/:productId/boms`, async ({ params, request }) => {
    await delay(400);

    const { productId } = params;
    const body = await request.json();

    // Validate product exists
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Get latest version for this product
    const existingBOMs = getProductBOMs(productId);
    const latestVersion = existingBOMs.length > 0
      ? Math.max(...existingBOMs.map(b => b.version))
      : 0;

    const newBOM = {
      id: `bom_${Date.now()}`,
      product_id: productId,
      version: latestVersion + 1,
      is_active: body.is_active !== undefined ? body.is_active : true,
      name: body.name || `BOM v${latestVersion + 1}`,
      notes: body.notes || '',
      created_by: 'current_user', // Would be from auth context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If setting as active, deactivate all other BOMs for this product
    if (newBOM.is_active) {
      mockBOMs.forEach((bom) => {
        if (bom.product_id === productId && bom.id !== newBOM.id) {
          bom.is_active = false;
        }
      });
    }

    mockBOMs.push(newBOM);

    return HttpResponse.json({
      success: true,
      data: newBOM,
      message: 'BOM created successfully',
    });
  }),

  // PUT /boms/:bomId - Update BOM
  http.put(`${BASE_URL}/boms/:bomId`, async ({ params, request }) => {
    await delay(350);

    const { bomId } = params;
    const body = await request.json();

    const bomIndex = mockBOMs.findIndex((b) => b.id === bomId);

    if (bomIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM not found',
        },
        { status: 404 }
      );
    }

    const bom = mockBOMs[bomIndex];

    // If setting as active, deactivate all other BOMs for this product
    if (body.is_active && !bom.is_active) {
      mockBOMs.forEach((b) => {
        if (b.product_id === bom.product_id && b.id !== bomId) {
          b.is_active = false;
        }
      });
    }

    mockBOMs[bomIndex] = {
      ...bom,
      ...body,
      id: bomId, // Prevent ID change
      product_id: bom.product_id, // Prevent product_id change
      version: bom.version, // Prevent version change
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockBOMs[bomIndex],
      message: 'BOM updated successfully',
    });
  }),

  // DELETE /boms/:bomId - Delete BOM
  http.delete(`${BASE_URL}/boms/:bomId`, async ({ params }) => {
    await delay(300);

    const { bomId } = params;
    const bomIndex = mockBOMs.findIndex((b) => b.id === bomId);

    if (bomIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM not found',
        },
        { status: 404 }
      );
    }

    // Check if BOM is active
    if (mockBOMs[bomIndex].is_active) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Cannot delete active BOM. Please activate a different BOM first.',
        },
        { status: 400 }
      );
    }

    // Delete associated BOM items
    const itemsToDelete = mockBOMItems.filter((item) => item.bom_id === bomId);
    itemsToDelete.forEach((item) => {
      const itemIndex = mockBOMItems.indexOf(item);
      mockBOMItems.splice(itemIndex, 1);
    });

    mockBOMs.splice(bomIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'BOM deleted successfully',
    });
  }),

  // ==================== BOM ITEMS HANDLERS ====================

  // GET /boms/:bomId/items - Get all items for a BOM
  http.get(`${BASE_URL}/boms/:bomId/items`, async ({ params }) => {
    await delay(200);

    const { bomId } = params;
    const items = getBOMItems(bomId);

    return HttpResponse.json({
      success: true,
      data: items,
    });
  }),

  // POST /boms/:bomId/items - Add item to BOM
  http.post(`${BASE_URL}/boms/:bomId/items`, async ({ params, request }) => {
    await delay(350);

    const { bomId } = params;
    const body = await request.json();

    // Validate BOM exists
    const bom = mockBOMs.find((b) => b.id === bomId);
    if (!bom) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM not found',
        },
        { status: 404 }
      );
    }

    // Validation
    if (!body.inventory_item_id || !body.quantity_per_unit || !body.unit) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Inventory item, quantity, and unit are required',
        },
        { status: 400 }
      );
    }

    // TODO: In real implementation, validate that inventory_item category is allowed
    // Should only be FABRIC, RAW_MATERIAL, MULTI_HEAD, ADDA_MATERIAL

    const newItem = {
      id: `bom_item_${Date.now()}`,
      bom_id: bomId,
      inventory_item_id: body.inventory_item_id,
      quantity_per_unit: parseFloat(body.quantity_per_unit),
      unit: body.unit,
      garment_piece: body.garment_piece || null,
      sequence_order: body.sequence_order || mockBOMItems.filter(i => i.bom_id === bomId).length + 1,
      notes: body.notes || '',
    };

    mockBOMItems.push(newItem);

    return HttpResponse.json({
      success: true,
      data: newItem,
      message: 'BOM item added successfully',
    });
  }),

  // PUT /boms/:bomId/items/:itemId - Update BOM item
  http.put(`${BASE_URL}/boms/:bomId/items/:itemId`, async ({ params, request }) => {
    await delay(300);

    const { bomId, itemId } = params;
    const body = await request.json();

    const itemIndex = mockBOMItems.findIndex(
      (item) => item.id === itemId && item.bom_id === bomId
    );

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM item not found',
        },
        { status: 404 }
      );
    }

    mockBOMItems[itemIndex] = {
      ...mockBOMItems[itemIndex],
      ...body,
      id: itemId, // Prevent ID change
      bom_id: bomId, // Prevent BOM change
    };

    return HttpResponse.json({
      success: true,
      data: mockBOMItems[itemIndex],
      message: 'BOM item updated successfully',
    });
  }),

  // DELETE /boms/:bomId/items/:itemId - Delete BOM item
  http.delete(`${BASE_URL}/boms/:bomId/items/:itemId`, async ({ params }) => {
    await delay(250);

    const { bomId, itemId } = params;

    const itemIndex = mockBOMItems.findIndex(
      (item) => item.id === itemId && item.bom_id === bomId
    );

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'BOM item not found',
        },
        { status: 404 }
      );
    }

    mockBOMItems.splice(itemIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'BOM item deleted successfully',
    });
  }),
];
