import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  MessageSquare,
  QrCode,
  Receipt,
  Sparkles,
  Trash2,
  Utensils,
  X,
  Zap,
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: "ready" | "cooking" | "accepted" | "offer" | "refund";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  orderId?: string;
  otp?: string;
  counter?: string;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "c_notif_1",
    type: "ready",
    title: "Order Ready at Counter Bay 02! 🔔",
    message: "Your Mysore Masala Dosa + Filter Coffee is packed and ready. Show OTP 4921 at Little Fern Kitchen.",
    timestamp: "Just now",
    isRead: false,
    orderId: "ORD-109",
    otp: "4921",
    counter: "Bay 02, Express Pickup",
  },
  {
    id: "c_notif_2",
    type: "cooking",
    title: "Chef Started Cooking",
    message: "Little Fern Kitchen has placed your dosa on the tawa. Estimated ready in 6 minutes.",
    timestamp: "7 mins ago",
    isRead: false,
    orderId: "ORD-109",
  },
  {
    id: "c_notif_3",
    type: "accepted",
    title: "Order Confirmed & Paid (₹150)",
    message: "Razorpay payment ID pay_Q88912739 verified. Kitchen accepted order #ORD-109.",
    timestamp: "10 mins ago",
    isRead: true,
    orderId: "ORD-109",
  },
  {
    id: "c_notif_4",
    type: "offer",
    title: "Tech Park Lunch Rush Reminder",
    message: "Pre-order before 12:45 PM to beat the 1:00 PM corporate crowd and save 15 minutes of wait time.",
    timestamp: "2 hours ago",
    isRead: true,
  },
  {
    id: "c_notif_5",
    type: "refund",
    title: "Instant UPI Refund Processed",
    message: "₹40 refunded to your GPay UPI handle for reported missing sambar bowl on #ORD-102.",
    timestamp: "Yesterday",
    isRead: true,
  },
];

export function CustomerNotifications({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [list, setList] = useState<NotificationItem[]>(initialNotifications);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAll = () => {
    setList((prev) => prev.map((item) => ({ ...item, isRead: true })));
    notify("Marked all alerts as read");
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((i) => i.id !== id));
    notify("Alert removed");
  };

  const unreadCount = list.filter((i) => !i.isRead).length;

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f9fa] px-3 py-4 text-[#1f2937] font-sans sm:px-6 sm:py-6">
      <div className="mx-auto max-w-2xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1f2937] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 border border-[#374151]">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#ff6b00] text-white shadow-md">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-black text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-[#111827]">Order Updates & Push Alerts</h1>
              <p className="text-xs text-[#6b7280]">
                Real-time preparation stages, OTP tokens & counter announcements
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[#16a34a]" /> Mark All Read
            </button>
          )}
        </header>

        {/* List */}
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#f3f4f6] text-[#9ca3af]">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-sm font-bold text-[#111827]">No Alerts</h2>
            <p className="text-xs text-[#6b7280] mt-1">
              Live updates for your meal pre-orders will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isRead
                    ? "bg-white border-[#e5e7eb]"
                    : "bg-[#fffbf6] border-[#ffedd5] shadow-sm ring-1 ring-[#ffedd5]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                        item.type === "ready"
                          ? "bg-[#ecfdf5] text-[#16a34a]"
                          : item.type === "cooking"
                          ? "bg-[#fff7ed] text-[#ea580c]"
                          : item.type === "accepted"
                          ? "bg-[#eff6ff] text-[#2563eb]"
                          : item.type === "refund"
                          ? "bg-[#f5f3ff] text-[#7c3aed]"
                          : "bg-[#fef3c7] text-[#d97706]"
                      }`}
                    >
                      {item.type === "ready" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : item.type === "cooking" ? (
                        <Flame className="h-5 w-5" />
                      ) : item.type === "accepted" ? (
                        <Receipt className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-[#111827]">{item.title}</h3>
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#ff6b00]"></span>
                        )}
                      </div>
                      <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">{item.message}</p>

                      {/* Prominent OTP and Counter Bay Callout */}
                      {item.otp && (
                        <div className="mt-2.5 inline-flex items-center gap-2.5 rounded-xl bg-[#fff7ed] border border-[#ffedd5] px-3 py-1.5">
                          <span className="text-[11px] font-bold text-[#9a3412]">
                            Pickup OTP: <strong className="font-mono text-sm text-[#ff6b00]">{item.otp}</strong>
                          </span>
                          <span className="text-[11px] text-[#9a3412]">· {item.counter}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9ca3af]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.timestamp}
                        </span>
                        {item.orderId && onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate("customer-flow/OrderTracking")}
                            className="font-bold text-[#ff6b00] hover:underline"
                          >
                            Track Live &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-[#9ca3af] hover:text-[#dc2626] rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomerNotifications;
