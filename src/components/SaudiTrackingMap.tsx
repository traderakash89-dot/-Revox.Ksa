import React from 'react';
import { Truck, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface SaudiTrackingMapProps {
  order: Order;
}

// Normalized coordinate projections for Saudi Arabia map (relative 0-100% on a 600x420 viewBox)
const SAUDI_CITIES: Record<string, { x: number; y: number; label: string }> = {
  Riyadh: { x: 330, y: 210, label: 'Riyadh (Central Hub)' },
  Jeddah: { x: 140, y: 260, label: 'Jeddah Route' },
  Mecca: { x: 160, y: 270, label: 'Mecca Route' },
  Medina: { x: 160, y: 190, label: 'Medina Route' },
  Dammam: { x: 450, y: 180, label: 'Dammam / Khobar' },
  Khobar: { x: 455, y: 188, label: 'Khobar Coastal' },
  Dhahran: { x: 445, y: 182, label: 'Dhahran Hub' },
  'Al Jubail': { x: 435, y: 155, label: 'Al Jubail Industrial' },
  'Al Ahsa': { x: 430, y: 230, label: 'Al Ahsa Oasis' },
  Taif: { x: 180, y: 280, label: 'Taif Route' },
  Tabuk: { x: 110, y: 100, label: 'Tabuk Northern' },
  Abha: { x: 230, y: 350, label: 'Abha Southern' },
  'Khamis Mushait': { x: 245, y: 345, label: 'Khamis Mushait' },
  Hail: { x: 250, y: 140, label: 'Hail Northern' },
  Najran: { x: 300, y: 360, label: 'Najran Southern' },
  Jizan: { x: 200, y: 375, label: 'Jizan Coastal' },
  Yanbu: { x: 120, y: 215, label: 'Yanbu Port' },
  'Qassim / Buraidah': { x: 270, y: 175, label: 'Al Qassim Hub' },
};

export const SaudiTrackingMap: React.FC<SaudiTrackingMapProps> = ({ order }) => {
  const origin = SAUDI_CITIES['Riyadh'];
  const destination = SAUDI_CITIES[order.customer.city] || {
    x: 330,
    y: 210,
    label: order.customer.city,
  };

  // Determine delivery transit progress percentage based on order status
  let progressPercent = 0.15;
  if (order.status === 'pending_payment_approval') progressPercent = 0.1;
  else if (order.status === 'processing') progressPercent = 0.3;
  else if (order.status === 'shipped') progressPercent = 0.65;
  else if (order.status === 'out_for_delivery') progressPercent = 0.88;
  else if (order.status === 'delivered') progressPercent = 1.0;

  // Compute current courier vehicle coordinate along transit line
  const curX = origin.x + (destination.x - origin.x) * progressPercent;
  const curY = origin.y + (destination.y - origin.y) * progressPercent;

  return (
    <div className="bg-[#090D14] border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Saudi Arabia Delivery Route Map
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manual courier tracking · Dispatch Hub: Riyadh ➔ Destination: {order.customer.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Sync
          </span>
          <span className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            ETA: 5-7 Days
          </span>
        </div>
      </div>

      {/* Interactive Cyber SVG Map of Saudi Arabia */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-[#070A10] rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center">
        
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(245, 158, 11, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <svg viewBox="0 0 600 420" className="w-full h-full select-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Saudi Arabia Outline Polygon (Stylized high-tech territorial boundary) */}
          <path
            d="M 120 70 
               L 180 50 
               L 310 70 
               L 410 110 
               L 470 140 
               L 490 200 
               L 540 240 
               L 480 320 
               L 400 370 
               L 310 390 
               L 200 395 
               L 180 350 
               L 140 290 
               L 110 210 
               L 80 120 Z"
            fill="#0F172A"
            stroke="#1E293B"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-colors"
          />

          {/* Regional connecting transit lines across main cities */}
          <path
            d="M 330 210 L 140 260 M 330 210 L 450 180 M 330 210 L 160 190 M 330 210 L 230 350 M 330 210 L 110 100"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.4"
          />

          {/* Key Saudi City Nodes */}
          {Object.entries(SAUDI_CITIES).map(([cityKey, coords]) => {
            const isOrigin = cityKey === 'Riyadh';
            const isDest = cityKey === order.customer.city;
            return (
              <g key={cityKey} className="cursor-pointer">
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isOrigin || isDest ? 6 : 3}
                  fill={isOrigin ? '#F59E0B' : isDest ? '#10B981' : '#475569'}
                  filter={isOrigin || isDest ? 'url(#glow)' : undefined}
                />
                {(isOrigin || isDest) && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="12"
                    fill="none"
                    stroke={isOrigin ? '#F59E0B' : '#10B981'}
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                    style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
                  />
                )}
                <text
                  x={coords.x + 8}
                  y={coords.y + 4}
                  fill={isOrigin ? '#F59E0B' : isDest ? '#10B981' : '#94A3B8'}
                  fontSize={isOrigin || isDest ? '11' : '8'}
                  fontWeight={isOrigin || isDest ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                >
                  {cityKey}
                </text>
              </g>
            );
          })}

          {/* Active Delivery Route Arc from Riyadh to Customer City */}
          {origin !== destination && (
            <>
              {/* Planned route track */}
              <path
                d={`M ${origin.x} ${origin.y} Q ${(origin.x + destination.x) / 2} ${
                  (origin.y + destination.y) / 2 - 30
                } ${destination.x} ${destination.y}`}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.7"
              />

              {/* Progress marker: delivery truck on transit */}
              <g transform={`translate(${curX - 12}, ${curY - 12})`} filter="url(#glow)">
                <rect x="0" y="0" width="24" height="24" rx="6" fill="#F59E0B" />
                <path
                  d="M4 14V8H14V14H4ZM14 10H18L20 12V14H14V10ZM6 16C5.45 16 5 15.55 5 15C5 14.45 5.45 14 6 14C6.55 14 7 14.45 7 15C7 15.55 6.55 16 6 16ZM18 16C17.45 16 17 15.55 17 15C17 14.45 17.45 14 18 14C18.55 14 19 14.45 19 15C19 15.55 18.55 16 18 16Z"
                  fill="#000000"
                  transform="translate(0, 2)"
                />
              </g>
            </>
          )}

          {/* Pin marker if local Riyadh delivery */}
          {origin === destination && (
            <g transform={`translate(${origin.x - 12}, ${origin.y - 28})`} filter="url(#glow)">
              <circle cx="12" cy="12" r="10" fill="#10B981" />
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#FFFFFF" />
            </g>
          )}
        </svg>

        {/* Live location badge pinned at bottom-left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5 shadow-lg">
          <Truck className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <p className="text-slate-400 font-mono">Current Logistics Hub</p>
            <p className="text-slate-100 font-semibold truncate max-w-[240px]">
              {order.currentLocationName || 'Riyadh Central Processing Depot'}
            </p>
          </div>
        </div>
      </div>

      {/* Courier & Tracking Code Information Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        <div className="bg-[#111723] rounded-lg p-3 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Assigned Courier</span>
          <span className="font-semibold text-slate-100 mt-0.5 block truncate">
            {order.courierName || 'Revox Express Local Delivery Team'}
          </span>
        </div>

        <div className="bg-[#111723] rounded-lg p-3 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Manual Tracking Number</span>
          <span className="font-mono font-bold text-amber-400 mt-0.5 block truncate select-all">
            {order.trackingNumber || 'Pending Courier Assignment'}
          </span>
        </div>

        <div className="bg-[#111723] rounded-lg p-3 border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Delivery Timeframe</span>
          <span className="font-semibold text-emerald-400 mt-0.5 block truncate">
            5-7 Business Days Guaranteed
          </span>
        </div>
      </div>
    </div>
  );
};
