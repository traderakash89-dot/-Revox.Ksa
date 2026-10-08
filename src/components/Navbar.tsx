import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, ShieldCheck, Truck, Menu, X, ArrowRight, User } from 'lucide-react';
import { RevoxLogo } from './RevoxLogo';
import { CustomerUser } from '../types';
import { isAdminDeviceBanned } from '../utils/adminSecurity';

interface NavbarProps {
  cartCount: number;
  currentUser: CustomerUser | null;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  onOpenCustomerAuth: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenConditionGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  currentUser,
  onOpenCart,
  onOpenTracking,
  onOpenAdmin,
  onOpenCustomerAuth,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onOpenConditionGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isBanned, setIsBanned] = useState<boolean>(() => isAdminDeviceBanned());

  useEffect(() => {
    const handleSecurityChange = () => {
      setIsBanned(isAdminDeviceBanned());
    };
    window.addEventListener('revox_admin_security_changed', handleSecurityChange);
    window.addEventListener('storage', handleSecurityChange);
    return () => {
      window.removeEventListener('revox_admin_security_changed', handleSecurityChange);
      window.removeEventListener('storage', handleSecurityChange);
    };
  }, []);

  const navCategories = [
    { label: 'All Products', value: 'all' },
    { label: 'iPhones', value: 'iPhones' },
    { label: 'Laptops', value: 'Laptops' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Cameras', value: 'Cameras' },
    { label: 'Chargers', value: 'Chargers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ZONE 1: Single brand wordmark element */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectCategory('all')}
              className="flex items-center focus:outline-none text-left cursor-pointer"
            >
              <RevoxLogo size="md" showTagline={false} />
            </button>
          </div>

          {/* ZONE 2: 4-6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navCategories.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onSelectCategory(item.value);
                  setMobileMenuOpen(false);
                }}
                className={`transition-colors py-1 relative hover:text-[#0F172A] cursor-pointer ${
                  selectedCategory === item.value
                    ? 'text-cyan-600 font-bold'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
                {selectedCategory === item.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 rounded-full" />
                )}
              </button>
            ))}
            
            {onOpenConditionGuide && (
              <button
                onClick={onOpenConditionGuide}
                className="hover:text-emerald-600 text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                title="Product Condition Guide"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Condition Guide</span>
              </button>
            )}

            <button
              onClick={onOpenTracking}
              className="hover:text-cyan-600 text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* ZONE 3: 1-2 primary actions + Customer Account & Admin */}
          <div className="flex items-center gap-2.5">
            {/* Search Input on Desktop */}
            <div className="relative hidden md:block w-44 lg:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search iPhone, MacBook..."
                className="w-full bg-slate-100 border border-slate-200 text-xs text-slate-900 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:bg-white focus:border-cyan-500 transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Customer Account Button */}
            <button
              onClick={onOpenCustomerAuth}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                currentUser
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
              title={currentUser ? `Signed in as ${currentUser.fullName}` : 'Sign In / Register'}
            >
              <User className="w-4 h-4 text-cyan-600" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-colors hover:border-cyan-500/50 cursor-pointer shadow-xs"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono font-black text-xs rounded-full flex items-center justify-center px-1 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Control Room Entry (Hidden if permanently locked out) */}
            {!isBanned && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all cursor-pointer"
                title="Restricted Admin Login"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>Admin</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {searchOpen && (
          <div className="md:hidden py-2 border-t border-slate-200 animate-in slide-in-from-top-2 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search refurbished tech..."
                className="w-full bg-slate-100 border border-slate-200 text-sm text-slate-900 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:bg-white focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Mobile Slide Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-2 animate-in fade-in duration-200 bg-white">
            {navCategories.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onSelectCategory(item.value);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === item.value
                    ? 'bg-cyan-50 text-cyan-700 font-bold border-l-2 border-cyan-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            ))}

            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenCustomerAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-cyan-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-cyan-600" />
                <span>{currentUser ? `Account: ${currentUser.fullName}` : 'Sign In / Register Customer Account'}</span>
              </button>

              {onOpenConditionGuide && (
                <button
                  onClick={() => {
                    onOpenConditionGuide();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-emerald-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Product Condition Guide</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenTracking();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-cyan-600" />
                <span>Track Your Order (5-7 Days Delivery)</span>
              </button>

              {!isBanned && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>Admin Room (Staff Login)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
