import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  Ellipsis,
  HandCoins,
  LockKeyhole,
  Phone,
  Plus,
  Printer,
  Radio,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

export type OrderStatus = "new" | "in-progress" | "ready" | "completed";
export type Filter = "all" | OrderStatus;

export type OrderItem = {
  name: string;
  detail?: string;
  quantity: number;
  price: string;
};

export type Order = {
  id: string;
  customer: string;
  phone: string;
  initials: string;
  pickupTime: string;
  pickupRange: string;
  items: OrderItem[];
  amount: string;
  status: OrderStatus;
  note?: string;
  urgent?: boolean;
  otp: string;
  paymentId: string;
};

const startingOrders: Order[] = [
  {
    id: "TOT-4821",
    customer: "Maya Rodriguez",
    phone: "+91 98451 22910",
    initials: "MR",
    pickupTime: "12:35 PM",
    pickupRange: "12:35–12:45 PM",
    items: [
      { name: "Mysore Masala Dosa", detail: "Crispy · extra coconut chutney", quantity: 2, price: "₹220" },
      { name: "Filter Coffee (Degree)", detail: "Strong · less sugar", quantity: 1, price: "₹40" },
    ],
    amount: "₹260",
    status: "new",
    note: "Please pack chutney in separate container",
    urgent: true,
    otp: "7419",
    paymentId: "pay_tot_98124a",
  },
  {
    id: "TOT-4818",
    customer: "Lewis Turner",
    phone: "+91 98860 31405",
    initials: "LT",
    pickupTime: "12:25 PM",
    pickupRange: "12:25–12:35 PM",
    items: [
      { name: "Andhra Special Meal Thali", detail: "Extra pappu dal & appalam", quantity: 1, price: "₹210" },
      { name: "Butter Milk (Chaas)", detail: "Chilled with ginger tadka", quantity: 1, price: "₹35" },
    ],
    amount: "₹245",
    status: "in-progress",
    otp: "3892",
    paymentId: "pay_tot_81923b",
  },
  {
    id: "TOT-4814",
    customer: "Nia Bennett",
    phone: "+91 97410 88201",
    initials: "NB",
    pickupTime: "12:15 PM",
    pickupRange: "12:15–12:25 PM",
    items: [
      { name: "Paneer Tikka Rice Bowl", detail: "Medium spicy with curd dip", quantity: 1, price: "₹230" },
      { name: "Ginger Lemon Cooler", detail: "Fresh mint splash", quantity: 1, price: "₹50" },
    ],
    amount: "₹280",
    status: "ready",
    note: "Customer is waiting at pickup counter",
    otp: "5124",
    paymentId: "pay_tot_73911c",
  },
  {
    id: "TOT-4809",
    customer: "Theo Martin",
    phone: "+91 99001 54721",
    initials: "TM",
    pickupTime: "12:50 PM",
    pickupRange: "12:50–1:00 PM",
    items: [
      { name: "Idli Vada Combo", detail: "Ghee dip · sambar dip", quantity: 2, price: "₹170" },
      { name: "Masala Chai Flask", detail: "Ginger cardamom", quantity: 1, price: "₹35" },
    ],
    amount: "₹205",
    status: "new",
    otp: "9042",
    paymentId: "pay_tot_62831d",
  },
  {
    id: "TOT-4798",
    customer: "Ananya Rao",
    phone: "+91 98450 11923",
    initials: "AR",
    pickupTime: "11:45 AM",
    pickupRange: "11:45–11:55 AM",
    items: [
      { name: "Egg Roast Parotta Box", detail: "Double gravy", quantity: 1, price: "₹170" },
    ],
    amount: "₹170",
    status: "completed",
    otp: "1892",
    paymentId: "pay_tot_51928e",
  },
];

const statusLabels: Record<OrderStatus, string> = {
  new: "New Order",
  "in-progress": "Preparing",
  ready: "Ready for Pickup",
  completed: "Handed Over",
};

const statusColors: Record<OrderStatus, string> = {
  new: "bg-[#fff0df] text-[#bd4c13] border-[#fcd5b8]",
  "in-progress": "bg-[#e8f0e9] text-[#2d6b52] border-[#c2ded0]",
  ready: "bg-[#e2edf0] text-[#235860] border-[#b6dce3]",
  completed: "bg-[#f1ebe3] text-[#716155] border-[#d8cbbe]",
};

