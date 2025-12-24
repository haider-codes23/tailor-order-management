import { httpClient } from './httpClient';

// ==================== PRODUCTS API ====================

/**
 * Get all products with optional filters
 * @param {Object} params - Filter parameters
 * @param {string} [params.search] - Search in name, SKU, description
 * @param {string} [params.category] - Filter by category
 * @param {boolean} [params.active] - Filter by active status
 * @returns {Promise<Array>} List of products
 *
 * @example
 * const products = await getProducts({ search: 'gold', active: true });
 */
export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams();
 
  if (params.search) searchParams.append('search', params.search);
  if (params.category) searchParams.append('category', params.category);
  if (params.active !== undefined) searchParams.append('active', params.active.toString());

  const queryString = searchParams.toString();
  const url = `/products${queryString ? `?${queryString}` : ''}`;

  const response = await httpClient.get(url);
  return response.data;
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product with active BOM info
 *
 * @example
 * const product = await getProduct('prod_1');
 */
export async function getProduct(productId) {
  const response = await httpClient.get(`/products/${productId}`);
  return response.data;
}

/**
 * Create a new product
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name (required)
 * @param {string} productData.sku - Product SKU (required, unique)
 * @param {string} [productData.description] - Product description
 * @param {string} [productData.category] - Product category
 * @param {boolean} [productData.active] - Active status (default: true)
 * @param {string} [productData.shopify_product_id] - Shopify product ID
 * @param {string} [productData.shopify_variant_id] - Shopify variant ID
 * @param {Array<string>} [productData.images] - Image URLs
 * @param {string} [productData.primary_image] - Primary image URL
 * @param {number} [productData.base_price] - Base price in PKR
 * @returns {Promise<Object>} Created product
 *
 * @example
 * const newProduct = await createProduct({
 *   name: 'RUBY RADIANCE',
 *   sku: 'RUBY-001',
 *   description: 'Stunning ruby red outfit',
 *   category: 'FORMAL',
 *   base_price: 42000,
 * });
 */
export async function createProduct(productData) {
  const response = await httpClient.post('/products', productData);
  return response.data;
}

/**
 * Update an existing product
 * @param {string} productId - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated product
 *
 * @example
 * const updated = await updateProduct('prod_1', {
 *   base_price: 48000,
 *   description: 'Updated description',
 * });
 */
export async function updateProduct(productId, updates) {
  const response = await httpClient.put(`/products/${productId}`, updates);
  return response.data;
}

/**
 * Delete a product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deletion confirmation
 *
 * @example
 * await deleteProduct('prod_1');
 */
export async function deleteProduct(productId) {
  const response = await httpClient.delete(`/products/${productId}`);
  return response.data;
}

// ==================== BOMs API ====================

/**
 * Get all BOMs for a product (including inactive versions)
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} List of BOMs sorted by version (latest first)
 *
 * @example
 * const boms = await getProductBOMs('prod_1');
 */
export async function getProductBOMs(productId) {
  const response = await httpClient.get(`/products/${productId}/boms`);
  return response.data;
}

/**
 * Get the active BOM for a product (with items)
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Active BOM with items array
 *
 * @example
 * const activeBOM = await getActiveBOM('prod_1');
 * console.log(activeBOM.items); // BOM items array
 */
export async function getActiveBOM(productId) {
  const response = await httpClient.get(`/products/${productId}/boms/active`);
  return response.data;
}

/**
 * Get a specific BOM by ID (with items)
 * @param {string} bomId - BOM ID
 * @returns {Promise<Object>} BOM with items array
 *
 * @example
 * const bom = await getBOM('bom_1');
 */
export async function getBOM(bomId) {
  const response = await httpClient.get(`/boms/${bomId}`);
  return response.data;
}

/**
 * Create a new BOM for a product
 * @param {string} productId - Product ID
 * @param {Object} bomData - BOM information
 * @param {string} [bomData.name] - BOM name (auto-generated if not provided)
 * @param {boolean} [bomData.is_active] - Set as active BOM (default: true)
 * @param {string} [bomData.notes] - BOM notes
 * @returns {Promise<Object>} Created BOM
 *
 * @example
 * const newBOM = await createBOM('prod_1', {
 *   name: 'Updated design BOM',
 *   is_active: true,
 *   notes: 'Material cost optimization',
 * });
 */
export async function createBOM(productId, bomData) {
  const response = await httpClient.post(`/products/${productId}/boms`, bomData);
  return response.data;
}

/**
 * Update a BOM
 * @param {string} bomId - BOM ID
 * @param {Object} updates - Fields to update
 * @param {boolean} [updates.is_active] - Set as active BOM
 * @param {string} [updates.name] - BOM name
 * @param {string} [updates.notes] - BOM notes
 * @returns {Promise<Object>} Updated BOM
 *
 * @example
 * await updateBOM('bom_2', { is_active: true }); // Activate this BOM
 */
export async function updateBOM(bomId, updates) {
  const response = await httpClient.put(`/boms/${bomId}`, updates);
  return response.data;
}

/**
 * Delete a BOM (must not be active)
 * @param {string} bomId - BOM ID
 * @returns {Promise<Object>} Deletion confirmation
 *
 * @example
 * await deleteBOM('bom_2');
 */
export async function deleteBOM(bomId) {
  const response = await httpClient.delete(`/boms/${bomId}`);
  return response.data;
}

// ==================== BOM ITEMS API ====================

/**
 * Get all items for a BOM
 * @param {string} bomId - BOM ID
 * @returns {Promise<Array>} List of BOM items
 *
 * @example
 * const items = await getBOMItems('bom_1');
 */
