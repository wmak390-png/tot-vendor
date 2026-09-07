import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Keypad,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Utensils,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, type Order } from "@/lib/takeontime-store";

export function KitchenDisplaySystem({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>(takeOnTimeStore.getOrders("vendor_little_fern"));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "in-progress" | "ready">("all");
  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setOrders(takeOnTimeStore.getOrders("vendor_little_fern"));
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio context might be restricted
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const filteredOrders = filter === "all" ? activeOrders : activeOrders.filter((o) => o.status === filter);

  // Consolidated Item Summary for the cook
  const itemConsolidation: Record<string, number> = {};
  activeOrders
    .filter((o) => o.status === "new" || o.status === "in-progress")
    .forEach((o) => {
      o.items.forEach((item) => {
        itemConsolidation[item.name] = (itemConsolidation[item.name] || 0) + item.quantity;
      });
    });

  const handleStartCooking = (orderId: string) => {
    takeOnTimeStore.acceptOrder(orderId);
    playChime();
    notify(`Order #${orderId} moved to Cooking`);
  };

  const handleMarkReady = (orderId: string) => {
    takeOnTimeStore.markOrderReady(orderId);
    playChime();
    notify(`Order #${orderId} marked Ready! Pickup buzzer sent to customer.`);
  };

  const handleOpenOtpModal = (order: Order) => {
    setOtpModalOrder(order);
    setOtpInput("");
    setOtpError(false);
  };

  const handleVerifyOtp = () => {
    if (!otpModalOrder) return;
    if (otpInput.trim() === otpModalOrder.otp) {
      takeOnTimeStore.completeOrder(otpModalOrder.id);
      notify(`Order #${otpModalOrder.id} successfully handed over!`);
      setOtpModalOrder(null);
      setOtpInput("");
      setOtpError(false);
      playChime();
    } else {
      setOtpError(true);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#121613] text-[#f0f4f1] p-3 sm:p-6 font-sans">
      {/* Top Station Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28362b] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#ed6c2d] flex items-center justify-center font-black text-white shadow-lg">
            KDS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Kitchen Display System</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3021] px-2.5 py-0.5 text-xs font-semibold text-[#4ed976] border border-[#2d5236]">
                <span className="h-2 w-2 rounded-full bg-[#4ed976] animate-pulse"></span>
                LIVE CHEF STATION
              </span>
            </div>
            <p className="text-xs text-[#8a9e8f]">Little Fern Kitchen · Counter Bay 02 · Embassy TechVillage</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              soundEnabled
                ? "bg-[#1c2e22] text-[#4ed976] border-[#345c3d]"
                : "bg-[#252826] text-[#718276] border-[#38403a]"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Buzzer Chime ON" : "Buzzer Muted"}
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("vendor-flow/Orders")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222b24] hover:bg-[#2b382e] text-[#b3c7b8] border border-[#314235] transition-colors"
            >
              Back to Regular Queue
            </button>
          )}
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#0b100d] px-4 py-2 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
          <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Live Kitchen Summary Metrics */}
      <section aria-label="Kitchen Summary" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-[#1a231d] border border-[#2b3a2f]">
          <div className="text-xs text-[#8a9e8f] flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#f59e0b]" /> Active Cooking
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {activeOrders.filter((o) => o.status === "in-progress").length}
          </div>
          <p className="text-[11px] text-[#8a9e8f]">On stove & tawa</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a231d] border border-[#2b3a2f]">
          <div className="text-xs text-[#8a9e8f] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" /> New Incoming
          </div>
          <div className="text-2xl font-bold text-[#60a5fa] mt-1">
            {activeOrders.filter((o) => o.status === "new").length}
          </div>
          <p className="text-[11px] text-[#8a9e8f]">Needs prep confirmation</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a231d] border border-[#2b3a2f]">
          <div className="text-xs text-[#8a9e8f] flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#4ed976]" /> Ready for Handover
          </div>
          <div className="text-2xl font-bold text-[#4ed976] mt-1">
            {activeOrders.filter((o) => o.status === "ready").length}
          </div>
          <p className="text-[11px] text-[#8a9e8f]">Awaiting customer OTP</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1a231d] border border-[#2b3a2f]">
          <div className="text-xs text-[#8a9e8f] flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-[#ed6c2d]" /> Avg. Prep Speed
          </div>
          <div className="text-2xl font-bold text-[#f09562] mt-1">8.2 min</div>
          <p className="text-[11px] text-[#8a9e8f]">Target: under 12 min</p>
        </div>
      </section>

      {/* Preparation Consolidator Bar */}
      {Object.keys(itemConsolidation).length > 0 && (
        <section aria-label="Items on Fire" className="mb-6 rounded-xl bg-[#18221b] border border-[#2a3a2e] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f09562] uppercase tracking-wider">
              <Flame className="h-4 w-4 text-[#ed6c2d]" /> Active Batch Aggregation (Total items currently cooking)
            </div>
            <span className="text-[11px] text-[#8a9e8f]">Consolidated across all tickets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(itemConsolidation).map(([name, qty]) => (
              <div
                key={name}
                className="flex items-center gap-2 bg-[#222f25] px-3 py-1.5 rounded-lg border border-[#304435] text-xs"
              >
                <span className="font-bold text-[#4ed976] text-sm bg-[#162118] px-2 py-0.5 rounded border border-[#2a3c2e]">
                  ×{qty}
                </span>
                <span className="font-semibold text-white">{name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {(["all", "new", "in-progress", "ready"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              filter === tab
                ? "bg-[#ed6c2d] text-white border-[#ed6c2d] shadow-sm"
                : "bg-[#1a231d] text-[#a4b8a9] border-[#2b3a2f] hover:bg-[#222e25]"
            }`}
          >
            {tab === "all" && `All Active (${activeOrders.length})`}
            {tab === "new" && `New Orders (${activeOrders.filter((o) => o.status === "new").length})`}
            {tab === "in-progress" && `Cooking Now (${activeOrders.filter((o) => o.status === "in-progress").length})`}
            {tab === "ready" && `Ready to Hand Over (${activeOrders.filter((o) => o.status === "ready").length})`}
          </button>
        ))}
      </div>

      {/* Live Order Grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2b3a2f] bg-[#161d18] p-12 text-center">
          <Utensils className="h-10 w-10 text-[#495b4e] mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">All Clear on Chef Station</h3>
          <p className="text-xs text-[#8a9e8f] mt-1 max-w-sm mx-auto">
            No orders in this status right now. Incoming orders from customer kiosks and apps will chime here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === "new";
            const isInProgress = order.status === "in-progress";
            const isReady = order.status === "ready";

            return (
              <article
                key={order.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                  isNew
                    ? "bg-[#211d17] border-[#d97706]/60 shadow-[0_0_15px_rgba(217,119,6,0.15)]"
                    : isInProgress
                    ? "bg-[#18211a] border-[#2f4834]"
                    : "bg-[#152319] border-[#285333] shadow-[0_0_15px_rgba(78,217,118,0.12)]"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#2b3a2f] pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">{order.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            isNew
                              ? "bg-[#d97706]/20 text-[#fbbf24] border border-[#d97706]/40"
                              : isInProgress
                              ? "bg-[#3b82f6]/20 text-[#93c5fd] border border-[#3b82f6]/40"
                              : "bg-[#4ed976]/20 text-[#8bf2a9] border border-[#4ed976]/40"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a9e8f] mt-0.5">
                        {order.customer} · Placed {order.createdAt}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#f09562]">{order.pickupTime}</div>
                      <span className="text-[10px] text-[#8a9e8f]">{order.pickupRange}</span>
                    </div>
                  </div>

                  {/* Customer Note */}
                  {order.note && (
                    <div className="mb-3 rounded-lg bg-[#271d15] border border-[#523d24] p-2 text-xs text-[#fed7aa] flex items-start gap-1.5">
                      <span className="font-bold text-[#f97316]">NOTE:</span>
                      <span>{order.note}</span>
                    </div>
                  )}

                  {/* Item List */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between bg-[#131b15] p-2.5 rounded-xl border border-[#233126]"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-extrabold text-base text-[#4ed976] bg-[#1a291e] px-2 py-0.5 rounded border border-[#2d4633]">
                            {item.quantity}×
                          </span>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{item.name}</p>
                            {item.detail && <p className="text-[11px] text-[#8a9e8f] mt-0.5">{item.detail}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#667a6d]">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="border-t border-[#28362b] pt-3 mt-2">
                  {isNew && (
                    <button
                      type="button"
                      onClick={() => handleStartCooking(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#ed6c2d] hover:bg-[#d95d20] text-white transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-white" /> Start Cooking
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      type="button"
                      onClick={() => handleMarkReady(order.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#2e7d32] hover:bg-[#256628] text-white transition-all shadow-md active:scale-98 cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Mark Order Ready
                    </button>
                  )}

                  {isReady && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs bg-[#16271b] px-3 py-1.5 rounded-lg border border-[#2a5033]">
                        <span className="text-[#8bf2a9] font-medium">Customer OTP Verification:</span>
                        <span className="font-mono font-bold text-white tracking-widest">{order.otp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenOtpModal(order)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1f6f39] hover:bg-[#195a2e] text-[#dcfce7] transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#8bf2a9]" /> Verify OTP & Handover
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* OTP Modal */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#19221b] border border-[#2f4333] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4 border-b border-[#28392c] pb-3">
              <div>
                <h3 className="font-bold text-base">Verify Customer OTP</h3>
                <p className="text-xs text-[#8a9e8f]">Order #{otpModalOrder.id} · {otpModalOrder.customer}</p>
              </div>
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                className="rounded-lg p-1 text-[#8a9e8f] hover:bg-[#253328]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#b0c4b4] mb-3">
              Ask the customer for their 4-digit pickup code shown on their phone:
            </p>

            <div className="mb-4">
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, ""));
                  setOtpError(false);
                }}
                placeholder="Enter 4 digits"
                className="w-full text-center text-3xl font-mono tracking-widest font-extrabold bg-[#0f1511] border border-[#314736] rounded-xl py-3 focus:outline-none focus:border-[#4ed976]"
                autoFocus
              />
              {otpError && (
                <p className="text-xs text-[#ef4444] font-semibold text-center mt-2">
                  Incorrect code! Customer's actual code is {otpModalOrder.otp}.
                </p>
              )}
            </div>

            {/* Quick keypad helpers */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "Auto"].map((keyVal) => (
                <button
                  key={keyVal}
                  type="button"
                  onClick={() => {
                    if (keyVal === "C") setOtpInput("");
                    else if (keyVal === "Auto") setOtpInput(otpModalOrder.otp);
                    else if (otpInput.length < 4) setOtpInput((prev) => prev + keyVal);
                  }}
                  className="py-2.5 rounded-lg bg-[#222f25] hover:bg-[#2b3c2f] font-bold text-sm text-white border border-[#2d4031] transition-colors active:scale-95"
                >
                  {keyVal}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOtpModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#253027] hover:bg-[#2e3c31] text-[#9bb0a0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white shadow-md cursor-pointer"
              >
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default KitchenDisplaySystem;
