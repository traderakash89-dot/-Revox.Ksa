import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  BatteryCharging,
  ShieldCheck,
  Laptop,
  Check,
  Sparkles,
  Info,
  ArrowRight,
  PackageCheck,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Product, ConditionGrade } from '../types';

interface ProductConditionGuideProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  initialCondition?: ConditionGrade | null;
  onSelectProduct?: (product: Product) => void;
}

export const ProductConditionGuide: React.FC<ProductConditionGuideProps> = ({
  isOpen,
  onClose,
  product,
  initialCondition,
  onSelectProduct,
}) => {
  // Determine active tab/filter: 'all' | 'Excellent' | 'Very Good' | 'Good'
  const [selectedTab, setSelectedTab] = useState<'all' | ConditionGrade>('all');

  // Synchronize when opened with a specific product or condition
  useEffect(() => {
    if (initialCondition) {
      setSelectedTab(initialCondition);
    } else if (product) {
      if (product.conditionGrade) {
        setSelectedTab(product.conditionGrade);
      } else if (product.condition.toLowerCase().includes('very good')) {
        setSelectedTab('Very Good');
      } else if (product.condition.toLowerCase().includes('good')) {
        setSelectedTab('Good');
      } else {
        setSelectedTab('Excellent');
      }
    } else {
      setSelectedTab('all');
    }
  }, [isOpen, initialCondition, product]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 p-4 sm:p-7 space-y-6 my-auto max-h-[92vh] flex flex-col">
        
        {/* 1. Header with Close Button */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/90 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Product Condition Guide
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              “To help you understand the condition of our products before purchasing, we use three simple condition grades. Please review the guide below to understand what each condition means.”
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0 ml-3"
            aria-label="Close Product Condition Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1 text-slate-200">
          
          {/* Active Product Context Banner (when triggered from a specific product card) */}
          {product && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#111726] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-black/60 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    Product Under Inspection
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      {product.conditionGrade === 'Very Good' || product.condition.includes('Very Good') ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                          <span>Condition: Very Good</span>
                        </>
                      ) : product.conditionGrade === 'Good' || product.condition.includes('Good') ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                          <span>Condition: Good</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                          <span>Condition: Excellent</span>
                        </>
                      )}
                    </span>

                    {/* Dynamic Battery Info if available */}
                    {product.batteryHealth && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5" />
                          <span>Battery Health: {product.batteryHealth.replace(' Genuine Health', '').replace(' Battery', '')}</span>
                        </span>
                      </>
                    )}

                    {product.charger && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-300 font-medium truncate max-w-[150px]">
                          {product.charger}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {onSelectProduct && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectProduct(product);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-950" />
                  <span>View Product Details</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Filter Pill Controls (All / Excellent / Very Good / Good) */}
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
              Select Grade:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-[#141B2D] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              All 3 Conditions
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('Excellent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'Excellent'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#141B2D] text-slate-300 hover:text-emerald-400 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>🟢 Excellent Condition</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('Very Good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'Very Good'
                  ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                  : 'bg-[#141B2D] text-slate-300 hover:text-blue-400 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>🔵 Very Good Condition</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('Good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'Good'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                  : 'bg-[#141B2D] text-slate-300 hover:text-yellow-400 border border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>🟡 Good Condition</span>
            </button>
          </div>

          {/* 3. Three Separate Condition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* CARD 1: EXCELLENT CONDITION */}
            {(selectedTab === 'all' || selectedTab === 'Excellent') && (
              <div
                className={`flex flex-col justify-between rounded-2xl bg-[#0F1626] border p-5 transition-all ${
                  selectedTab === 'Excellent'
                    ? 'border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : 'border-emerald-500/30 hover:border-emerald-500/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                        <span>Excellent Condition</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Tier 1 · Pristine
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Products marked <strong className="text-emerald-300 font-bold">Excellent Condition</strong> are in very clean and well-maintained condition.
                  </p>

                  {/* Typical Characteristics */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Typical Characteristics:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Very clean overall appearance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Minimal or no visible signs of use</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Screen/display is clean and free from major marks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Body/chassis is in excellent condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>No major dents or damage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>All major functions are working properly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Battery health is generally around <strong>90%–95%</strong> for applicable devices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400">Battery condition may vary depending on the individual product</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-emerald-300 font-medium">Product has been checked before listing</span>
                      </li>
                    </ul>
                  </div>

                  {/* Accessories */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accessories</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                      <p className="text-slate-300 font-semibold">
                        For laptops: <span className="text-emerald-300 font-bold">Original Charger Included</span> when specifically mentioned on the product listing.
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        For other products, accessories included will be clearly mentioned on the individual product page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Display Label:</span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    🟢 Condition: Excellent
                  </span>
                </div>
              </div>
            )}

            {/* CARD 2: VERY GOOD CONDITION */}
            {(selectedTab === 'all' || selectedTab === 'Very Good') && (
              <div
                className={`flex flex-col justify-between rounded-2xl bg-[#0F1626] border p-5 transition-all ${
                  selectedTab === 'Very Good'
                    ? 'border-blue-500 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500'
                    : 'border-blue-500/30 hover:border-blue-500/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>🔵 Very Good Condition</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Tier 2 · Great Value
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Products marked <strong className="text-blue-300 font-bold">Very Good Condition</strong> are in good overall physical and functional condition with normal signs of previous use.
                  </p>

                  {/* Typical Characteristics */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Typical Characteristics:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Clean overall appearance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Minor scratches or small signs of use may be present</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>No major damage</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Screen/display is in good condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>All major functions are working properly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BatteryCharging className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>Battery health is generally around <strong>85%–95%</strong> for applicable devices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400">Battery condition may vary depending on the individual product</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PackageCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-blue-300 font-medium">Product has been checked before listing</span>
                      </li>
                    </ul>
                  </div>

                  {/* Accessories */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-blue-400" />
                      <span>Accessories</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                      <p className="text-slate-300 font-semibold">
                        For laptops: <span className="text-blue-300 font-bold">Original Charger Included</span> when specifically mentioned on the product listing.
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Any additional accessories will be clearly mentioned in the product description.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Display Label:</span>
                  <span className="font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                    🔵 Condition: Very Good
                  </span>
                </div>
              </div>
            )}

            {/* CARD 3: GOOD CONDITION */}
            {(selectedTab === 'all' || selectedTab === 'Good') && (
              <div
                className={`flex flex-col justify-between rounded-2xl bg-[#0F1626] border p-5 transition-all ${
                  selectedTab === 'Good'
                    ? 'border-yellow-400 shadow-xl shadow-yellow-950/40 ring-1 ring-yellow-400'
                    : 'border-yellow-400/30 hover:border-yellow-400/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>🟡 Good Condition</span>
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      Tier 3 · Maximum Savings
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Products marked <strong className="text-yellow-300 font-bold">Good Condition</strong> are fully usable products that may show more noticeable signs of previous use.
                  </p>

                  {/* Typical Characteristics */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Typical Characteristics:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Visible but normal signs of use may be present</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Minor to moderate scratches or cosmetic marks may be present</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Small dents or wear may be present depending on the product</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Screen/display remains functional</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Main functions are working properly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BatteryCharging className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Battery health is generally around <strong>80%–95%</strong> for applicable devices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400">Battery condition may vary depending on the individual product</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PackageCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-yellow-300 font-medium">Product has been checked before listing</span>
                      </li>
                    </ul>
                  </div>

                  {/* Accessories */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Accessories</span>
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                      <p className="text-slate-300 font-semibold">
                        For laptops: <span className="text-yellow-300 font-bold">Original Charger Included</span> when specifically mentioned on the product listing.
                      </p>
                      <p className="text-slate-400 text-[10px]">
                        Other included accessories must be clearly displayed on the individual product page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Display Label:</span>
                  <span className="font-bold text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-800/60">
                    🟡 Condition: Good
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* 4. IMPORTANT BATTERY HEALTH RULE BANNER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#111726] to-emerald-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BatteryCharging className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Important Battery Health Rule
              </h4>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-slate-200 font-medium">
                <strong>Battery health is an approximate guideline and should NOT be treated as a guaranteed exact percentage for every product.</strong>
              </p>
              <p className="text-slate-400">
                Display battery information dynamically when available. For instance, our store automatically shows certified battery capacity readings on product cards:
              </p>

              {/* Dynamic Battery Info Callout */}
              <div className="p-3 bg-[#0A0D15] rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">Dynamic Display Example:</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-md shadow-sm">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery Health: 92%</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Backed by our 12-Month Official Warranty
                </span>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Note: Battery degradation occurs naturally over time. Each device in our inventory is tested with specialized diagnostic software to ensure high capacity and reliable standby performance before listing.
              </p>
            </div>
          </div>

        </div>

        {/* 5. Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Revox Certified Refurbish Quality Standard · Saudi Arabia
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer ml-auto shadow-md"
          >
            Understood, Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
