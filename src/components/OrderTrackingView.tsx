import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Copy, Check, MessageSquare, ArrowLeft, ShieldCheck, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { SaudiTrackingMap } from './SaudiTrackingMap';

interface OrderTrackingViewProps {
  orders: Order[];
  initialOrderId?: string;
  onBackToStore: () => void;
  onUpdateOrderReceipt?: (orderId: string, receiptImg: string, txnRef: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  initialOrderId,
  onBackToStore,
  onUpdateOrderReceipt,
}) => {
  const [searchId, setSearchId] = useState<string>(initialOrderId || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(
    orders.find((o) => o.id.toLowerCase() === (initialOrderId || '').toLowerCase()) ||
    orders[0] ||
    null
  );
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Re-upload state for pending orders
  const [newReceipt, setNewReceipt] = useState<string>('');
  const [newTxnRef, setNewTxnRef] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === query) ||
        o.customer.phone.includes(query)
    );
    if (found) {
      setActiveOrder(found);
    } else {
      alert(`No order found matching "${searchId}". Try sample order ID like RVX-98214-SA.`);
    }
  };

  const copyTrackingNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleUploadReceiptSubmit = () => {
    if (!newReceipt) {
      alert('Please select an image file first.');
      return;
    }
    if (activeOrder && onUpdateOrderReceipt) {
      onUpdateOrderReceipt(activeOrder.id, newReceipt, newTxnRef);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Waiting Confirmation (Pending Payment Approval)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/40 text-blue-400">
            <Package className="w-3.5 h-3.5" />
            Processing / Packed
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/40 text-purple-400">
            <Truck className="w-3.5 h-3.5" />
            Shipped (Courier In Transit)
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Truck className="w-3.5 h-3.5 animate-bounce" />
            Out for Delivery (Local Driver En Route)
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered & Certified
          </span>
        );
    }
  };

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Bar with Back Button & Search Box */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>

        {/* Search by Order ID Form */}
        <form onSubmit={handleSearch} className="w-full sm:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search Order ID (e.g. RVX-98214-SA)"
              className="w-full bg-[#111723] border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-amber-500/80 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {activeOrder ? (
        <div className="space-y-6">
          
          {/* Order Header Card */}
          <div className="bg-[#111723] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                    Order {activeOrder.id}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Placed on {activeOrder.createdAt}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Recipient: <strong className="text-slate-200">{activeOrder.customer.fullName}</strong> · {activeOrder.customer.phone} · {activeOrder.customer.city}
                </p>
              </div>

              <div>
                {getStatusBadge(activeOrder.status)}
              </div>
            </div>

            {/* Metrics Bar with Advance & COD Balance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Payment Classification</span>
                <span className="font-semibold text-slate-200 uppercase mt-0.5 block">
                  {activeOrder.paymentType === 'cod_partial'
                    ? 'COD (50 SAR Advance Paid)'
                    : 'Full Advance Prepaid'}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  Channel: {activeOrder.transferChannel?.toUpperCase() || 'AL_RAJHI'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Total Amount</span>
                <span className="font-mono font-bold text-white text-sm mt-0.5 block">
                  {activeOrder.total.toLocaleString()} SAR
                </span>
                {activeOrder.paymentType === 'cod_partial' && (
                  <span className="text-[10px] text-amber-400 font-mono block">
                    COD Due at Door: {activeOrder.remainingBalanceCod?.toLocaleString()} SAR
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block">Shipping Fee</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block uppercase">
                  Always Free (0 SAR)
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Delivery Benchmark</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  5-7 Business Days
                </span>
              </div>
            </div>

            {/* Courier & Tracking Banner */}
            {activeOrder.trackingNumber ? (
              <div className="p-3.5 bg-[#090D14] border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Courier: <strong className="text-slate-200">{activeOrder.courierName || 'Local Delivery Courier'}</strong>
                    </span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      Tracking: {activeOrder.trackingNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyTrackingNumber(activeOrder.trackingNumber!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors w-fit cursor-pointer"
                >
                  {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTracking ? 'Copied' : 'Copy Tracking'}</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#090D14] border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Admin is inspecting your device. Tracking number will be assigned once dispatched to the local courier.
                </span>
              </div>
            )}
          </div>

          {/* Interactive Saudi Arabia Delivery Map */}
          <SaudiTrackingMap order={activeOrder} />

          {/* If Status is Waiting Confirmation: Provide Receipt Upload / Status Explanation */}
          {activeOrder.status === 'pending_payment_approval' && (
            <div className="bg-[#111723] border border-amber-900/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    Payment Verification in Progress (Waiting Confirmation)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    We have received your order! If you haven't uploaded your transfer receipt or want to provide an updated screenshot, please upload it below. Our store admin will verify the transfer in our Al Rajhi / STC Pay / Barq Pay account and immediately transition your order to "Processing / Packed".
                  </p>
                </div>
              </div>

              {/* Upload or Update Receipt Field */}
              <div className="p-4 bg-[#090D14] rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Transaction Slip Reference
                    </label>
                    <input
                      type="text"
                      value={newTxnRef}
                      onChange={(e) => setNewTxnRef(e.target.value)}
                      placeholder={activeOrder.transactionReference || 'e.g. TXN-1092834'}
                      className="w-full bg-[#111723] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Upload / Re-Upload Receipt Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (typeof event.target?.result === 'string') {
                              setNewReceipt(event.target.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                {newReceipt && (
                  <div className="flex items-center gap-3 pt-2">
                    <img src={newReceipt} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                    <button
                      type="button"
                      onClick={handleUploadReceiptSubmit}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                    >
                      Submit Receipt for Fast Admin Approval
                    </button>
                  </div>
                )}

                {uploadSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Receipt successfully updated! Admin has been notified.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 5-Step Order Status Pipeline Timeline */}
          <div className="bg-[#111723] border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Delivery Pipeline Status (5-7 Business Days)
            </h3>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
              {activeOrder.checkpoints.map((step, idx) => {
                return (
                  <div key={idx} className="relative group">
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {step.completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${step.completed ? 'text-white' : 'text-slate-400'}`}>
                          {step.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {step.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-1">
                        <MapPin className="w-3 h-3" /> {step.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="bg-[#111723] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Purchased Refurbished Hardware
            </h4>
            <div className="space-y-3">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-200 truncate">{item.product.name}</p>
                    <p className="text-slate-400 text-[11px]">
                      Qty: {item.quantity} {item.selectedStorage ? `· ${item.selectedStorage}` : ''} {item.selectedRam ? `· ${item.selectedRam}` : ''} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-100">
                    {(item.unitPrice * item.quantity).toLocaleString()} SAR
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Support Assistance */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span>
                Need delivery assistance or inquiry about Order #{activeOrder.id}? Contact Revox WhatsApp Support directly.
              </span>
            </div>
            <a
              href={`https://wa.me/966508520173?text=${encodeURIComponent(
                `Hello Revox, I would like an update on my order ${activeOrder.id} for ${activeOrder.customer.fullName}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition-colors whitespace-nowrap"
            >
              WhatsApp Support
            </a>
          </div>

        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 space-y-3 bg-[#111723] rounded-2xl border border-slate-800">
          <Package className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-200">Track Any Revox Order</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter your order number or phone number above to see real-time delivery pipeline status and courier tracking.
          </p>
        </div>
      )}
    </div>
  );
};
