import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Info,
  PackageCheck,
  Receipt,
  Settings,
  ShieldCheck,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

type VendorNotification = {
  id: string;
  type: "order" | "approval" | "system" | "settlement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  orderId?: string;
  amount?: string;
};

const initialVendorNotifications: VendorNotification[] = [
  {
    id: "notif_1",
    type: "order",
    title: "New Prepaid Order #ORD-109",
    message: "Rahul Sharma ordered 1× Mysore Masala Dosa + 1× Filter Coffee (Degree Blend). Pickup estimated in 12 mins.",
    timestamp: "2 mins ago",
    isRead: false,
    orderId: "ORD-109",
    amount: "₹150",
  },
  {
    id: "notif_2",
    type: "order",
    title: "Counter Pickup Completed #ORD-104",
    message: "OTP 8812 verified by cashier. Handed over to Priya K. Payment credited to today's ledger.",
    timestamp: "18 mins ago",
    isRead: false,
    orderId: "ORD-104",
    amount: "₹240",
  },
  {
    id: "notif_3",
    type: "settlement",
    title: "11:30 PM Batch Settlement Initiated",
    message: "Net payout of ₹4,411 for 18 orders transferred to HDFC Bank A/c ••••7291 (UTR: RZP2609071130).",
    timestamp: "Yesterday 11:32 PM",
    isRead: true,
    amount: "₹4,411",
  },
  {
    id: "notif_4",
    type: "approval",
    title: "FSSAI Annual Compliance Audit Passed",
    message: "Your campus counter bay license is verified and clear through March 2027.",
    timestamp: "2 days ago",
    isRead: true,
  },
  {
    id: "notif_5",
    type: "system",
    title: "Peak Rush Alert: 12:45 PM – 2:15 PM",
    message: "Estimated 35+ customer pre-orders incoming from Towers 2 & 3. Ensure batter and coffee flasks are prepped.",
    timestamp: "3 days ago",
    isRead: true,
  },
];

export function Notifications({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [notifications, setNotifications] = useState<VendorNotification[]>(initialVendorNotifications);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "orders">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const playBuzzer = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext fallback
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notify("Marked all notifications as read");
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notify("Notification removed");
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "orders") return n.type === "order";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
              <h1 className="text-xl font-black text-[#111827]">Kitchen Notifications</h1>
              <p className="text-xs text-[#6b7280]">
                Realtime FCM push alerts, incoming orders & payout confirmations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playBuzzer();
                notify(soundEnabled ? "Muted order chime" : "Kitchen buzzer chime enabled");
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? "bg-[#fff7ed] border-[#fed7aa] text-[#ea580c]"
                  : "bg-white border-[#e5e7eb] text-[#9ca3af]"
              }`}
              title="Toggle kitchen sound buzzer"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "Buzzer ON" : "Muted"}</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5 text-[#16a34a]" /> Mark All Read
              </button>
            )}
          </div>
        </header>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-[#ff6b00] text-white shadow-sm"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("unread")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "unread"
                ? "bg-[#ff6b00] text-white shadow-sm"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("orders")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "orders"
                ? "bg-[#ff6b00] text-white shadow-sm"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
            }`}
          >
            Orders Only
          </button>
        </div>

        {/* Notification Stream */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-12 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#f3f4f6] text-[#9ca3af]">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-sm font-bold text-[#111827]">No Notifications</h2>
            <p className="text-xs text-[#6b7280] mt-1">
              You are all caught up! New orders and system announcements will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isRead
                    ? "bg-white border-[#e5e7eb] hover:border-[#d1d5db]"
                    : "bg-[#fffbf6] border-[#ffedd5] shadow-sm ring-1 ring-[#ffedd5]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                        item.type === "order"
                          ? "bg-[#fff7ed] text-[#ff6b00]"
                          : item.type === "settlement"
                          ? "bg-[#ecfdf5] text-[#16a34a]"
                          : item.type === "approval"
                          ? "bg-[#eff6ff] text-[#2563eb]"
                          : "bg-[#fef3c7] text-[#d97706]"
                      }`}
                    >
                      {item.type === "order" ? (
                        <Receipt className="h-4 w-4" />
                      ) : item.type === "settlement" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : item.type === "approval" ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
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
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9ca3af]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.timestamp}
                        </span>
                        {item.amount && (
                          <span className="font-bold text-[#111827]">{item.amount}</span>
                        )}
                        {item.orderId && onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate("vendor-flow/Orders")}
                            className="font-bold text-[#ff6b00] hover:underline"
                          >
                            Open in KOT Queue &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(item.id)}
                      className="p-1 text-[#9ca3af] hover:text-[#111827] rounded-md transition-colors"
                      title={item.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-[#9ca3af] hover:text-[#dc2626] rounded-md transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;
