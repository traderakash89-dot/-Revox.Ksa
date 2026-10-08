import React from 'react';
import { Sparkles } from 'lucide-react';

interface FreeShippingBannerProps {
  announcementText?: string;
}

export const FreeShippingBanner: React.FC<FreeShippingBannerProps> = ({
  announcementText,
}) => {
  const defaultText = '🎁 50 RIYAL BONUS CODE + FREE DELIVERY ON ALL PRODUCTS 🚚';
  const textToShow =
    announcementText && announcementText.includes('50 RIYAL')
      ? announcementText
      : defaultText;

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs border-b border-amber-500/30 z-30 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap text-xs sm:text-[13px] md:text-sm font-black tracking-wide leading-tight">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-extrabold text-[10px] sm:text-xs uppercase shadow-xs shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>EXCLUSIVE OFFER</span>
          </span>
          <span className="font-extrabold text-slate-950 drop-shadow-2xs">
            {textToShow}
          </span>
        </div>
      </div>
    </div>
  );
};
