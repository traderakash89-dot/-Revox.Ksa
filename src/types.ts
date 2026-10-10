export type OrderStatus =
  | 'pending_payment_approval' // "Waiting Confirmation" for Advance Payment / 50 SAR COD Advance
  | 'processing'               // "Processing / Packed" (Admin approved payment)
  | 'shipped'                  // "Shipped" (Admin inputs tracking number & courier)
  | 'out_for_delivery'         // "Out for Delivery" (Local courier en route)
  | 'delivered';               // "Delivered" (5-7 business days)

export type TransferChannel = 'al_rajhi' | 'stc_pay' | 'barq';

export type PaymentType = 'full_advance' | 'cod_partial';

export type ConditionGrade = 'Excellent' | 'Very Good' | 'Good';
export type ChargerOption = 'Original Charger Included' | 'Compatible Charger Included' | 'Charger Not Included';
export type FunctionalStatusOption = 'Fully Tested & Working' | 'Working with Minor Issue' | 'See Product Description';
export type IncludedItemOption = 'Device' | 'Original Charger' | 'Compatible Charger' | 'Charging Cable' | 'Box' | 'Accessories' | 'Other';

export interface ProductVariant {
  id?: string;
  storage?: string;           // e.g. "128GB", "256GB", "512GB", "1TB", "16GB RAM / 512GB SSD"
  ram?: string;               // e.g. "8GB", "16GB", "32GB"
  colorName: string;          // e.g. "Natural Titanium", "Space Black"
  colorHex: string;           // e.g. "#9E9A93"
  price: number;              // Specific price for this variant
  originalPrice?: number;
  stock?: number;
  image?: string;             // Variant-specific picture
  serialNumber?: string;      // Variant unique serial number
}

export interface Product {
  id: string;
  name: string;
  category: 'Laptops' | 'iPhones' | 'Mobiles' | 'Chargers' | 'Samsung' | 'Cameras' | 'Accessories' | 'Audio' | string;
  condition: string;          // e.g. "Excellent", "Very Good", "Good"
  conditionGrade?: ConditionGrade; // 'Excellent' | 'Very Good' | 'Good'
  charger?: ChargerOption;    // 'Original Charger Included' | 'Compatible Charger Included' | 'Charger Not Included'
  whatsIncluded?: string[];   // ['Device', 'Original Charger', 'Charging Cable', 'Box']
  cosmeticNotes?: string;     // e.g. "Minor signs of use on the bottom panel."
  functionalStatus?: FunctionalStatusOption; // 'Fully Tested & Working'
  conditionDetails?: {
    grade: string;            // "Excellent"
    screen: string;           // "Zero scratches, 100% genuine OLED"
    body: string;             // "Pristine titanium/aluminum casing, ultrasound sanitized"
    batteryHealth: string;    // "94% Genuine Health Tested"
    hardwareTest: string;     // "100-point diagnostic certified"
    warranty: string;         // "12-Month Revox Official Warranty"
  };
  batteryHealth?: string;     // e.g. "94%"
  warranty: string;           // e.g. "12-Month Revox Official Warranty"
  serialNumber?: string;      // Unique Serial Number / IMEI tracking for refurbished items
  sku?: string;               // SKU code
  price: number;              // Base price in SAR
  originalPrice: number;      // Original price before refurbishment discount
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  galleryImages: string[];
  description: string;
  specs: Record<string, string>;
  variants: ProductVariant[];
  featured?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;              // Saudi phone e.g. 0508520173 or +966508520173
  email?: string;
  city: string;               // e.g. Riyadh, Jeddah, Dammam, Mecca, Medina
  district: string;           // e.g. Al Olaya, Al Malaz, Al Rawdah
  street: string;
  buildingNumber: string;     // Building or Villa Number
  postalCode?: string;
  deliveryNotes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedRam?: string;
  unitPrice: number;
}

export interface OrderCheckpoint {
  title: string;
  timestamp: string;
  description: string;
  location: string;
  completed: boolean;
}

export interface Order {
  id: string;                   // e.g. RVX-89412-SA
  createdAt: string;
  customer: CustomerAddress;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;          // 0 SAR for Full Advance
  total: number;
  
  // Payment Classification (Full Advance vs COD with 50 SAR Advance)
  paymentType: PaymentType;     // 'full_advance' | 'cod_partial'
  transferChannel: TransferChannel; // 'al_rajhi' | 'stc_pay' | 'barq'
  advancePaidAmount: number;    // 50 SAR for COD, or total for full advance
  remainingBalanceCod: number;  // (total - 50 SAR) collected on delivery for COD, or 0 for full advance
  status: OrderStatus;
  
  // Payment Verification Fields (Al Rajhi, STC Pay, Barq Pay)
  paymentReceiptImage?: string; // Base64 data URL or uploaded image URL
  transactionReference?: string;
  paymentApprovedAt?: string;
  paymentNotes?: string;

  // Courier & Tracking details
  courierName?: string;         // e.g. "Revox Express Courier", "SMSA Express", "Aramex"
  trackingNumber?: string;      // e.g. "RVX-TRK-98412-KSA"
  shippedAt?: string;
  estimatedDeliveryDate: string;// "5-7 Business Days"
  currentLocationName?: string; // Current transit hub e.g. "Riyadh Central Sorting Facility"
  checkpoints: OrderCheckpoint[];
  userId?: string;              // Linked customer account ID
}

export interface CustomerUser {
  id: string;
  fullName: string;
  emailOrPhone: string;
  authType: 'mobile' | 'email';
  phone: string;
  email?: string;
  savedAddress?: CustomerAddress;
  savedAddresses?: CustomerAddress[];
  createdAt: string;
}

export interface CMSConfig {
  announcementText: string;
  heroHeadline: string;
  heroSubheadline: string;
  freeShippingNote: string;
  supportPhone: string;
  supportEmail: string;
  storeAddress?: string;
  tiktokUrl?: string;
  alRajhiDetails: {
    accountName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
  stcPayDetails: {
    accountName: string;
    mobileNumber: string;
  };
  barqPayDetails: {
    accountName: string;
    mobileNumber: string;
  };
  // Dynamic Product Banner Configuration
  dynamicBannerConfig?: {
    enabled: boolean;          // Enable/Disable switch
    published: boolean;        // Publish/Unpublish switch
    productIds: string[];      // Array of selected product IDs in display order
    autoplaySpeed?: number;    // e.g. 5000ms
  };
}

export interface AdminUser {
  email: string;
  token: string;
  name: string;
  role: 'super_admin';
  deviceId?: string;
  deviceName?: string;
  lastLoginAt?: string;
}

export interface PushNotification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: OrderStatus;
}
