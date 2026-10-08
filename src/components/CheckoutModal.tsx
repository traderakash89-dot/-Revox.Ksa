import React, { useState } from 'react';
import { X, Truck, ShieldCheck, CreditCard, Banknote, CheckCircle2, AlertCircle, ArrowRight, UserCheck, Lock, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerAddress, CMSConfig, Order, CustomerUser, TransferChannel, PaymentType } from '../types';
import { BankQRCard } from './BankQRComponents';
import { GoogleMapsLocationPicker } from './GoogleMapsLocationPicker';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  cms: CMSConfig;
  currentUser: CustomerUser | null;
  onOpenCustomerAuth: (reason?: string) => void;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  cms,
  currentUser,
  onOpenCustomerAuth,
  onOrderCreated,
}) => {
  if (!isOpen) return null;

  // Payment Channel & Receipt State
  const [transferChannel, setTransferChannel] = useState<TransferChannel>('al_rajhi');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Saved addresses from logged-in customer profile
  const savedAddresses = currentUser?.savedAddresses || (currentUser?.savedAddress ? [currentUser.savedAddress] : []);
  const defaultSaved = savedAddresses[0];

  // Saudi address state: If customer has a saved address in their real profile, load it; otherwise completely blank
  const [selectedSavedIndex, setSelectedSavedIndex] = useState<number | 'new'>(savedAddresses.length > 0 ? 0 : 'new');
  const [fullName, setFullName] = useState(defaultSaved?.fullName || currentUser?.fullName || '');
  const [phone, setPhone] = useState(defaultSaved?.phone || currentUser?.phone || '');
  const [email, setEmail] = useState(defaultSaved?.email || currentUser?.email || '');
  const [city, setCity] = useState(defaultSaved?.city || '');
  const [district, setDistrict] = useState(defaultSaved?.district || '');
  const [street, setStreet] = useState(defaultSaved?.street || '');
  const [buildingNumber, setBuildingNumber] = useState(defaultSaved?.buildingNumber || '');
  const [deliveryNotes, setDeliveryNotes] = useState(defaultSaved?.deliveryNotes || '');
  const [geoCoordinates, setGeoCoordinates] = useState<{ lat?: number; lng?: number }>({});

  const handleSelectSavedAddress = (idx: number | 'new') => {
    setSelectedSavedIndex(idx);
    if (idx === 'new') {
      setFullName(currentUser?.fullName || '');
      setPhone(currentUser?.phone || '');
      setEmail(currentUser?.email || '');
      setCity('');
      setDistrict('');
      setStreet('');
      setBuildingNumber('');
      setDeliveryNotes('');
    } else {
      const addr = savedAddresses[idx];
      if (addr) {
        setFullName(addr.fullName || currentUser?.fullName || '');
        setPhone(addr.phone || currentUser?.phone || '');
        setEmail(addr.email || currentUser?.email || '');
        setCity(addr.city || '');
        setDistrict(addr.district || '');
        setStreet(addr.street || '');
        setBuildingNumber(addr.buildingNumber || '');
        setDeliveryNotes(addr.deliveryNotes || '');
      }
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingFee = 0; // Always Free Shipping on All Products Across Saudi Arabia
  const total = subtotal + shippingFee;
  const paymentType: PaymentType = 'full_advance';

  const saudiCities = [
    'Riyadh',
    'Jeddah',
    'Dammam',
    'Mecca',
    'Medina',
    'Khobar',
    'Dhahran',
    'Al Jubail',
    'Al Ahsa',
    'Taif',
    'Tabuk',
    'Abha',
    'Khamis Mushait',
    'Hail',
    'Najran',
    'Jizan',
    'Yanbu',
    'Qassim / Buraidah',
  ];

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // STRICT CHECK: Customer must be logged in!
    if (!currentUser) {
      onOpenCustomerAuth('Please sign in or create an account to complete and track your order.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg('Please enter customer full name.');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone.match(/^(05|\+9665|9665)\d{8}$/)) {
      setErrorMsg('Please enter a valid Saudi mobile number (e.g. 0508520173).');
      return;
    }

    if (!district.trim() || !street.trim() || !buildingNumber.trim()) {
      setErrorMsg('Please fill in district, street, and building/villa number for courier delivery.');
      return;
    }

    // Require receipt upload for payment verification
    if (!receiptImage) {
      setErrorMsg('Please attach the payment transfer screenshot for your order verification.');
      return;
    }

    setIsSubmitting(true);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `RVX-${randomNum}-SA`;

    const address: CustomerAddress = {
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: email.trim() || undefined,
      city,
      district: district.trim(),
      street: street.trim(),
      buildingNumber: buildingNumber.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined,
    };

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      customer: address,
      items: [...items],
      subtotal,
      shippingFee: 0,
      total,
      paymentType: 'full_advance',
      transferChannel,
      advancePaidAmount: total,
      remainingBalanceCod: 0,
      status: 'pending_payment_approval',
      paymentReceiptImage: receiptImage,
      transactionReference: transactionRef || undefined,
      estimatedDeliveryDate: '5-7 Business Days (Local Courier)',
      currentLocationName: 'Riyadh Central Hub (Awaiting Verification)',
      userId: currentUser.id,
      checkpoints: [
        {
          title: 'Payment Submitted',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Customer completed payment of ${total.toLocaleString()} SAR via ${transferChannel.toUpperCase()} with free delivery. Receipt attached.`,
          location: 'Online Store',
          completed: true,
        },
        {
          title: 'Admin Verification & Payment Approval',
          timestamp: 'In Progress',
          description: 'Store admin verifies the transfer slip and approves payment to proceed to packaging.',
          location: 'Revox Finance Desk',
          completed: false,
        },
        {
          title: 'Packaging & 100-Point Inspection',
          timestamp: 'Scheduled',
          description: 'Hardware certification & shockproof packaging for local courier handover.',
          location: 'Riyadh Logistics Center',
          completed: false,
        },
        {
          title: 'Shipped (Courier & Tracking Number Assigned)',
          timestamp: 'Scheduled',
          description: 'Handed over to courier with tracking code for 5-7 business days delivery.',
          location: 'Courier Network',
          completed: false,
        },
        {
          title: 'Delivered',
          timestamp: '5-7 Business Days',
          description: 'Handover to customer with 12-Month Revox Warranty.',
          location: `${district}, ${city}`,
          completed: false,
        },
      ],
    };

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EAB308', '#FCD34D', '#10B981'],
      });
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderCreated(newOrder);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif]">
              Checkout & Delivery Details
            </h3>
            <p className="text-xs text-cyan-800 mt-0.5 font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-600" />
              Always Free Shipping on Advance Payment! (5-7 Days Delivery Across KSA)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Auth Banner Check */}
        {!currentUser ? (
          <div className="p-5 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Login Required:</strong> You must be signed in to place an order and track your delivery.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenCustomerAuth('Please sign in or create an account to proceed to checkout.')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-sm cursor-pointer"
            >
              Sign In or Register Now
            </button>
          </div>
        ) : (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Ordering as <strong className="text-slate-900">{currentUser.fullName}</strong> ({currentUser.phone})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Account Verified</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} autoComplete="off" className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer & Address */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[11px] font-black">
                  1
                </span>
                Saudi Arabia Shipping Address
              </h4>
              <GoogleMapsLocationPicker
                onLocationSelect={(loc) => {
                  if (loc.city) setCity(loc.city);
                  if (loc.district) setDistrict(loc.district);
                  if (loc.street) setStreet(loc.street);
                  setGeoCoordinates({ lat: loc.lat, lng: loc.lng });
                  setSelectedSavedIndex('new');
                }}
              />
            </div>

            {/* Saved Address Quick Selector if user has saved addresses in profile */}
            {savedAddresses.length > 0 && (
              <div className="p-3 bg-cyan-50/60 border border-cyan-200/80 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-cyan-900 block">
                  Select Delivery Address from Profile:
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSavedAddress(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-left ${
                        selectedSavedIndex === idx
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span>📍 {addr.district || 'Location'}, {addr.city}</span>
                      <span className="text-[10px] block opacity-80">{addr.street || 'Default'}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSavedAddress('new')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSavedIndex === 'new'
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    + Enter New Address
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="revox_customer_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Al-Harbi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Saudi Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  autoComplete="off"
                  name="revox_customer_phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0508520173"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">City *</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="revox_customer_city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Riyadh, Jeddah, Dammam"
                  list="saudi-cities-list"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
                <datalist id="saudi-cities-list">
                  {saudiCities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">District / Neighborhood *</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="revox_customer_district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Al Olaya / Al Rawdah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Building / Villa No. *</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="revox_customer_bldg"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  placeholder="Villa 12 or Tower 3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-700 mb-1 font-semibold">Street Address *</label>
              <input
                type="text"
                required
                autoComplete="off"
                name="revox_customer_street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. King Fahd Road, Cross Street 12"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 2: Payment Policy & Mode Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[11px] font-black">
                2
              </span>
              Payment Method (Manual Bank Transfer)
            </h4>

            {/* Manual Payment Information Card */}
            <div className="p-3.5 rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50/80 via-blue-50/50 to-emerald-50/40 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Manual Bank Transfer / Mobile Wallet
                </span>
                <span className="font-mono font-extrabold text-cyan-800">
                  {total.toLocaleString()} SAR
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Choose your preferred manual payment method below (Al Rajhi Bank, STC Pay, or Barq Pay). Complete the transfer and attach your payment receipt screenshot for instant verification.
              </p>
            </div>

            {/* Manual Transfer Channels (Al Rajhi / STC Pay / Barq Pay) */}
            <div className="mt-2">
              <BankQRCard
                cms={cms}
                selectedChannel={transferChannel}
                onChannelChange={setTransferChannel}
                receiptImage={receiptImage}
                onReceiptUpload={setReceiptImage}
                transactionRef={transactionRef}
                onTransactionRefChange={setTransactionRef}
                requiredAmountText={`${total.toLocaleString()} SAR`}
                isCodAdvance={false}
              />
            </div>
          </div>

          {/* Section 3: Summary & Order Button */}
          <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900 font-semibold">{subtotal.toLocaleString()} SAR</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" /> Shipping Fee Across Saudi Arabia
                </span>
                <span className="font-mono font-bold">FREE (0 SAR)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Order Value</span>
                <span className="font-mono text-[#0F172A] text-base font-black">{total.toLocaleString()} SAR</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#0051C6] hover:from-[#0072FF] hover:to-[#00C6FF] text-white font-extrabold text-sm tracking-wide shadow-[0_4px_20px_rgba(0,114,255,0.35)] hover:shadow-[0_6px_28px_rgba(0,114,255,0.5)] hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    Confirm & Place Order ({total.toLocaleString()} SAR)
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
