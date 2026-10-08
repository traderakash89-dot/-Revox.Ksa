import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Twitter,
  Facebook,
  Mail,
  ShieldCheck,
  BatteryCharging,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';

interface ShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ product, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  // Construct sharing URL and text
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?product=${product.id}` : '';
  const shareTitle = `${product.name} - Revox Certified Refurbished`;
  const conditionLabel = product.conditionGrade
    ? `${product.conditionGrade} Condition`
    : product.condition || 'Excellent Condition';
  const batteryText = product.batteryHealth ? ` · ${product.batteryHealth} Battery Health` : '';
  const shareText = `Check out ${product.name} (${conditionLabel}${batteryText}) on Revox KSA for ${product.price.toLocaleString()} SAR with 12-Month Official Warranty!`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl || window.location.href);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl || window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback remains visible
      }
    }
  };

  // Social sharing links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=RevoxKSA,Refurbished,SaudiTech`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nView listing here: ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Share Product Listing</h3>
              <p className="text-[11px] text-slate-400">Send verified refurbished tech to friends or family</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Snapshot Card */}
        <div className="p-3 bg-[#111827] rounded-xl border border-slate-800 flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-lg bg-black/40 border border-slate-700/60 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{product.name}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-emerald-400 font-semibold">{conditionLabel}</span>
              {product.batteryHealth && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-mono">{product.batteryHealth} Battery</span>
                </>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-sm font-mono font-black text-amber-400">
                {product.price.toLocaleString()} SAR
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[10px] text-slate-500 line-through font-mono">
                  {product.originalPrice.toLocaleString()} SAR
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Social Quick Share Buttons Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Share Directly Via:
          </label>
          <div className="grid grid-cols-5 gap-2">
            
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#111827] hover:bg-[#1A233A] border border-slate-800 hover:border-emerald-500/50 text-emerald-400 transition-all group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium text-slate-300 mt-1">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#111827] hover:bg-[#1A233A] border border-slate-800 hover:border-blue-500/50 text-blue-400 transition-all group"
            >
              <Send className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium text-slate-300 mt-1">Telegram</span>
            </a>

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#111827] hover:bg-[#1A233A] border border-slate-800 hover:border-slate-500 text-slate-200 transition-all group"
            >
              <Twitter className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium text-slate-300 mt-1">X / Twitter</span>
            </a>

            {/* TikTok Profile */}
            <a
              href="https://www.tiktok.com/@revox.ksa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#111827] hover:bg-[#1A233A] border border-slate-800 hover:border-cyan-500/50 text-white transition-all group"
              title="Revox Official TikTok"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.4a6.33 6.33 0 0 0-6.33 6.34 6.34 6.34 0 0 0 10.83 4.46A6.29 6.29 0 0 0 15.82 15V8.58a8.28 8.28 0 0 0 4.77 1.52V6.65a4.81 4.81 0 0 1-1-.04v.08z" />
              </svg>
              <span className="text-[10px] font-medium text-slate-300 mt-1">TikTok</span>
            </a>

            {/* Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#111827] hover:bg-[#1A233A] border border-slate-800 hover:border-blue-600 text-blue-500 transition-all group col-span-4 sm:col-span-1"
            >
              <Facebook className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium text-slate-300 mt-1">Facebook</span>
            </a>

          </div>
        </div>

        {/* Copy Product Link Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Copy Product Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-[#090D15] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono select-all focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Share Trigger if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700/80"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Open System Share Menu (iOS / Android)</span>
          </button>
        )}

      </div>
    </div>
  );
};