export async function getBOMItems(bomId) {
  const response = await httpClient.get(`/boms/${bomId}/items`);
  return response.data;
}

/**
 * Add an item to a BOM
 * @param {string} bomId - BOM ID
 * @param {Object} itemData - BOM item information
 * @param {string} itemData.inventory_item_id - Inventory item ID (required)
 * @param {number} itemData.quantity_per_unit - Quantity needed (required)
 * @param {string} itemData.unit - Unit of measurement (required)
 * @param {string} [itemData.garment_piece] - Garment piece (SHIRT, PANT, DUPATTA, etc.)
 * @param {number} [itemData.sequence_order] - Display order
 * @param {string} [itemData.notes] - Item notes
 * @returns {Promise<Object>} Created BOM item
 *
 * @example
 * const item = await createBOMItem('bom_1', {
 *   inventory_item_id: 'inv_1',
 *   quantity_per_unit: 3.5,
 *   unit: 'METER',
 *   garment_piece: 'SHIRT',
 *   notes: 'Main fabric for shirt',
 * });
 */
export async function createBOMItem(bomId, itemData) {
  const response = await httpClient.post(`/boms/${bomId}/items`, itemData);
  return response.data;
}

/**
 * Update a BOM item
 * @param {string} bomId - BOM ID
 * @param {string} itemId - BOM item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated BOM item
 *
 * @example
 * await updateBOMItem('bom_1', 'bom_item_1', {
 *   quantity_per_unit: 4.0,
 *   notes: 'Increased quantity for larger sizes',
 * });
 */
export async function updateBOMItem(bomId, itemId, updates) {
  const response = await httpClient.put(`/boms/${bomId}/items/${itemId}`, updates);
  return response.data;
}

/**
 * Delete a BOM item
 * @param {string} bomId - BOM ID
 * @param {string} itemId - BOM item ID
 * @returns {Promise<Object>} Deletion confirmation
 *
 * @example
 * await deleteBOMItem('bom_1', 'bom_item_1');
 */
export async function deleteBOMItem(bomId, itemId) {
  const response = await httpClient.delete(`/boms/${bomId}/items/${itemId}`);
  return response.data;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate consolidated material requirements for order items
 * This is used during INVENTORY_CHECK to determine what materials are needed
 *
 * @param {Array} orderItems - Array of order items
 * @param {string} orderItems[].product_id - Product ID
 * @param {number} orderItems[].quantity - Quantity ordered
 * @returns {Promise<Object>} Consolidated material requirements grouped by inventory_item_id
 *
 * @example
 * const requirements = await calculateMaterialRequirements([
 *   { product_id: 'prod_1', quantity: 2 },
 *   { product_id: 'prod_2', quantity: 1 },
 * ]);
 *
 * // Returns:
 * // {
 * //   'inv_1': { inventory_item_id: 'inv_1', total_quantity: 7.0, unit: 'METER', items: [...] },
 * //   'inv_2': { inventory_item_id: 'inv_2', total_quantity: 4.0, unit: 'METER', items: [...] },
 * //   ...
 * // }
 */
export async function calculateMaterialRequirements(orderItems) {
  const requirements = {};

  // Get active BOM for each product
  for (const orderItem of orderItems) {
    try {
      const activeBOM = await getActiveBOM(orderItem.product_id);
     
      // Calculate materials needed
      activeBOM.items.forEach((bomItem) => {
        const totalQty = bomItem.quantity_per_unit * orderItem.quantity;
       
        if (!requirements[bomItem.inventory_item_id]) {
          requirements[bomItem.inventory_item_id] = {
            inventory_item_id: bomItem.inventory_item_id,
            total_quantity: 0,
            unit: bomItem.unit,
            items: [],
          };
        }
       
        requirements[bomItem.inventory_item_id].total_quantity += totalQty;
        requirements[bomItem.inventory_item_id].items.push({
          product_id: orderItem.product_id,
          order_quantity: orderItem.quantity,
          bom_item: bomItem,
          calculated_quantity: totalQty,
        });
      });
    } catch (error) {
      console.error(`Failed to get BOM for product ${orderItem.product_id}:`, error);
      // In real implementation, might throw or handle differently
    }
  }

  return requirements;
}

/**
 * Check if inventory has sufficient stock for material requirements
 *
 * @param {Object} requirements - Material requirements from calculateMaterialRequirements
 * @param {Function} getInventoryItem - Function to get inventory item by ID
 * @returns {Promise<Object>} Shortage analysis
 *
 * @example
 * const requirements = await calculateMaterialRequirements(orderItems);
 * const analysis = await checkInventoryAvailability(requirements, getInventoryItem);
 *
 * if (!analysis.all_available) {
 *   console.log('Shortages:', analysis.shortages);
 * }
 */
export async function checkInventoryAvailability(requirements, getInventoryItem) {
  const shortages = [];
  let allAvailable = true;

  for (const [inventoryItemId, requirement] of Object.entries(requirements)) {
    try {
      const inventoryItem = await getInventoryItem(inventoryItemId);
     
      if (inventoryItem.remaining_stock < requirement.total_quantity) {
        allAvailable = false;
        shortages.push({
          inventory_item_id: inventoryItemId,
          inventory_item: inventoryItem,
          required: requirement.total_quantity,
          available: inventoryItem.remaining_stock,
          shortage: requirement.total_quantity - inventoryItem.remaining_stock,
          unit: requirement.unit,
        });
      }
    } catch (error) {
      console.error(`Failed to check inventory for ${inventoryItemId}:`, error);
      allAvailable = false;
    }
  }

  return {
    all_available: allAvailable,
    shortages,
    total_items_checked: Object.keys(requirements).length,
  };
}
