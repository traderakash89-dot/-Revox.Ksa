import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogIn,
  UserPlus,
  MapPin,
  Plus,
  Trash2,
  Package,
  Truck,
  Clock,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { CustomerUser, CustomerAddress, Order } from '../types';
import { GoogleMapsLocationPicker } from './GoogleMapsLocationPicker';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerUser | null;
  orders?: Order[];
  onLogin: (user: CustomerUser) => void;
  onLogout: () => void;
  onSaveAddress?: (address: CustomerAddress) => void;
  onDeleteAddress?: (index: number) => void;
  onOpenTracking?: (orderId: string) => void;
  redirectReason?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  orders = [],
  onLogin,
  onLogout,
  onSaveAddress,
  onDeleteAddress,
  onOpenTracking,
  redirectReason,
}) => {
  if (!isOpen) return null;

  // Active Tab for Logged In Customer Profile
  const [profileTab, setProfileTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Auth Modes for logged out state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authType, setAuthType] = useState<'mobile' | 'email'>('mobile');

  // Form states for login/signup - completely clean and empty (no dummy defaults)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Address Form States
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrBldg, setNewAddrBldg] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  // Get user's orders
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.customer.phone === currentUser.phone ||
          (currentUser.email && o.customer.email === currentUser.email)
      )
    : [];

  // Saved addresses list
  const userAddresses: CustomerAddress[] = currentUser
    ? currentUser.savedAddresses || (currentUser.savedAddress ? [currentUser.savedAddress] : [])
    : [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const identifier = authType === 'mobile' ? phone.trim() : email.trim();
    if (!identifier) {
      setErrorMsg(`Please enter your ${authType === 'mobile' ? 'mobile number' : 'email address'}.`);
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    let storedUsers: CustomerUser[] = [];
    try {
      const saved = localStorage.getItem('revox_customer_users');
      if (saved) storedUsers = JSON.parse(saved);
    } catch {}

    let matchedUser = storedUsers.find(
      (u) =>
        u.emailOrPhone.toLowerCase() === identifier.toLowerCase() ||
        u.phone === identifier ||
        u.email?.toLowerCase() === identifier.toLowerCase()
    );

    if (!matchedUser) {
      matchedUser = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim() || (authType === 'mobile' ? 'Customer ' + identifier.slice(-4) : identifier.split('@')[0]),
        emailOrPhone: identifier,
        authType,
        phone: authType === 'mobile' ? identifier : '05' + Math.floor(10000000 + Math.random() * 90000000),
        email: authType === 'email' ? identifier : undefined,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      storedUsers.push(matchedUser);
      localStorage.setItem('revox_customer_users', JSON.stringify(storedUsers));
    }

    onLogin(matchedUser);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full customer name.');
      return;
    }

    const identifier = authType === 'mobile' ? phone.trim() : email.trim();
    if (!identifier) {
      setErrorMsg(`Please enter your ${authType === 'mobile' ? 'Saudi mobile number' : 'Gmail / Email'}.`);
      return;
    }

    if (authType === 'mobile' && !phone.match(/^(05|\+9665|9665)\d{8}$/)) {
      setErrorMsg('Please enter a valid Saudi mobile number (e.g. 0508520173).');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    let storedUsers: CustomerUser[] = [];
    try {
      const saved = localStorage.getItem('revox_customer_users');
      if (saved) storedUsers = JSON.parse(saved);
    } catch {}

    const newUser: CustomerUser = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      emailOrPhone: identifier,
      authType,
      phone: authType === 'mobile' ? identifier : phone.trim() || '',
      email: authType === 'email' ? identifier : email.trim() || undefined,
      savedAddresses: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    storedUsers.push(newUser);
    localStorage.setItem('revox_customer_users', JSON.stringify(storedUsers));

    onLogin(newUser);
  };

  const handleAddNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrCity || !newAddrDistrict || !newAddrStreet) {
      alert('Please fill City, District, and Street Address.');
      return;
    }

    const newAddr: CustomerAddress = {
      fullName: newAddrName || currentUser?.fullName || '',
      phone: newAddrPhone || currentUser?.phone || '',
      city: newAddrCity,
      district: newAddrDistrict,
      street: newAddrStreet,
      buildingNumber: newAddrBldg || 'Villa / Apt',
      deliveryNotes: newAddrNotes || undefined,
    };

    if (onSaveAddress) {
      onSaveAddress(newAddr);
    }

    setIsAddingAddress(false);
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrCity('');
    setNewAddrDistrict('');
    setNewAddrStreet('');
    setNewAddrBldg('');
    setNewAddrNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0E1522] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-5 my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                {currentUser ? 'Customer Profile & Dashboard' : authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? `Logged in as ${currentUser.fullName}`
                  : 'Sign in to access your orders, track shipments & saved addresses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Redirect Notice (e.g. from checkout) */}
        {redirectReason && !currentUser && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{redirectReason}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. LOGGED-IN CUSTOMER DEDICATED PROFILE DASHBOARD */}
        {/* ======================================================== */}
        {currentUser ? (
          <div className="space-y-4 text-xs">
            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-[#090D14] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setProfileTab('profile')}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'profile'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileTab('addresses')}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'addresses'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Addresses ({userAddresses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileTab('orders')}
                className={`flex-1 py-2 text-center rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  profileTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders ({userOrders.length})</span>
              </button>
            </div>

            {/* TAB 1: Profile Details */}
            {profileTab === 'profile' && (
              <div className="space-y-3">
                <div className="p-4 bg-[#111723] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Customer Full Name</span>
                    <span className="font-bold text-white text-sm">{currentUser.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Registered Phone</span>
                    <span className="font-mono text-amber-400 font-semibold">{currentUser.phone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Email Address</span>
                    <span className="font-mono text-slate-200">{currentUser.email || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Membership Date</span>
                    </span>
                    <span className="text-slate-300 font-mono">{currentUser.createdAt || 'Recent'}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Authenticated Account: All your orders and warranty rights are secured with Revox.</span>
                </div>
              </div>
            )}

            {/* TAB 2: Multiple Saved Addresses */}
            {profileTab === 'addresses' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold text-xs">Manage Delivery Addresses</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingAddress ? 'Cancel' : 'Add New Address'}</span>
                  </button>
                </div>

                {/* Add New Address Form Modal/Section */}
                {isAddingAddress && (
                  <form onSubmit={handleAddNewAddressSubmit} className="p-4 bg-[#090D14] border border-amber-500/40 rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Add Saudi Delivery Location</span>
                      </span>
                      <GoogleMapsLocationPicker
                        onLocationSelect={(loc) => {
                          if (loc.city) setNewAddrCity(loc.city);
                          if (loc.district) setNewAddrDistrict(loc.district);
                          if (loc.street) setNewAddrStreet(loc.street);
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Contact Name</label>
                        <input
                          type="text"
                          value={newAddrName}
                          onChange={(e) => setNewAddrName(e.target.value)}
                          placeholder={currentUser.fullName}
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Mobile Phone</label>
                        <input
                          type="tel"
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value)}
                          placeholder={currentUser.phone}
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">City *</label>
                        <input
                          type="text"
                          required
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          placeholder="e.g. Riyadh"
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">District *</label>
                        <input
                          type="text"
                          required
                          value={newAddrDistrict}
                          onChange={(e) => setNewAddrDistrict(e.target.value)}
                          placeholder="e.g. Al Olaya"
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Street Address *</label>
                        <input
                          type="text"
                          required
                          value={newAddrStreet}
                          onChange={(e) => setNewAddrStreet(e.target.value)}
                          placeholder="King Fahd Rd"
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Building / Villa No.</label>
                        <input
                          type="text"
                          value={newAddrBldg}
                          onChange={(e) => setNewAddrBldg(e.target.value)}
                          placeholder="Tower 3, Apt 12"
                          className="w-full bg-[#111723] border border-slate-700 rounded px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                    >
                      Save Address to Profile
                    </button>
                  </form>
                )}

                {/* List of Existing Saved Addresses */}
                {userAddresses.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 bg-[#111723] rounded-xl border border-slate-800 space-y-1">
                    <MapPin className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">No saved addresses yet</p>
                    <p className="text-[11px]">Add your home or office address to speed up checkout.</p>
                  </div>
                ) : (
                  userAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#111723] rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{addr.fullName || currentUser.fullName}</span>
                          <span className="font-mono text-amber-400 text-[11px]">({addr.phone || currentUser.phone})</span>
                        </div>
                        <p className="text-slate-300">
                          {addr.buildingNumber ? `${addr.buildingNumber}, ` : ''}{addr.street}, {addr.district}, {addr.city}
                        </p>
                        {addr.deliveryNotes && (
                          <p className="text-[11px] text-slate-500 italic">Note: {addr.deliveryNotes}</p>
                        )}
                      </div>

                      {onDeleteAddress && (
                        <button
                          type="button"
                          onClick={() => onDeleteAddress(idx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Real-Time Order History List with Tracking */}
            {profileTab === 'orders' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {userOrders.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-[#111723] rounded-xl border border-slate-800 space-y-1.5">
                    <Package className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-300">No Orders Found</p>
                    <p className="text-[11px]">You haven't placed any orders with this account yet.</p>
                  </div>
                ) : (
                  userOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      pending_payment_approval: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                      shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                      out_for_delivery: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
                      delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    };

                    const statusLabels: Record<string, string> = {
                      pending_payment_approval: 'Pending Approval',
                      processing: 'Processing / Packed',
                      shipped: 'Shipped',
                      out_for_delivery: 'Out for Delivery',
                      delivered: 'Delivered',
                    };

                    return (
                      <div
                        key={order.id}
                        className="p-3.5 bg-[#111723] rounded-xl border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-400">{order.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              statusColors[order.status] || 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300 text-[11px]">
                          <span>{order.items.length} Item(s) · {order.items[0]?.product.name || 'Device'}</span>
                          <span className="font-mono font-bold text-white">{order.total.toLocaleString()} SAR</span>
                        </div>

                        {order.trackingNumber && (
                          <div className="p-2 bg-[#090D14] rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Truck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Tracking: <strong className="font-mono text-cyan-300">{order.trackingNumber}</strong></span>
                            </div>
                            {order.courierName && (
                              <span className="text-slate-400 text-[10px]">{order.courierName}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-500">{order.createdAt.slice(0, 16).replace('T', ' ')}</span>
                          {onOpenTracking && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenTracking(order.id);
                                onClose();
                              }}
                              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <span>Live Tracking</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Logout and Continue buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Close & Shop
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. LOGGED-OUT: CLEAN SIGN IN & CREATE ACCOUNT FORMS */
          /* ======================================================== */
          <div className="space-y-4 text-xs">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#090D14] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`py-2 text-center rounded-lg font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`py-2 text-center rounded-lg font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Method Toggle: Mobile vs Email */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 border-b border-slate-800 pb-2.5">
              <button
                type="button"
                onClick={() => setAuthType('mobile')}
                className={`flex items-center gap-1.5 pb-1 transition-colors cursor-pointer ${
                  authType === 'mobile'
                    ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                    : 'hover:text-slate-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Saudi Mobile</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthType('email')}
                className={`flex items-center gap-1.5 pb-1 transition-colors cursor-pointer ${
                  authType === 'email'
                    ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                    : 'hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email / Gmail</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/80 rounded-lg text-red-300 text-[11px]">
                {errorMsg}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-3.5">
                {authType === 'mobile' ? (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Saudi Mobile Number</label>
                    <input
                      type="tel"
                      required
                      autoComplete="off"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0508520173"
                      className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Email / Gmail Address</label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} autoComplete="off" className="space-y-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Full Customer Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Al-Harbi"
                    className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {authType === 'mobile' ? (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Saudi Mobile Number</label>
                    <input
                      type="tel"
                      required
                      autoComplete="off"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0508520173"
                      className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Email / Gmail Address</label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Create Password</label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-500 text-center pt-1">
              <span>Secure Revox Customer Portal · 12-Month Official Warranty Protection</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
