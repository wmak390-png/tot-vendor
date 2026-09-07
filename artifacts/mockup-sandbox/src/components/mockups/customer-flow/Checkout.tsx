import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

const pickupSlots = [
  { id: "15min", label: "ASAP · Ready in 12–15 mins", sub: "Kitchen is actively cooking" },
  { id: "30min", label: "In 30 mins (1:00 PM)", sub: "Recommended for meetings" },
  { id: "45min", label: "In 45 mins (1:15 PM)", sub: "Lunch rush scheduled window" },
];

export function Checkout({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [cart, setCart] = useState(takeOnTimeStore.getCart());
  const [customerName, setCustomerName] = useState("Maya Rodriguez");
  const [customerPhone, setCustomerPhone] = useState("+91 98451 22910");
  const [selectedSlot, setSelectedSlot] = useState(pickupSlots[0].id);
  const [kitchenNote, setKitchenNote] = useState(cart.kitchenNote || "");
  
  // Payment bottom sheet
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi_gpay" | "upi_phonepe" | "card" | "paytm">("upi_gpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setCart(takeOnTimeStore.getCart());
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const itemTotal = cart.items.reduce((sum, it) => sum + it.priceNum, 0);
  const platformFee = 0; // Waived for campus MVP
  const taxes = Math.round(itemTotal * 0.05); // 5% GST on canteen food
  const grandTotal = itemTotal + platformFee + taxes;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentSheet(false);
      takeOnTimeStore.setCartKitchenNote(kitchenNote);
      takeOnTimeStore.setCartPickupSlot(pickupSlots.find((s) => s.id === selectedSlot)?.label || "In 15 mins");
      
      const newOrder = takeOnTimeStore.placeCustomerOrder(customerName, customerPhone);
      notify(`Prepayment successful! Order #${newOrder.id} placed.`);
      
      if (onNavigate) {
        onNavigate("customer-flow/OrderTracking");
      }
    }, 1200);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f4ede4] px-0 text-[#252822] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#faf6ef] shadow-[0_20px_80px_rgba(40,30,20,0.12)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#202522] px-4 py-2.5 text-xs font-semibold text-[#fff8ee] shadow-2xl flex items-center gap-2 border border-[#3b433e]">
            <Check className="h-4 w-4 text-[#78c792]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between bg-[#242b26] px-4 py-3 text-white">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/VendorMenu")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#323c34] text-[#f5ebd9] hover:bg-[#434f47]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-[#e5a67f]">Pickup Checkout</h1>
            <p className="text-xs font-bold text-white">{cart.vendorName}</p>
          </div>
          <div className="w-9" />
        </header>

        {/* Scrollable Checkout Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
          
          {/* Pickup Counter Card */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbf0e6] text-[#ed6c2d]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b7565]">
                  Pickup Location & Counter
                </span>
                <h2 className="text-sm font-extrabold text-[#27201c]">{cart.vendorName}</h2>
                <p className="text-[11px] text-[#716155]">Counter 2 · Koramangala 4th Block Campus</p>
              </div>
            </div>
          </div>

          {/* Pickup Window Selection */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock className="h-4 w-4 text-[#ed6c2d]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#27201c]">
                Select Promised Pickup Time
              </h3>
            </div>

            <div className="space-y-2">
              {pickupSlots.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? "border-[#ed6c2d] bg-[#fdf7f2] ring-1 ring-[#ed6c2d]"
                        : "border-[#e9ddd1] bg-white text-[#5c4a3e] hover:bg-[#faf5ee]"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-[#ed6c2d]" : "text-[#27201c]"}`}>
                        {slot.label}
                      </p>
                      <p className="text-[10px] text-[#8b7565]">{slot.sub}</p>
                    </div>
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full border ${
                        isSelected ? "border-[#ed6c2d] bg-[#ed6c2d] text-white" : "border-[#cdbdb0]"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Items Review */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#f1e5d8]">
              <span className="text-xs font-black uppercase tracking-wider text-[#27201c]">
                Items In Bag ({cart.items.length})
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("customer-flow/VendorMenu")}
                className="text-[11px] font-bold text-[#ed6c2d] hover:underline"
              >
                + Add more
              </button>
            </div>

            <div className="divide-y divide-[#f5ede4]">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex-1">
                    <p className="font-bold text-[#27201c]">{item.name}</p>
                    {item.detail && <p className="text-[10px] text-[#8b7565]">{item.detail}</p>}
                    <p className="text-xs font-extrabold text-[#ed6c2d] mt-0.5">{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-[#faf5ee] border border-[#ebdcd0] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => takeOnTimeStore.updateCartItemQty(idx, -1)}
                      className="text-[#7d695b] hover:text-black"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => takeOnTimeStore.updateCartItemQty(idx, 1)}
                      className="text-[#7d695b] hover:text-black"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cooking Instructions */}
            <div className="mt-3 pt-2.5 border-t border-[#f1e5d8]">
              <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">
                Note for kitchen staff
              </label>
              <input
                type="text"
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                placeholder="e.g. Extra chutney, less spicy, separate box"
                className="w-full rounded-xl border border-[#ebdcd0] bg-[#faf6ef] p-2 text-xs text-[#27201c] focus:border-[#ed6c2d] focus:outline-none"
              />
            </div>
          </div>

          {/* Customer Pickup Contact */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-white p-3.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wider text-[#27201c] block mb-2">
              Pickup Notification Contact
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8b7565]">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-[#ebdcd0] bg-[#faf6ef] p-2 text-xs font-semibold text-[#27201c]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8b7565]">Phone for OTP SMS</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#ebdcd0] bg-[#faf6ef] p-2 text-xs font-semibold text-[#27201c]"
                />
              </div>
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-white p-3.5 shadow-sm text-xs space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#27201c] block mb-1">
              Bill Summary
            </span>
            <div className="flex justify-between text-[#716155]">
              <span>Item Total</span>
              <span className="font-semibold text-[#27201c]">₹{itemTotal}</span>
            </div>
            <div className="flex justify-between text-[#716155]">
              <span>Campus Platform Fee</span>
              <span className="font-semibold text-[#2d7a46]">FREE (₹0)</span>
            </div>
            <div className="flex justify-between text-[#716155]">
              <span>GST & Canteen Cess (5%)</span>
              <span className="font-semibold text-[#27201c]">₹{taxes}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#f1e5d8] text-sm font-black text-[#27201c]">
              <span>To Pay</span>
              <span className="text-[#ed6c2d]">₹{grandTotal}</span>
            </div>
          </div>

          {/* Razorpay Prepaid Notice */}
          <div className="flex items-center gap-2 rounded-xl bg-[#e8f4ec] p-2.5 text-[11px] text-[#246138]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#2d7a46]" />
            <span>Prepaid only. Orders auto-refund if declined by vendor. No cash handling needed.</span>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] z-40">
          <button
            type="button"
            onClick={() => setShowPaymentSheet(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-[#ed6c2d] px-4 py-3 text-white shadow-xl hover:bg-[#db5e20] active:scale-98 transition-all"
          >
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-white/80 block">Grand Total</span>
              <span className="text-base font-black">₹{grandTotal}</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-black">
              <span>Pay & Place Order</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        {/* Simulated Razorpay Sheet */}
        {showPaymentSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-[430px] rounded-t-[32px] bg-white p-5 shadow-2xl border-t border-[#ebdcd0] animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0c2340] text-white font-serif font-black text-sm">
                    R
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0c2340]">Razorpay Secure Checkout</h3>
                    <p className="text-[10px] text-[#8b7565]">Prepaid Gateway · TakeOnTime</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentSheet(false)}
                  className="rounded-lg p-1 text-[#8b7565] hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="my-3 rounded-xl bg-[#f5f8fa] p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#334155]">Total Amount</span>
                <span className="text-lg font-black text-[#0c2340]">₹{grandTotal}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8b7565]">
                  Select Payment Method
                </span>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi_gpay")}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-xs font-bold ${
                    paymentMethod === "upi_gpay"
                      ? "border-[#0c2340] bg-[#f0f5ff] text-[#0c2340]"
                      : "border-[#e2e8f0] text-[#475569]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#2563eb]" />
                    <span>Google Pay UPI (Instant)</span>
                  </div>
                  <span className="text-[10px] text-[#16a34a] font-mono">Fastest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi_phonepe")}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-xs font-bold ${
                    paymentMethod === "upi_phonepe"
                      ? "border-[#0c2340] bg-[#f0f5ff] text-[#0c2340]"
                      : "border-[#e2e8f0] text-[#475569]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#7c3aed]" />
                    <span>PhonePe / BHIM UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-xs font-bold ${
                    paymentMethod === "card"
                      ? "border-[#0c2340] bg-[#f0f5ff] text-[#0c2340]"
                      : "border-[#e2e8f0] text-[#475569]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#475569]" />
                    <span>Credit or Debit Card</span>
                  </div>
                </button>
              </div>

              {/* Confirm Pay Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0c2340] py-3 text-xs font-black text-white shadow-lg hover:bg-[#133358] active:scale-98 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authorizing UPI Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay ₹{grandTotal} & Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Checkout;
