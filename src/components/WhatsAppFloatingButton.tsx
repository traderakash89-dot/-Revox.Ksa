import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '966508520173',
}) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hello Revox Support! I have an inquiry regarding certified refurbished devices and free shipping in Saudi Arabia.');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Revox WhatsApp Support"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-3.5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-[0_4px_24px_rgba(16,185,129,0.35)] transition-all hover:scale-105 group"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white animate-ping" />
      </div>
      <span className="hidden sm:inline font-sans">
        WhatsApp Support
      </span>
    </a>
  );
};
