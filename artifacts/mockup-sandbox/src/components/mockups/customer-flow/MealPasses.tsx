import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Flame,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  PartyPopper,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingDown,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  takeOnTimeStore,
  type MealPlan,
  type UserSubscription,
} from "@/lib/takeontime-store";

export function MealPasses({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"my-pass" | "browse">("my-pass");
  const [plans, setPlans] = useState<MealPlan[]>(takeOnTimeStore.getMealPlans());
  const [sub, setSub] = useState<UserSubscription | null>(takeOnTimeStore.getUserSubscription());
  const [toast, setToast] = useState<string | null>(null);

  // Filter in browse
  const [planFilter, setPlanFilter] = useState<"all" | "weekly" | "monthly" | "flexi">("all");

  // Purchase Modal State
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<MealPlan | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  // Slot Booking Modal State
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("Lunch");
  const [selectedTime, setSelectedTime] = useState("12:45 PM");
  const [selectedMealOption, setSelectedMealOption] = useState("Executive Andhra Thali + Sweet");
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setPlans(takeOnTimeStore.getMealPlans());
      setSub(takeOnTimeStore.getUserSubscription());
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleBuyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToBuy) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      try {
        takeOnTimeStore.purchaseMealPlan(selectedPlanToBuy.id);
        notify(`🎉 Payment successful! "${selectedPlanToBuy.title}" activated with ${selectedPlanToBuy.totalMeals} meal credits.`);
        setSelectedPlanToBuy(null);
        setActiveTab("my-pass");
      } catch (err) {
        notify("Failed to activate plan");
      }
    }, 1400);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;

    const ok = takeOnTimeStore.bookMealSlot(
      bookingDate,
      selectedSlot,
      selectedTime,
      selectedMealOption
    );

    if (ok) {
      notify(`Meal reserved for ${bookingDate} (${selectedTime})! 1 credit deducted. Pickup token generated.`);
      setBookingDate(null);
    } else {
      notify("Could not complete booking. Check remaining credits or daily limit.");
    }
  };

  const handleCancelBooking = (dateStr: string) => {
    const ok = takeOnTimeStore.cancelMealSlot(dateStr);
    if (ok) {
      notify(`Booking cancelled for ${dateStr}. 1 meal credit restored to your pass.`);
      setBookingDate(null);
    }
  };

  // Days calculation for September 2026 calendar (Sep 1 to Sep 30)
  // Sep 1, 2026 is a Tuesday (index 2: Sun=0, Mon=1, Tue=2)
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const leadingBlankDays = Array.from({ length: 2 }, (_, i) => i); // Starts on Tuesday

  const filteredPlans = plans.filter((p) => {
    if (!p.isActive) return false;
    if (planFilter === "all") return true;
    return p.type === planFilter;
  });

  // Check today's date formatted as YYYY-MM-DD
  const todayStr = "2026-09-07";
  const todayBooking = sub?.bookings[todayStr];

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f9fa] px-3 py-4 text-[#1f2937] font-sans sm:px-6 sm:py-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#111827] px-4 py-3 text-xs font-semibold text-white shadow-2xl flex items-center gap-2.5 border border-[#374151]">
          <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#ff6b00] to-[#ea580c] text-white shadow-md shadow-orange-500/20">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#111827] tracking-tight">
                  Cafeteria Meal Passes
                </h1>
                <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-black text-[#16a34a] border border-[#bbf7d0]">
                  Prepaid Savings
                </span>
              </div>
              <p className="text-xs text-[#6b7280]">
                Pre-purchase lunch or dinner in bulk. Save up to 35% with zero daily checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("my-pass")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "my-pass"
                  ? "bg-[#ff6b00] text-white shadow-sm"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              My Active Pass
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("browse")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "browse"
                  ? "bg-[#ff6b00] text-white shadow-sm"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Browse Plans
            </button>
          </div>
        </header>

        {/* TAB 1: MY ACTIVE PASS & INTERACTIVE CALENDAR */}
        {activeTab === "my-pass" && (
          <div className="space-y-4">
            {sub ? (
              <>
                {/* Active Pass Card */}
                <section
                  aria-label="Active Meal Pass Details"
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#111827] text-white p-6 shadow-xl border border-[#334155]"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 text-[#f59e0b]" /> Active Pass
                        </span>
                        <h2 className="text-lg font-black text-white mt-1">
                          {sub.planTitle}
                        </h2>
                        <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                          <Utensils className="h-3.5 w-3.5 text-[#ff6b00]" /> {sub.vendorName} · Counter 2
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-black text-[#ff8a3d]">
                          {sub.mealsRemaining}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
                          Meals Left of {sub.totalMeals}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] text-[#cbd5e1] font-semibold mb-1">
                        <span>Credits Consumed: {sub.mealsConsumed}</span>
                        <span>Reserved: {sub.mealsReserved}</span>
                        <span>Validity: till {sub.endDate}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff6b00] to-[#f59e0b] transition-all"
                          style={{
                            width: `${Math.round((sub.mealsRemaining / sub.totalMeals) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Today's booking banner */}
                    {todayBooking ? (
                      <div className="mt-5 rounded-2xl bg-[#ff6b00]/15 border border-[#ff6b00]/30 p-3.5 backdrop-blur-md flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff6b00] text-white font-black text-sm">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#ff944d] tracking-wider block">
                              Booked for Today · {todayBooking.slot}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {todayBooking.mealOption}
                            </span>
                            <div className="text-[11px] text-[#fed7aa] mt-0.5">
                              Pickup at <strong className="text-white">{todayBooking.time}</strong> (Counter 2 Express Bay)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="px-3 py-2 rounded-xl bg-white text-[#111827] font-black text-xs hover:bg-[#f3f4f6] transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <QrCode className="h-3.5 w-3.5" /> OTP {todayBooking.otp}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-3">
                        <div className="text-xs text-[#cbd5e1]">
                          <span className="font-bold text-white block">No meal scheduled for today</span>
                          Tap today&apos;s date on calendar below to book your lunch or dinner slot.
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingDate(todayStr)}
                          className="px-3 py-1.5 rounded-xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                        >
                          Book Today
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* Monthly Booking Calendar */}
                <section
                  aria-label="Monthly Meal Pass Calendar"
                  className="rounded-3xl bg-white border border-[#e5e7eb] p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-[#ff6b00]" /> September 2026 Calendar
                      </h3>
                      <p className="text-xs text-[#6b7280]">
                        Tap any future date to book lunch or dinner using your credits.
                      </p>
                    </div>

                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
                      <span className="flex items-center gap-1 text-[#16a34a]">
                        <span className="h-2 w-2 rounded-full bg-[#16a34a]"></span> Consumed
                      </span>
                      <span className="flex items-center gap-1 text-[#2563eb]">
                        <span className="h-2 w-2 rounded-full bg-[#2563eb]"></span> Reserved
                      </span>
                      <span className="flex items-center gap-1 text-[#6b7280]">
                        <span className="h-2 w-2 rounded-full bg-[#d1d5db]"></span> Open Date
                      </span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {/* Day Headers */}
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} className="py-1 text-[11px] font-bold text-[#9ca3af]">
                        {day}
                      </div>
                    ))}

                    {/* Blank leading days */}
                    {leadingBlankDays.map((i) => (
                      <div key={`blank-${i}`} className="p-2" />
                    ))}

                    {/* Month Days */}
                    {daysInMonth.map((day) => {
                      const dayStr = day < 10 ? `0${day}` : `${day}`;
                      const fullDate = `2026-09-${dayStr}`;
                      const isPast = day < 7;
                      const isToday = day === 7;
                      const booking = sub.bookings[fullDate];

                      let bgClass = "bg-[#f9fafb] text-[#374151] hover:border-[#ff6b00] hover:bg-[#fff7ed]";
                      let badge = null;

                      if (booking) {
                        if (booking.status === "consumed") {
                          bgClass = "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] font-bold";
                          badge = "✓";
                        } else if (booking.status === "reserved") {
                          bgClass = "bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af] font-black ring-2 ring-[#3b82f6]";
                          badge = booking.slot[0];
                        }
                      } else if (isPast) {
                        bgClass = "bg-[#f3f4f6] text-[#9ca3af] opacity-60 cursor-not-allowed";
                      } else if (isToday) {
                        bgClass = "bg-[#fff7ed] border-[#ff6b00] text-[#ea580c] font-black";
                      }

                      return (
                        <button
                          key={fullDate}
                          type="button"
                          disabled={isPast && !booking}
                          onClick={() => setBookingDate(fullDate)}
                          className={`relative p-2 rounded-xl border transition-all flex flex-col items-center justify-between min-h-[48px] ${bgClass}`}
                        >
                          <span className="text-[11px] font-bold">{day}</span>
                          {badge && (
                            <span className="text-[10px] font-black">{badge}</span>
                          )}
                          {isToday && !booking && (
                            <span className="h-1 w-1 rounded-full bg-[#ff6b00]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Footnote */}
                  <div className="mt-4 pt-3 border-t border-[#f3f4f6] flex items-center justify-between text-[11px] text-[#6b7280]">
                    <span>Policy: Free cancellation up to 2 hours before pickup</span>
                    <span className="font-bold text-[#111827]">Daily Limit: 1 meal / day</span>
                  </div>
                </section>

                {/* Pass Rules & Quick Actions */}
                <section aria-label="Pass Guidelines" className="rounded-3xl bg-white border border-[#e5e7eb] p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-[#111827] uppercase tracking-wider text-[#9ca3af]">
                    Meal Pass Features & Privileges
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#f9fafb]">
                      <ShieldCheck className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[#111827]">Express Pass Counter</strong>
                        <span className="text-[11px] text-[#6b7280]">Skip general queue. Dedicated Bay 02 pickup lane.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#f9fafb]">
                      <Coins className="h-4 w-4 text-[#ff6b00] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[#111827]">Zero Convenience Fees</strong>
                        <span className="text-[11px] text-[#6b7280]">No additional gateway charges on booking slots.</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* No Active Pass State */
              <div className="rounded-3xl bg-white border border-[#e5e7eb] p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] text-[#ff6b00]">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-[#111827]">No Active Meal Pass</h3>
                <p className="text-xs text-[#6b7280] max-w-sm mx-auto mt-1 mb-6">
                  Save on your daily office meals. Buy a weekly or monthly pass to lock in discounted thalis and skip the counter lines.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className="px-6 py-3 rounded-2xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  Browse Available Meal Plans <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROWSE & BUY MEAL PLANS */}
        {activeTab === "browse" && (
          <div className="space-y-4">
            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(["all", "weekly", "monthly", "flexi"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPlanFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                    planFilter === cat
                      ? "bg-[#111827] text-white shadow-sm"
                      : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  {cat === "all" ? "All Meal Passes" : `${cat} Passes`}
                </button>
              ))}
            </div>

            {/* Corporate Subsidy Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#eff6ff] to-[#f0fdf4] border border-[#bfdbfe] p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#2563eb] text-white">
                  <BadgePercent className="h-4 w-4" />
                </span>
                <div>
                  <strong className="text-[#1e3a8a] block">Corporate Tech Park Subsidy</strong>
                  <span className="text-[11px] text-[#3b82f6]">Verified Cisco employee perks: additional 10% auto-deducted</span>
                </div>
              </div>
              <span className="rounded-lg bg-[#dbeafe] px-2 py-1 text-[10px] font-black text-[#1d4ed8]">
                ACTIVE
              </span>
            </div>

            {/* Plans List */}
            <div className="space-y-3.5">
              {filteredPlans.map((plan) => {
                const perMeal = Math.round(plan.basePrice / plan.totalMeals);
                return (
                  <div
                    key={plan.id}
                    className="rounded-3xl bg-white border border-[#e5e7eb] p-5 shadow-sm transition-all hover:border-[#fed7aa] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              plan.type === "monthly"
                                ? "bg-[#eff6ff] text-[#2563eb]"
                                : plan.type === "weekly"
                                ? "bg-[#ecfdf5] text-[#16a34a]"
                                : "bg-[#f5f3ff] text-[#7c3aed]"
                            }`}
                          >
                            {plan.type} PASS
                          </span>
                          <span className="text-xs font-bold text-[#6b7280]">
                            {plan.vendorName}
                          </span>
                        </div>

                        <span className="rounded-full bg-[#fef2f2] px-2.5 py-0.5 text-[10px] font-bold text-[#dc2626] border border-[#fecaca] flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" /> Save {plan.savingsPercent}%
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[#111827]">{plan.title}</h3>
                      <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{plan.tagline}</p>

                      {/* Specs badges */}
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] px-2.5 py-1 font-bold text-[#111827]">
                          🍱 {plan.totalMeals} Meals Included
                        </span>
                        <span className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] px-2.5 py-1 font-bold text-[#111827]">
                          ⏳ {plan.validityDays} Days Validity
                        </span>
                        <span className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] px-2.5 py-1 font-bold text-[#111827]">
                          ⚡ Max {plan.dailyLimit} meal/day
                        </span>
                      </div>

                      {/* Menu Description */}
                      <div className="mt-3 rounded-2xl bg-[#fafafa] border border-[#f3f4f6] p-3 text-xs text-[#4b5563]">
                        <span className="font-bold text-[#111827] block text-[11px] mb-0.5">
                          Daily Meal Inclusions:
                        </span>
                        {plan.menuDescription}
                      </div>
                    </div>

                    {/* Price & Buy Action */}
                    <div className="mt-4 pt-4 border-t border-[#f3f4f6] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#111827]">
                            ₹{plan.totalPrice}
                          </span>
                          <span className="text-xs text-[#6b7280]">
                            (₹{perMeal}/meal)
                          </span>
                        </div>
                        <span className="text-[10px] text-[#16a34a] font-bold">
                          Inclusive of 5% GST & Platform Waiver
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPlanToBuy(plan)}
                        className="px-5 py-2.5 rounded-2xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        Buy Pass <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL 1: PURCHASE & PAYMENT BREAKDOWN */}
        {selectedPlanToBuy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] text-[#ff6b00]">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-[#111827]">Prepaid Meal Pass Checkout</h2>
                    <p className="text-[11px] text-[#6b7280]">{selectedPlanToBuy.vendorName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlanToBuy(null)}
                  className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBuyPlan} className="space-y-4 text-xs">
                {/* Plan Summary */}
                <div className="rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] p-4">
                  <h3 className="font-bold text-[#111827] text-sm">{selectedPlanToBuy.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-[#6b7280]">
                    <span>{selectedPlanToBuy.totalMeals} Total Meals</span>
                    <span>·</span>
                    <span>{selectedPlanToBuy.validityDays} Days Validity</span>
                  </div>
                </div>

                {/* Itemized Price Breakdown */}
                <div className="space-y-2 border-y border-[#f3f4f6] py-3 text-[#6b7280]">
                  <div className="flex justify-between">
                    <span>Base Plan Price:</span>
                    <span className="font-mono font-medium text-[#111827]">₹{selectedPlanToBuy.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5% Food GST:</span>
                    <span className="font-mono font-medium text-[#111827]">+₹{selectedPlanToBuy.gst}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Convenience Fee:</span>
                    <span className="font-mono font-medium text-[#111827]">+₹{selectedPlanToBuy.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-[#16a34a] font-bold">
                    <span>Corporate Perk (10% Waiver):</span>
                    <span className="font-mono">-₹{Math.round(selectedPlanToBuy.totalPrice * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#111827] pt-2 border-t border-[#f3f4f6]">
                    <span>Final Amount to Pay:</span>
                    <span className="font-mono text-[#ff6b00]">
                      ₹{selectedPlanToBuy.totalPrice - Math.round(selectedPlanToBuy.totalPrice * 0.1)}
                    </span>
                  </div>
                </div>

                {/* Payment Selection (Prepaid Only) */}
                <div>
                  <label className="block font-bold text-[#374151] mb-2">
                    Prepaid Payment Mode (No COD for Passes)
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm)", icon: "⚡" },
                      { id: "card", label: "Corporate Credit / Debit Card", icon: "💳" },
                      { id: "netbanking", label: "Netbanking", icon: "🏦" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as "upi" | "card" | "netbanking")}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          paymentMethod === m.id
                            ? "bg-[#fff7ed] border-[#ff6b00] text-[#ff6b00] font-bold"
                            : "bg-white border-[#d1d5db] text-[#374151]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{m.icon}</span> {m.label}
                        </span>
                        {paymentMethod === m.id && <Check className="h-4 w-4 text-[#ff6b00]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-2xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Razorpay Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{selectedPlanToBuy.totalPrice - Math.round(selectedPlanToBuy.totalPrice * 0.1)} & Activate Pass
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: BOOK MEAL SLOT / VIEW RESERVATION */}
        {bookingDate && sub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl my-8">
              {/* Check if already booked */}
              {sub.bookings[bookingDate] ? (
                /* Already Booked View */
                <div>
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#ecfdf5] text-[#16a34a]">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-base font-black text-[#111827]">Meal Reservation</h2>
                        <span className="text-xs text-[#6b7280]">{bookingDate}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingDate(null)}
                      className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] p-4 text-center">
                      <span className="text-[10px] uppercase font-bold text-[#6b7280] tracking-wider">
                        Counter Pickup OTP
                      </span>
                      <div className="text-3xl font-black font-mono text-[#ff6b00] my-1">
                        {sub.bookings[bookingDate].otp}
                      </div>
                      <span className="text-[11px] text-[#6b7280]">
                        Show this 4-digit code at Counter 2 (Little Fern Kitchen)
                      </span>
                    </div>

                    <div className="rounded-xl border border-[#f3f4f6] p-3 space-y-1.5 text-[#374151]">
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Slot:</span>
                        <strong className="text-[#111827]">{sub.bookings[bookingDate].slot}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Pickup Time:</span>
                        <strong className="text-[#111827]">{sub.bookings[bookingDate].time}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b7280]">Meal Preference:</span>
                        <strong className="text-[#111827]">{sub.bookings[bookingDate].mealOption}</strong>
                      </div>
                    </div>

                    {sub.bookings[bookingDate].status === "reserved" && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(bookingDate)}
                        className="w-full py-2.5 rounded-xl border border-[#fca5a5] text-[#dc2626] font-bold text-xs hover:bg-[#fef2f2] transition-colors"
                      >
                        Cancel Booking (Restore 1 Credit)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Slot Booking Form */
                <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-2">
                    <div>
                      <h2 className="text-base font-black text-[#111827]">Book Meal Slot</h2>
                      <span className="text-xs text-[#6b7280]">Date: {bookingDate}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingDate(null)}
                      className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Slot choice */}
                  <div>
                    <label className="block font-bold text-[#374151] mb-1.5">
                      Select Meal Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Lunch (12:00–3:00 PM)", "Dinner (7:00–10:00 PM)"].map((s) => {
                        const slotKey = s.split(" ")[0];
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSlot(slotKey)}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                              selectedSlot === slotKey
                                ? "bg-[#fff7ed] border-[#ff6b00] text-[#ff6b00]"
                                : "bg-white border-[#d1d5db] text-[#4b5563]"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pickup Time Window */}
                  <div>
                    <label className="block font-bold text-[#374151] mb-1.5">
                      Desired Pickup Window
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["12:30 PM", "12:45 PM", "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM"].map(
                        (t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`py-2 rounded-xl border font-mono font-bold text-center transition-all ${
                              selectedTime === t
                                ? "bg-[#ff6b00] border-[#ff6b00] text-white shadow-sm"
                                : "bg-white border-[#d1d5db] text-[#374151]"
                            }`}
                          >
                            {t}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Meal Item Choice */}
                  <div>
                    <label className="block font-bold text-[#374151] mb-1.5">
                      Chef Special Meal Choice
                    </label>
                    <div className="space-y-1.5">
                      {[
                        "Executive Andhra Thali + Sweet",
                        "Royal South Indian Delicacy Meal",
                        "Veg Dum Biryani Bowl with Raita",
                      ].map((meal) => (
                        <button
                          key={meal}
                          type="button"
                          onClick={() => setSelectedMealOption(meal)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between font-medium transition-all ${
                            selectedMealOption === meal
                              ? "bg-[#fff7ed] border-[#ff6b00] text-[#ff6b00] font-bold"
                              : "bg-white border-[#d1d5db] text-[#374151]"
                          }`}
                        >
                          <span>{meal}</span>
                          {selectedMealOption === meal && <Check className="h-4 w-4 text-[#ff6b00]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credit note */}
                  <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-[11px] text-[#166534]">
                    <strong>1 Meal Credit will be reserved</strong> from your {sub.planTitle}. You can cancel up to 2 hours before pickup to restore credit.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Confirm & Reserve Credit <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL 3: QR & OTP COUNTER PICKUP TOKEN */}
        {showQrModal && todayBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#16a34a] border border-[#bbf7d0] inline-block mb-3">
                Ready for Pickup at Bay 02
              </span>

              <div className="mx-auto my-3 grid h-44 w-44 place-items-center rounded-2xl border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] p-3">
                <div className="space-y-1">
                  <QrCode className="h-28 w-28 text-[#111827] mx-auto" />
                  <span className="text-[10px] font-mono text-[#6b7280]">Scan at Counter Scanner</span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs font-bold text-[#6b7280] block">4-Digit Pickup OTP</span>
                <strong className="text-4xl font-mono font-black text-[#ff6b00] tracking-wider block my-1">
                  {todayBooking.otp}
                </strong>
                <p className="text-xs text-[#4b5563] mt-2">
                  Little Fern Kitchen · Counter 2 Express Lane
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="mt-6 w-full py-3 rounded-xl bg-[#111827] text-white font-bold text-xs"
              >
                Close Token
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MealPasses;
