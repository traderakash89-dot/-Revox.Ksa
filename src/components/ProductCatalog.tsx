import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenCondition: (product: Product, e: React.MouseEvent) => void;
  onOpenConditionGuide?: () => void;
  onShareProduct?: (product: Product, e: React.MouseEvent) => void;
}

// Dedicated Pure Touch & Drag Swipe Row (No manual navigation buttons, no arrows)
const TouchSwipeRow: React.FC<{
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, e: React.MouseEvent) => void;
  onOpenCondition: (p: Product, e: React.MouseEvent) => void;
  onShareProduct?: (p: Product, e: React.MouseEvent) => void;
}> = ({ products, onSelectProduct, onAddToCart, onOpenCondition, onShareProduct }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rowRef.current) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftVal.current = rowRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !rowRef.current) return;
    const x = e.pageX - rowRef.current.offsetLeft;
    const distance = Math.abs(x - startX.current);
    if (distance > 5) {
      isDragging.current = true;
      e.preventDefault();
      rowRef.current.scrollLeft = scrollLeftVal.current - (x - startX.current) * 1.3;
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    // Delay resetting isDragging slightly so child onClick can check it
    setTimeout(() => {
      isDragging.current = false;
    }, 60);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    isDragging.current = false;
  };

  const handleCardSelect = (product: Product) => {
    if (isDragging.current) return;
    onSelectProduct(product);
  };

  return (
    <div
      ref={rowRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-2 pt-1 select-none scroll-smooth cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-x pan-y',
      }}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[74vw] min-w-[240px] max-w-[310px] sm:w-[235px] sm:max-w-none md:w-[255px] lg:w-[275px] shrink-0"
        >
          <ProductCard
            product={product}
            onSelect={handleCardSelect}
            onAddToCart={onAddToCart}
            onOpenCondition={onOpenCondition}
            onShareProduct={onShareProduct}
          />
        </div>
      ))}
    </div>
  );
};

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onAddToCart,
  onOpenCondition,
  onOpenConditionGuide,
  onShareProduct,
}) => {
  // Filter Popover modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Advanced Filter options
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'under1000' | '1000to3000' | '3000to6000' | 'above6000'>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  const categories = [
    { label: 'All Products', value: 'all' },
    { label: 'iPhones', value: 'iPhones' },
    { label: 'Laptops', value: 'Laptops' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Cameras', value: 'Cameras' },
    { label: 'Chargers', value: 'Chargers' },
    { label: 'Accessories', value: 'Accessories' },
  ];

  const brands = [
    { label: 'All Brands', value: 'all' },
    { label: 'Apple', value: 'Apple' },
    { label: 'Samsung', value: 'Samsung' },
    { label: 'Sony', value: 'Sony' },
    { label: 'Revox GaN', value: 'Revox' },
  ];

  const conditions = [
    { label: 'All Conditions', value: 'all' },
    { label: '🟢 Excellent Condition', value: 'Excellent' },
    { label: '🔵 Very Good Condition', value: 'Very Good' },
    { label: '🟡 Good Condition', value: 'Good' },
  ];

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (conditionFilter !== 'all') count++;
    if (sortBy !== 'featured') count++;
    return count;
  }, [selectedCategory, selectedBrand, priceRange, conditionFilter, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    onSelectCategory('all');
    setSelectedBrand('all');
    setPriceRange('all');
    setConditionFilter('all');
    setSortBy('featured');
    onSearchChange('');
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Exclude soft-deleted products in Trash
      if (item.isDeleted) return false;

      // Category filter
      const matchCategory =
        selectedCategory === 'all' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'iPhones' && item.name.toLowerCase().includes('iphone'));

      // Brand filter
      const matchBrand =
        selectedBrand === 'all' ||
        item.name.toLowerCase().includes(selectedBrand.toLowerCase()) ||
        item.description.toLowerCase().includes(selectedBrand.toLowerCase());

      // Price range filter
      let matchPrice = true;
      if (priceRange === 'under1000') matchPrice = item.price < 1000;
      if (priceRange === '1000to3000') matchPrice = item.price >= 1000 && item.price <= 3000;
      if (priceRange === '3000to6000') matchPrice = item.price > 3000 && item.price <= 6000;
      if (priceRange === 'above6000') matchPrice = item.price > 6000;

      // Condition filter
      const matchCondition =
        conditionFilter === 'all' ||
        (item.conditionGrade && item.conditionGrade.toLowerCase() === conditionFilter.toLowerCase()) ||
        item.condition.toLowerCase().includes(conditionFilter.toLowerCase());

      // Search query
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchBrand && matchPrice && matchCondition && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedBrand, priceRange, conditionFilter, searchQuery, sortBy]);

  // Split into multiple (2 to 3) similar product rows/lines cleanly
  const productRows = useMemo(() => {
    const total = filteredProducts.length;
    if (total === 0) return [];
    
    if (total <= 3) {
      return [
        {
          id: 'line-1',
          title: 'Featured Selection',
          badge: 'Line 1',
          items: filteredProducts,
        },
      ];
    }
    
    if (total <= 6) {
      const half = Math.ceil(total / 2);
      return [
        {
          id: 'line-1',
          title: 'Featured Flagships & Top Rated',
          badge: 'Line 1',
          items: filteredProducts.slice(0, half),
        },
        {
          id: 'line-2',
          title: 'Popular Certified Choices',
          badge: 'Line 2',
          items: filteredProducts.slice(half),
        },
      ];
    }

    // 3 clean, similar product rows/lines
    const chunk1 = Math.ceil(total / 3);
    const chunk2 = Math.ceil((total - chunk1) / 2);

    return [
      {
        id: 'line-1',
        title: 'Featured Flagships & Top Picks',
        badge: 'Line 1',
        items: filteredProducts.slice(0, chunk1),
      },
      {
        id: 'line-2',
        title: 'Trending Refurbished Tech',
        badge: 'Line 2',
        items: filteredProducts.slice(chunk1, chunk1 + chunk2),
      },
      {
        id: 'line-3',
        title: 'Best Value Certified Gear',
        badge: 'Line 3',
        items: filteredProducts.slice(chunk1 + chunk2),
      },
    ];
  }, [filteredProducts]);

  return (
    <section id="catalog-section" className="py-4 sm:py-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
      
      {/* 1. SECTION TITLE & FILTER FEATURE (NO MANUAL SLIDE BUTTONS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
        
        {/* Section Title with Verified Glow Icon */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Recommended For You
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600">
            Certified refurbished tech · 12-Month Official Warranty · Swipe across lines to explore
          </p>
        </div>

        {/* Action Toolbar: Condition Guide button + Filter Option button + Sort dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          
          {/* Direct Product Condition Guide Button */}
          {onOpenConditionGuide && (
            <button
              type="button"
              onClick={onOpenConditionGuide}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500/60 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              title="Open Product Condition Guide"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Condition Guide</span>
            </button>
          )}

          {/* SLEEK COMPACT FILTER OPTION BUTTON */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-[1.03] active:scale-95 ${
              activeFiltersCount > 0
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white border-blue-400 shadow-[0_4px_16px_rgba(0,114,255,0.35)]'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-400/50 text-slate-700 hover:text-slate-950 shadow-xs hover:shadow-[0_4px_16px_rgba(0,198,255,0.15)]'
            }`}
            title="Filter by category, price, brand, and condition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
            <span>Filter Options</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 font-mono text-[10px] flex items-center justify-center font-bold shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-700 shadow-xs">
            <ArrowUpDown className="w-3 h-3 text-cyan-600 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rating</option>
            </select>
          </div>

        </div>
      </div>

      {/* Active Filter Pills Bar (Quick Remove Chips) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap py-0.5 text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Active:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px]">
              <span>Category: {selectedCategory}</span>
              <button onClick={() => onSelectCategory('all')} className="hover:text-cyan-950 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px]">
              <span>Brand: {selectedBrand}</span>
              <button onClick={() => setSelectedBrand('all')} className="hover:text-blue-950 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
              <span>Price: {priceRange.replace('to', ' - ').replace('under', '< ').replace('above', '> ')} SAR</span>
              <button onClick={() => setPriceRange('all')} className="hover:text-emerald-950 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          {conditionFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px]">
              <span>Condition: {conditionFilter}</span>
              <button onClick={() => setConditionFilter('all')} className="hover:text-purple-950 cursor-pointer"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-cyan-700 hover:text-cyan-800 underline font-semibold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 2. MULTIPLE PRODUCT ROWS / LINES WITH TOUCH & SWIPE HORIZONTAL SCROLLING */}
      {productRows.length > 0 ? (
        <div className="space-y-5 sm:space-y-6">
          {productRows.map((row) => (
            <div key={row.id} className="space-y-2">
              
              {/* Row Header with clean title and item count */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                    {row.badge}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-wide">
                    {row.title}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {row.items.length} items
                </span>
              </div>

              {/* Pure Touch & Swipe Horizontal Scrolling Track (No Buttons / No Arrows) */}
              <TouchSwipeRow
                products={row.items}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
                onOpenCondition={onOpenCondition}
                onShareProduct={onShareProduct}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-14 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {products.length === 0 ? 'Live Inventory Currently Empty' : 'No items found matching your filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            {products.length === 0
              ? 'New certified refurbished inventory added in the Admin Panel will automatically appear here globally in real-time.'
              : "We couldn't find items matching your active category or search filters. Try resetting filters."}
          </p>
          {products.length > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* 3. SLEEK COMPACT FILTER MODAL / DROPDOWN DIALOG */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Filter "Recommended For You"
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Sections */}
            <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
              
              {/* Category Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onSelectCategory(c.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                        selectedCategory === c.value
                          ? 'bg-cyan-600 text-white font-bold border-cyan-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Price Range (SAR)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'All Prices', val: 'all' },
                    { label: 'Under 1,000 SAR', val: 'under1000' },
                    { label: '1,000 - 3,000 SAR', val: '1000to3000' },
                    { label: '3,000 - 6,000 SAR', val: '3000to6000' },
                    { label: 'Above 6,000 SAR', val: 'above6000' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriceRange(p.val as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                        priceRange === p.val
                          ? 'bg-cyan-600 text-white font-bold border-cyan-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Brand / Manufacturer
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {brands.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setSelectedBrand(b.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                        selectedBrand === b.value
                          ? 'bg-cyan-600 text-white font-bold border-cyan-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Refurbished Condition Grade
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {conditions.map((cd) => (
                    <button
                      key={cd.value}
                      type="button"
                      onClick={() => setConditionFilter(cd.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                        conditionFilter === cd.value
                          ? 'bg-cyan-600 text-white font-bold border-cyan-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cd.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-all active:scale-95"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-extrabold text-xs cursor-pointer shadow-[0_4px_16px_rgba(0,114,255,0.35)] hover:shadow-[0_6px_22px_rgba(0,114,255,0.5)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
