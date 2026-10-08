import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useStore, StoreProvider } from './context/StoreContext';
import { FreeShippingBanner } from './components/FreeShippingBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductConditionGuide } from './components/ProductConditionGuide';
import { ShareModal } from './components/ShareModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminPanel } from './components/AdminPanel';
import { NotificationToast } from './components/NotificationToast';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { RevoxLogo } from './components/RevoxLogo';
import { Product, Order } from './types';
import { isAdminDeviceBanned } from './utils/adminSecurity';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Sparkles,
  Package,
} from 'lucide-react';

function RevoxAppContent() {
  const {
    products,
    orders,
    cart,
    cms,
    currentUser,
    notifications,
    customerLogin,
    customerLogout,
    saveCustomerAddress,
    deleteCustomerAddress,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    createOrder,
    updateOrderStatus,
    approvePayment,
    updateTracking,
    deleteOrder,
    uploadOrderReceipt,
    saveProduct,
    deleteProduct,
    updateCMS,
    dismissNotification,
  } = useStore();

  // Navigation and Modal States
  const [currentView, setCurrentView] = useState<'store' | 'tracking'>('store');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [conditionProduct, setConditionProduct] = useState<Product | null>(null);
  const [isConditionGuideOpen, setIsConditionGuideOpen] = useState<boolean>(false);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState<boolean>(false);
  const [customerAuthReason, setCustomerAuthReason] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminBanned, setIsAdminBanned] = useState<boolean>(() => isAdminDeviceBanned());
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');

  useEffect(() => {
    const handleAdminSecurityUpdate = () => {
      const banned = isAdminDeviceBanned();
      setIsAdminBanned(banned);
      if (banned) {
        setIsAdminOpen(false);
      }
    };
    window.addEventListener('revox_admin_security_changed', handleAdminSecurityUpdate);
    window.addEventListener('storage', handleAdminSecurityUpdate);
    return () => {
      window.removeEventListener('revox_admin_security_changed', handleAdminSecurityUpdate);
      window.removeEventListener('storage', handleAdminSecurityUpdate);
    };
  }, []);

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenShare = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${product.name} - Revox Certified Refurbished`,
          text: `Check out ${product.name} (${product.condition}) on Revox KSA for ${product.price.toLocaleString()} SAR with 12-Month Official Warranty!`,
          url: `${window.location.origin}/?product=${product.id}`,
        })
        .catch(() => {
          // If cancelled or rejected, open custom share sheet modal
          setShareProduct(product);
          setIsShareModalOpen(true);
        });
    } else {
      setShareProduct(product);
      setIsShareModalOpen(true);
    }
  };

  const handleOpenTrackingWithOrder = (orderId?: string) => {
    if (orderId) setTrackingOrderId(orderId);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (newOrder: Order) => {
    createOrder(newOrder);
    setTrackingOrderId(newOrder.id);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    setCurrentView('store');
    const catalogElem = document.getElementById('catalog-section');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openCustomerAuthWithPrompt = (reason?: string) => {
    setCustomerAuthReason(reason || '');
    setIsCustomerAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-['Poppins',Inter,system-ui,-apple-system,sans-serif]">
      
      {/* 1. Top Announcement Bar */}
      <FreeShippingBanner announcementText={cms.announcementText} />

      {/* 2. Top Navigation Bar (Strict 3-zone contract) */}
      <Navbar
        cartCount={cartTotalCount}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => handleOpenTrackingWithOrder()}
        onOpenAdmin={() => {
          if (!isAdminBanned) setIsAdminOpen(true);
        }}
        onOpenCustomerAuth={() => openCustomerAuthWithPrompt()}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentView !== 'store') setCurrentView('store');
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'store') setCurrentView('store');
        }}
        onOpenConditionGuide={() => {
          setConditionProduct(null);
          setIsConditionGuideOpen(true);
        }}
      />

      {/* 3. Main View Switcher */}
      <main className="flex-1">
        {currentView === 'store' ? (
          <>
            {/* Hero Slider & Square Category Grid Layout */}
            <HeroSection
              cms={cms}
              onExplore={scrollToCatalog}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                scrollToCatalog();
              }}
              activeCategory={selectedCategory}
            />

            {/* Product Catalog with Pagination & Condition badge links */}
            <ProductCatalog
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, e) => {
                e.stopPropagation();
                addToCart(p, 1);
                setIsCartOpen(true);
              }}
              onOpenCondition={(p, e) => {
                e.stopPropagation();
                setConditionProduct(p);
                setIsConditionGuideOpen(true);
              }}
              onOpenConditionGuide={() => {
                setConditionProduct(null);
                setIsConditionGuideOpen(true);
              }}
              onShareProduct={handleOpenShare}
            />

            {/* Compact Info Section: Arranged into TWO COLUMNS SIDE-BY-SIDE with shortened text */}
            <section className="py-4 sm:py-5 border-t border-slate-200 bg-[#F1F5F9]/60">
              <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  
                  {/* Slim Box 1: Local Payments */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-1.5 hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                          <CreditCard className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                            Local Payments
                          </h4>
                          <span className="text-[9px] text-cyan-700 font-semibold block truncate">
                            0 SAR Shipping
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                        Instant QR
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[8px] sm:text-[9px]">
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-blue-700 font-bold">
                        Al Rajhi
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-amber-700 font-bold">
                        STC Pay
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-emerald-700 font-bold">
                        Barq Pay
                      </div>
                    </div>
                  </div>

                  {/* Slim Box 2: Fast Delivery */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-1.5 hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                          <Truck className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                            Delivery: 5–7 Days
                          </h4>
                          <span className="text-[9px] text-slate-500 font-medium block truncate">
                            Across All KSA Cities
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenTrackingWithOrder()}
                        className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-700 text-[8px] sm:text-[9px] font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Track →
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[8px] sm:text-[9px]">
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-emerald-700 font-medium">
                        Verified
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-blue-700 font-medium">
                        Packed
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-cyan-700 font-medium">
                        Shipped
                      </div>
                    </div>
                  </div>

                  {/* Slim Box 3: 12M Warranty */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-1.5 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                            12M Warranty
                          </h4>
                          <span className="text-[9px] text-emerald-700 font-semibold block truncate">
                            Official Revox Cover
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                        Included
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[8px] sm:text-[9px]">
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-emerald-700 font-medium">
                        Hardware
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-amber-700 font-medium">
                        Battery
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-blue-700 font-medium">
                        Swap/Repair
                      </div>
                    </div>
                  </div>

                  {/* Slim Box 4: 7-Days Return */}
                  <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-1.5 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                          <RotateCcw className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#0F172A] leading-tight truncate">
                            7-Days Return
                          </h4>
                          <span className="text-[9px] text-purple-700 font-medium block truncate">
                            100% Money-Back
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200 shrink-0">
                        Zero Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[8px] sm:text-[9px]">
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-purple-700 font-medium">
                        Free Pickup
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-emerald-700 font-medium">
                        Full Refund
                      </div>
                      <div className="p-1 rounded bg-slate-50 border border-slate-200/80 truncate text-cyan-700 font-medium">
                        Certified
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </>
        ) : (
          <OrderTrackingView
            orders={orders}
            initialOrderId={trackingOrderId}
            onBackToStore={() => setCurrentView('store')}
            onUpdateOrderReceipt={uploadOrderReceipt}
          />
        )}
      </main>

      {/* 4. Space-Saving Two-Column Footer & Information Layout */}
      <footer className="bg-white border-t border-slate-200 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
          
          {/* Main Footer: Arranged into TWO COLUMNS SIDE-BY-SIDE */}
          <div className="grid grid-cols-2 gap-3 sm:gap-8">
            
            {/* Left Column: Brand, Categories & Account Links */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <RevoxLogo size="sm" showTagline={false} />
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  Saudi Arabia's trusted destination for certified refurbished tech · 12-Month Official Warranty.
                </p>
                <div className="text-[10px] text-cyan-700 font-semibold flex items-center gap-1">
                  <Truck className="w-3 h-3 shrink-0 text-cyan-600" />
                  <span>0 SAR Shipping on Advance Pay</span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900">
                  Categories
                </h4>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>
                    <button onClick={() => { setSelectedCategory('iPhones'); scrollToCatalog(); }} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      Refurbished iPhones
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('Laptops'); scrollToCatalog(); }} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      MacBook & Laptops
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('Samsung'); scrollToCatalog(); }} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      Samsung Galaxy Ultra
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('Cameras'); scrollToCatalog(); }} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      Sony Alpha Cameras
                    </button>
                  </li>
                  <li>
                    <button onClick={() => { setSelectedCategory('Chargers'); scrollToCatalog(); }} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      GaN Chargers & Audio
                    </button>
                  </li>
                </ul>
              </div>

              {/* Customer Services */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer Services
                </h4>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>
                    <button
                      onClick={() => {
                        setConditionProduct(null);
                        setIsConditionGuideOpen(true);
                      }}
                      className="text-emerald-700 hover:text-emerald-800 transition-colors text-left truncate w-full block font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Product Condition Guide</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleOpenTrackingWithOrder()} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      Track My Order
                    </button>
                  </li>
                  <li>
                    <button onClick={() => openCustomerAuthWithPrompt()} className="hover:text-cyan-700 transition-colors text-left truncate w-full block">
                      {currentUser ? currentUser.fullName : 'Customer Account Login'}
                    </button>
                  </li>
                  {!isAdminBanned && (
                    <li>
                      <button onClick={() => setIsAdminOpen(true)} className="text-slate-600 hover:text-cyan-700 hover:underline text-left truncate w-full block font-medium">
                        Admin Portal (Staff Login)
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Support, Contacts, Bank & Verified Details */}
            <div className="space-y-4">
              
              {/* Direct Support */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer Support
                </h4>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-cyan-600 shrink-0" />
                    <a href={`tel:${cms.supportPhone}`} className="hover:text-cyan-700 font-mono truncate">
                      {cms.supportPhone}
                    </a>
                  </li>
                  <li className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-cyan-600 shrink-0" />
                    <a href={`mailto:${cms.supportEmail}`} className="hover:text-cyan-700 font-mono truncate">
                      {cms.supportEmail}
                    </a>
                  </li>
                  <li className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-cyan-600 shrink-0" />
                    <span className="truncate">Riyadh Hub, KSA</span>
                  </li>
                  <li className="flex items-center gap-1.5 truncate pt-0.5">
                    <a
                      href={cms.tiktokUrl || 'https://www.tiktok.com/@revox.ksa.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] tracking-wide transition-all hover:scale-105 shadow-xs"
                      title="Follow Revox KSA on TikTok"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-cyan-400">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.4a6.33 6.33 0 0 0-6.33 6.34 6.34 6.34 0 0 0 10.83 4.46A6.29 6.29 0 0 0 15.82 15V8.58a8.28 8.28 0 0 0 4.77 1.52V6.65a4.81 4.81 0 0 1-1-.04v.08z" />
                      </svg>
                      <span>TikTok: @revox.ksa.com</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Verified Local Payments & Bank Info */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900">
                  Bank & Payment Methods
                </h4>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1 text-slate-700">
                  <div className="flex items-center justify-between text-slate-900 font-semibold">
                    <span>Al Rajhi Transfer</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">0 SAR Ship</span>
                  </div>
                  <div className="text-slate-600 truncate">
                    Beneficiary: <span className="text-slate-900 font-medium">{cms.alRajhiDetails.accountName}</span>
                  </div>
                  <div className="text-slate-600 truncate">
                    IBAN: <span className="font-mono text-slate-900">{cms.alRajhiDetails.iban}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Al Rajhi Bank</span>
                    <span>·</span>
                    <span>STC Pay</span>
                    <span>·</span>
                    <span>Barq Pay</span>
                  </div>
                </div>
              </div>

              {/* Policy Badges & Condition Guide Quick Trigger */}
              <button
                type="button"
                onClick={() => {
                  setConditionProduct(null);
                  setIsConditionGuideOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] text-emerald-800 font-medium flex items-center justify-between transition-colors cursor-pointer text-left"
                title="View Product Condition Guide"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>12M Warranty · 3 Condition Tiers</span>
                </div>
                <span className="text-[9px] underline font-semibold text-emerald-700">Guide ➔</span>
              </button>

            </div>

          </div>

          {/* Bottom Copyright & Channels Strip */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} Revox Technologies KSA. All rights reserved.</p>
            <div className="flex items-center gap-2 text-[10px] flex-wrap justify-center">
              <span>Al Rajhi Bank</span>
              <span>·</span>
              <span>STC Pay</span>
              <span>·</span>
              <span>Barq Pay</span>
              <span>·</span>
              <a
                href={cms.tiktokUrl || 'https://www.tiktok.com/@revox.ksa.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-800 hover:text-cyan-700 underline flex items-center gap-1"
                title="TikTok Official Profile"
              >
                <span>TikTok @revox.ksa.com</span>
                <span className="text-[9px]">↗</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* 5. Modals & Overlays */}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenConditionModal={(p) => {
          setConditionProduct(p);
          setIsConditionGuideOpen(true);
        }}
        onShareProduct={handleOpenShare}
        onAddToCart={(product, qty, color, storage, ram, price) => {
          addToCart(product, qty, color, storage, ram, price);
          setIsCartOpen(true);
        }}
        onBuyNow={(product, qty, color, storage, ram, price) => {
          addToCart(product, qty, color, storage, ram, price);
          if (!currentUser) {
            openCustomerAuthWithPrompt('Please sign in or create an account to proceed to checkout.');
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Product Share Sheet Modal */}
      <ShareModal
        product={shareProduct}
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareProduct(null);
        }}
      />

      {/* Professional Product Condition Guide Modal */}
      <ProductConditionGuide
        isOpen={isConditionGuideOpen}
        onClose={() => {
          setIsConditionGuideOpen(false);
          setConditionProduct(null);
        }}
        product={conditionProduct}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsConditionGuideOpen(false);
        }}
      />

      {/* Customer Account & Authentication Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        currentUser={currentUser}
        orders={orders}
        onLogin={customerLogin}
        onLogout={customerLogout}
        onSaveAddress={saveCustomerAddress}
        onDeleteAddress={deleteCustomerAddress}
        onOpenTracking={handleOpenTrackingWithOrder}
        redirectReason={customerAuthReason}
      />

      {/* Slide-Over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!currentUser) {
            openCustomerAuthWithPrompt('Please sign in or create an account to proceed to checkout.');
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {/* Checkout Modal with Saudi Address & Payment Form */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        cms={cms}
        currentUser={currentUser}
        onOpenCustomerAuth={openCustomerAuthWithPrompt}
        onOrderCreated={handleOrderCreated}
      />

      {/* Comprehensive Admin Panel (Guarded against locked out devices) */}
      {isAdminOpen && !isAdminBanned && (
        <AdminPanel
          orders={orders}
          products={products}
          cms={cms}
          onUpdateOrderStatus={updateOrderStatus}
          onApprovePayment={approvePayment}
          onUpdateTracking={updateTracking}
          onDeleteOrder={deleteOrder}
          onSaveProduct={saveProduct}
          onDeleteProduct={deleteProduct}
          onUpdateCMS={updateCMS}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Automated Real-time Order Push Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
        onOpenOrder={(orderId) => handleOpenTrackingWithOrder(orderId)}
      />

      {/* Floating WhatsApp Contact Button */}
      <WhatsAppFloatingButton phoneNumber={cms.supportPhone} />

    </div>
  );
}

export default function App() {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={mapsApiKey}>
      <StoreProvider>
        <RevoxAppContent />
      </StoreProvider>
    </APIProvider>
  );
}
