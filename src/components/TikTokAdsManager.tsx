import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  Music,
  Volume2,
  VolumeX,
  Smartphone,
  Layers,
  Settings,
  ShieldCheck,
  BatteryCharging,
  DollarSign,
  TrendingUp,
  Tag,
  Target,
  Globe,
  Flame,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Product } from '../types';

interface TikTokAdsManagerProps {
  products: Product[];
}

export const TikTokAdsManager: React.FC<TikTokAdsManagerProps> = ({ products }) => {
  // 1. Product Selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    products[0]?.id || '',
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Currently focused product for the slide creator
  const activeProduct =
    products.find((p) => p.id === selectedProductIds[0]) || products[0];

  // 2. Video & Slide Creator Settings
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1'>('9:16');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideSpeed, setSlideSpeed] = useState<number>(2500); // 2.5s per frame
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState('trending_phonk');
  const [customHeadline, setCustomHeadline] = useState(
    '🔥 Certified Tech Deal in Saudi Arabia!'
  );
  const [customSticker, setCustomSticker] = useState('0 SAR Shipping');
  const [exportingAsset, setExportingAsset] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 3. Campaign & Ad Generator Settings
  const [adPlatform, setAdPlatform] = useState<'tiktok' | 'meta' | 'both'>('tiktok');
  const [campaignObjective, setCampaignObjective] = useState<'conversions' | 'traffic' | 'video_views'>('conversions');
  const [campaignName, setCampaignName] = useState(
    `[KSA-Ads] ${activeProduct?.name || 'Refurbished Tech'} - Conversions Q4`
  );
  const [targetCity, setTargetCity] = useState('all_ksa');
  const [dailyBudget, setDailyBudget] = useState(250); // SAR
  const [adLanguage, setAdLanguage] = useState<'ar' | 'en'>('ar');
  const [ctaButton, setCtaButton] = useState<'Shop Now' | 'Order Now' | 'Get Offer'>('Shop Now');
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [campaignLaunched, setCampaignLaunched] = useState(false);

  // Slides definition for the focused product
  const slides = useMemo(() => {
    if (!activeProduct) return [];
    const condition = activeProduct.conditionGrade || 'Excellent';
    const battery = activeProduct.batteryHealth || '94% Tested';
    const discount = activeProduct.originalPrice > activeProduct.price
      ? Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)
      : 30;

    return [
      {
        id: 1,
        tag: 'HERO HOOK',
        title: activeProduct.name,
        subtitle: '100% Inspected · Factory Certified Refurbished',
        badge: 'Top Pick · Saudi Arabia',
        highlight: 'Like New Quality',
        image: activeProduct.image,
      },
      {
        id: 2,
        tag: 'CONDITION & QA',
        title: `${condition} Condition`,
        subtitle: '100-Point Hardware Diagnostic Check',
        badge: 'Certified Refurbished',
        highlight: 'Ultrasound Sanitized',
        image: (activeProduct.galleryImages && activeProduct.galleryImages[0]) || activeProduct.image,
      },
      {
        id: 3,
        tag: 'BATTERY HEALTH',
        title: `Battery Health: ${battery}`,
        subtitle: 'Tested Capacity & Genuine Endurance',
        badge: 'High Performance',
        highlight: 'All Day Standby Verified',
        image: activeProduct.image,
      },
      {
        id: 4,
        tag: 'PRICE & SAVINGS',
        title: `${activeProduct.price.toLocaleString()} SAR`,
        subtitle: `Save up to ${discount}% compared to brand new retail!`,
        badge: `-${discount}% Mega Savings`,
        highlight: activeProduct.originalPrice ? `Was ${activeProduct.originalPrice.toLocaleString()} SAR` : 'Best KSA Value',
        image: (activeProduct.galleryImages && activeProduct.galleryImages[1]) || activeProduct.image,
      },
      {
        id: 5,
        tag: 'OFFICIAL GUARANTEE',
        title: '12-Month Official Warranty',
        subtitle: '0 SAR Free Delivery on Advance Payment',
        badge: 'Doorstep Delivery KSA',
        highlight: '7-Days Money Back Policy',
        image: activeProduct.image,
      },
    ];
  }, [activeProduct]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, slideSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, slideSpeed, slides.length]);

  // Keep campaign name in sync with product selection
  useEffect(() => {
    if (activeProduct) {
      setCampaignName(`[KSA-${adPlatform.toUpperCase()}] ${activeProduct.name} - Conversions`);
    }
  }, [activeProduct, adPlatform]);

  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(selectedProductIds.filter((p) => p !== id));
      }
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const selectSingleForPreview = (id: string) => {
    if (!selectedProductIds.includes(id)) {
      setSelectedProductIds([id, ...selectedProductIds]);
    } else {
      // Re-order so clicked is first
      setSelectedProductIds([id, ...selectedProductIds.filter((p) => p !== id)]);
    }
    setCurrentSlideIndex(0);
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategoryFilter === 'all' ||
      p.category.toLowerCase() === activeCategoryFilter.toLowerCase();
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Generated Ad Copy
  const adCopyArabic = `🇸🇦 أقوى عروض الأجهزة المجددة الأصلية من ريفوكس!
🔥 ${activeProduct?.name} بحالة ممتازة وفحص شامل 100 نقطة.
⚡ صحة بطارية ${activeProduct?.batteryHealth || 'ممتازة'} وضمان ذهبي 12 شهر.
💰 بسعر ${activeProduct?.price.toLocaleString()} ريال فقط (وفر حتى ${Math.round(((activeProduct?.originalPrice - activeProduct?.price) / activeProduct?.originalPrice) * 100)}%)!
🚚 شحن مجاني 0 ريال عند الدفع المسبق (الراجحي / STC Pay / Barq).
اضغط على الرابط واطلب جهازك الآن مع استبدال وتوصيل سريع لكافة مدن المملكة.
#ريفوكس #أجهزة_مجددة #السعودية #الرياض #عروض_تقنية #ايفون`;

  const adCopyEnglish = `🇸🇦 Top Certified Refurbished Tech in Saudi Arabia!
🔥 ${activeProduct?.name} in pristine certified condition with 100-point diagnostic check.
⚡ Tested ${activeProduct?.batteryHealth || 'high capacity'} battery health + 12-Month Official Revox Warranty.
💰 Only ${activeProduct?.price.toLocaleString()} SAR (Massive savings vs new)!
🚚 0 SAR Free Doorstep Delivery on Advance Payment (Al Rajhi / STC Pay / Barq).
Shop now with full warranty and fast Saudi delivery.
#RevoxKSA #Refurbished #SaudiTech #Riyadh #TechDeals`;

  const currentAdCopy = adLanguage === 'ar' ? adCopyArabic : adCopyEnglish;

  const handleCopyPayload = () => {
    const payload = {
      platform: adPlatform,
      campaign_name: campaignName,
      objective: campaignObjective,
      target_location: targetCity,
      daily_budget_sar: dailyBudget,
      estimated_reach: `${(dailyBudget * 28).toLocaleString()} - ${(dailyBudget * 52).toLocaleString()} impressions/day`,
      products: selectedProductIds.map((id) => {
        const prod = products.find((p) => p.id === id);
        return {
          id: prod?.id,
          name: prod?.name,
          price_sar: prod?.price,
          condition: prod?.conditionGrade || prod?.condition,
          url: `${window.location.origin}/?product=${prod?.id}`,
        };
      }),
      ad_creative: {
        aspect_ratio: aspectRatio,
        headline: customHeadline,
        sticker_badge: customSticker,
        primary_text: currentAdCopy,
        call_to_action: ctaButton,
        music_beat: selectedMusic,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleSimulateExport = () => {
    setExportingAsset(true);
    setTimeout(() => {
      setExportingAsset(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1800);
  };

  const handleLaunchCampaign = () => {
    setCampaignLaunched(true);
    setTimeout(() => setCampaignLaunched(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111723] p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-['Poppins']">
                TikTok & Social Ads Manager
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                PRO Ads Studio
              </span>
              <a
                href="https://www.tiktok.com/@revox.ksa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                title="Open Official TikTok Account"
              >
                <span>@revox.ksa.com</span>
                <span className="text-[9px] text-cyan-400">↗</span>
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated 9:16 Video Slide Creator, Direct TikTok & Meta Campaign Builder, and Product Multi-Ad Launcher.
            </p>
          </div>
        </div>

        {/* Quick Platform Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#090D15] rounded-xl border border-slate-800 self-start md:self-auto text-xs">
          <button
            type="button"
            onClick={() => setAdPlatform('tiktok')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adPlatform === 'tiktok'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎵 TikTok Ads</span>
          </button>
          <button
            type="button"
            onClick={() => setAdPlatform('meta')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adPlatform === 'meta'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📱 Facebook & IG</span>
          </button>
          <button
            type="button"
            onClick={() => setAdPlatform('both')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adPlatform === 'both'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ Dual Launch</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: INVENTORY SELECTOR (LEFT) + VIDEO CREATOR & AD CAMPAIGN GENERATOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (4 Cols): PRODUCT SELECTION & INVENTORY SELECTOR */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#111723] rounded-2xl border border-slate-800 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Select Products for Ads</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {selectedProductIds.length} Selected
              </span>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090D15] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 text-[11px]">
                {['all', 'iPhones', 'Laptops', 'Samsung', 'Cameras', 'Accessories'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition-colors cursor-pointer ${
                      activeCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 bg-slate-900 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Select Product Cards List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No products available in catalog. Add items in the Product Management tab to create ads.
                </div>
              ) : (
                filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const isCurrentlyPreviewed = activeProduct?.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => selectSingleForPreview(p.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrentlyPreviewed
                        ? 'bg-[#182338] border-amber-400 shadow-md ring-1 ring-amber-400'
                        : isSelected
                        ? 'bg-[#141B2D] border-amber-500/40'
                        : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectProduct(p.id);
                        }}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="text-emerald-400 font-semibold">{p.conditionGrade || 'Excellent'}</span>
                          {p.batteryHealth && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-emerald-400">{p.batteryHealth}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs text-amber-400 block">
                        {p.price.toLocaleString()} SAR
                      </span>
                      {isCurrentlyPreviewed && (
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block mt-0.5">
                          Active Preview
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setSelectedProductIds(products.map((p) => p.id))}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline text-[11px]"
              >
                Select All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds(products[0]?.id ? [products[0].id] : [])}
                className="text-slate-400 hover:text-white cursor-pointer text-[11px]"
              >
                Reset to 1 Item
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 Cols): 9:16 VIDEO SLIDE CREATOR & AD CAMPAIGN GENERATOR */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* A. DYNAMIC VIDEO & SLIDE CREATOR (TIKTOK 9:16 GUIDELINE OPTIMIZED) */}
          <div className="bg-[#111723] rounded-2xl border border-slate-800 p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Video & Image Slide Creator (TikTok / Meta 9:16 Engine)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    aspectRatio === '9:16'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  9:16 Vertical (TikTok/Reels)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    aspectRatio === '1:1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  1:1 Square (Feed)
                </button>
              </div>
            </div>

            {/* Slide Player Stage + Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Left Side: Mock Phone Canvas / Video Display */}
              <div className="md:col-span-5 flex justify-center">
                <div
                  className={`relative bg-[#070A11] rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between select-none ${
                    aspectRatio === '9:16' ? 'w-[230px] h-[410px]' : 'w-[260px] h-[260px]'
                  }`}
                >
                  {/* Top TikTok/Reels Overlay Mock */}
                  <div className="p-3 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-wider text-white uppercase font-mono">
                        Revox Ads
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow">
                      {customSticker}
                    </span>
                  </div>

                  {/* Active Slide Image Stage */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                      src={slides[currentSlideIndex]?.image}
                      alt="Slide preview"
                      className="w-full h-full object-cover rounded-xl transition-all duration-500 scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                  </div>

                  {/* Middle Slide Content */}
                  <div className="relative z-10 p-4 space-y-1 my-auto text-center animate-in fade-in duration-300">
                    <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-amber-400 bg-black/70 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                      {slides[currentSlideIndex]?.tag}
                    </span>
                    <h4 className="text-base font-black text-white leading-tight drop-shadow-md">
                      {slides[currentSlideIndex]?.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-medium drop-shadow">
                      {slides[currentSlideIndex]?.subtitle}
                    </p>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full inline-block">
                        {slides[currentSlideIndex]?.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Controls / TikTok Action Pill */}
                  <div className="p-3 z-10 space-y-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <div className="flex items-center justify-between text-[10px] text-white font-semibold">
                      <span className="truncate max-w-[130px]">{activeProduct?.name || 'Product'}</span>
                      <span className="font-mono text-amber-400 font-black">
                        {activeProduct?.price != null ? `${activeProduct.price.toLocaleString()} SAR` : '0 SAR'}
                      </span>
                    </div>
                    <div className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-[11px] flex items-center justify-between shadow-lg">
                      <span>{ctaButton}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1 pt-1">
                      {slides.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i === currentSlideIndex ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Slide Sequence Controls & Audio Engine */}
              <div className="md:col-span-7 space-y-4 text-xs">
                
                {/* Playback Controls Bar */}
                <div className="p-3 bg-[#0A0E17] rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
                      title={isPlaying ? 'Pause Slideshow' : 'Play Video Slideshow'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      Frame {currentSlideIndex + 1} of {slides.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Speed:</span>
                    {[
                      { label: '1.5s', ms: 1500 },
                      { label: '2.5s', ms: 2500 },
                      { label: '3.5s', ms: 3500 },
                    ].map((s) => (
                      <button
                        key={s.ms}
                        onClick={() => setSlideSpeed(s.ms)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                          slideSpeed === s.ms
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio & Music Beats Selector */}
                <div className="p-3 bg-[#0A0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Music className="w-3.5 h-3.5 text-rose-400" />
                      <span>Soundtrack & Beat Sync</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'trending_phonk', name: '🔥 Saudi Phonk', bpm: '140 BPM' },
                      { id: 'luxury_tech', name: '✨ Luxury Tech', bpm: '120 BPM' },
                      { id: 'energetic_bounce', name: '⚡ Hyper Bounce', bpm: '128 BPM' },
                    ].map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setSelectedMusic(track.id)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          selectedMusic === track.id
                            ? 'bg-rose-500/10 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-[11px] block truncate">{track.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 block">{track.bpm}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slide Custom Overlays */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Ad Headline Hook
                    </label>
                    <input
                      type="text"
                      value={customHeadline}
                      onChange={(e) => setCustomHeadline(e.target.value)}
                      className="w-full bg-[#0A0E17] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Promo Badge Sticker
                    </label>
                    <input
                      type="text"
                      value={customSticker}
                      onChange={(e) => setCustomSticker(e.target.value)}
                      className="w-full bg-[#0A0E17] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Export Asset Button */}
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSimulateExport}
                    disabled={exportingAsset}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                  >
                    {exportingAsset ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering 9:16 Video Asset...</span>
                      </>
                    ) : exportSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>HD Video Ready for TikTok Upload!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Export TikTok 9:16 Video Ad Package</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* B. DIRECT TIKTOK & FACEBOOK AD INTEGRATION & LAUNCH PAYLOAD */}
          <div className="bg-[#111723] rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Direct TikTok / Facebook Ad Workflow & Copy Generator
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Copy Language:</span>
                <button
                  type="button"
                  onClick={() => setAdLanguage('ar')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    adLanguage === 'ar' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  🇸🇦 Arabic
                </button>
                <button
                  type="button"
                  onClick={() => setAdLanguage('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                    adLanguage === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Campaign Parameters Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Campaign Objective
                </label>
                <select
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value as any)}
                  className="w-full bg-[#090D15] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="conversions">Catalog Conversions (Sales)</option>
                  <option value="traffic">Storefront Traffic</option>
                  <option value="video_views">High-Retention Video Views</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Target Geographic Area
                </label>
                <select
                  value={targetCity}
                  onChange={(e) => setTargetCity(e.target.value)}
                  className="w-full bg-[#090D15] border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all_ksa">All Saudi Arabia (KSA Wide)</option>
                  <option value="riyadh">Riyadh Hub & Central Region</option>
                  <option value="jeddah_mecca">Jeddah, Mecca & Western Province</option>
                  <option value="dammam_khobar">Dammam & Eastern Province</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Daily Ad Budget (SAR)
                </label>
                <div className="flex items-center gap-1 bg-[#090D15] border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <input
                    type="number"
                    min={50}
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full bg-transparent text-amber-400 font-mono font-bold focus:outline-none text-xs"
                  />
                  <span className="text-[10px] font-bold text-slate-400">SAR/day</span>
                </div>
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Campaign Identifier
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full bg-[#090D15] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
            </div>

            {/* AI Generated Primary Ad Copy */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Optimized TikTok & Facebook Ad Copy</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentAdCopy);
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Copywriting Text</span>
                </button>
              </div>
              <textarea
                rows={4}
                readOnly
                value={currentAdCopy}
                className="w-full bg-[#090D15] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none"
              />
            </div>

            {/* Actions: Direct Launch & Payload Export */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Pixel Tracking Ready: CompletePayment, AddToCart</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied JSON / Spec!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Campaign API Payload</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleLaunchCampaign}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                >
                  {campaignLaunched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Campaign Successfully Launched!</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 text-slate-950" />
                      <span>Deploy to TikTok & Facebook Ads</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
