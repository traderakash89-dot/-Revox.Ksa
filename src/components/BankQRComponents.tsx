import React, { useState } from 'react';
import { Copy, Check, Upload, ShieldCheck, AlertCircle, FileText, Zap } from 'lucide-react';
import { CMSConfig, TransferChannel } from '../types';

interface BankQRCardProps {
  cms: CMSConfig;
  selectedChannel: TransferChannel;
  onChannelChange?: (channel: TransferChannel) => void;
  receiptImage?: string;
  onReceiptUpload?: (dataUrl: string) => void;
  transactionRef?: string;
  onTransactionRefChange?: (val: string) => void;
  readOnly?: boolean;
  requiredAmountText?: string; // e.g. "50 SAR (COD Partial Advance)" or "Full Amount: 3,499 SAR"
  isCodAdvance?: boolean;
}

export const BankQRCard: React.FC<BankQRCardProps> = ({
  cms,
  selectedChannel,
  onChannelChange,
  receiptImage,
  onReceiptUpload,
  transactionRef,
  onTransactionRefChange,
  readOnly = false,
  requiredAmountText,
  isCodAdvance = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string' && onReceiptUpload) {
        onReceiptUpload(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 space-y-5">
      
      {/* Required Amount Transfer Callout */}
      {requiredAmountText && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-600 block text-[11px]">Transfer Amount Due Now</span>
            <span className="text-base font-mono font-bold text-amber-700">{requiredAmountText}</span>
          </div>
          {isCodAdvance && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded">
              Balance collected on delivery
            </span>
          )}
        </div>
      )}

      {/* 3-Way Channel Selector: Al Rajhi vs STC Pay vs Barq Pay */}
      {!readOnly && onChannelChange && (
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => onChannelChange('al_rajhi')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
              selectedChannel === 'al_rajhi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Al Rajhi Bank
          </button>
          <button
            type="button"
            onClick={() => onChannelChange('stc_pay')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
              selectedChannel === 'stc_pay'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            STC Pay
          </button>
          <button
            type="button"
            onClick={() => onChannelChange('barq')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
              selectedChannel === 'barq'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            Barq Pay / بارك
          </button>
        </div>
      )}

      {/* Channel 1: Al Rajhi Bank */}
      {selectedChannel === 'al_rajhi' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#090D14] border border-blue-900/40 rounded-xl p-4">
            {/* Al Rajhi QR Scanner Graphic */}
            <div className="relative shrink-0 w-36 h-36 bg-slate-950 p-2 rounded-xl border border-blue-700/30 flex flex-col items-center justify-center shadow-lg">
              <svg viewBox="0 0 160 160" className="w-full h-full text-slate-100 fill-current">
                <rect x="10" y="10" width="40" height="40" rx="4" fill="none" stroke="#2563EB" strokeWidth="6" />
                <rect x="20" y="20" width="20" height="20" rx="2" fill="#2563EB" />
                <rect x="110" y="10" width="40" height="40" rx="4" fill="none" stroke="#2563EB" strokeWidth="6" />
                <rect x="120" y="20" width="20" height="20" rx="2" fill="#2563EB" />
                <rect x="10" y="110" width="40" height="40" rx="4" fill="none" stroke="#2563EB" strokeWidth="6" />
                <rect x="20" y="120" width="20" height="20" rx="2" fill="#2563EB" />
                <circle cx="65" cy="20" r="3" fill="#E2E8F0" />
                <circle cx="85" cy="20" r="3" fill="#E2E8F0" />
                <circle cx="130" cy="80" r="3" fill="#E2E8F0" />
                <circle cx="70" cy="115" r="3" fill="#E2E8F0" />
                <circle cx="100" cy="115" r="3" fill="#E2E8F0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-900 border border-blue-500 rounded flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-blue-400">RAJHI</span>
                </div>
              </div>
              <span className="text-[9px] text-blue-400 font-mono mt-1">Scan via Al Rajhi App</span>
            </div>

            {/* Account Info */}
            <div className="flex-1 space-y-2.5 w-full text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Account Beneficiary</span>
                <span className="font-bold text-slate-100 font-mono">{cms.alRajhiDetails.accountName}</span>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Account Number</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cms.alRajhiDetails.accountNumber, 'acc')}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'acc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#111723] rounded border border-slate-800 font-mono text-xs font-bold text-slate-200 tracking-wider break-all select-all">
                  {cms.alRajhiDetails.accountNumber}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>IBAN</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cms.alRajhiDetails.iban.replace(/\s+/g, ''), 'iban')}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedKey === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'iban' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 bg-[#111723] rounded border border-slate-800 font-mono text-[11px] font-bold text-blue-300 tracking-wide break-all select-all">
                  {cms.alRajhiDetails.iban}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel 2: STC Pay */}
      {selectedChannel === 'stc_pay' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#090D14] border border-amber-900/40 rounded-xl p-4">
            <div className="relative shrink-0 w-36 h-36 bg-slate-950 p-2 rounded-xl border border-amber-600/30 flex flex-col items-center justify-center shadow-lg">
              <svg viewBox="0 0 160 160" className="w-full h-full text-amber-500 fill-current">
                <rect x="10" y="10" width="38" height="38" rx="6" fill="none" stroke="#F59E0B" strokeWidth="5" />
                <circle cx="29" cy="29" r="8" fill="#F59E0B" />
                <rect x="112" y="10" width="38" height="38" rx="6" fill="none" stroke="#F59E0B" strokeWidth="5" />
                <circle cx="131" cy="29" r="8" fill="#F59E0B" />
                <rect x="10" y="112" width="38" height="38" rx="6" fill="none" stroke="#F59E0B" strokeWidth="5" />
                <circle cx="29" cy="131" r="8" fill="#F59E0B" />
                <circle cx="60" cy="25" r="3.5" fill="#FDE68A" />
                <circle cx="115" cy="70" r="3.5" fill="#FDE68A" />
                <circle cx="85" cy="130" r="3.5" fill="#FDE68A" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-900 border border-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-black text-amber-400 font-['Poppins']">STC</span>
                </div>
              </div>
              <span className="text-[9px] text-amber-400 font-mono mt-1">Scan via STC Pay App</span>
            </div>

            <div className="flex-1 space-y-2.5 w-full text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">STC Pay Name</span>
                <span className="font-bold text-slate-100 font-mono">{cms.stcPayDetails.accountName}</span>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Registered Mobile Number</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cms.stcPayDetails.mobileNumber, 'stc')}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    {copiedKey === 'stc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'stc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-[#111723] rounded border border-slate-800 font-mono text-sm font-bold text-amber-400 select-all flex items-center justify-between">
                  <span>{cms.stcPayDetails.mobileNumber}</span>
                  <span className="text-[10px] text-slate-400 font-sans">(Saudi Arabia)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Open STC Pay ➔ Select <strong>Transfer to Mobile</strong> ➔ Enter <strong>0508520173</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Channel 3: Barq Pay / بارك */}
      {selectedChannel === 'barq' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#090D14] border border-emerald-900/40 rounded-xl p-4">
            <div className="relative shrink-0 w-36 h-36 bg-slate-950 p-2 rounded-xl border border-emerald-600/30 flex flex-col items-center justify-center shadow-lg">
              <svg viewBox="0 0 160 160" className="w-full h-full text-emerald-500 fill-current">
                <rect x="10" y="10" width="38" height="38" rx="6" fill="none" stroke="#10B981" strokeWidth="5" />
                <circle cx="29" cy="29" r="8" fill="#10B981" />
                <rect x="112" y="10" width="38" height="38" rx="6" fill="none" stroke="#10B981" strokeWidth="5" />
                <circle cx="131" cy="29" r="8" fill="#10B981" />
                <rect x="10" y="112" width="38" height="38" rx="6" fill="none" stroke="#10B981" strokeWidth="5" />
                <circle cx="29" cy="131" r="8" fill="#10B981" />
                <circle cx="60" cy="25" r="3.5" fill="#A7F3D0" />
                <circle cx="115" cy="70" r="3.5" fill="#A7F3D0" />
                <circle cx="85" cy="130" r="3.5" fill="#A7F3D0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-900 border border-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono mt-1">Scan via Barq Pay App</span>
            </div>

            <div className="flex-1 space-y-2.5 w-full text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Barq Pay Holder</span>
                <span className="font-bold text-slate-100 font-mono">{cms.barqPayDetails.accountName}</span>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Barq Registered Number</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cms.barqPayDetails.mobileNumber, 'barq')}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {copiedKey === 'barq' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'barq' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-[#111723] rounded border border-slate-800 font-mono text-sm font-bold text-emerald-400 select-all flex items-center justify-between">
                  <span>{cms.barqPayDetails.mobileNumber}</span>
                  <span className="text-[10px] text-slate-400 font-sans">(Barq Pay / بارك)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Open your Barq app ➔ Send transfer to <strong>0508520173</strong> ➔ Upload screenshot slip below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Screenshot Upload & Reference Form */}
      <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Transaction Reference / Slip ID (Recommended)
          </label>
          <input
            type="text"
            disabled={readOnly}
            value={transactionRef || ''}
            onChange={(e) => onTransactionRefChange && onTransactionRefChange(e.target.value)}
            placeholder="e.g. TXN-89410291 or Bank Ref No."
            className="w-full bg-[#090D14] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {!readOnly && (
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Payment Transfer Slip Screenshot <span className="text-amber-400">*</span>
            </label>
            <label
              htmlFor="receipt-upload"
              className={`flex items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                receiptImage
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-700 hover:border-amber-500/60 bg-[#090D14]'
              }`}
            >
              {receiptImage ? (
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={receiptImage}
                    alt="Receipt Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Transfer Screenshot Attached
                    </p>
                    <p className="text-[10px] text-slate-400">Click to change screenshot</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Click to upload payment receipt screenshot (PNG/JPG)</span>
                </div>
              )}
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

    </div>
  );
};
