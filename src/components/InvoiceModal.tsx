import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { Order, CMSConfig } from '../types';

interface InvoiceModalProps {
  order: Order | null;
  cms: CMSConfig;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, cms, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Revox Official Packing Slip & Tax Invoice
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-white text-slate-900">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-widest font-['Poppins'] text-slate-950">
                  REVOX
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded">
                  Certified Refurbished
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Revox Certified Refurbished Electronics LLC
              </p>
              <p className="text-xs text-slate-500">
                Kingdom of Saudi Arabia · Support: {cms.supportPhone} · {cms.supportEmail}
              </p>
              <p className="text-xs text-slate-500">
                VAT Reg No: 310948201900003
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Tax Invoice / Packing Slip
              </h2>
              <p className="text-xs text-slate-600">
                Invoice No: <strong className="font-mono text-slate-900">INV-{order.id.replace('RVX-', '')}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Order ID: <strong className="font-mono text-slate-900">{order.id}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Date: {order.createdAt}
              </p>
            </div>
          </div>

          {/* Shipping & Delivery Address Matrix */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                Customer Shipping Destination
              </span>
              <p className="text-sm font-bold text-slate-900">{order.customer.fullName}</p>
              <p className="text-slate-700">Phone: {order.customer.phone}</p>
              <p className="text-slate-700">
                {order.customer.buildingNumber}, {order.customer.street}
              </p>
              <p className="text-slate-700 font-semibold">
                {order.customer.district}, {order.customer.city}, Saudi Arabia
              </p>
              {order.customer.deliveryNotes && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Note: "{order.customer.deliveryNotes}"
                </p>
              )}
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                Courier Dispatch & Payment Workflow
              </span>
              <p className="text-slate-700">
                Courier: <strong className="text-slate-900">{order.courierName || 'Revox Express Driver'}</strong>
              </p>
              <p className="text-slate-700">
                Tracking Code:{' '}
                <strong className="font-mono text-slate-900 font-bold">
                  {order.trackingNumber || 'Pending Assignment'}
                </strong>
              </p>
              <p className="text-slate-700">
                Payment Type:{' '}
                <strong className="uppercase font-semibold text-slate-900">
                  {order.paymentType === 'cod_partial'
                    ? 'Cash on Delivery (50 SAR Advance Paid)'
                    : 'Full Advance Prepaid (0 SAR Delivery)'}
                </strong>
              </p>
              <p className="text-slate-700">
                Transfer Channel: <strong>{order.transferChannel?.toUpperCase() || 'AL_RAJHI'}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & Specifications</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{item.product.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {item.selectedStorage || ''} {item.selectedRam ? `· ${item.selectedRam}` : ''} {item.selectedColor ? `· ${item.selectedColor}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-mono text-[11px]">{item.product.condition}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {item.unitPrice.toLocaleString()} SAR
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {(item.unitPrice * item.quantity).toLocaleString()} SAR
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals & COD Balance Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">{order.subtotal.toLocaleString()} SAR</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Shipping Fee (KSA)</span>
                <span>FREE (0 SAR)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span>Total Order Amount</span>
                <span className="font-mono">{order.total.toLocaleString()} SAR</span>
              </div>

              {order.paymentType === 'cod_partial' && (
                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 bg-amber-50 p-2.5 rounded-lg text-[11px]">
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Prepaid Partial Advance:</span>
                    <span className="font-mono">50 SAR</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>COD Balance to Collect at Door:</span>
                    <span className="font-mono">{order.remainingBalanceCod?.toLocaleString()} SAR</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revox Official Certification Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Includes 12-Month Revox Official Hardware Warranty & 100-Point Hardware Certification.
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[10px]">
              Auth Stamp: REVOX-KSA-VERIFIED
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
