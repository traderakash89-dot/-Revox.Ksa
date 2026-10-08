import React from 'react';
import { X, ShieldCheck, BatteryCharging, Sparkles, CheckCircle2, Cpu, Smartphone, Award, RotateCcw } from 'lucide-react';
import { Product } from '../types';

interface ConditionDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ConditionDetailModal: React.FC<ConditionDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const details = product.conditionDetails || {
    grade: 'Grade A+ Pristine (100% Inspected)',
    screen: 'Flawless genuine display with zero scratches or dead pixels.',
    body: 'Pristine housing with zero visible dents; ultrasound sanitized.',
    batteryHealth: product.batteryHealth || '98% Genuine Capacity Tested',
    hardwareTest: '100-point diagnostic certified (Cameras, Speakers, Charging, Wireless)',
    warranty: '12-Month Revox Official Hardware Warranty',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0E1522] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-6 my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Poppins']">
                Revox Certified Refurbish Standards
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                {product.name} · {product.condition}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade Badge Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-['Poppins'] shadow-md">
              A+
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Condition Rating: Grade A+ Pristine
              </span>
              <span className="text-[11px] text-slate-300">
                100% Functionally & Cosmetically Flawless
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
            Passed 100-Pt QA
          </span>
        </div>

        {/* Detailed Inspection Checklist */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#111723] rounded-xl border border-slate-800 flex items-start gap-3">
            <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Screen & Glass Condition</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{details.screen}</p>
            </div>
          </div>

          <div className="p-3 bg-[#111723] rounded-xl border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Housing & Clinical Sanitization</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{details.body}</p>
            </div>
          </div>

          <div className="p-3 bg-[#111723] rounded-xl border border-slate-800 flex items-start gap-3">
            <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Battery Health Performance</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{details.batteryHealth}</p>
            </div>
          </div>

          <div className="p-3 bg-[#111723] rounded-xl border border-slate-800 flex items-start gap-3">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Hardware & Diagnostics</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{details.hardwareTest}</p>
            </div>
          </div>

          <div className="p-3 bg-[#111723] rounded-xl border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Revox Protection Guarantee</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Protected by our 12-Month Revox Official Warranty and 7-Day Money-Back Guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-colors cursor-pointer"
        >
          Got it, Close Condition Details
        </button>

      </div>
    </div>
  );
};
