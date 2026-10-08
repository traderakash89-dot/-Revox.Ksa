import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  BatteryCharging,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Smartphone,
  Camera,
  Zap,
  Headphones,
  CheckCircle2,
  Star,
  RotateCcw,
  Clock,
  Award,
} from 'lucide-react';
import { CMSConfig } from '../types';

interface HeroSectionProps {
  cms: CMSConfig;
  onExplore: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  cms,
  onExplore,
  onSelectCategory,
  activeCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: 'Certified Pristine · Grade A+',
      productName: 'iPhone 15 Pro Max',
      title: 'Titanium Flagship',
      bullets: [
        '98%+ Battery Health Guaranteed',
        '12-Month Revox Official Warranty',
        'Save 35% vs Brand New Retail',
      ],
      price: '3,899 SAR',
      oldPrice: '5,199 SAR',
      image: '/src/assets/images/refurbished_iphone_titanium_1790978131968.jpg',
      alt: 'Apple iPhone 15 Pro Max Natural Titanium',
      categoryTarget: 'iPhones',
    },
    {
      badge: 'Ultrasound Inspected Silicon',
      productName: 'MacBook Pro 16" M3',
      title: 'Next-Gen Performance',
      bullets: [
        'Low Cycle Count · 100% Health',
        'Liquid Retina XDR Display',
        'Full 100-Point Hardware Inspected',
      ],
      price: '6,499 SAR',
      oldPrice: '9,648 SAR',
      image: '/src/assets/images/refurbished_macbook_pro_1790978142319.jpg',
      alt: 'Apple MacBook Pro M3 Space Black',
      categoryTarget: 'Laptops',
    },
    {
      badge: 'Acoustic Lab Certified',
      productName: 'Sony WH-1000XM5',
      title: 'Noise Cancelling Flagship',
      bullets: [
        'Ultrasonic Sanitized & Like-New',
        'Industry Leading Noise Cancellation',
        '30-Hour Battery Performance',
      ],
      price: '999 SAR',
      oldPrice: '1,499 SAR',
      image: '/src/assets/images/refurbished_sony_headphones_1790978152489.jpg',
      alt: 'Sony WH-1000XM5 Studio Headphones',
      categoryTarget: 'Accessories',
    },
    {
      badge: 'Super Fast GaN Tech',
      productName: 'Revox 65W GaN Charger',
      title: 'Dual Port Compact Power',
      bullets: [
        'PD 3.0 & PPS Rapid Charge',
        'iPhone, Mac & Samsung Compatible',
        'Includes 100W Braided Cable',
      ],
      price: '129 SAR',
      oldPrice: '199 SAR',
      image: '/src/assets/images/refurbished_fast_charger_1790978184852.jpg',
      alt: 'Revox 65W GaN Fast Dual Port Charger',
      categoryTarget: 'Chargers',
    },
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const categoryCards = [
    { label: 'All Tech', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, cat: 'all' },
    { label: 'iPhones', icon: <Smartphone className="w-3.5 h-3.5 text-amber-400" />, cat: 'iPhones' },
    { label: 'Laptops', icon: <Laptop className="w-3.5 h-3.5 text-blue-400" />, cat: 'Laptops' },
    { label: 'Samsung', icon: <Smartphone className="w-3.5 h-3.5 text-purple-400" />, cat: 'Samsung' },
    { label: 'Cameras', icon: <Camera className="w-3.5 h-3.5 text-cyan-400" />, cat: 'Cameras' },
    { label: 'Chargers', icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />, cat: 'Chargers' },
    { label: 'Audio', icon: <Headphones className="w-3.5 h-3.5 text-emerald-400" />, cat: 'Accessories' },
    { label: 'Deals', icon: <Star className="w-3.5 h-3.5 text-pink-400" />, cat: 'all' },
  ];

  const slide = slides[currentSlide];

  return (
    <section className="w-full bg-[#F8FAFC] border-b border-slate-200">
      
      {/* 1. Full-Width Slim Hero Banner / Slider (Extreme Left to Extreme Right) */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#0B0F19] via-[#111827] to-[#0B0F19] border-b border-slate-800/80">
        
        {/* Ambient subtle glow effects */}
        <div className="absolute top-0 left-1/4 w-80 h-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-full bg-blue-500/5 blur-3xl pointer-events-none" />

        {/* Banner Slide Content - Compact & Slim Vertical Proportions */}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 min-h-[220px] sm:min-h-[250px] md:min-h-[270px] flex items-center relative">
          
          {/* Arrow Left */}
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Arrow Right */}
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Two-Column Side-by-Side Banner Content */}
          <div className="w-full grid grid-cols-12 gap-3 sm:gap-6 items-center px-6 sm:px-10">
            
            {/* Left Side: Short, crisp title, product name, and key bullet points (No paragraphs or clutter) */}
            <div className="col-span-7 sm:col-span-7 md:col-span-8 space-y-1.5 sm:space-y-2">
              
              {/* Badge & Free Shipping Tag */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[9px] sm:text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  {slide.badge}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  <Truck className="w-2.5 h-2.5" />
                  Free Shipping
                </span>
              </div>

              {/* Product Name & Short Title */}
              <div>
                <h1 className="text-base sm:text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight line-clamp-1">
                  {slide.productName}
                </h1>
                <p className="text-[11px] sm:text-sm font-semibold text-amber-300/90 leading-tight">
                  {slide.title}
                </p>
              </div>

              {/* Crisp Bullet Points (3 Key Features) */}
              <ul className="space-y-0.5 sm:space-y-1 pt-0.5">
                {slide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-300 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Price & Action Button */}
              <div className="flex items-center gap-2 sm:gap-3 pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm sm:text-lg font-black text-white">
                    {slide.price}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono hidden sm:inline">
                    {slide.oldPrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(slide.categoryTarget);
                    onExplore();
                  }}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#38BDF8] to-[#4FACFE] text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shadow-[0_3px_16px_rgba(0,242,254,0.4)] hover:shadow-[0_5px_24px_rgba(0,242,254,0.65)] hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

            </div>

            {/* Right Side: Clean Product Image Graphic */}
            <div className="col-span-5 sm:col-span-5 md:col-span-4 flex items-center justify-center">
              <div className="relative w-full max-w-[140px] sm:max-w-[200px] md:max-w-[240px] aspect-[4/3] rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/60 shadow-lg p-1.5 flex items-center justify-center group">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono text-amber-400 border border-amber-500/20 font-bold">
                  Certified
                </div>
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* 2. Trust & Policy Badges (Right Beneath Hero Banner in a neat horizontal row) */}
      <div className="w-full bg-white border-b border-slate-200 py-2 sm:py-2.5 px-2 sm:px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-1.5 sm:gap-4">
          
          {/* Badge 1: Free Delivery */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/90 hover:border-cyan-500/40 transition-colors">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[10px] sm:text-xs text-[#0F172A] block leading-tight truncate">
                Free Delivery
              </span>
              <span className="text-[8px] sm:text-[10px] text-cyan-700 font-semibold block leading-tight truncate">
                Across Saudi Arabia
              </span>
            </div>
          </div>

          {/* Badge 2: 7-Days Return Policy */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/90 hover:border-blue-500/40 transition-colors">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[10px] sm:text-xs text-[#0F172A] block leading-tight truncate">
                7-Days Return
              </span>
              <span className="text-[8px] sm:text-[10px] text-slate-500 font-medium block leading-tight truncate">
                Hassle-Free Policy
              </span>
            </div>
          </div>

          {/* Badge 3: 12 Months Warranty */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/90 hover:border-emerald-500/40 transition-colors">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[10px] sm:text-xs text-[#0F172A] block leading-tight truncate">
                12 Months Warranty
              </span>
              <span className="text-[8px] sm:text-[10px] text-emerald-700 font-semibold block leading-tight truncate">
                Official Guarantee
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Single-Row Circular/Pill Slider Layout with Horizontal Smooth Scrolling & Animation */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 inline-block animate-ping" />
            <span>Select Category</span>
          </span>
          <span className="text-[10px] text-cyan-700 font-semibold flex items-center gap-1">
            <span className="hidden sm:inline">Free Delivery All KSA (5-7 Days) · </span>
            <span className="text-slate-400">Swipe →</span>
          </span>
        </div>

        {/* Single-Row Horizontal Scrollable Container with Smooth Touch Scrolling & Hide Scrollbar */}
        <div className="relative w-full">
          {/* Subtle scroll edge gradient masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10" />

          <div
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categoryCards.map((card) => {
              const isActive = activeCategory === card.cat;
              return (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => {
                    onSelectCategory(card.cat);
                    onExplore();
                  }}
                  className={`group shrink-0 flex items-center gap-2 pl-1.5 pr-3 sm:pr-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500 text-white shadow-[0_3px_12px_rgba(0,198,255,0.35)] ring-2 ring-cyan-400/40'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:text-slate-950 hover:border-cyan-300'
                  }`}
                  title={`Filter by ${card.label}`}
                >
                  {/* Modern circular icon container */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-inner'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600'
                    }`}
                  >
                    {card.icon}
                  </div>

                  {/* Clean category label */}
                  <span
                    className={`text-xs sm:text-[13px] font-bold tracking-tight whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {card.label}
                  </span>

                  {/* Subtle active status indicator dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
};
