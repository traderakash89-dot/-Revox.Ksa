import React from 'react';
import { X, Trash2, ShoppingBag, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingFee = 0; // ALWAYS FREE SHIPPING
  const total = subtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10 w-full justify-end">
        <div className="w-full sm:w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between box-border overflow-x-hidden">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between w-full box-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingBag className="w-5 h-5 text-cyan-600 shrink-0" />
              <h3 className="text-base font-bold text-[#0F172A] truncate">
                Your Shopping Bag ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer shrink-0"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Always Free Shipping Notice */}
          <div className="bg-cyan-50 border-b border-cyan-100 px-4 sm:px-5 py-2.5 flex items-center gap-2 text-xs text-cyan-800 w-full box-border">
            <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-semibold truncate">
              Always Free Shipping Across Saudi Arabia! (0 SAR)
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 w-full box-border">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">Your bag is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Browse our certified refurbished phones, laptops, and tech accessories with 12-month warranty.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-all cursor-pointer shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${index}`}
                  className="flex gap-3 sm:gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/90 items-center w-full box-border"
                >
                  {/* Item Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {item.product.name}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                      {item.selectedStorage && (
                        <span className="font-mono text-slate-700 shrink-0">{item.selectedStorage}</span>
                      )}
                      {item.selectedStorage && item.selectedColor && <span>·</span>}
                      {item.selectedColor && (
                        <span className="truncate">{item.selectedColor}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 w-full">
                      <span className="font-mono text-xs font-bold text-cyan-700 whitespace-nowrap shrink-0">
                        {item.unitPrice.toLocaleString()} SAR
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-white border border-slate-200 rounded px-1 text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-medium text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer: Order Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-4 w-full box-border">
              
              <div className="space-y-2 text-xs w-full">
                <div className="flex justify-between items-center text-slate-600 w-full gap-2">
                  <span className="shrink-0">Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap text-right">
                    {subtotal.toLocaleString()} SAR
                  </span>
                </div>

                <div className="flex justify-between items-center text-emerald-700 w-full gap-2">
                  <span className="flex items-center gap-1 font-semibold truncate">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Shipping Fee (Saudi Arabia)</span>
                  </span>
                  <span className="font-mono font-bold uppercase whitespace-nowrap shrink-0 text-right">
                    FREE (0 SAR)
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-100 w-full gap-2">
                  <span className="shrink-0">Total Amount</span>
                  <span className="font-mono text-base text-[#0F172A] tabular-nums font-black whitespace-nowrap text-right">
                    {total.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Estimated Delivery: 5-7 Business Days</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3.5 sm:py-4 px-4 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:from-[#0072FF] hover:to-[#00C6FF] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_4px_20px_rgba(0,114,255,0.35)] hover:shadow-[0_6px_28px_rgba(0,114,255,0.5)] hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer box-border"
              >
                <span className="whitespace-nowrap">Checkout Now ({total.toLocaleString()} SAR)</span>
                <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
