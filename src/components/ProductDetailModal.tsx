import React, { useState } from 'react';
import { X, Star, ShieldCheck, Truck, BatteryCharging, Check, ShoppingBag, ArrowRight, Award, Info, Share2, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenConditionModal: (product: Product) => void;
  onShareProduct?: (product: Product, e: React.MouseEvent) => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedColor?: string,
    selectedStorage?: string,
    selectedRam?: string,
    finalPrice?: number
  ) => void;
  onBuyNow: (
    product: Product,
    quantity: number,
    selectedColor?: string,
    selectedStorage?: string,
    selectedRam?: string,
    finalPrice?: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenConditionModal,
  onShareProduct,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const defaultVariant = product.variants?.[0];
  // Normalize condition level to one of the 3 specified tiers: Excellent, Very Good, Good
  const conditionTier = (() => {
    if (product.conditionGrade === 'Very Good' || product.condition.toLowerCase().includes('very good')) {
      return {
        name: 'Very Good',
        label: 'Condition: Very Good',
        colorClass: 'text-blue-300 border-blue-500/50 bg-black/90 hover:border-blue-400',
        dotColor: 'bg-blue-400 shadow-sm shadow-blue-400/80',
      };
    }
    if (product.conditionGrade === 'Good' || product.condition.toLowerCase().includes('good')) {
      return {
        name: 'Good',
        label: 'Condition: Good',
        colorClass: 'text-yellow-300 border-yellow-500/50 bg-black/90 hover:border-yellow-400',
        dotColor: 'bg-yellow-400 shadow-sm shadow-yellow-400/80',
      };
    }
    return {
      name: 'Excellent',
      label: 'Condition: Excellent',
      colorClass: 'text-emerald-300 border-emerald-500/50 bg-black/90 hover:border-emerald-400',
      dotColor: 'bg-emerald-400 shadow-sm shadow-emerald-400/80',
    };
  })();

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(defaultVariant?.storage);
  const [selectedRam, setSelectedRam] = useState<string | undefined>(defaultVariant?.ram);
  const [selectedColor, setSelectedColor] = useState<string>(defaultVariant?.colorName || 'Default');
  const [quantity, setQuantity] = useState<number>(1);

  const isNoWarranty = !product.warranty || product.warranty.toLowerCase().includes('no warranty') || product.warranty === 'None';
  const [selectedWarranty, setSelectedWarranty] = useState<'none' | '12m' | '24m'>(isNoWarranty ? 'none' : '12m');
  const warrantyCost = selectedWarranty === '24m' ? 149 : selectedWarranty === '12m' && isNoWarranty ? 99 : 0;

  // Compute distinct options
  const storageOptions = Array.from(
    new Set(product.variants.map((v) => v.storage).filter(Boolean))
  ) as string[];

  const ramOptions = Array.from(
    new Set(product.variants.map((v) => v.ram).filter(Boolean))
  ) as string[];

  const colorOptions = Array.from(
    new Set(product.variants.map((v) => v.colorName).filter(Boolean))
  );

  // Find exact active variant
  const activeVariant =
    product.variants.find(
      (v) =>
        (!selectedStorage || v.storage === selectedStorage) &&
        (!selectedRam || v.ram === selectedRam) &&
        v.colorName === selectedColor
    ) ||
    product.variants.find(
      (v) => (!selectedStorage || v.storage === selectedStorage) && v.colorName === selectedColor
    ) ||
    defaultVariant;

  const currentPrice = (activeVariant?.price || product.price) + warrantyCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95">
        
        {/* Top-Right Action Buttons: Subtle Share + Close Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShareProduct) {
                onShareProduct(product, e);
              } else if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: product.name,
                  text: `Check out ${product.name} on Revox KSA for ${currentPrice.toLocaleString()} SAR!`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            aria-label="Share product"
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-cyan-700 border border-slate-200 shadow-xs hover:shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Share this product listing"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Image Gallery & Condition Banner */}
          <div className="p-6 bg-[#F8FAFC] flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200 shadow-xs">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Condition label triggering Product Condition Guide */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => onOpenConditionModal(product)}
                    className={`text-[10px] font-bold tracking-tight uppercase ${conditionTier.colorClass} backdrop-blur-md border px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95`}
                    title={`Condition: ${conditionTier.name} · Click to view Product Condition Guide`}
                  >
                    <span className={`w-2 h-2 rounded-full ${conditionTier.dotColor}`} />
                    <span>{conditionTier.label}</span>
                    <Info className="w-3 h-3 opacity-80 ml-0.5" />
                  </button>

                  {product.batteryHealth && (
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-white/95 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 w-fit shadow-xs">
                      <BatteryCharging className="w-3 h-3 text-emerald-600" />
                      <span>Battery Health: {product.batteryHealth.replace(' Genuine Health', '').replace(' Battery', '').replace(' Tested', '')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImage === img
                          ? 'border-cyan-600 ring-2 ring-cyan-400'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Condition Page Callout Box */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Condition: {conditionTier.name}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => onOpenConditionModal(product)}
                  className="text-[11px] font-bold text-cyan-700 hover:text-cyan-800 underline cursor-pointer"
                >
                  Condition Guide ➔
                </button>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${conditionTier.dotColor} shrink-0`} />
                  <span>Graded as <strong className="text-slate-900">{conditionTier.name} Condition</strong></span>
                </li>
                {product.batteryHealth && (
                  <li className="flex items-center gap-2">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Battery Health: <strong className="text-slate-900">{product.batteryHealth.replace(' Genuine Health', '').replace(' Battery', '').replace(' Tested', '')}</strong> (approximate guideline)</span>
                  </li>
                )}
                {product.category === 'Laptops' && (
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Original Charger Included (Specifically checked for laptops)</span>
                  </li>
                )}
                {isNoWarranty ? (
                  <li className="flex items-center gap-2 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>Tested & functional · <strong className="text-amber-700">No Warranty Included</strong> (Sold as-is / clearance)</span>
                  </li>
                ) : (
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Checked & tested before listing with <strong className="text-slate-900">{product.warranty}</strong></span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module with Dynamic Variants */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-700 tracking-wider uppercase">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-[#0F172A] leading-snug">
                {product.name}
              </h2>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-slate-100">
                <span className="text-3xl font-black text-[#0F172A] font-mono tabular-nums">
                  {currentPrice.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-cyan-700">SAR</span>
                {product.originalPrice > currentPrice && (
                  <span className="text-sm font-mono text-slate-400 line-through tabular-nums">
                    {product.originalPrice.toLocaleString()} SAR
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Available · Certified Ready</span>
                </span>
              </div>

              {/* Always Free Shipping on Advance Payment Notice */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs">
                <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="font-semibold">
                  Always Free Shipping on Advance Payment! (0 SAR Delivery)
                </span>
              </div>

              {/* RAM Variant Selector if available */}
              {ramOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    RAM Memory Option
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ramOptions.map((ram) => (
                      <button
                        key={ram}
                        type="button"
                        onClick={() => setSelectedRam(ram)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                          selectedRam === ram
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Capacity Selector if available */}
              {storageOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Storage Capacity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((storage) => (
                      <button
                        key={storage}
                        type="button"
                        onClick={() => setSelectedStorage(storage)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                          selectedStorage === storage
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Variant Selector */}
              {colorOptions.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Color: <span className="text-slate-900">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => {
                      const vMatch = product.variants.find((v) => v.colorName === color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedColor === color
                              ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-bold'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {vMatch?.colorHex && (
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: vMatch.colorHex }}
                            />
                          )}
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warranty Option Selector */}
              <div className="pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-cyan-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Warranty Options</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isNoWarranty ? 'Clearance / As-Is' : 'Free Doorstep Swap/Repair'}
                  </span>
                </label>
                
                {isNoWarranty ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWarranty('none')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedWarranty === 'none'
                          ? 'bg-cyan-50 border-cyan-600 text-cyan-950 shadow-xs ring-1 ring-cyan-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900">No Warranty</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                          Included (0 SAR)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Sold as-is with 7-Day return inspection guarantee
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWarranty('12m')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedWarranty === '12m'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900">Add 12M Warranty</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                          +99 SAR
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Optional full hardware & battery protection
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedWarranty('12m')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedWarranty === '12m'
                          ? 'bg-cyan-50 border-cyan-600 text-cyan-950 shadow-xs ring-1 ring-cyan-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900">{product.warranty || '12 Months Official'}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Included
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Full motherboard, screen & battery coverage (0 SAR)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedWarranty('24m')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedWarranty === '24m'
                          ? 'bg-cyan-50 border-cyan-600 text-cyan-950 shadow-xs ring-1 ring-cyan-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900">24 Months Care+</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold font-mono">
                          +149 SAR
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        Extended 2-year guarantee + accidental care protection
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Technical Specifications Table */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Device Hardware Specifications
                </label>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-1.5 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                      <span className="text-slate-500">{key}</span>
                      <span className="font-semibold text-slate-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity Stepper + Add to Bag & Buy Now */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1 text-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity, selectedColor, selectedStorage, selectedRam, currentPrice);
                    onClose();
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs tracking-wide border border-slate-800 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-400" />
                  <span>Add to Bag</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onBuyNow(product, quantity, selectedColor, selectedStorage, selectedRam, currentPrice);
                  onClose();
                }}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:from-[#0072FF] hover:to-[#00C6FF] text-white font-extrabold text-sm tracking-wide shadow-[0_4px_20px_rgba(0,114,255,0.35)] hover:shadow-[0_6px_28px_rgba(0,114,255,0.5)] hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