// Web Audio API chime generator for loud kitchen alert
function playKitchenChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(startingOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [soundOn, setSoundOn] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reject Modal
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState("Kitchen at full capacity");

  // Handover OTP Modal
  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);
  const [inputOtp, setInputOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const counts = useMemo(
    () => ({
      new: orders.filter((o) => o.status === "new").length,
      "in-progress": orders.filter((o) => o.status === "in-progress").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders]
  );

  const visibleOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  // Order state machine transitions
  const acceptOrder = (orderId: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, status: "in-progress" };
      })
    );
    notify(`Order #${orderId} accepted! Moved to Kitchen Prep.`);
  };

  const markReady = (orderId: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        return { ...order, status: "ready" };
      })
    );
    notify(`Order #${orderId} marked READY! Customer notified for pickup.`);
  };

  const confirmHandover = () => {
    if (!handoverOrder) return;
    if (inputOtp.trim() && inputOtp.trim() !== handoverOrder.otp) {
      setOtpError(true);
      return;
    }
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== handoverOrder.id) return order;
        return { ...order, status: "completed" };
      })
    );
    notify(`Order #${handoverOrder.id} handed over successfully!`);
    setHandoverOrder(null);
    setInputOtp("");
    setOtpError(false);
  };

  const submitReject = () => {
    if (!rejectingOrder) return;
    setOrders((current) => current.filter((o) => o.id !== rejectingOrder.id));
    notify(`Order #${rejectingOrder.id} declined: ${rejectReason}. Refund initiated.`);
    setRejectingOrder(null);
  };

  // Simulate a new incoming customer order
  const simulateNewOrder = () => {
    const id = `TOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrd: Order = {
      id,
      customer: "Kavya Deshmukh",
      phone: "+91 98200 45612",
      initials: "KD",
      pickupTime: "In 15 mins",
      pickupRange: "1:05–1:15 PM",
      items: [
        { name: "Mysore Masala Dosa", detail: "Fresh red chutney", quantity: 1, price: "₹110" },
        { name: "Masala Chai Flask", quantity: 1, price: "₹35" },
      ],
      amount: "₹145",
      status: "new",
      urgent: true,
      note: "Pre-order for tech park lunch break",
      otp: randomOtp,
      paymentId: `pay_tot_${Math.random().toString(36).slice(2, 8)}`,
    };
    setOrders((current) => [newOrd, ...current]);
    if (soundOn) playKitchenChime();
    notify(`Incoming Order #${id} from Kavya Deshmukh!`);
  };

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f8efe4] font-sans text-[#252822]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#202522] px-4 py-2.5 text-xs font-semibold text-[#fff8ee] shadow-2xl flex items-center gap-2 border border-[#3b433e]">
          <CheckCircle2 className="h-4 w-4 text-[#78c792]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="relative overflow-hidden bg-[#202522] px-5 pb-5 pt-4 text-[#fff8ee]">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed6c2d] shadow-sm">
              <span className="font-serif text-[1.3rem] font-black text-[#fff7ed]">t</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e4aa84]">TakeOnTime</p>
              <p className="text-sm font-black text-[#fff8ee]">Live Kitchen KOT Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoundOn(!soundOn);
                notify(soundOn ? "Order sound muted" : "Order sound enabled");
              }}
              aria-label="Toggle Sound"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#2c332e] text-[#dac7b5] hover:text-white"
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-[#f28b4b]" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={simulateNewOrder}
              className="flex items-center gap-1.5 rounded-full bg-[#ed6c2d] px-3 py-1.5 text-xs font-extrabold text-white shadow-md hover:bg-[#db5d20] active:scale-95 transition-transform"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate Order</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-[#f28b4b] animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f28b4b]">
                Active Service Window
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">
              Lunch Rush Orders
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#2c332e] px-2.5 py-1 text-[11px] font-bold text-[#b7c5b9]">
            <span className="h-2 w-2 rounded-full bg-[#75bc91] animate-ping" />
            <span>Accepting (Open)</span>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <section className="relative z-[1] -mt-2 px-4">
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-[#ead9c6] bg-[#fffaf3] p-2.5 shadow-sm text-center">
          <div
            onClick={() => setFilter("new")}
            className={`cursor-pointer rounded-xl p-2 transition-colors ${
              filter === "new" ? "bg-[#fff0df] ring-2 ring-[#bd4c13]" : "bg-[#fff6ec]"
            }`}
          >
            <p className="text-[9px] font-extrabold uppercase text-[#b96636]">New</p>
            <p className="mt-0.5 text-lg font-black text-[#a94b19]">{counts.new}</p>
          </div>
          <div
            onClick={() => setFilter("in-progress")}
            className={`cursor-pointer rounded-xl p-2 transition-colors ${
              filter === "in-progress" ? "bg-[#edf3ed] ring-2 ring-[#39735a]" : "bg-[#f4f8f4]"
            }`}
          >
            <p className="text-[9px] font-extrabold uppercase text-[#477057]">Cooking</p>
            <p className="mt-0.5 text-lg font-black text-[#39735a]">{counts["in-progress"]}</p>
          </div>
          <div
            onClick={() => setFilter("ready")}
            className={`cursor-pointer rounded-xl p-2 transition-colors ${
              filter === "ready" ? "bg-[#eaf1f1] ring-2 ring-[#346a70]" : "bg-[#f2f7f7]"
            }`}
          >
            <p className="text-[9px] font-extrabold uppercase text-[#456c70]">Ready</p>
            <p className="mt-0.5 text-lg font-black text-[#346a70]">{counts.ready}</p>
          </div>
          <div
            onClick={() => setFilter("completed")}
            className={`cursor-pointer rounded-xl p-2 transition-colors ${
              filter === "completed" ? "bg-[#f1ebe3] ring-2 ring-[#716155]" : "bg-[#faf6f1]"
            }`}
          >
            <p className="text-[9px] font-extrabold uppercase text-[#716155]">Done</p>
            <p className="mt-0.5 text-lg font-black text-[#56483e]">{counts.completed}</p>
          </div>
        </div>
      </section>

      {/* Orders List Content */}
      <section className="px-4 pb-12 pt-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(["all", "new", "in-progress", "ready", "completed"] as const).map((tab) => {
            const isSelected = filter === tab;
            const count = tab === "all" ? orders.length : counts[tab];
            const label = tab === "all" ? "All Orders" : statusLabels[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-transform active:scale-95 ${
                  isSelected
                    ? "bg-[#202522] text-[#fff9f0] shadow-sm"
                    : "border border-[#e6d6c4] bg-[#fffaf3] text-[#76695b] hover:bg-[#f4e8da]"
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] ${isSelected ? "text-[#e4aa84]" : "text-[#a89584]"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Order Cards */}
        <div className="mt-3 space-y-3">
          {visibleOrders.length > 0 ? (
            visibleOrders.map((order) => (
              <article
                key={order.id}
                className={`rounded-2xl border bg-[#fffdf9] p-4 shadow-sm transition-all ${
                  order.status === "new"
                    ? "border-[#f2a87c] ring-1 ring-[#f2a87c]/40"
                    : "border-[#eadcca]"
                }`}
              >
                {/* Top Row: Customer & Order ID */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5ebe0] text-xs font-black text-[#695240]">
                      {order.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-[#252822]">{order.customer}</h3>
                        {order.urgent && (
                          <span className="rounded-md bg-[#fae8e5] px-1.5 py-0.5 text-[9px] font-bold text-[#c93f30]">
                            Due Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#8a796e]">{order.id} · Pickup: {order.pickupRange}</p>
                    </div>
                  </div>

                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* Items List */}
                <div className="mt-3 divide-y divide-[#f2e7dd] rounded-xl bg-[#faf5ee] px-3 py-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="grid h-4 w-4 place-items-center rounded bg-[#e8dbcd] text-[10px] font-black text-[#56483e]">
                          {item.quantity}
                        </span>
                        <div>
                          <span className="font-semibold text-[#2d2420]">{item.name}</span>
                          {item.detail && <p className="text-[10px] text-[#8e7e72]">{item.detail}</p>}
                        </div>
                      </div>
                      <span className="font-bold text-[#352a24]">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Customer Special Note */}
                {order.note && (
                  <div className="mt-2.5 rounded-lg border-l-2 border-[#dd693c] bg-[#fff6ee] px-2.5 py-1 text-[11px] text-[#785440]">
                    <strong>Note:</strong> {order.note}
                  </div>
                )}

                {/* Action Row */}
                <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-[#f0e3d7]">
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#918174] block">Prepaid Total</span>
                    <span className="text-sm font-black text-[#252822]">{order.amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-xl border border-[#decbb9] px-3 py-2 text-xs font-bold text-[#5e5046] hover:bg-[#f4e9dd]"
                    >
                      KOT Details
                    </button>

                    {order.status === "new" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectingOrder(order)}
                          className="rounded-xl border border-[#f3c8c2] bg-[#fff5f4] px-2.5 py-2 text-xs font-bold text-[#c93f30] hover:bg-[#fde9e7]"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => acceptOrder(order.id)}
                          className="rounded-xl bg-[#202522] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#343b36]"
                        >
                          Accept (Cook)
                        </button>
                      </>
                    )}

                    {order.status === "in-progress" && (
                      <button
                        type="button"
                        onClick={() => markReady(order.id)}
                        className="rounded-xl bg-[#dd693c] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#c95b30]"
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === "ready" && (
                      <button
                        type="button"
                        onClick={() => {
                          setHandoverOrder(order);
                          setInputOtp("");
                          setOtpError(false);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-[#2d6b52] px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#235641]"
                      >
                        <HandCoins className="h-3.5 w-3.5" />
                        <span>Handover (OTP)</span>
                      </button>
                    )}

                    {order.status === "completed" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-[#3d7a53]">
                        <CheckCircle2 className="h-4 w-4" /> Picked Up
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#decbb9] bg-[#fffaf5] p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#78c792] mb-2" />
              <h4 className="text-sm font-bold text-[#2d2420]">Queue is Clear</h4>
              <p className="mt-0.5 text-xs text-[#8e7e72]">
                No orders currently in &quot;{statusLabels[filter] || "this status"}&quot;.
              </p>
              <button
                type="button"
                onClick={simulateNewOrder}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#202522] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Sparkles className="h-3 w-3" /> Simulate a Test Order
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Handover OTP Verification Modal */}
      {handoverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]">
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f3ec] text-[#2d6b52] mb-3">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-[#29221d]">Handover Pickup</h3>
              <p className="mt-1 text-xs text-[#7e6d61]">
                Customer: <strong className="text-[#29221d]">{handoverOrder.customer}</strong>
              </p>
              <p className="text-[11px] text-[#8e7e72] mt-0.5 font-mono">
                Order #{handoverOrder.id}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-[#faf5ee] p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#918174]">
                Customer&apos;s Pickup Token
              </span>
              <p className="mt-1 font-mono text-2xl font-black tracking-widest text-[#2d6b52]">
                {handoverOrder.otp}
              </p>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                Enter 4-Digit Customer OTP
              </label>
              <input
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => {
                  setInputOtp(e.target.value.replace(/\D/g, ""));
                  setOtpError(false);
                }}
                placeholder="4-digit code"
                className="w-full rounded-xl border border-[#decbb9] bg-white py-2 text-center font-mono text-lg font-bold tracking-widest text-[#29221d] focus:border-[#dd693c] focus:outline-none"
              />
              {otpError && (
                <p className="mt-1 text-center text-[10px] font-bold text-[#c93f30]">
                  Incorrect code. Check customer screen token.
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setHandoverOrder(null)}
                className="flex-1 rounded-xl border border-[#decbb9] py-2 text-xs font-bold text-[#726256]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmHandover}
                className="flex-1 rounded-xl bg-[#2d6b52] py-2 text-xs font-extrabold text-white"
              >
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl border border-[#ebdcd0]">
            <div className="flex items-center gap-2 text-[#c93f30] mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-sm">Decline Order #{rejectingOrder.id}?</h3>
            </div>
            <p className="text-xs text-[#7e6d61] leading-relaxed">
              Customer prepaid ₹{rejectingOrder.amount}. Declining will immediately trigger an automated full refund to their UPI account.
            </p>

            <div className="mt-3 space-y-1.5">
              <label className="text-[11px] font-bold text-[#56483e]">Select Reason</label>
              {[
                "Kitchen at full capacity",
                "Ingredients / items sold out",
                "Kitchen closing early for break",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full rounded-lg border p-2 text-left text-xs font-semibold ${
                    rejectReason === reason
                      ? "border-[#c93f30] bg-[#fff5f4] text-[#c93f30]"
                      : "border-[#e8dccf] bg-white text-[#56483e]"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="flex-1 rounded-xl border border-[#decbb9] py-2 text-xs font-bold text-[#726256]"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={submitReject}
                className="flex-1 rounded-xl bg-[#c93f30] py-2 text-xs font-extrabold text-white"
              >
                Decline & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail KOT Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
              <div>
                <h3 className="text-base font-black text-[#29221d]">Kitchen Order Ticket (KOT)</h3>
                <p className="text-[11px] font-mono text-[#8e7e72]">ID: {selectedOrder.id} · Prepaid</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#8e7e72] hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs text-[#52443a]">
              <div className="flex justify-between">
                <span>Customer</span>
                <strong className="text-[#29221d]">{selectedOrder.customer} ({selectedOrder.phone})</strong>
              </div>
              <div className="flex justify-between">
                <span>Pickup Window</span>
                <strong>{selectedOrder.pickupRange}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Reference</span>
                <span className="font-mono text-[11px]">{selectedOrder.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Handover Token</span>
                <strong className="font-mono text-sm text-[#2d6b52]">{selectedOrder.otp}</strong>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-[#faf5ee] p-3 text-xs divide-y divide-[#ebdcd0]">
              {selectedOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between py-1.5">
                  <div>
                    <span className="font-bold text-[#29221d]">{it.quantity} × {it.name}</span>
                    {it.detail && <p className="text-[10px] text-[#8e7e72]">{it.detail}</p>}
                  </div>
                  <span className="font-bold">{it.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  notify("Thermal KOT printed via Bluetooth printer");
                  setSelectedOrder(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#decbb9] py-2 text-xs font-bold text-[#56483e] hover:bg-[#f0e4d7]"
              >
                <Printer className="h-4 w-4" /> Print KOT
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl bg-[#202522] py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Orders;
