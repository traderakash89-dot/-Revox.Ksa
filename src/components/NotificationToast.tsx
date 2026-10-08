import React from 'react';
import { Bell, X, Truck, CheckCircle2, Package, Clock } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationToastProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
  onOpenOrder: (orderId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
  onOpenOrder,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        let icon = <Bell className="w-4 h-4 text-amber-400" />;
        if (notif.status === 'processing') {
          icon = <Package className="w-4 h-4 text-blue-400" />;
        } else if (notif.status === 'shipped' || notif.status === 'out_for_delivery') {
          icon = <Truck className="w-4 h-4 text-purple-400 animate-bounce" />;
        } else if (notif.status === 'delivered') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        }

        return (
          <div
            key={notif.id}
            className="pointer-events-auto p-4 rounded-xl bg-[#0E1522]/95 border border-amber-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-[#111723] border border-slate-800 shrink-0">
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                <span className="text-[10px] font-mono text-slate-500">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{notif.message}</p>

              <button
                type="button"
                onClick={() => {
                  onOpenOrder(notif.orderId);
                  onDismiss(notif.id);
                }}
                className="mt-2 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline block"
              >
                Track Order #{notif.orderId} ➔
              </button>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(notif.id)}
              className="text-slate-500 hover:text-white p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
