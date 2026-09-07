import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Timer,
  Utensils,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, type Order, type OrderStatus } from "@/lib/takeontime-store";

export function OrderTracking({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [activeOrderId, setActiveOrderId] = useState(takeOnTimeStore.getActiveCustomerOrderId());
  const [order, setOrder] = useState<Order | undefined>(takeOnTimeStore.getOrderById(activeOrderId));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      const currentId = takeOnTimeStore.getActiveCustomerOrderId();
      setActiveOrderId(currentId);
      setOrder(takeOnTimeStore.getOrderById(currentId));
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!order) {
    return (
      <main className="min-h-[100dvh] w-full bg-[#f4ede4] p-4 text-[#252822] flex items-center justify-center">
        <div className="rounded-3xl bg-white p-6 text-center max-w-xs shadow-lg border border-[#ebdcd0]">
          <Receipt className="mx-auto h-8 w-8 text-[#8b7565] mb-2" />
          <h2 className="font-bold text-base text-[#27201c]">No Active Order</h2>
          <p className="text-xs text-[#716155] mt-1">Please select an order or place a new one from the menu.</p>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
            className="mt-4 rounded-xl bg-[#ed6c2d] px-4 py-2 text-xs font-bold text-white"
          >
            Browse Food Counters
          </button>
        </div>
      </main>
    );
  }

  // Stepper calculations
  const steps: { key: OrderStatus; label: string; sub: string }[] = [
    { key: "new", label: "Order Placed", sub: "Payment verified · Awaiting chef" },
    { key: "in-progress", label: "Accepted & Prepping", sub: "Kitchen is actively cooking" },
    { key: "ready", label: "Ready for Pickup", sub: "Waiting at Counter 2" },
    { key: "completed", label: "Handed Over", sub: "OTP verified · Enjoy meal!" },
  ];

  const getStepState = (stepKey: OrderStatus) => {
    const orderIndex = steps.findIndex((s) => s.key === order.status);
    const thisIndex = steps.findIndex((s) => s.key === stepKey);
    if (thisIndex < orderIndex) return "done";
    if (thisIndex === orderIndex) return "active";
    return "pending";
  };

  // Vendor simulation shortcuts directly from tracking
  const simulateVendorAccept = () => {
    takeOnTimeStore.acceptOrder(order.id);
    notify(`Kitchen accepted order #${order.id}! Status: Prepping.`);
  };

  const simulateVendorReady = () => {
    takeOnTimeStore.markOrderReady(order.id);
    notify(`Chef marked order #${order.id} as READY! Pickup counter notified.`);
  };

  const simulateVendorComplete = () => {
    takeOnTimeStore.completeOrder(order.id);
    notify(`OTP verified! Order #${order.id} marked as handed over.`);
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
            onClick={() => onNavigate && onNavigate("customer-flow/CustomerOrders")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#323c34] text-[#f5ebd9] hover:bg-[#434f47]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-[#e5a67f]">Live Order Tracker</h1>
            <p className="font-mono text-xs font-bold text-white">ID: {order.id}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
            className="rounded-xl bg-[#323c34] px-2.5 py-1 text-[11px] font-bold text-[#f5ebd9] hover:bg-[#434f47]"
          >
            Home
          </button>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-20">
          
          {/* Pickup Token Card - The Core TakeOnTime Value */}
          <section className="rounded-3xl border border-[#ebdcd0] bg-white p-5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#8b7565]">
              <QrCode className="h-3.5 w-3.5 text-[#ed6c2d]" />
              <span>Counter Pickup Token</span>
            </div>

            <div className="my-2 rounded-2xl bg-[#faf5ee] border border-[#f0e3d6] py-3 px-4 inline-block">
              <span className="font-mono text-4xl font-black tracking-widest text-[#2d7a46]">
                {order.otp}
              </span>
            </div>

            <p className="text-xs font-bold text-[#27201c]">
              Show this 4-digit code to staff at Counter 2
            </p>
            <p className="text-[11px] text-[#8b7565] mt-0.5">
              Pickup Window: <strong className="text-[#27201c]">{order.pickupRange}</strong>
            </p>

            {/* Status Banner */}
            <div className="mt-4 rounded-xl p-2.5 text-xs font-bold flex items-center justify-center gap-2 bg-[#fdf2e9] text-[#ed6c2d] border border-[#fbd8c0]">
              <Clock className="h-4 w-4" />
              <span>
                {order.status === "new"
                  ? "Order sent to kitchen · Waiting for chef confirmation"
                  : order.status === "in-progress"
                  ? "Chef is cooking your order right now!"
                  : order.status === "ready"
                  ? "ORDER IS READY! Head to Counter 2 now"
                  : "Order picked up and completed"}
              </span>
            </div>
          </section>

          {/* Realtime Stepper */}
          <section className="rounded-2xl border border-[#ebdcd0] bg-white p-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#27201c] mb-3">
              Kitchen Preparation Status
            </h2>

            <div className="space-y-4">
              {steps.map((st, i) => {
                const state = getStepState(st.key);
                const isLast = i === steps.length - 1;

                return (
                  <div key={st.key} className="flex gap-3">
                    {/* Circle & Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                          state === "done"
                            ? "bg-[#2d7a46] text-white"
                            : state === "active"
                            ? "bg-[#ed6c2d] text-white ring-4 ring-[#ed6c2d]/20"
                            : "bg-[#f1e7dc] text-[#8b7565]"
                        }`}
                      >
                        {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      {!isLast && (
                        <div
                          className={`h-8 w-0.5 my-1 ${
                            state === "done" ? "bg-[#2d7a46]" : "bg-[#ecdccf]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pt-0.5">
                      <p
                        className={`text-xs font-extrabold ${
                          state === "active"
                            ? "text-[#ed6c2d]"
                            : state === "done"
                            ? "text-[#27201c]"
                            : "text-[#8b7565]"
                        }`}
                      >
                        {st.label}
                      </p>
                      <p className="text-[11px] text-[#8b7565]">{st.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Test Action Simulation Tool (For Testing the Complete Loop) */}
          <section className="rounded-2xl border border-dashed border-[#e4ab87] bg-[#fffaf5] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase text-[#b8531d]">
                <Sparkles className="h-3.5 w-3.5 text-[#ed6c2d]" /> Simulator (Test Kitchen Actions)
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("vendor-flow/Orders")}
                className="text-[10px] font-bold text-[#ed6c2d] hover:underline flex items-center gap-0.5"
              >
                <span>Open Vendor KOT</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <p className="text-[11px] text-[#7d695b] mb-2.5">
              Simulate chef actions on the other side of the counter to watch this tracker update in real-time:
            </p>

            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={simulateVendorAccept}
                disabled={order.status !== "new"}
                className="rounded-xl border border-[#ebdcd0] bg-white py-2 text-[11px] text-[#27201c] hover:bg-[#faf5ee] disabled:opacity-40"
              >
                1. Accept (Cook)
              </button>
              <button
                type="button"
                onClick={simulateVendorReady}
                disabled={order.status !== "in-progress"}
                className="rounded-xl bg-[#ed6c2d] py-2 text-[11px] text-white hover:bg-[#db5e20] disabled:opacity-40"
              >
                2. Mark Ready
              </button>
              <button
                type="button"
                onClick={simulateVendorComplete}
                disabled={order.status !== "ready"}
                className="rounded-xl bg-[#2d7a46] py-2 text-[11px] text-white hover:bg-[#236338] disabled:opacity-40"
              >
                3. Handover OTP
              </button>
            </div>
          </section>

          {/* Itemized Receipt */}
          <section className="rounded-2xl border border-[#ebdcd0] bg-white p-4 shadow-sm text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#27201c] mb-2.5">
              Order Receipt ({order.items.length} items)
            </h3>

            <div className="divide-y divide-[#f5ede4]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 text-xs">
                  <div>
                    <span className="font-bold text-[#27201c]">
                      {item.quantity} × {item.name}
                    </span>
                    {item.detail && <p className="text-[10px] text-[#8b7565]">{item.detail}</p>}
                  </div>
                  <span className="font-bold text-[#27201c]">{item.price}</span>
                </div>
              ))}
            </div>

            {order.note && (
              <div className="mt-2 rounded-lg bg-[#fff6ee] p-2 text-[11px] text-[#845b44] border-l-2 border-[#ed6c2d]">
                <strong>Note:</strong> {order.note}
              </div>
            )}

            <div className="mt-3 pt-2.5 border-t border-[#f1e5d8] flex justify-between font-black text-sm text-[#27201c]">
              <span>Prepaid Total (UPI)</span>
              <span className="text-[#ed6c2d]">{order.amount}</span>
            </div>
            <p className="mt-1 text-[10px] text-[#8b7565] font-mono">
              Razorpay Ref: {order.paymentId}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default OrderTracking;
