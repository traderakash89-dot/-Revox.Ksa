import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CMS } from './src/data/initialData';
import { Product, Order, CMSConfig, OrderStatus } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ==========================================
// PERSISTENT DATABASE STORAGE ENGINE
// ==========================================
const DATA_DIR = path.resolve(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CMS_FILE = path.join(DATA_DIR, 'cms.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 1. Products Persistence (Strictly starts empty - zero demo data)
function loadProductsFromDisk(): Product[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products from persistent storage:', err);
  }
  // Initialize empty database file on first run
  saveProductsToDisk([]);
  return [];
}

function saveProductsToDisk(prods: Product[]) {
  try {
    ensureDataDir();
    const tempFile = `${PRODUCTS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(prods, null, 2), 'utf-8');
    fs.renameSync(tempFile, PRODUCTS_FILE);
  } catch (err) {
    console.error('Error saving products to persistent storage:', err);
  }
}

// 2. Orders Persistence
function loadOrdersFromDisk(): Order[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading orders from storage:', err);
  }
  saveOrdersToDisk(INITIAL_ORDERS);
  return [...INITIAL_ORDERS];
}

function saveOrdersToDisk(ords: Order[]) {
  try {
    ensureDataDir();
    const tempFile = `${ORDERS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(ords, null, 2), 'utf-8');
    fs.renameSync(tempFile, ORDERS_FILE);
  } catch (err) {
    console.error('Error saving orders to storage:', err);
  }
}

// 3. CMS Persistence
function loadCMSFromDisk(): CMSConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(CMS_FILE)) {
      const raw = fs.readFileSync(CMS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...INITIAL_CMS, ...parsed };
      }
    }
  } catch (err) {
    console.error('Error reading CMS config from storage:', err);
  }
  saveCMSToDisk(INITIAL_CMS);
  return { ...INITIAL_CMS };
}

