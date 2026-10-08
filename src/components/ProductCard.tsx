import React from 'react';
import { Star, ShieldCheck, ShoppingBag, Eye, BatteryCharging, Info, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenCondition: (product: Product, e: React.MouseEvent) => void;
  onShareProduct?: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onOpenCondition,
  onShareProduct,
}) => {
  // Normalize condition level to one of the 3 specified tiers: Excellent, Very Good, Good
  const conditionTier = (() => {
    if (product.conditionGrade === 'Very Good' || product.condition.toLowerCase().includes('very good')) {
      return {
        name: 'Very Good',
        label: 'Condition: Very Good',
        colorClass: 'text-blue-700 border-blue-200 bg-white/95 hover:border-blue-400 hover:text-blue-800',
        dotColor: 'bg-blue-500 shadow-xs shadow-blue-400/80',
      };
    }
    if (product.conditionGrade === 'Good' || product.condition.toLowerCase().includes('good')) {
      return {
        name: 'Good',
        label: 'Condition: Good',
        colorClass: 'text-amber-700 border-amber-200 bg-white/95 hover:border-amber-400 hover:text-amber-800',
        dotColor: 'bg-amber-500 shadow-xs shadow-amber-400/80',
      };
    }
    return {
      name: 'Excellent',
      label: 'Condition: Excellent',
      colorClass: 'text-emerald-700 border-emerald-200 bg-white/95 hover:border-emerald-400 hover:text-emerald-800',
      dotColor: 'bg-emerald-500 shadow-xs shadow-emerald-400/80',
    };
  })();

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white hover:bg-white border border-slate-200/90 hover:border-cyan-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg hover:shadow-cyan-950/5 select-none h-full justify-between"
    >
      {/* 1. Product Image Stage */}
      <div className="relative aspect-[4/3] bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-2 sm:p-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Condition Badge (Clickable to open dedicated Condition Guide) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCondition(product, e);
            }}
            className={`text-[9px] sm:text-[10px] font-bold tracking-tight uppercase ${conditionTier.colorClass} backdrop-blur-md border px-2 py-0.5 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95`}
            title={`Condition: ${conditionTier.name} · Click to view Product Condition Guide`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${conditionTier.dotColor}`} />
            <span>{conditionTier.label}</span>
            <Info className="w-2.5 h-2.5 opacity-80 shrink-0" />
          </button>
        </div>

        {/* Top-Right Action Badges: Subtle Share Button & Discount Tag */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {discountPercent > 0 && (
            <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-mono text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg shadow-xs">
              -{discountPercent}%
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onShareProduct) {
                onShareProduct(product, e);
              } else if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: product.name,
                  text: `Check out ${product.name} on Revox KSA for ${product.price} SAR!`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-cyan-700 border border-slate-200/90 hover:border-cyan-400/60 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm hover:scale-105 active:scale-90"
            title="Share this product"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick View Overlay on Desktop Hover */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-md transition-all hover:scale-110 active:scale-95"
            title="View Specs & Details"
          >
            <Eye className="w-4 h-4 text-cyan-600" />
          </button>
        </div>
      </div>

      {/* 2. Card Content & Details */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          
          {/* Category & Rating Bar */}
          <div className="flex items-center justify-between text-[9px] sm:text-[11px] text-slate-500">
            <span className="uppercase tracking-wider font-extrabold text-cyan-700 truncate max-w-[65%]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200/80">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono font-bold text-[10px] sm:text-[11px]">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-cyan-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Dynamic Battery Health or Warranty Coverage Tag */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] pt-0.5">
            {product.batteryHealth ? (
              <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 truncate">
                <BatteryCharging className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Battery Health: {product.batteryHealth.replace(' Genuine Health', '').replace(' Battery', '').replace(' Tested', '')}</span>
              </span>
            ) : product.warranty && !product.warranty.toLowerCase().includes('no warranty') && product.warranty !== 'None' ? (
              <span className="text-slate-700 font-medium flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{product.warranty}</span>
              </span>
            ) : (
              <span className="text-slate-500 font-medium flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.5 rounded-md border border-slate-200 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>No Warranty</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Clearly Visible, Clean, and Neatly Aligned Price & Add to Cart Button */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Price Block */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-sm sm:text-base md:text-lg font-black text-[#0F172A] tabular-nums tracking-tight truncate">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[9px] sm:text-[11px] font-extrabold text-cyan-700">SAR</span>
            </div>
            {product.originalPrice > product.price && (
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 line-through tabular-nums truncate">
                {product.originalPrice.toLocaleString()} SAR
              </span>
            )}
          </div>

          {/* Add to Cart Button with Electric Cyan Gradient & Haptic Scale */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, e);
            }}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:from-[#0072FF] hover:to-[#00C6FF] text-white font-extrabold text-[11px] sm:text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_3px_12px_rgba(0,114,255,0.3)] hover:shadow-[0_5px_18px_rgba(0,114,255,0.45)] hover:scale-[1.03] active:scale-90 shrink-0 whitespace-nowrap"
            title={`Add ${product.name} to Cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
