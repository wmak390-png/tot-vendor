import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgePercent,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  takeOnTimeStore,
  type MealPlan,
  type UserSubscription,
} from "@/lib/takeontime-store";

export function VendorMealPlans({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [plans, setPlans] = useState<MealPlan[]>(takeOnTimeStore.getMealPlans("vendor_little_fern"));
  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");
  const [typeFilter, setTypeFilter] = useState<"all" | "weekly" | "monthly" | "flexi">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Plan Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [planType, setPlanType] = useState<"weekly" | "monthly" | "flexi">("weekly");
  const [totalMeals, setTotalMeals] = useState(5);
  const [validityDays, setValidityDays] = useState(7);
  const [dailyLimit, setDailyLimit] = useState(1);
  const [basePrice, setBasePrice] = useState(550);
  const [menuDescription, setMenuDescription] = useState("");
  const [tier, setTier] = useState<"Standard" | "Executive" | "Student" | "Budget">("Standard");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([
    "Lunch (12:00 PM – 3:00 PM)",
  ]);

  // Search in subscribers
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setPlans(takeOnTimeStore.getMealPlans("vendor_little_fern"));
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleActive = (planId: string, currentStatus: boolean) => {
    takeOnTimeStore.toggleMealPlanStatus(planId);
    notify(
      currentStatus
        ? "Plan paused. Existing subscribers can still redeem meals; new purchases are paused."
        : "Plan activated and published to customer app!"
    );
  };

  // Pricing calculations
  const gst = Math.round(basePrice * 0.05);
  const platformFee = planType === "weekly" ? 20 : 40;
  const customerTotal = basePrice + gst + platformFee;
  const vendorCommission = Math.round(basePrice * 0.08);
  const vendorNetPayout = basePrice - vendorCommission;
  const pricePerMeal = Math.round(basePrice / (totalMeals || 1));

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !menuDescription.trim()) {
      notify("Please fill in plan title and menu description");
      return;
    }

    takeOnTimeStore.createMealPlan({
      vendorId: "vendor_little_fern",
      vendorName: "Little Fern Kitchen",
      title: title.trim(),
      tagline: tagline.trim() || `${totalMeals} meals valid for ${validityDays} days`,
      type: planType,
      totalMeals: Number(totalMeals),
      validityDays: Number(validityDays),
      dailyLimit: Number(dailyLimit),
      mealSlots: selectedSlots,
      menuDescription: menuDescription.trim(),
      basePrice: Number(basePrice),
      gst,
      platformFee,
      totalPrice: customerTotal,
      savingsPercent: Math.min(40, Math.max(15, Math.round((1 - pricePerMeal / 140) * 100))),
      isActive: true,
      tier,
    });

    notify(`Created & published "${title}" successfully!`);
    setShowCreateModal(false);
    // Reset defaults
    setTitle("");
    setTagline("");
    setMenuDescription("");
  };

  const filteredPlans = plans.filter((p) => {
    if (typeFilter === "all") return true;
    return p.type === typeFilter;
  });

  // Calculate high-level stats
  const totalSubscribers = plans.reduce((acc, p) => acc + p.subscribersCount, 0);
  const activePlansCount = plans.filter((p) => p.isActive).length;
  const estimatedGrossTurnover = plans.reduce((acc, p) => acc + p.subscribersCount * p.basePrice, 0);

  // Mock subscriber roster data
  const subscribersList = [
    {
      id: "sub_01",
      customerName: "Rahul Sharma",
      email: "rahul.s@cisco.com",
      phone: "+91 98450 12345",
      planTitle: "Monthly Executive 22-Day Meal Pass",
      type: "Monthly",
      mealsRemaining: 17,
      totalMeals: 22,
      expiryDate: "30 Sep 2026",
      status: "Active",
      todayBooked: "Lunch 12:45 PM (OTP 4921)",
    },
    {
      id: "sub_02",
      customerName: "Priya Sundaram",
      email: "priya.s@intel.com",
      phone: "+91 98451 99012",
      planTitle: "5-Day Weekly Corporate Lunch Pass",
      type: "Weekly",
      mealsRemaining: 2,
      totalMeals: 5,
      expiryDate: "12 Sep 2026",
      status: "Active",
      todayBooked: "No booking today",
    },
    {
      id: "sub_03",
      customerName: "Arjun Mehta",
      email: "arjun.m@wipro.com",
      phone: "+91 99002 44102",
      planTitle: "Monthly Executive 22-Day Meal Pass",
      type: "Monthly",
      mealsRemaining: 19,
      totalMeals: 22,
      expiryDate: "28 Sep 2026",
      status: "Active",
      todayBooked: "Lunch 1:15 PM (OTP 8102)",
    },
    {
      id: "sub_04",
      customerName: "Sneha Patil",
      email: "sneha.p@infosys.com",
      phone: "+91 98860 11928",
      planTitle: "10-Meal Campus Flexi Saver",
      type: "Flexi",
      mealsRemaining: 6,
      totalMeals: 10,
      expiryDate: "22 Sep 2026",
      status: "Active",
      todayBooked: "No booking today",
    },
    {
      id: "sub_05",
      customerName: "Devendra Verma",
      email: "dev.v@target.com",
      phone: "+91 97410 33819",
      planTitle: "5-Day Weekly Corporate Lunch Pass",
      type: "Weekly",
      mealsRemaining: 0,
      totalMeals: 5,
      expiryDate: "05 Sep 2026",
      status: "Exhausted",
      todayBooked: "Completed",
    },
  ];

  const filteredSubscribers = subscribersList.filter(
    (s) =>
      s.customerName.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.planTitle.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f9fa] px-3 py-4 text-[#1f2937] font-sans sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1f2937] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 border border-[#374151]">
            <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e7eb] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#ff6b00] to-[#ea580c] text-white shadow-md shadow-orange-500/20">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#111827] tracking-tight">
                  Meal Plans & Subscription Passes
                </h1>
                <span className="rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-xs font-bold text-[#ea580c] border border-[#fed7aa]">
                  Prepaid Bulk Sales
                </span>
              </div>
              <p className="text-xs text-[#6b7280]">
                Offer weekly & monthly recurring cafeteria meal passes with upfront revenue collection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Meal Pass
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("vendor-flow/Orders")}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] transition-all"
              >
                KOT Queue &rarr;
              </button>
            )}
          </div>
        </header>

        {/* Business Metrics Grid */}
        <section aria-label="Meal Plan KPI Metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6b7280] mb-1">
              <span className="font-semibold">Active Subscribers</span>
              <Users className="h-4 w-4 text-[#ff6b00]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">{totalSubscribers}</div>
            <span className="text-[10px] font-bold text-[#16a34a] flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +14 new this week
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6b7280] mb-1">
              <span className="font-semibold">Published Passes</span>
              <Layers className="h-4 w-4 text-[#2563eb]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">{activePlansCount}</div>
            <span className="text-[10px] text-[#6b7280] mt-1 block">
              {plans.length - activePlansCount} paused drafts
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6b7280] mb-1">
              <span className="font-semibold">Upfront Pass GMV</span>
              <Coins className="h-4 w-4 text-[#16a34a]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">
              ₹{(estimatedGrossTurnover / 1000).toFixed(1)}k
            </div>
            <span className="text-[10px] font-bold text-[#16a34a] mt-1 block">
              100% Guaranteed Prepaid
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6b7280] mb-1">
              <span className="font-semibold">Today&apos;s Pass Redemptions</span>
              <Utensils className="h-4 w-4 text-[#ea580c]" />
            </div>
            <div className="text-2xl font-black text-[#111827]">28 Meals</div>
            <span className="text-[10px] text-[#6b7280] mt-1 block">
              Auto-KOT in progress
            </span>
          </div>
        </section>

        {/* View Switcher: Plans vs Subscribers */}
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "plans"
                  ? "bg-[#111827] text-white shadow-sm"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Meal Plans Catalog ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "subscribers"
                  ? "bg-[#111827] text-white shadow-sm"
                  : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              Active Subscribers Roster ({subscribersList.length})
            </button>
          </div>

          {activeTab === "plans" && (
            <div className="hidden sm:flex items-center gap-1.5">
              {(["all", "weekly", "monthly", "flexi"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTypeFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    typeFilter === filter
                      ? "bg-[#ff6b00] text-white"
                      : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Meal Plans Catalog */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all flex flex-col justify-between ${
                  plan.isActive ? "border-[#e5e7eb]" : "border-[#fed7aa] bg-[#fffaf5]"
                }`}
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
                      <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold text-[#4b5563]">
                        {plan.tier} Tier
                      </span>
                    </div>

                    {/* Active / Paused Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(plan.id, plan.isActive)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        plan.isActive
                          ? "bg-[#ecfdf5] text-[#16a34a] hover:bg-[#d1fae5]"
                          : "bg-[#fff7ed] text-[#ea580c] hover:bg-[#ffedd5]"
                      }`}
                      title={plan.isActive ? "Pause new purchases" : "Activate plan"}
                    >
                      {plan.isActive ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
                      {plan.isActive ? "Active / Visible" : "Paused"}
                    </button>
                  </div>

                  <h3 className="text-base font-black text-[#111827]">{plan.title}</h3>
                  <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{plan.tagline}</p>

                  {/* Plan specs */}
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f9fafb] p-3 text-center border border-[#f3f4f6]">
                    <div>
                      <span className="text-[10px] text-[#6b7280] block font-medium">Meal Count</span>
                      <strong className="text-xs font-black text-[#111827]">{plan.totalMeals} Meals</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6b7280] block font-medium">Validity</span>
                      <strong className="text-xs font-black text-[#111827]">{plan.validityDays} Days</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6b7280] block font-medium">Daily Limit</span>
                      <strong className="text-xs font-black text-[#111827]">{plan.dailyLimit} / day</strong>
                    </div>
                  </div>

                  {/* Menu Description */}
                  <div className="mt-3 text-xs text-[#4b5563] bg-[#fff] border border-[#f3f4f6] rounded-xl p-3">
                    <span className="font-bold text-[#111827] block text-[11px] mb-0.5">
                      Included Menu Items:
                    </span>
                    {plan.menuDescription}
                  </div>

                  {/* Allowed Slots */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {plan.mealSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-lg bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold text-[#4b5563]"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & Subscriber Footer */}
                <div className="mt-5 pt-4 border-t border-[#f3f4f6] flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-[#111827]">₹{plan.totalPrice}</span>
                      <span className="text-[11px] text-[#6b7280]">all-inclusive</span>
                    </div>
                    <span className="text-[10px] text-[#16a34a] font-bold">
                      ₹{Math.round(plan.basePrice / plan.totalMeals)}/meal (saves {plan.savingsPercent}%)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#111827] flex items-center gap-1 justify-end">
                      <Users className="h-3.5 w-3.5 text-[#ff6b00]" /> {plan.subscribersCount}
                    </span>
                    <span className="text-[10px] text-[#6b7280]">Active Subscribers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Subscribers Roster */}
        {activeTab === "subscribers" && (
          <div className="rounded-2xl bg-white border border-[#e5e7eb] p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-black text-[#111827]">Pass Holders Active on Your Counter</h2>
                <p className="text-xs text-[#6b7280]">
                  Real-time view of customers with prepaid credits redeemable at Counter 2
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search customer, pass, email..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#d1d5db] focus:border-[#ff6b00] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                    <th className="py-2.5 px-3 font-bold">Customer Name</th>
                    <th className="py-2.5 px-3 font-bold">Meal Pass</th>
                    <th className="py-2.5 px-3 font-bold">Credits Remaining</th>
                    <th className="py-2.5 px-3 font-bold">Expiry Date</th>
                    <th className="py-2.5 px-3 font-bold">Today&apos;s Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#f9fafb]">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#111827]">{sub.customerName}</div>
                        <div className="text-[10px] text-[#6b7280]">{sub.email}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#374151]">
                        {sub.planTitle}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-[#111827]">{sub.mealsRemaining}</span>
                        <span className="text-[#6b7280] text-[11px]"> / {sub.totalMeals} meals</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#4b5563]">
                        {sub.expiryDate}
                      </td>
                      <td className="py-3 px-3">
                        {sub.todayBooked.includes("OTP") ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[10px] font-bold text-[#16a34a] border border-[#bbf7d0]">
                            <CheckCircle2 className="h-3 w-3" /> {sub.todayBooked}
                          </span>
                        ) : sub.status === "Exhausted" ? (
                          <span className="text-[11px] text-[#9ca3af]">Pass Exhausted</span>
                        ) : (
                          <span className="text-[11px] text-[#6b7280]">No slot booked today</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create New Meal Plan */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff7ed] text-[#ff6b00]">
                    <Plus className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-[#111827]">Create New Meal Plan Pass</h2>
                    <p className="text-[11px] text-[#6b7280]">Configure weekly or monthly prepaid cafeteria passes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-[#9ca3af] hover:text-[#111827]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
                {/* Plan Type Selector */}
                <div>
                  <label className="block font-bold text-[#374151] mb-1.5">
                    Plan Duration Cadence
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "weekly", label: "Weekly Pass", desc: "5 or 7 Days" },
                      { id: "monthly", label: "Monthly Pass", desc: "20 to 30 Days" },
                      { id: "flexi", label: "Flexi Bundle", desc: "Custom Credits" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setPlanType(item.id as "weekly" | "monthly" | "flexi");
                          if (item.id === "weekly") {
                            setTotalMeals(5);
                            setValidityDays(7);
                            setBasePrice(550);
                          } else if (item.id === "monthly") {
                            setTotalMeals(22);
                            setValidityDays(30);
                            setBasePrice(2200);
                          } else {
                            setTotalMeals(10);
                            setValidityDays(21);
                            setBasePrice(950);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          planType === item.id
                            ? "bg-[#fff7ed] border-[#ff6b00] text-[#ff6b00] shadow-sm"
                            : "bg-white border-[#d1d5db] text-[#374151] hover:border-[#9ca3af]"
                        }`}
                      >
                        <strong className="block text-xs font-bold">{item.label}</strong>
                        <span className="text-[10px] text-[#6b7280]">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Title & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#374151] mb-1">
                      Plan Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5-Day Executive Lunch Pass"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-medium focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#374151] mb-1">
                      Tier Archetype
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as "Standard" | "Executive" | "Student" | "Budget")}
                      className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-medium focus:border-[#ff6b00] focus:outline-none"
                    >
                      <option value="Standard">Standard Tier</option>
                      <option value="Executive">Executive Gourmet</option>
                      <option value="Student">Student Saver</option>
                      <option value="Budget">Budget / Snacks</option>
                    </select>
                  </div>
                </div>

                {/* Quantities: Meals, Validity, Daily Limit */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#374151] mb-1">
                      Total Meals Included
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={totalMeals}
                      onChange={(e) => setTotalMeals(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-bold focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#374151] mb-1">
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-bold focus:border-[#ff6b00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#374151] mb-1">
                      Daily Max Limit
                    </label>
                    <select
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs font-bold focus:border-[#ff6b00] focus:outline-none"
                    >
                      <option value={1}>1 meal per day</option>
                      <option value={2}>2 meals per day (Lunch + Dinner)</option>
                    </select>
                  </div>
                </div>

                {/* Menu Description */}
                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Fixed Menu Inclusions
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Daily Executive South Indian Thali with 3 rotating curries, dal, warm rotis, fragrant rice & sweet."
                    value={menuDescription}
                    onChange={(e) => setMenuDescription(e.target.value)}
                    className="w-full rounded-xl border border-[#d1d5db] px-3 py-2 text-xs focus:border-[#ff6b00] focus:outline-none"
                  />
                </div>

                {/* Allowed Meal Windows */}
                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Applicable Meal Windows
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Lunch (12:00 PM – 3:00 PM)",
                      "Dinner (7:00 PM – 10:00 PM)",
                      "Breakfast (8:30 AM – 11:00 AM)",
                    ].map((slot) => {
                      const isSelected = selectedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (selectedSlots.length > 1) {
                                setSelectedSlots(selectedSlots.filter((s) => s !== slot));
                              }
                            } else {
                              setSelectedSlots([...selectedSlots, slot]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-[#ff6b00] border-[#ff6b00] text-white"
                              : "bg-white border-[#d1d5db] text-[#4b5563]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Base Price & Live Financial Simulator */}
                <div className="rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#111827]">
                      Vendor Base Price (Pre-Tax)
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#6b7280]">₹</span>
                      <input
                        type="number"
                        min={100}
                        step={50}
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        className="w-24 rounded-lg border border-[#d1d5db] px-2 py-1 text-right text-xs font-black text-[#111827] focus:outline-none focus:border-[#ff6b00]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#6b7280] pt-2 border-t border-[#e5e7eb]">
                    <div className="flex justify-between">
                      <span>Customer 5% Food GST:</span>
                      <span className="font-mono">+₹{gst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Convenience Fee:</span>
                      <span className="font-mono">+₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#111827] text-xs pt-1 border-t border-[#f3f4f6]">
                      <span>Customer Total Checkout Price:</span>
                      <span className="font-mono text-[#ff6b00]">₹{customerTotal}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#16a34a] pt-1">
                      <span>Vendor Net Payout (after 8% platform fee):</span>
                      <span className="font-mono">₹{vendorNetPayout}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-[#6b7280] hover:bg-[#f3f4f6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md cursor-pointer"
                  >
                    Publish Meal Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default VendorMealPlans;
