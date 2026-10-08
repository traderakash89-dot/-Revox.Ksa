import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  DollarSign,
  Search,
  Eye,
  Check,
  Edit,
  Trash2,
  Plus,
  Printer,
  X,
  FileText,
  AlertCircle,
  Settings,
  Layers,
  Lock,
  LogOut,
  Calendar,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Tag,
  Hash,
  Smartphone,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Filter,
  BatteryCharging,
  SlidersHorizontal,
  Copy,
  Sparkles,
  Zap,
  Video,
  ShieldOff,
  CheckSquare,
  Square,
  EyeOff,
  Laptop,
  Cpu,
} from 'lucide-react';
import { Order, Product, CMSConfig, OrderStatus, AdminUser, ProductVariant } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { TikTokAdsManager } from './TikTokAdsManager';
import {
  verifySecretAdminCode,
  checkPersistentAdminSession,
  clearAdminSession,
  isAdminDeviceBanned,
  getDeviceMetadata,
  getFailedAttemptsCount,
  DeviceMetadata,
} from '../utils/adminSecurity';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  cms: CMSConfig;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onApprovePayment: (orderId: string) => void;
  onUpdateTracking: (orderId: string, courierName: string, trackingNumber: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateCMS: (newCms: CMSConfig) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  products,
  cms,
  onUpdateOrderStatus,
  onApprovePayment,
  onUpdateTracking,
  onDeleteOrder,
  onSaveProduct,
  onDeleteProduct,
  onUpdateCMS,
  onClose,
}) => {
  // Device tracking metadata for this workstation
  const deviceMeta = useMemo<DeviceMetadata>(() => getDeviceMetadata(), []);

  // MASTER SECRET CODE AUTHENTICATION (Code: 722566) & PERSISTENT SESSION AUTO-AUTH
  // Automatically keeps the admin logged in on the authorized device
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const session = checkPersistentAdminSession();
    if (session) {
      return {
        email: session.email || 'admin@revox.ksa',
        name: session.name,
        role: session.role,
        token: session.token,
        deviceId: session.deviceId,
        deviceName: session.deviceMeta.summaryName,
        lastLoginAt: session.deviceMeta.lastLogin,
      };
    }
    return null;
  });

  // Secret Code (Single Gate - Removed Gmail and Password fields)
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 3-Attempt Failed Counter & Permanent Device/Session Ban Policy
  const [failedAttempts, setFailedAttempts] = useState<number>(() => getFailedAttemptsCount());
  const [isDeviceBanned, setIsDeviceBanned] = useState<boolean>(() => isAdminDeviceBanned());
  const [bannedTimestamp, setBannedTimestamp] = useState<string>(() => {
    try {
      return localStorage.getItem('revox_admin_banned_timestamp') || '';
    } catch {
      return '';
    }
  });

  // Tabs: 'orders' | 'products' | 'tiktok_ads' | 'analytics' | 'cms'
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'tiktok_ads' | 'analytics' | 'cms'>('orders');
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target as Node)) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected products for bulk inventory actions (e.g. bulk warranty setting or removing)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkActionSuccessMsg, setBulkActionSuccessMsg] = useState<string>('');

  // Order Filters & Search
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Product Filters & Search for Inventory Control
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productSearch, setProductSearch] = useState<string>('');

  // Modals inside Admin
  const [viewReceiptModal, setViewReceiptModal] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Tracking update state within order row
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [courierInput, setCourierInput] = useState<string>('Revox Express Courier');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

  // Product CRUD Modal state with multi-variant management
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Mobiles',
    price: 1999,
    originalPrice: 2899,
    stock: 10,
    serialNumber: '',
    sku: '',
    condition: 'Grade A+ Pristine (100% Inspected)',
    batteryHealth: '98% Genuine Health',
    warranty: '12-Month Revox Official Warranty',
    description: '',
    image: '',
    galleryImages: [],
    rating: 4.9,
    reviewsCount: 15,
    variants: [],
  });

  // Variant editing within product modal (Dynamic RAM, Storage, Color & Individual Pricing)
  const [variantColor, setVariantColor] = useState('');
  const [variantHex, setVariantHex] = useState('#9E9A93');
  const [variantStorage, setVariantStorage] = useState('256GB');
  const [variantRam, setVariantRam] = useState('');
  const [variantPrice, setVariantPrice] = useState<number>(3499);
  const [variantStock, setVariantStock] = useState<number>(5);
  const [variantSerial, setVariantSerial] = useState<string>('');

  // Category addition state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Mobiles',
    'iPhones',
    'Laptops',
    'Samsung',
    'Cameras',
    'Chargers',
    'Accessories',
    'Audio',
  ]);

  // Image URL input helper in modal
  const [directImageUrlInput, setDirectImageUrlInput] = useState('');

  // CMS Settings form state
  const [cmsForm, setCmsForm] = useState<CMSConfig>(cms);
  const [cmsSavedAlert, setCmsSavedAlert] = useState(false);

  // Compute analytics
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingApprovalsCount = orders.filter((o) => o.status === 'pending_payment_approval').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const inTransitCount = orders.filter((o) => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  // Monthly breakdown
  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. 2026-10
  const monthlyOrders = orders.filter((o) => o.createdAt.startsWith(currentMonthStr));
  const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

  // Per-day sales and order tracking breakdown for current month
  const perDayBreakdown = useMemo(() => {
    const map: { [day: string]: { count: number; revenue: number; codCount: number; advanceCount: number } } = {};
    orders.forEach((o) => {
      const day = o.createdAt.slice(0, 10); // YYYY-MM-DD
      if (!map[day]) {
        map[day] = { count: 0, revenue: 0, codCount: 0, advanceCount: 0 };
      }
      map[day].count += 1;
      map[day].revenue += o.total;
      if (o.paymentType === 'cod_partial') {
        map[day].codCount += 1;
      } else {
        map[day].advanceCount += 1;
      }
    });

    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, stats]) => ({ day, ...stats }));
  }, [orders]);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchSearch =
      !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch) ||
      o.customer.city.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // Filtered products for Product Management Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      const matchCategory =
        productCategoryFilter === 'all' ||
        p.category.toLowerCase() === productCategoryFilter.toLowerCase() ||
        (productCategoryFilter === 'Mobiles' && (p.category === 'iPhones' || p.category === 'Samsung' || p.category === 'Mobiles'));

      // Stock status filter
      let matchStock = true;
      if (productStockFilter === 'in_stock') matchStock = p.stock >= 4;
      if (productStockFilter === 'low_stock') matchStock = p.stock > 0 && p.stock <= 3;
      if (productStockFilter === 'out_of_stock') matchStock = p.stock <= 0;

      // Search filter
      const q = productSearch.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.serialNumber && p.serialNumber.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.condition && p.condition.toLowerCase().includes(q));

      return matchCategory && matchStock && matchSearch;
    });
  }, [products, productCategoryFilter, productStockFilter, productSearch]);

  // Product inventory KPI counts
  const totalCatalogCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  // Navigation tabs definition for the corner hero dropdown menu
  const navTabs = useMemo(() => [
    {
      id: 'orders' as const,
      label: 'Orders Management',
      shortLabel: 'Orders',
      icon: Package,
      count: orders.length,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      description: 'Manage customer orders, approval & fulfillment',
      alert: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} to approve` : undefined,
    },
    {
      id: 'products' as const,
      label: 'Products & Inventory',
      shortLabel: 'Products',
      icon: Layers,
      count: products.length,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      description: 'Catalog, stock counts, warranties & IMEI numbers',
    },
    {
      id: 'tiktok_ads' as const,
      label: 'TikTok Ads Manager',
      shortLabel: 'TikTok Ads',
      icon: Video,
      badge: 'NEW',
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'Campaign creatives, video ads & TikTok pixels',
    },
    {
      id: 'analytics' as const,
      label: 'Daily Sales & Ledger',
      shortLabel: 'Daily Sales',
      icon: BarChart3,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      description: 'Day-by-day revenue, COD vs Advance payments',
    },
    {
      id: 'cms' as const,
      label: 'CMS & Payment Gateways',
      shortLabel: 'CMS & Bank',
      icon: Settings,
      color: 'text-violet-400',
      badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      description: 'Al Rajhi IBAN, STC Pay, barcodes & support info',
    },
  ], [orders.length, products.length, pendingApprovalsCount]);

  const currentTabItem = useMemo(() => {
    return navTabs.find((t) => t.id === activeTab) || navTabs[0];
  }, [navTabs, activeTab]);

  // MASTER SECRET CODE LOGIN HANDLER (CODE: 722566) & 3-STRIKE PERMANENT DEVICE LOCKDOWN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // If device is already permanently banned, block immediately
    if (isDeviceBanned) {
      setLoginError(
        'ACCESS TERMINATED: This device / workstation has been permanently banned from Revox Control Room.'
      );
      return;
    }

    setLoginError('');

    const res = verifySecretAdminCode(secretCode);
    if (res.success && res.session) {
      // SUCCESSFUL LOGIN: Reset security counters, remember authorized device and enable persistent session
      setFailedAttempts(0);
      setCurrentUser({
        email: res.session.email || 'admin@revox.ksa',
        name: res.session.name,
        role: res.session.role,
        token: res.session.token,
        deviceId: res.session.deviceId,
        deviceName: res.session.deviceMeta.summaryName,
        lastLoginAt: res.session.deviceMeta.lastLogin,
      });
      setSecretCode('');
    } else {
      // WRONG CODE: Increment failure counter and trigger permanent device ban on 3rd attempt
      setFailedAttempts(res.failedCount || 0);
      setLoginError(res.error || 'Invalid secret access code.');
      if (res.isBanned) {
        setIsDeviceBanned(true);
        setBannedTimestamp(new Date().toISOString());
      }
    }
  };

  // Multi-image file upload handler (Multi-image upload for galleries)
  const handleMultiImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setProductForm((prev) => {
            const currentGallery = prev.galleryImages || [];
            const newGallery = currentGallery.includes(result) ? currentGallery : [...currentGallery, result];
            return {
              ...prev,
              image: prev.image || result, // Set as primary image if empty
              galleryImages: newGallery,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add image from direct URL
  const handleAddDirectImageUrl = () => {
    if (!directImageUrlInput.trim()) return;
    const url = directImageUrlInput.trim();
    setProductForm((prev) => {
      const currentGallery = prev.galleryImages || [];
      const newGallery = currentGallery.includes(url) ? currentGallery : [...currentGallery, url];
      return {
        ...prev,
        image: prev.image || url,
        galleryImages: newGallery,
      };
    });
    setDirectImageUrlInput('');
  };

  // Product Selection for Bulk Actions (Single or Multiple or All)
  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // Bulk Warranty Updater: Set No Warranty or any specific warranty for ALL products or SELECTED products
  const handleSetWarrantyBulk = (warrantyValue: string, applyToAll: boolean = false) => {
    const targetProducts = applyToAll
      ? products
      : products.filter((p) => selectedProductIds.includes(p.id));

    if (targetProducts.length === 0) {
      alert('Please select at least one product using the checkboxes, or choose "Apply to All Products".');
      return;
    }

    targetProducts.forEach((p) => {
      const updated: Product = {
        ...p,
        warranty: warrantyValue,
        conditionDetails: p.conditionDetails
          ? {
              ...p.conditionDetails,
              warranty: warrantyValue === 'No Warranty' ? 'No Warranty Included' : warrantyValue,
            }
          : undefined,
        specs: {
          ...p.specs,
          Warranty: warrantyValue === 'No Warranty' ? 'No Warranty' : warrantyValue,
        },
      };
      onSaveProduct(updated);
    });

    const msg =
      warrantyValue === 'No Warranty'
        ? `Warranty successfully removed! Set "No Warranty" on ${targetProducts.length} product${targetProducts.length > 1 ? 's' : ''}.`
        : `Successfully set "${warrantyValue}" on ${targetProducts.length} product${targetProducts.length > 1 ? 's' : ''}.`;

    setBulkActionSuccessMsg(msg);
    setTimeout(() => setBulkActionSuccessMsg(''), 5000);
  };

  // Bulk Remove / Clear Inventory: Remove all fake or mock inventory products while preserving the store banner
  const handleClearAllInventory = () => {
    if (products.length === 0) {
      alert('The inventory is already empty.');
      return;
    }
    const confirmed = confirm(
      `Are you sure you want to remove all ${products.length} inventory products? This will completely clear the mock/test inventory from your catalog while keeping the hero banner pictures, CMS settings, and payment details 100% intact.`
    );
    if (confirmed) {
      products.forEach((p) => {
        onDeleteProduct(p.id);
      });
      setSelectedProductIds([]);
      setBulkActionSuccessMsg('All mock inventory products successfully removed! Storefront is clean and ready for real stock.');
      setTimeout(() => setBulkActionSuccessMsg(''), 5000);
    }
  };

  // Instant 1-Click Warranty Toggle for any single product directly from the table
  const handleQuickToggleWarranty = (product: Product) => {
    const hasActiveWarranty =
      product.warranty &&
      !product.warranty.toLowerCase().includes('no warranty') &&
      product.warranty !== 'None';
    const newWarranty = hasActiveWarranty ? 'No Warranty' : '12-Month Revox Official Warranty';

    const updated: Product = {
      ...product,
      warranty: newWarranty,
      conditionDetails: product.conditionDetails
        ? {
            ...product.conditionDetails,
            warranty: newWarranty === 'No Warranty' ? 'No Warranty Included' : newWarranty,
          }
        : undefined,
      specs: {
        ...product.specs,
        Warranty: newWarranty === 'No Warranty' ? 'No Warranty' : newWarranty,
      },
    };

    onSaveProduct(updated);
    setBulkActionSuccessMsg(
      newWarranty === 'No Warranty'
        ? `Warranty removed for "${product.name}". Now set to No Warranty.`
        : `12-Month Official Warranty restored for "${product.name}".`
    );
    setTimeout(() => setBulkActionSuccessMsg(''), 4500);
  };

  // Set cover/primary image
  const handleSetPrimaryImage = (imgUrl: string) => {
    setProductForm((prev) => ({
      ...prev,
      image: imgUrl,
    }));
  };

  // Remove image from gallery
  const handleRemoveGalleryImage = (imgUrl: string) => {
    setProductForm((prev) => {
      const updatedGallery = (prev.galleryImages || []).filter((img) => img !== imgUrl);
      const newPrimary = prev.image === imgUrl ? (updatedGallery[0] || '') : prev.image;
      return {
        ...prev,
        image: newPrimary,
        galleryImages: updatedGallery,
      };
    });
  };

  // Auto-generate unique serial number for refurbished device
  const handleGenerateSerialNumber = () => {
    const prefix = 'RVX-SN';
    const catShort = (productForm.category || 'DEV').substring(0, 3).toUpperCase();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const sn = `${prefix}-${catShort}-${randomHex}`;
    setProductForm((prev) => ({
      ...prev,
      serialNumber: sn,
      sku: prev.sku || `SKU-${catShort}-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      serialNumber: prod.serialNumber || `RVX-SN-${prod.category.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      galleryImages: prod.galleryImages && prod.galleryImages.length > 0 ? [...prod.galleryImages] : [prod.image],
      variants: [...(prod.variants || [])],
    });
    setProductModalOpen(true);
  };

  // Open Add Product Modal with fresh state
  const openAddProduct = () => {
    setEditingProduct(null);
    const genSerial = `RVX-SN-MOB-${Math.floor(100000 + Math.random() * 900000)}`;
    setProductForm({
      id: `rvx-prod-${Date.now()}`,
      name: '',
      category: 'Mobiles',
      price: 1999,
      originalPrice: 2899,
      stock: 12,
      serialNumber: genSerial,
      sku: `SKU-MOB-${Math.floor(1000 + Math.random() * 9000)}`,
      condition: 'Grade A+ Pristine (100% Inspected)',
      conditionDetails: {
        grade: 'Grade A+ Pristine (Like New)',
        screen: 'Zero scratches, 100% genuine OLED display certified',
        body: 'Pristine housing with zero visible dents; ultrasound sanitized',
        batteryHealth: '98% Genuine Capacity Tested',
        hardwareTest: '100-point diagnostic certified',
        warranty: '12-Month Revox Official Warranty Card Included',
      },
      batteryHealth: '98% Genuine Health',
      warranty: '12-Month Revox Official Warranty',
      description: 'Certified refurbished device with ultrasound sanitization, 100-point quality check, and genuine parts guarantee.',
      image: '/src/assets/images/refurbished_iphone_titanium_1790978131968.jpg',
      galleryImages: ['/src/assets/images/refurbished_iphone_titanium_1790978131968.jpg'],
      rating: 4.9,
      reviewsCount: 20,
      specs: {
        'Condition': 'Grade A+ Pristine',
        'Warranty': '12-Month Revox Warranty',
        'Inspection': '100-Point Diagnostics Passed',
      },
      variants: [
        {
          id: `v-${Date.now()}-1`,
          colorName: 'Space Black',
          colorHex: '#1F2022',
          storage: '256GB',
          ram: '8GB',
          price: 1999,
          stock: 6,
          serialNumber: `${genSerial}-V1`,
        },
      ],
      featured: false,
    });
    setProductModalOpen(true);
  };

  // STRICT LOGOUT HANDLER (CLEARS SESSION TOKEN BUT PRESERVES AUTHORIZED DEVICE PROFILE)
  const handleLogout = () => {
    clearAdminSession(true);
    setCurrentUser(null);
    setSecretCode('');
  };

  // Quick inline stock updater for fast inventory control
  const handleQuickStockChange = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated: Product = { ...product, stock: newStock };
    onSaveProduct(updated);
  };

  // Add a variant with independent pricing, RAM, Storage, Color & Stock
  const handleAddVariant = () => {
    if (!variantColor.trim() || !variantPrice) {
      alert('Please provide variant color name and price.');
      return;
    }

    const newV: ProductVariant = {
      id: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      colorName: variantColor.trim(),
      colorHex: variantHex,
      storage: variantStorage.trim() || undefined,
      ram: variantRam.trim() || undefined,
      price: Number(variantPrice),
      stock: Number(variantStock || 5),
      serialNumber: variantSerial.trim() || undefined,
    };

    setProductForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newV],
    }));

    setVariantColor('');
    setVariantSerial('');
  };

  const handleRemoveVariant = (variantId?: string) => {
    setProductForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((v) => v.id !== variantId),
    }));
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please fill product title and price.');
      return;
    }

    const fullProduct: Product = {
      id: productForm.id || `rvx-prod-${Date.now()}`,
      name: productForm.name || 'Refurbished Device',
      category: productForm.category || 'Mobiles',
      condition: productForm.condition || 'Grade A+ Pristine (100% Inspected)',
      conditionDetails: productForm.conditionDetails || {
        grade: 'Grade A+ Pristine',
        screen: 'Zero scratches, 100% genuine OLED display',
        body: 'Pristine housing; ultrasound sanitized',
        batteryHealth: productForm.batteryHealth || '98% Genuine Capacity',
        hardwareTest: '100-point diagnostic certified',
        warranty: productForm.warranty || '12-Month Revox Official Warranty',
      },
      batteryHealth: productForm.batteryHealth || '98% Genuine Health',
      warranty: productForm.warranty || '12-Month Revox Official Warranty',
      serialNumber: productForm.serialNumber || `RVX-SN-${Math.floor(100000 + Math.random() * 900000)}`,
      sku: productForm.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice || Number(productForm.price) * 1.3),
      stock: Number(productForm.stock || 5),
      rating: Number(productForm.rating || 4.9),
      reviewsCount: Number(productForm.reviewsCount || 10),
      image: productForm.image || (productForm.galleryImages?.[0] || '/src/assets/images/refurbished_iphone_titanium_1790978131968.jpg'),
      galleryImages: productForm.galleryImages && productForm.galleryImages.length > 0
        ? productForm.galleryImages
        : [productForm.image || '/src/assets/images/refurbished_iphone_titanium_1790978131968.jpg'],
      description: productForm.description || 'Certified refurbished flagship hardware.',
      specs: productForm.specs || {
        'Condition Grade': productForm.condition || 'Grade A+',
        'Warranty': productForm.warranty || '12 Months Revox',
      },
      variants: productForm.variants && productForm.variants.length > 0 ? productForm.variants : [
        {
          id: `v-${Date.now()}`,
          colorName: 'Standard',
          colorHex: '#1E293B',
          price: Number(productForm.price),
          stock: Number(productForm.stock || 5),
        },
      ],
      featured: productForm.featured || false,
    };

    onSaveProduct(fullProduct);
    setProductModalOpen(false);
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    if (!customCategories.includes(cat)) {
      setCustomCategories((prev) => [...prev, cat]);
      setProductForm((prev) => ({ ...prev, category: cat }));
    }
    setNewCategoryName('');
  };

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCMS(cmsForm);
    setCmsSavedAlert(true);
    setTimeout(() => setCmsSavedAlert(false), 3000);
  };

  // STRICT LOGIN SCREEN & PERMANENT DEVICE LOCKDOWN GATE
  if (!currentUser) {
    // 1. PERMANENT DEVICE LOCKDOWN SCREEN (TRIGGERED AFTER 3 FAILED ATTEMPTS)
    if (isDeviceBanned) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0A0E18] border-2 border-red-600 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-950/60 relative overflow-hidden animate-in zoom-in-95">
            {/* Top red warning line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldOff className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Poppins'] tracking-wide">
                    Revox Security Gate
                  </h3>
                  <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-wider block">
                    Zero-Trust Protocol Engaged
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                title="Return to Storefront"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permanent Lockdown Banner */}
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl space-y-2 text-red-200">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Workstation Access Permanently Restricted</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access to the Revox Control Room from this device / browser session has been permanently locked down due to <strong>3 consecutive failed authentication attempts</strong>.
              </p>
            </div>

            {/* Security Audit Details */}
            <div className="p-3 bg-black/60 border border-slate-800 rounded-xl text-[11px] font-mono space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Incident Code:</span>
                <span className="text-red-400 font-bold">SEC-BAN-403-BRUTEFORCE</span>
              </div>
              <div className="flex justify-between">
                <span>Policy Triggered:</span>
                <span className="text-slate-300">Anti-Brute-Force Enforcement</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Attempts:</span>
                <span className="text-red-400 font-bold">3 of 3 Limit Exceeded</span>
              </div>
              <div className="flex justify-between">
                <span>Enforcement Action:</span>
                <span className="text-rose-400 font-bold">Permanent Session Ban</span>
              </div>
              <div className="flex justify-between">
                <span>Locked Timestamp:</span>
                <span className="text-slate-300 truncate max-w-[200px]">
                  {bannedTimestamp || new Date().toISOString()}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              All further administrative sign-in attempts from this workstation have been terminated for security compliance.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer border border-slate-800 shadow-md"
            >
              Exit to Customer Storefront
            </button>
          </div>
        </div>
      );
    }

    // 2. MASTER SECRET CODE LOGIN SCREEN (SINGLE GATE - 722566) WITH DEVICE TRACKING
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div className="w-full max-w-md bg-[#0D131F] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white font-['Poppins'] tracking-tight">
                  Revox Control Room
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-semibold block">
                  Master Security Gate · Secret Code
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hardware & Device Tracking Card */}
          <div className="p-3.5 bg-[#080D16] border border-slate-800/90 rounded-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono">
                  Tracked Admin Workstation
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Device Tracked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Device ID:</span>
                <span className="text-cyan-300 font-bold truncate block">{deviceMeta.deviceId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Platform:</span>
                <span className="text-slate-300 truncate block">{deviceMeta.summaryName}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
              <span>Display Resolution:</span>
              <span className="text-slate-300 font-mono">{deviceMeta.screenResolution}</span>
            </div>
          </div>

          {/* Strict 3-Attempt Security Policy Alert */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="text-[11px] font-medium">3-Attempt Maximum Security Limit</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
              failedAttempts > 0
                ? 'bg-red-950 text-red-300 border border-red-800'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {failedAttempts}/3 Failed
            </span>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/70 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-in shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* Single Secret Code Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-300 font-mono">
                  Master Secret Access Code
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                >
                  {showSecretCode ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide Code</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showSecretCode ? 'text' : 'password'}
                  required
                  autoFocus
                  autoComplete="off"
                  maxLength={10}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-[#111726] border border-cyan-500/40 rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-[0.4em] font-extrabold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-cyan-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Control Room</span>
            </button>

            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[10px] text-slate-400 space-y-1 leading-relaxed">
              <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Authorized Device Persistence Enabled:</span>
              </p>
              <p className="text-slate-400 text-[10px]">
                Upon successful entry, this hardware workstation is recognized and always kept logged in for seamless administrative control.
              </p>
              <p className="text-rose-400 font-semibold text-[9.5px]">
                Warning: 3 incorrect attempts permanently locks this device and removes all Admin buttons from your screen.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#090D14] overflow-y-auto flex flex-col">
      
      {/* Top Header - Compact Hero Header & Menu Button System */}
      <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/90 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left: Brand & Device Session Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-tight font-['Poppins']">
                  Revox Control Room
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Auth Active
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="text-cyan-400 font-semibold">{currentUser.deviceId || deviceMeta.deviceId}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 hidden md:inline">{currentUser.deviceName || deviceMeta.summaryName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Corner: Consolidated Clean Hero Dropdown Menu + Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SECTION SWITCHER: Organized Dropdown Menu in the Corner */}
          <div className="relative" ref={menuDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#111726] hover:bg-[#162033] border border-cyan-500/35 hover:border-cyan-400 text-white text-xs font-semibold shadow-md transition-all cursor-pointer group"
              title="Click to switch section"
            >
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <currentTabItem.icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white tracking-tight font-['Poppins']">
                {currentTabItem.shortLabel}
              </span>
              {currentTabItem.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  {currentTabItem.count}
                </span>
              )}
              {currentTabItem.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                  {currentTabItem.badge}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 ${isMenuDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {/* Dropdown Floating Panel */}
            {isMenuDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-[#0B0F19] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Admin Navigation Menu
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">5 Sections</span>
                </div>

                <div className="space-y-1">
                  {navTabs.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-white shadow-xs'
                            : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isActive ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'bg-slate-800/80 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate font-['Poppins'] ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {item.label}
                            </span>
                            {item.count !== undefined && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {item.count}
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5 font-['Poppins']">
                            {item.description}
                          </p>
                          {item.alert && (
                            <span className="text-[9.5px] font-mono text-amber-400 block mt-0.5 font-semibold">
                              ⚠️ {item.alert}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Workstation Info Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Workstation:</span>
            <span className="text-cyan-300 font-bold">{currentUser.deviceId || deviceMeta.deviceId}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            title="Sign Out Session (Stay Authorized on this Hardware Device)"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 border border-slate-700 font-['Poppins']"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Summary Cards Grid - Refined Modern Text Stylist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-[#111723] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Total Sales Volume
              </span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums mt-1 block tracking-tight">
              {totalSales.toLocaleString()} SAR
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              Across all {orders.length} customer orders
            </span>
          </div>

          <div className="bg-[#111723] border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Monthly Status ({currentMonthStr})
              </span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1 block tracking-tight">
              {monthlyRevenue.toLocaleString()} SAR
            </span>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 mt-1 flex items-center gap-1 font-semibold cursor-pointer font-mono"
            >
              <span>{monthlyOrders.length} orders · View Daily Ledger</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div
            onClick={() => {
              setActiveTab('orders');
              setOrderFilter('pending_payment_approval');
            }}
            className="bg-[#111723] border border-amber-900/60 hover:border-amber-500/60 rounded-xl p-4 shadow-sm cursor-pointer transition-colors relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                Waiting Confirmation
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums mt-1 block tracking-tight">
              {pendingApprovalsCount}
            </span>
            <span className="text-[10px] text-amber-400/90 mt-1 block font-medium font-mono">
              Requires Admin Review & Approval →
            </span>
          </div>

          <div
            onClick={() => {
              setActiveTab('products');
            }}
            className="bg-[#111723] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 shadow-sm cursor-pointer transition-colors relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                Catalog & Stock
              </span>
              <Package className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tabular-nums mt-1 block tracking-tight">
              {totalCatalogCount} Items ({totalStockUnits} Units)
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {lowStockCount} low stock · {outOfStockCount} out of stock
            </span>
          </div>

        </div>

        {/* TAB 1: ORDER MANAGEMENT WITH DELETE OPTION */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111723] p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
                {[
                  { label: `All Orders (${orders.length})`, val: 'all' },
                  { label: `Waiting Confirmation (${pendingApprovalsCount})`, val: 'pending_payment_approval' },
                  { label: `Processing (${processingCount})`, val: 'processing' },
                  { label: `Shipped (${inTransitCount})`, val: 'shipped' },
                  { label: `Delivered (${deliveredCount})`, val: 'delivered' },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => setOrderFilter(f.val)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      orderFilter === f.val
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search Order ID, name, phone, city..."
                  className="w-full bg-[#090D14] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#111723] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1420] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer & City</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-4">Amount & Payment</th>
                      <th className="py-3 px-4">Receipt Proof</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Courier & Tracking</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          No orders found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        return (
                          <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                            
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-slate-100 block">
                                {order.id}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {order.createdAt}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-200 block">
                                {order.customer.fullName}
                              </span>
                              <span className="text-[11px] text-amber-400 font-mono block">
                                {order.customer.phone}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {order.customer.city} ({order.customer.district || 'KSA'})
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-[180px]">
                              <div className="space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-300 leading-tight">
                                    <span className="font-semibold text-white">{it.quantity}x</span> {it.product.name}
                                    {it.selectedStorage && <span className="text-slate-400 text-[10px]"> ({it.selectedStorage})</span>}
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-white block">
                                {order.total.toLocaleString()} SAR
                              </span>
                              {order.paymentType === 'cod_partial' ? (
                                <div className="text-[11px] space-y-0.5">
                                  <span className="text-amber-400 font-semibold block">COD (50 SAR Advance)</span>
                                  <span className="text-slate-400 font-mono">
                                    Bal: {order.remainingBalanceCod?.toLocaleString()} SAR
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-400 font-semibold block">
                                  Full Advance (0 SAR Delivery)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className="font-bold text-[10px] uppercase text-slate-300 block">
                                  {order.transferChannel?.toUpperCase() || 'AL_RAJHI'}
                                </span>

                                {order.paymentReceiptImage ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewReceiptModal(order)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 flex items-center gap-1 font-medium cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View Slip</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-amber-400 italic">
                                    No receipt uploaded
                                  </span>
                                )}

                                {order.transactionReference && (
                                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[110px] block" title={order.transactionReference}>
                                    Ref: {order.transactionReference}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {order.status === 'pending_payment_approval' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-400">
                                  <Clock className="w-3 h-3" />
                                  Waiting Confirmation
                                </span>
                              )}
                              {order.status === 'processing' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-blue-500/15 border border-blue-500/40 text-blue-400">
                                  <Package className="w-3 h-3" />
                                  Processing / Packed
                                </span>
                              )}
                              {order.status === 'shipped' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-purple-500/15 border border-purple-500/40 text-purple-400">
                                  <Truck className="w-3 h-3" />
                                  Shipped
                                </span>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
                                  <Truck className="w-3 h-3 animate-pulse" />
                                  Out for Delivery
                                </span>
                              )}
                              {order.status === 'delivered' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Delivered
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {editingTrackingOrderId === order.id ? (
                                <div className="space-y-1.5 w-48">
                                  <input
                                    type="text"
                                    value={courierInput}
                                    onChange={(e) => setCourierInput(e.target.value)}
                                    placeholder="Courier Name"
                                    className="w-full bg-[#090D14] border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                                  />
                                  <input
                                    type="text"
                                    value={trackingNumberInput}
                                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                                    placeholder="Tracking #"
                                    className="w-full bg-[#090D14] border border-slate-700 rounded px-2 py-1 text-[11px] text-amber-400 font-mono"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onUpdateTracking(order.id, courierInput, trackingNumberInput);
                                        setEditingTrackingOrderId(null);
                                      }}
                                      className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                                    >
                                      Save & Notify
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTrackingOrderId(null)}
                                      className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="text-[11px] text-slate-300 block truncate max-w-[140px]">
                                    {order.courierName || 'Local Courier'}
                                  </span>
                                  {order.trackingNumber ? (
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono text-xs font-bold text-amber-400 block select-all">
                                        {order.trackingNumber}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTrackingOrderId(order.id);
                                          setCourierInput(order.courierName || 'Revox Express Courier');
                                          setTrackingNumberInput(order.trackingNumber || '');
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-white"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTrackingOrderId(order.id);
                                        setCourierInput(order.courierName || 'Revox Express Courier');
                                        setTrackingNumberInput(`RVX-TRK-${Math.floor(10000 + Math.random() * 90000)}-SA`);
                                      }}
                                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                                    >
                                      + Attach Tracking
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                              {order.status === 'pending_payment_approval' && (
                                <button
                                  type="button"
                                  onClick={() => onApprovePayment(order.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer"
                                  title="Approve Payment"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve Payment</span>
                                </button>
                              )}

                              {order.status === 'processing' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                                  className="px-2 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                                >
                                  Ship
                                </button>
                              )}

                              {order.status === 'shipped' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateOrderStatus(order.id, 'out_for_delivery')}
                                  className="px-2 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                                >
                                  Dispatch
                                </button>
                              )}

                              {order.status === 'out_for_delivery' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                  className="px-2 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                                >
                                  Deliver
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Download / Print Packaging Slip"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete Order #${order.id} for ${order.customer.fullName}? This will permanently remove it from the database.`)) {
                                    onDeleteOrder(order.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Order from System"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ADVANCED PRODUCT MANAGEMENT & INVENTORY CONTROL */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Header & Control Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111723] p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-['Poppins']">
                    Product Management & Inventory Control
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete CRUD Control: Add, Edit, Update, and Delete products with Serial Tracking, Multi-Variant Pricing & Multi-Image Galleries.
                </p>
              </div>

              {/* Action Buttons: Add Product & Direct Category Management */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllInventory}
                  className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  title="Remove all mock/test inventory without touching banner"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Clear All Inventory</span>
                </button>

                <button
                  type="button"
                  onClick={openAddProduct}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Quick Inventory Summary Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#0D1420] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Total Catalog Items:</span>
                <span className="font-bold text-white font-mono">{totalCatalogCount}</span>
              </div>
              <div className="bg-[#0D1420] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">In-Stock Quantity:</span>
                <span className="font-bold text-emerald-400 font-mono">{totalStockUnits} units</span>
              </div>
              <div className="bg-[#0D1420] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Low Stock Alert (≤3):</span>
                <span className="font-bold text-amber-400 font-mono">{lowStockCount}</span>
              </div>
              <div className="bg-[#0D1420] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Out of Stock:</span>
                <span className="font-bold text-red-400 font-mono">{outOfStockCount}</span>
              </div>
            </div>

            {/* Quick Filters Toolbar: Category Filter, Stock Status Filter & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#111723] p-3 rounded-xl border border-slate-800">
              
              {/* Category Pills Filter */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs pb-1 lg:pb-0">
                <span className="text-[11px] text-slate-500 font-bold uppercase mr-1">Category:</span>
                {['all', 'Mobiles', 'iPhones', 'Laptops', 'Samsung', 'Cameras', 'Chargers', 'Accessories', 'Audio'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      productCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#090D14] text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>

              {/* Stock Status & Search */}
              <div className="flex items-center gap-2">
                {/* Stock Status Filter */}
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value as any)}
                  className="bg-[#090D14] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (≥4)</option>
                  <option value="low_stock">Low Stock (1-3)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                {/* Search Input */}
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search Title, Serial, SKU..."
                    className="w-full bg-[#090D14] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

            </div>

            {/* Bulk Action Alert Banner */}
            {bulkActionSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{bulkActionSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkActionSuccessMsg('')}
                  className="text-emerald-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* BULK & INSTANT WARRANTY MANAGEMENT TOOLBAR */}
            <div className="bg-[#0C121D] border border-amber-900/40 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Warranty Controls (Select Products or Apply to All):</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  {selectedProductIds.length > 0
                    ? `${selectedProductIds.length} of ${filteredProducts.length} Selected`
                    : `All ${products.length} Products`}
                </span>
              </div>

              {/* Fast Bulk Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {/* Set No Warranty / Remove Warranty */}
                <button
                  type="button"
                  onClick={() => handleSetWarrantyBulk('No Warranty', selectedProductIds.length === 0)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                  title={
                    selectedProductIds.length > 0
                      ? `Remove warranty and set "No Warranty" for ${selectedProductIds.length} selected products`
                      : 'Remove warranty and set "No Warranty" for ALL products in catalog'
                  }
                >
                  <ShieldOff className="w-3.5 h-3.5 text-red-400" />
                  <span>
                    {selectedProductIds.length > 0
                      ? `Set No Warranty (${selectedProductIds.length})`
                      : 'Set "No Warranty" for All Products'}
                  </span>
                </button>

                {/* Restore 12-Month Official Warranty */}
                <button
                  type="button"
                  onClick={() =>
                    handleSetWarrantyBulk('12-Month Revox Official Warranty', selectedProductIds.length === 0)
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                  title={
                    selectedProductIds.length > 0
                      ? `Apply 12-Month Official Warranty to ${selectedProductIds.length} selected products`
                      : 'Apply 12-Month Official Warranty to ALL products in catalog'
                  }
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {selectedProductIds.length > 0
                      ? `Set 12M Warranty (${selectedProductIds.length})`
                      : 'Set 12M Warranty for All'}
                  </span>
                </button>

                {/* 6-Month Warranty */}
                <button
                  type="button"
                  onClick={() => handleSetWarrantyBulk('6-Month Revox Warranty', selectedProductIds.length === 0)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium transition-all cursor-pointer"
                  title="Apply 6-Month warranty"
                >
                  <span>Set 6M</span>
                </button>

                {/* Bulk Delete Selected Products */}
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products? This will remove them immediately from the catalog.`)) {
                        selectedProductIds.forEach((id) => onDeleteProduct(id));
                        setSelectedProductIds([]);
                        setBulkActionSuccessMsg(`${selectedProductIds.length} selected products deleted.`);
                        setTimeout(() => setBulkActionSuccessMsg(''), 4000);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 hover:text-white border border-red-700 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                    title="Delete selected products"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete Selected ({selectedProductIds.length})</span>
                  </button>
                )}

                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="px-2 py-1.5 text-slate-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Deselect
                  </button>
                )}
              </div>
            </div>

            {/* 1. COMPREHENSIVE PRODUCT LISTING & CONTROL TABLE */}
            <div className="bg-[#111723] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1420] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedProductIds.length === filteredProducts.length &&
                            filteredProducts.length > 0
                          }
                          onChange={handleSelectAllProducts}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                          title="Select all products for bulk action"
                        />
                      </th>
                      <th className="py-3 px-4">Product Info & Serial Tracking</th>
                      <th className="py-3 px-4">Condition & Battery</th>
                      <th className="py-3 px-4">Warranty Coverage & Toggle</th>
                      <th className="py-3 px-4">Base & Retail Price</th>
                      <th className="py-3 px-4">Variants (RAM / Storage / Color)</th>
                      <th className="py-3 px-4">Stock Level</th>
                      <th className="py-3 px-4 text-right">Actions (Edit / Update / Delete)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          No products found matching the criteria. Click "Add New Product" to list a new item.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLowStock = p.stock > 0 && p.stock <= 3;
                        const isOutOfStock = p.stock <= 0;
                        const discountPercent = Math.round(
                          ((p.originalPrice - p.price) / p.originalPrice) * 100
                        );
                        const isNoWarranty =
                          !p.warranty ||
                          p.warranty.toLowerCase().includes('no warranty') ||
                          p.warranty === 'None';

                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            {/* Checkbox for Bulk Actions */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(p.id)}
                                onChange={() => handleToggleSelectProduct(p.id)}
                                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Product Info, Thumbnail & Serial Number Tracking */}
                            <td className="py-3 px-4">
                              <div className="flex items-start gap-3">
                                <div className="relative w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  {p.galleryImages && p.galleryImages.length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-mono text-amber-400 px-1 rounded-tl">
                                      +{p.galleryImages.length - 1}
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-white text-xs block leading-tight">
                                    {p.name}
                                  </span>

                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                      {p.category}
                                    </span>

                                    {/* Serial Number Tracking Badge */}
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800 flex items-center gap-1 select-all"
                                      title="Refurbished Device Serial Number"
                                    >
                                      <Hash className="w-2.5 h-2.5 text-amber-400" />
                                      <span>{p.serialNumber || `SN: RVX-${p.id.slice(-6)}`}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Refurbish Condition & Battery Health */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <span className="text-amber-400 font-bold text-[11px] block">
                                  {p.condition}
                                </span>
                                {p.batteryHealth ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                                    <BatteryCharging className="w-3 h-3" />
                                    <span>{p.batteryHealth}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500">100% Tested</span>
                                )}
                              </div>
                            </td>

                            {/* Dedicated Warranty Option & Quick 1-Click Toggle */}
                            <td className="py-3 px-4">
                              <div className="space-y-1.5">
                                {isNoWarranty ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/70 border border-red-800/80 px-2 py-0.5 rounded shadow-sm">
                                      <ShieldOff className="w-3 h-3 text-red-400" />
                                      <span>No Warranty</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickToggleWarranty(p)}
                                      className="block text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline font-semibold cursor-pointer"
                                      title="Add standard 12-Month Revox Official Warranty to this product"
                                    >
                                      + Add 12M Warranty
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded shadow-sm">
                                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                      <span className="truncate max-w-[130px]">{p.warranty}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickToggleWarranty(p)}
                                      className="block text-[10px] text-red-400 hover:text-red-300 hover:underline font-semibold cursor-pointer"
                                      title="Remove warranty from this product (sets to No Warranty)"
                                    >
                                      Remove Warranty
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Pricing */}
                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <span className="font-mono font-extrabold text-white text-sm block">
                                  {p.price.toLocaleString()} SAR
                                </span>
                                {p.originalPrice > p.price && (
                                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                                    <span className="line-through">{p.originalPrice.toLocaleString()} SAR</span>
                                    {discountPercent > 0 && (
                                      <span className="text-red-400 font-bold">(-{discountPercent}%)</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Variants Display */}
                            <td className="py-3 px-4 max-w-[220px]">
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-300 block">
                                  {p.variants?.length || 0} Dynamic Variants
                                </span>
                                
                                {p.variants && p.variants.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {p.variants.slice(0, 3).map((v, i) => (
                                      <span
                                        key={v.id || i}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#090D14] border border-slate-800 text-slate-300"
                                      >
                                        {v.colorHex && (
                                          <span
                                            className="w-2 h-2 rounded-full border border-black shrink-0"
                                            style={{ backgroundColor: v.colorHex }}
                                          />
                                        )}
                                        <span>{v.storage || v.colorName}</span>
                                        <span className="font-mono text-amber-400 font-semibold">{v.price} SAR</span>
                                      </span>
                                    ))}
                                    {p.variants.length > 3 && (
                                      <span className="text-[10px] text-slate-500 self-center">
                                        +{p.variants.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500">Standard single variant</span>
                                )}
                              </div>
                            </td>

                            {/* Stock Level with Quick +/- Steppers */}
                            <td className="py-3 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockChange(p, -1)}
                                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                    title="Decrease stock by 1"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-sm px-2 text-white">
                                    {p.stock}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockChange(p, 1)}
                                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                                    title="Increase stock by 1"
                                  >
                                    +
                                  </button>
                                </div>

                                <div>
                                  {isOutOfStock ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/60 border border-red-800 text-red-400">
                                      Out of Stock
                                    </span>
                                  ) : isLowStock ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/60 border border-amber-800 text-amber-400">
                                      Low Stock ({p.stock} left)
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                                      In Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Actions per Product: Edit, Update, and Delete */}
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => openEditProduct(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                                title="Edit Product Specifications & Variants"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Quick Update Button (opens edit modal directly) */}
                              <button
                                type="button"
                                onClick={() => openEditProduct(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                title="Update Pricing & Inventory"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Update</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to permanently delete "${p.name}" (ID: ${p.id})? This will immediately remove it from the customer storefront and database.`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/70 border border-slate-700 text-slate-400 hover:text-red-300 transition-colors cursor-pointer inline-flex items-center"
                                title="Delete Product from Inventory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: TIKTOK & SOCIAL ADS MANAGER (VIDEO/IMAGE SLIDESHOWS & AD WORKFLOWS) */}
        {activeTab === 'tiktok_ads' && (
          <TikTokAdsManager products={products} />
        )}

        {/* TAB 4: PER-DAY SALES & ORDER TRACKING ANALYTICS SECTION */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Poppins']">
                  Daily Sales & Order Tracking Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Granular day-by-day revenue breakdown and customer payment method distribution.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Current Month Volume</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {monthlyRevenue.toLocaleString()} SAR
                </span>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-[#111723] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D1420] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Orders Count</th>
                      <th className="py-3 px-4">Full Advance Orders</th>
                      <th className="py-3 px-4">COD Orders</th>
                      <th className="py-3 px-4">Total Daily Revenue</th>
                      <th className="py-3 px-4">Revenue Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {perDayBreakdown.map((row) => {
                      const sharePercent = totalSales > 0 ? Math.round((row.revenue / totalSales) * 100) : 0;
                      return (
                        <tr key={row.day} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {row.day}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            {row.count} orders
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-medium">
                            {row.advanceCount} advance (0 SAR ship)
                          </td>
                          <td className="py-3 px-4 text-amber-400 font-medium">
                            {row.codCount} COD orders
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">
                            {row.revenue.toLocaleString()} SAR
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${Math.min(100, sharePercent)}%` }}
                                />
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">{sharePercent}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTENT MANAGEMENT & PAYMENTS */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-['Syne']">
                  Storefront Content & Payment Gateways
                </h3>
                <p className="text-xs text-slate-400">
                  Manage announcement text, Al Rajhi Bank, STC Pay, and Barq Pay account credentials.
                </p>
              </div>

              {cmsSavedAlert && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Changes Saved Successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCMS} className="space-y-6 text-xs">
              <div className="bg-[#111723] border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  Homepage Announcements & Contact Info
                </h4>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Top Announcement Bar Text</label>
                  <input
                    type="text"
                    value={cmsForm.announcementText}
                    onChange={(e) => setCmsForm({ ...cmsForm, announcementText: e.target.value })}
                    className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">WhatsApp Support Phone</label>
                    <input
                      type="text"
                      value={cmsForm.supportPhone}
                      onChange={(e) => setCmsForm({ ...cmsForm, supportPhone: e.target.value })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Support Email Address</label>
                    <input
                      type="email"
                      value={cmsForm.supportEmail}
                      onChange={(e) => setCmsForm({ ...cmsForm, supportEmail: e.target.value })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                    <span>TikTok Official Account Link (Social Media)</span>
                    <a
                      href={cmsForm.tiktokUrl || 'https://www.tiktok.com/@revox.ksa.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline text-[11px] font-mono"
                    >
                      Test Link ↗
                    </a>
                  </label>
                  <input
                    type="url"
                    value={cmsForm.tiktokUrl || ''}
                    placeholder="https://www.tiktok.com/@revox.ksa.com"
                    onChange={(e) => setCmsForm({ ...cmsForm, tiktokUrl: e.target.value })}
                    className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3.5 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Al Rajhi, STC Pay, Barq Pay Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Al Rajhi */}
                <div className="bg-[#111723] border border-blue-900/50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-blue-400 block">Al Rajhi Bank Details</span>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">Account Name</label>
                    <input
                      type="text"
                      value={cmsForm.alRajhiDetails.accountName}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          alRajhiDetails: { ...cmsForm.alRajhiDetails, accountName: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">Account Number</label>
                    <input
                      type="text"
                      value={cmsForm.alRajhiDetails.accountNumber}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          alRajhiDetails: { ...cmsForm.alRajhiDetails, accountNumber: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">IBAN</label>
                    <input
                      type="text"
                      value={cmsForm.alRajhiDetails.iban}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          alRajhiDetails: { ...cmsForm.alRajhiDetails, iban: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                {/* STC Pay */}
                <div className="bg-[#111723] border border-amber-900/50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-amber-400 block">STC Pay Details</span>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">STC Pay Name</label>
                    <input
                      type="text"
                      value={cmsForm.stcPayDetails.accountName}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          stcPayDetails: { ...cmsForm.stcPayDetails, accountName: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">STC Mobile Number</label>
                    <input
                      type="text"
                      value={cmsForm.stcPayDetails.mobileNumber}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          stcPayDetails: { ...cmsForm.stcPayDetails, mobileNumber: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                {/* Barq Pay */}
                <div className="bg-[#111723] border border-emerald-900/50 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase text-emerald-400 block">Barq Pay / بارك</span>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">Barq Holder Name</label>
                    <input
                      type="text"
                      value={cmsForm.barqPayDetails.accountName}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          barqPayDetails: { ...cmsForm.barqPayDetails, accountName: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 text-[11px]">Barq Registered Number</label>
                    <input
                      type="text"
                      value={cmsForm.barqPayDetails.mobileNumber}
                      onChange={(e) =>
                        setCmsForm({
                          ...cmsForm,
                          barqPayDetails: { ...cmsForm.barqPayDetails, mobileNumber: e.target.value },
                        })
                      }
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-md"
              >
                Save All Content & Payment Configurations
              </button>
            </form>
          </div>
        )}

      </main>

      {/* VIEW RECEIPT MODAL */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0E1522] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  Payment Slip Verification · {viewReceiptModal.id}
                </h3>
                <p className="text-xs text-slate-400">
                  Customer: {viewReceiptModal.customer.fullName} · {viewReceiptModal.total.toLocaleString()} SAR
                </p>
              </div>
              <button onClick={() => setViewReceiptModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-auto bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center">
              {viewReceiptModal.paymentReceiptImage ? (
                <img
                  src={viewReceiptModal.paymentReceiptImage}
                  alt="Customer Uploaded Receipt"
                  className="max-h-[50vh] w-auto object-contain rounded"
                />
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">No screenshot uploaded.</div>
              )}
            </div>

            <div className="p-3 bg-[#111723] rounded-lg border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-400 block text-[10px]">Reference / Transaction ID</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {viewReceiptModal.transactionReference || 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Transfer Method</span>
                <span className="font-semibold text-slate-200 uppercase">
                  {viewReceiptModal.transferChannel?.toUpperCase() || 'AL_RAJHI'} (
                  {viewReceiptModal.paymentType === 'cod_partial' ? '50 SAR COD Advance' : 'Full Advance'})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Status: <strong className="text-amber-400 uppercase">{viewReceiptModal.status}</strong>
              </span>

              {viewReceiptModal.status === 'pending_payment_approval' && (
                <button
                  type="button"
                  onClick={() => {
                    onApprovePayment(viewReceiptModal.id);
                    setViewReceiptModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Payment Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ADVANCED PRODUCT LISTING / ADDITION / EDIT FORM MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0E1522] border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xl my-auto animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-['Syne']">
                    {editingProduct ? `Edit Refurbished Device: ${editingProduct.name}` : 'Add New Refurbished Product'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Comprehensive Specs, Serial Control, Multi-Variant Pricing & Gallery Upload
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProductSubmit} className="space-y-5 text-xs overflow-y-auto pr-1 flex-1">
              
              {/* --- SECTION 1: BASIC INFO --- */}
              <div className="bg-[#111723] p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>1. Basic Product Information</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Product Title / Model Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name || ''}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Apple iPhone 15 Pro Max Titanium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Category Selector <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={productForm.category || 'Mobiles'}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {customCategories.map((c) => (
                        <option key={c} value={c} className="bg-[#090D14]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inline Quick Add Custom Category */}
                <div className="p-2 bg-[#090D14] rounded-lg border border-slate-800/80 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">+ Add Custom Category:</span>
                  <input
                    type="text"
                    placeholder="e.g. Smartwatches or Tablets"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-[#111723] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Detailed Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    placeholder="Detailed refurbished condition, genuine components, package contents..."
                  />
                </div>
              </div>

              {/* --- SECTION 2: STOCK & SERIAL NUMBER CONTROL --- */}
              <div className="bg-[#111723] p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span>2. Stock Level & Unique Serial Number Tracking</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Stock Quantity Level <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={productForm.stock ?? 10}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">
                        Unique Serial Number / IMEI Tracking
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateSerialNumber}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                      >
                        + Auto-Generate Serial
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productForm.serialNumber || ''}
                        onChange={(e) => setProductForm({ ...productForm, serialNumber: e.target.value })}
                        className="flex-1 bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                        placeholder="e.g. RVX-SN-IP15PM-892144"
                      />
                      <input
                        type="text"
                        value={productForm.sku || ''}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-28 sm:w-36 bg-[#090D14] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-300 font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                        placeholder="SKU Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Base Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Base Selling Price (SAR) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price || 0}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">
                      Original Retail Benchmark Price (SAR)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPrice || 0}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: TECHNICAL SPECIFICATIONS & CONDITION --- */}
              <div className="bg-[#111723] p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. Refurbished Condition & Battery Health Indicator</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Condition Badge Selector */}
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                      Condition Badge Selector
                    </label>
                    <select
                      value={productForm.condition || 'Condition: Excellent'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const grade = val.includes('Very Good') ? 'Very Good' : val.includes('Good') ? 'Good' : 'Excellent';
                        setProductForm({ ...productForm, condition: val, conditionGrade: grade });
                      }}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Condition: Excellent">🟢 Condition: Excellent (Pristine)</option>
                      <option value="Condition: Very Good">🔵 Condition: Very Good (Normal Wear)</option>
                      <option value="Condition: Good">🟡 Condition: Good (Fully Functional)</option>
                    </select>
                  </div>

                  {/* Battery Health Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-300 font-semibold">
                        Battery Health Indicator
                      </label>
                      <div className="flex gap-1">
                        {['100%', '98%', '95%', '90%'].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, batteryHealth: `${pct} Genuine Health` })}
                            className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 hover:text-amber-400 font-mono"
                          >
                            {pct}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 98% Genuine Capacity Tested"
                      value={productForm.batteryHealth || ''}
                      onChange={(e) => setProductForm({ ...productForm, batteryHealth: e.target.value })}
                      className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-2.5 py-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Warranty Options (Select or Remove Anytime) */}
                  <div className="sm:col-span-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                      <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Warranty Options (Select or Remove Warranty Anytime for this product)</span>
                      </label>
                      {productForm.warranty === 'No Warranty' || !productForm.warranty ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/70 border border-red-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldOff className="w-3 h-3" />
                          <span>Status: No Warranty (Removed)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Status: {productForm.warranty}</span>
                        </span>
                      )}
                    </div>

                    {/* Quick Preset Buttons for Warranty */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      {/* One-click "No Warranty / Remove Warranty" */}
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            warranty: 'No Warranty',
                            conditionDetails: productForm.conditionDetails
                              ? { ...productForm.conditionDetails, warranty: 'No Warranty Included' }
                              : undefined,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          productForm.warranty === 'No Warranty' || !productForm.warranty
                            ? 'bg-red-950 text-red-300 border-red-500 ring-1 ring-red-500 shadow-sm'
                            : 'bg-[#090D14] text-slate-400 hover:text-red-400 hover:border-red-900 border-slate-800'
                        }`}
                      >
                        <ShieldOff className="w-3.5 h-3.5 text-red-400" />
                        <span>🚫 No Warranty (Remove Warranty)</span>
                      </button>

                      {/* 3 Months */}
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, warranty: '3-Month Revox Warranty' })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          productForm.warranty === '3-Month Revox Warranty'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-[#090D14] text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        3-Month Warranty
                      </button>

                      {/* 6 Months */}
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, warranty: '6-Month Revox Warranty' })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          productForm.warranty === '6-Month Revox Warranty'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                            : 'bg-[#090D14] text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        6-Month Warranty
                      </button>

                      {/* 12 Months Official */}
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            warranty: '12-Month Revox Official Warranty',
                            conditionDetails: productForm.conditionDetails
                              ? {
                                  ...productForm.conditionDetails,
                                  warranty: '12-Month Revox Official Warranty Card Included',
                                }
                              : undefined,
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          productForm.warranty === '12-Month Revox Official Warranty'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold ring-1 ring-emerald-500'
                            : 'bg-[#090D14] text-slate-400 hover:text-emerald-400 border-slate-800'
                        }`}
                      >
                        12-Month Official (Standard)
                      </button>

                      {/* 24 Months Care+ */}
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, warranty: '24-Month Extended Care+' })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                          productForm.warranty === '24-Month Extended Care+'
                            ? 'bg-purple-950 text-purple-300 border-purple-500 font-bold'
                            : 'bg-[#090D14] text-slate-400 hover:text-purple-400 border-slate-800'
                        }`}
                      >
                        24-Month Care+
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. No Warranty or 12-Month Revox Official Warranty"
                        value={productForm.warranty || ''}
                        onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                        className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Note: You can select "No Warranty" or remove warranty at any time for this product or for all products using the bulk toolbar.
                    </span>
                  </div>
                </div>
              </div>

              {/* --- SECTION 4: DYNAMIC VARIANTS BUILDER (RAM, STORAGE, COLOR & INDEPENDENT PRICING) --- */}
              <div className="bg-[#111723] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>4. RAM, Storage & Color Variants (With Individual Pricing)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {productForm.variants?.length || 0} variants configured
                  </span>
                </div>

                {/* Existing Configured Variants List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {(productForm.variants || []).map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-2.5 bg-[#090D14] rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {v.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black shrink-0 shadow-sm"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span className="font-bold text-white">{v.colorName}</span>
                        {v.ram && <span className="text-slate-400 font-medium">· {v.ram} RAM</span>}
                        {v.storage && <span className="text-slate-300 font-semibold">· {v.storage}</span>}
                        {v.serialNumber && (
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                            [{v.serialNumber}]
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400 text-sm">{v.price} SAR</span>
                        <span className="text-slate-500 font-mono text-[11px]">({v.stock || 5} units)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                          title="Remove variant"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Variant Form Row */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Color Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Space Black"
                      value={variantColor}
                      onChange={(e) => setVariantColor(e.target.value)}
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2 py-1.5 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Color Swatch</label>
                    <input
                      type="color"
                      value={variantHex}
                      onChange={(e) => setVariantHex(e.target.value)}
                      className="w-full h-8 bg-[#090D14] border border-slate-800 rounded p-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">RAM (e.g. 16GB)</label>
                    <input
                      type="text"
                      placeholder="e.g. 16GB RAM"
                      value={variantRam}
                      onChange={(e) => setVariantRam(e.target.value)}
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2 py-1.5 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Storage Option</label>
                    <input
                      type="text"
                      placeholder="e.g. 512GB SSD"
                      value={variantStorage}
                      onChange={(e) => setVariantStorage(e.target.value)}
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2 py-1.5 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Variant Price (SAR)</label>
                    <input
                      type="number"
                      placeholder="SAR Price"
                      value={variantPrice}
                      onChange={(e) => setVariantPrice(Number(e.target.value))}
                      className="w-full bg-[#090D14] border border-slate-800 rounded px-2 py-1.5 text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                    >
                      + Add Variant
                    </button>
                  </div>
                </div>
              </div>

              {/* --- SECTION 5: MEDIA UPLOAD (MULTI-IMAGE GALLERIES) --- */}
              <div className="bg-[#111723] p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-amber-400 uppercase text-[11px] tracking-wider block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>5. Multi-Image Gallery & Variant-Specific Media Upload</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button (Multiple Images Supported) */}
                  <label className="p-3 bg-[#090D14] border border-dashed border-slate-700 hover:border-amber-500 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors text-slate-300 hover:text-white">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs">Upload Multiple Images from Device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultiImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Direct Image URL input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={directImageUrlInput}
                      onChange={(e) => setDirectImageUrlInput(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddDirectImageUrl}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Multi-Image Gallery Grid Preview */}
                {(productForm.galleryImages && productForm.galleryImages.length > 0) && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Gallery Images ({productForm.galleryImages.length} attached) · Click "Set Primary Cover" to select primary photo
                    </span>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {productForm.galleryImages.map((imgUrl, idx) => {
                        const isPrimary = productForm.image === imgUrl;
                        return (
                          <div
                            key={idx}
                            className={`relative aspect-square rounded-lg overflow-hidden bg-black border ${
                              isPrimary ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                            } group`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Primary Badge */}
                            {isPrimary && (
                              <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-bold text-[8px] px-1 rounded shadow">
                                Cover
                              </span>
                            )}

                            {/* Quick Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(imgUrl)}
                                  className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold w-full truncate"
                                >
                                  Make Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(imgUrl)}
                                className="px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-bold w-full"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Bottom Actions */}
              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingProduct ? 'Update Product & Inventory' : 'Save & Publish Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          cms={cms}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

    </div>
  );
};