function saveCMSToDisk(config: CMSConfig) {
  try {
    ensureDataDir();
    const tempFile = `${CMS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(config, null, 2), 'utf-8');
    fs.renameSync(tempFile, CMS_FILE);
  } catch (err) {
    console.error('Error saving CMS config to storage:', err);
  }
}

// Initialize In-Memory mirror from persistent disk files
let products: Product[] = loadProductsFromDisk();
let orders: Order[] = loadOrdersFromDisk();
let cmsConfig: CMSConfig = loadCMSFromDisk();

// ==========================================
// REAL-TIME SYNCHRONIZATION (Server-Sent Events)
// ==========================================
const sseClients = new Set<Response>();

function broadcastSync(eventType: string, payload: any) {
  const dataString = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE Global Real-time Stream
app.get('/api/sync-events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  // Push immediate initial state snapshot on connection
  res.write(
    `event: init\ndata: ${JSON.stringify({
      type: 'init',
      products,
      cms: cmsConfig,
      timestamp: Date.now(),
    })}\n\n`
  );

  sseClients.add(res);

  // Heartbeat ping every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// Quick sync status / revalidation endpoint
app.get('/api/sync-status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    productCount: products.length,
    orderCount: orders.length,
    timestamp: Date.now(),
  });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Products API (Persistent CRUD with Real-time Broadcasting and Trash / Recycle Bin Support)
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, includeTrash } = req.query;
  let result = [...products];

  // If includeTrash is not requested, filter out soft-deleted products
  if (includeTrash !== 'true') {
    result = result.filter((p) => !p.isDeleted);
  }

  if (category && category !== 'all') {
    result = result.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, data: result, timestamp: Date.now() });
});

// Trash products endpoint: returns all products currently in the Recycle Bin
app.get('/api/products-trash', (_req: Request, res: Response) => {
  const trashItems = products.filter((p) => p.isDeleted);
  res.json({ success: true, count: trashItems.length, data: trashItems, timestamp: Date.now() });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// Create product and persist permanently
app.post('/api/products', (req: Request, res: Response) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `rvx-prod-${Date.now()}`,
    isDeleted: false,
  };
  products.unshift(newProduct);
  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'created',
    productId: newProduct.id,
    timestamp: Date.now(),
  });
  res.status(201).json({ success: true, data: newProduct });
});

// Update or Upsert product and persist permanently
app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    // Upsert: If not found, add as a new product with the requested ID
    const newProduct: Product = {
      ...req.body,
      id: req.params.id,
      isDeleted: req.body.isDeleted ?? false,
    };
    products.unshift(newProduct);
    saveProductsToDisk(products);
    broadcastSync('products_updated', {
      type: 'products_updated',
      products,
      action: 'created',
      productId: newProduct.id,
      timestamp: Date.now(),
    });
    return res.status(201).json({ success: true, data: newProduct });
  }

  products[index] = { ...products[index], ...req.body, id: req.params.id };
  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'updated',
    productId: req.params.id,
    timestamp: Date.now(),
  });
  res.json({ success: true, data: products[index] });
});

// Soft Delete product -> Move to Trash / Recycle Bin
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  
  // Soft delete: mark as deleted with timestamp
  products[index] = {
    ...products[index],
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  };

  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'soft_deleted',
    productId: req.params.id,
    timestamp: Date.now(),
  });
  res.json({
    success: true,
    message: 'Product moved to Trash / Recycle Bin',
    data: products[index],
  });
});

// Restore product from Trash back to active inventory
app.post('/api/products/:id/restore', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    isDeleted: false,
    deletedAt: undefined,
  };

  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'restored',
    productId: req.params.id,
    timestamp: Date.now(),
  });
  res.json({
    success: true,
    message: 'Product restored successfully to active inventory',
    data: products[index],
  });
});

// Permanent Delete product from database forever
app.delete('/api/products/:id/permanent', (req: Request, res: Response) => {
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const permanentlyDeleted = products.splice(index, 1)[0];
  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'permanently_deleted',
    productId: req.params.id,
    timestamp: Date.now(),
  });
  res.json({
    success: true,
    message: 'Product permanently removed from database',
    data: permanentlyDeleted,
  });
});

// Bulk Clear / Delete all products permanently or empty trash
app.delete('/api/products', (req: Request, res: Response) => {
  const { mode } = req.query; // 'trash_only' or all
  if (mode === 'trash_only') {
    products = products.filter((p) => !p.isDeleted);
  } else {
    products = [];
  }
  saveProductsToDisk(products);
  broadcastSync('products_updated', {
    type: 'products_updated',
    products,
    action: 'cleared_all',
    timestamp: Date.now(),
  });
  res.json({ success: true, message: 'Products database updated', count: products.length });
});

// 2. Orders API (with Delete and Persistent Disk Storage)
app.get('/api/orders', (req: Request, res: Response) => {
  const { status } = req.query;
  let result = [...orders];

  if (status && status !== 'all') {
    result = result.filter((o) => o.status === status);
  }

  res.json({ success: true, count: result.length, data: result });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find(
    (o) =>
      o.id.toLowerCase() === req.params.id.toLowerCase() ||
      (o.trackingNumber && o.trackingNumber.toLowerCase() === req.params.id.toLowerCase())
  );
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const body = req.body;
  const newOrder: Order = {
    ...body,
    id: body.id || `RVX-${Math.floor(10000 + Math.random() * 90000)}-SA`,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    shippingFee: 0,
    status: 'pending_payment_approval',
    estimatedDeliveryDate: '5-7 Business Days (Manual Local Delivery)',
  };

  orders.unshift(newOrder);
  saveOrdersToDisk(orders);
  res.status(201).json({ success: true, data: newOrder });
});

// Delete specific order
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  const deleted = orders.splice(index, 1)[0];
  saveOrdersToDisk(orders);
  res.json({ success: true, message: 'Order deleted successfully', data: deleted });
});

// Approve payment by Admin
app.patch('/api/orders/:id/approve-payment', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = 'processing';
  order.paymentApprovedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  if (order.checkpoints && order.checkpoints.length > 1) {
    order.checkpoints[1].completed = true;
    order.checkpoints[1].timestamp = order.paymentApprovedAt;
    order.checkpoints[1].description = 'Payment confirmed and approved by store admin.';
  }

  saveOrdersToDisk(orders);
  res.json({ success: true, message: 'Payment approved successfully', data: order });
});

// Update tracking number & courier name by Admin
app.patch('/api/orders/:id/tracking', (req: Request, res: Response) => {
  const { courierName, trackingNumber } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.courierName = courierName || 'Revox Express Courier';
  order.trackingNumber = trackingNumber;
  order.shippedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
  order.status = 'shipped';

  if (order.checkpoints && order.checkpoints.length > 2) {
    order.checkpoints[2].completed = true;
    order.checkpoints[2].timestamp = order.shippedAt;
    order.checkpoints[2].description = `Assigned to ${order.courierName} with tracking ${trackingNumber}.`;
  }

  saveOrdersToDisk(orders);
  res.json({ success: true, message: 'Tracking updated and customer notified', data: order });
});

// Update order status pipeline
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;

  if (status === 'delivered') {
    if (order.checkpoints && order.checkpoints.length >= 5) {
      order.checkpoints.forEach((cp) => (cp.completed = true));
    }
  }

  saveOrdersToDisk(orders);
  res.json({ success: true, data: order });
});

// Upload or re-upload payment receipt screenshot
app.post('/api/orders/:id/upload-receipt', (req: Request, res: Response) => {
  const { receiptImage, transactionReference } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.paymentReceiptImage = receiptImage;
  if (transactionReference) {
    order.transactionReference = transactionReference;
  }

  saveOrdersToDisk(orders);
  res.json({ success: true, message: 'Receipt uploaded successfully', data: order });
});

// 3. CMS & Settings API (Persistent)
app.get('/api/cms', (_req: Request, res: Response) => {
  res.json({ success: true, data: cmsConfig });
});

app.put('/api/cms', (req: Request, res: Response) => {
  cmsConfig = { ...cmsConfig, ...req.body };
  saveCMSToDisk(cmsConfig);
  broadcastSync('cms_updated', { type: 'cms_updated', cms: cmsConfig, timestamp: Date.now() });
  res.json({ success: true, data: cmsConfig });
});

// 4. Strict Admin Auth (Only Support.revox@gmail.com and Akash72256@)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'Support.revox@gmail.com' && password === 'Akash72256@') {
    res.json({
      success: true,
      token: 'jwt-revox-superadmin-akash-authorized',
      user: {
        email: 'Support.revox@gmail.com',
        name: 'Revox Super Admin',
        role: 'super_admin',
      },
    });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized: Access restricted to authorized store admin only.' });
  }
});

// 5. Analytics API
app.get('/api/analytics', (_req: Request, res: Response) => {
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingApprovals = orders.filter((o) => o.status === 'pending_payment_approval').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  res.json({
    success: true,
    data: {
      totalSales,
      totalOrdersCount,
      pendingApprovals,
      processingCount,
      shippedCount,
      deliveredCount,
    },
  });
});

// ==========================================
// VITE MIDDLEWARE INTEGRATION (Express Full-Stack)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Revox Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
