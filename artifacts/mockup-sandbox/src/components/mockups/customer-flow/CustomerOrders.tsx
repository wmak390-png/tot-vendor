import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Receipt,
  RotateCw,
  ShoppingBag,
  Store,
  Timer,
} from "lucide-react";
import { takeOnTimeStore, type Order } from "@/lib/takeontime-store";

export function CustomerOrders({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [orders, setOrders] = useState<Order[]>(takeOnTimeStore.getOrders());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setOrders(takeOnTimeStore.getOrders());
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTrackOrder = (orderId: string) => {
    takeOnTimeStore.setActiveCustomerOrder(orderId);
    if (onNavigate) {
      onNavigate("customer-flow/OrderTracking");
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((it, idx) => {
      takeOnTimeStore.addToCart(
        {
          id: idx + 10,
          name: it.name,
          detail: it.detail,
          quantity: it.quantity,
          price: it.price,
          priceNum: it.priceNum,
        },
        order.vendorId,
        order.vendorName
      );
    });
    notify(`Items from Order #${order.id} added to bag!`);
    if (onNavigate) {
      onNavigate("customer-flow/Checkout");
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f4ede4] px-0 text-[#252822] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#faf6ef] shadow-[0_20px_80px_rgba(40,30,20,0.12)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#202522] px-4 py-2.5 text-xs font-semibold text-[#fff8ee] shadow-2xl flex items-center gap-2 border border-[#3b433e]">
            <CheckCircle2 className="h-4 w-4 text-[#78c792]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between bg-[#242b26] px-4 py-3 text-white">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#323c34] text-[#f5ebd9] hover:bg-[#434f47]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-[#e5a67f]">Pickup Orders</h1>
            <p className="text-xs font-bold text-white">History & Tokens</p>
          </div>
          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#8b7565]">
              My Orders ({orders.length})
            </h2>
            <span className="text-[11px] font-bold text-[#ed6c2d]">
              Prepaid Pickup
            </span>
          </div>

          {orders.map((order) => {
            const isActive = order.status !== "completed" && order.status !== "cancelled";

            return (
              <article
                key={order.id}
                className={`rounded-2xl border bg-white p-3.5 shadow-sm transition-all ${
                  isActive ? "border-[#ed6c2d] ring-1 ring-[#ed6c2d]/20" : "border-[#ebdcd0]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-[#ed6c2d]" />
                      <h3 className="font-extrabold text-sm text-[#27201c]">{order.vendorName}</h3>
                    </div>
                    <p className="text-[11px] text-[#8b7565] font-mono mt-0.5">
                      #{order.id} · {order.createdAt}
                    </p>
                  </div>

                  {isActive ? (
                    <span className="rounded-full bg-[#fff0e1] border border-[#f5c69f] px-2.5 py-0.5 text-[10px] font-extrabold text-[#d65e1d] animate-pulse">
                      Active: {order.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#f1f5f2] border border-[#cfe2d5] px-2.5 py-0.5 text-[10px] font-bold text-[#2d7a46]">
                      Picked Up
                    </span>
                  )}
                </div>

                {/* Items preview */}
                <div className="mt-2.5 rounded-xl bg-[#faf5ee] p-2 text-xs text-[#5c4a3e]">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-0.5">
                      <span>{it.quantity} × {it.name}</span>
                      <span className="font-bold">{it.price}</span>
                    </div>
                  ))}
                </div>

                {/* OTP Token callout if active */}
                {isActive && (
                  <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#e8f4ec] p-2.5 text-xs text-[#246138]">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#246138]/80 block">
                        Pickup Token
                      </span>
                      <span className="font-mono text-base font-black tracking-wider text-[#246138]">
                        {order.otp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTrackOrder(order.id)}
                      className="rounded-lg bg-[#2d7a46] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#236338]"
                    >
                      Live Tracking
                    </button>
                  </div>
                )}

                {/* Card Footer */}
                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#f1e5d8] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8b7565] uppercase font-bold">Total: </span>
                    <span className="font-black text-[#27201c]">{order.amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1 rounded-xl border border-[#ebdcd0] px-2.5 py-1.5 text-xs font-bold text-[#5c4a3e] hover:bg-[#faf5ee]"
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>Reorder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTrackOrder(order.id)}
                      className="flex items-center gap-1 rounded-xl bg-[#ed6c2d] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#d65e1d]"
                    >
                      <span>View Token</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#ddcfbf] bg-white p-8 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-[#988171] mb-2" />
              <h4 className="text-sm font-bold text-[#2d2420]">No Orders Yet</h4>
              <p className="mt-0.5 text-xs text-[#8e7e72]">
                Order ahead to skip the canteen queue and pick up with your 4-digit token.
              </p>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
                className="mt-3 rounded-xl bg-[#ed6c2d] px-4 py-2 text-xs font-bold text-white"
              >
                Browse Canteens
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default CustomerOrders;
