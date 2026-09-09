import { useEffect, useState } from "react";
import {
  AlertCircle,
  Armchair,
  ArrowRight,
  Building,
  Calendar,
  Clock,
  Coffee,
  Flame,
  Heart,
  Hotel,
  MapPin,
  Package,
  Pause,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Ticket,
  Timer,
  Utensils,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, getVendorFeatures, type Vendor, type VendorBusinessType } from "@/lib/takeontime-store";

const campuses = [
  "Koramangala 4th Block, Bengaluru",
  "Embassy TechVillage Food Court",
  "Ecospace Business Park Canteen",
  "Manyata Tech Park North Gate",
];

const quickCuisines = [
  { id: "all", label: "All Counters", icon: Utensils },
  { id: "veg", label: "Pure Veg", icon: Sparkles },
  { id: "dosa", label: "Dosas & Idlis", icon: Flame },
  { id: "thali", label: "Lunch Thalis", icon: Store },
  { id: "chai", label: "Chai & Snacks", icon: Coffee },
];

export function Discovery({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [vendors, setVendors] = useState<Vendor[]>(takeOnTimeStore.getVendors());
  const [cart, setCart] = useState(takeOnTimeStore.getCart());
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<"all" | "mess" | "hotel">("all");
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setVendors(takeOnTimeStore.getVendors());
      setCart(takeOnTimeStore.getCart());
    });
    return unsub;
  }, []);

  const approvedVendors = vendors.filter((v) => v.isApproved);

  const filteredVendors = approvedVendors.filter((v) => {
    // Business Type Filter
    if (businessTypeFilter === "mess" && v.businessType !== "mess" && v.businessType !== "all") {
      return false;
    }
    if (businessTypeFilter === "hotel" && v.businessType !== "hotel" && v.businessType !== "all") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCuisine = v.cuisine.toLowerCase().includes(q);
      const matchTagline = v.tagline.toLowerCase().includes(q);
      if (!matchName && !matchCuisine && !matchTagline) return false;
    }
    if (activeCuisine === "veg" && !v.cuisine.toLowerCase().includes("south indian") && !v.name.toLowerCase().includes("fern")) {
      return false;
    }
    if (activeCuisine === "chai" && !v.cuisine.toLowerCase().includes("chai")) {
      return false;
    }
    if (activeCuisine === "thali" && !v.cuisine.toLowerCase().includes("thali") && !v.cuisine.toLowerCase().includes("meals")) {
      return false;
    }
    return true;
  });

  const cartTotalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.items.reduce((sum, item) => sum + item.priceNum, 0);

  const selectVendorForMenu = (vendorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    takeOnTimeStore.setCurrentVendorId(vendorId);
    if (onNavigate) {
      onNavigate("customer-flow/VendorMenu");
    }
  };

  const selectVendorForSeat = (vendorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    takeOnTimeStore.setCurrentVendorId(vendorId);
    if (onNavigate) {
      onNavigate("customer-flow/SeatReservation");
    }
  };

  const selectVendorForPass = (vendorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    takeOnTimeStore.setCurrentVendorId(vendorId);
    if (onNavigate) {
      onNavigate("customer-flow/MealPasses");
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f4ede4] px-0 text-[#252822] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#faf6ef] shadow-[0_20px_80px_rgba(40,30,20,0.12)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        
        {/* Top App Header */}
        <header className="bg-[#242b26] px-5 pt-4 pb-4 text-[#fff8ee]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#ed6c2d] shadow-sm">
                <span className="font-serif text-sm font-black text-white">to</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5a67f]">TakeOnTime</span>
                <p className="text-xs font-black text-white">Order Ahead · Skip The Line</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("customer-flow/CustomerOrders")}
                className="flex items-center gap-1 rounded-full bg-[#353f38] px-2.5 py-1 text-[11px] font-bold text-[#e1ece3] hover:bg-[#434f47]"
              >
                <Receipt className="h-3.5 w-3.5 text-[#ff9858]" />
                <span>Orders</span>
              </button>
            </div>
          </div>

          {/* Campus Location Bar */}
          <div className="mt-3.5 flex items-center gap-2 rounded-2xl bg-[#323c34] px-3 py-2 text-xs">
            <MapPin className="h-4 w-4 shrink-0 text-[#f28b4b]" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#f5ebd9] outline-none cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c} value={c} className="bg-[#242b26] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#ffffff] px-3.5 py-2.5 text-xs text-[#242b26] shadow-sm">
            <Search className="h-4 w-4 text-[#9c897a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dosa, thali, chai, bowls..."
              className="w-full bg-transparent text-xs font-semibold text-[#242b26] placeholder-[#9c897a] outline-none"
            />
          </div>
        </header>

        {/* Value Banner */}
        <section className="px-4 pt-3.5 space-y-2">
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#ed6c2d] to-[#dd5616] p-3 text-white shadow-sm">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#ffe5d3]">
                <Zap className="h-3 w-3 fill-current" />
                <span>Prepaid Pickup Guarantee</span>
              </div>
              <h2 className="mt-0.5 text-xs font-bold leading-tight">
                Order before you walk down. Pick up in 10 mins.
              </h2>
            </div>
            <span className="rounded-xl bg-black/20 px-2.5 py-1 text-[10px] font-mono font-bold">
              0 Wait
            </span>
          </div>

          {/* Quick Action Feature Banners: Meal Pass & Seat Reservation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Table & Seat Reservations Link */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("customer-flow/SeatReservation")}
              className="w-full text-left rounded-2xl bg-[#fff] border border-[#e5dcd1] p-3 shadow-xs hover:border-[#ed6c2d] transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ecfdf5] text-[#15803d] shrink-0 border border-[#bbf7d0]">
                  <Armchair className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#242b26]">
                      Reserve Tables &amp; Seats
                    </span>
                    <span className="rounded-full bg-[#fef3c7] px-1.5 py-0.2 text-[9px] font-bold text-[#92400e]">
                      Live Rush
                    </span>
                  </div>
                  <p className="text-[11px] text-[#716155]">
                    Book mess/canteen seats ahead of rush.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#9c897a] group-hover:text-[#ed6c2d] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Meal Pass Quick Link */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("customer-flow/MealPasses")}
              className="w-full text-left rounded-2xl bg-[#fff] border border-[#e5dcd1] p-3 shadow-xs hover:border-[#ed6c2d] transition-all flex items-center justify-between gap-2.5 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff7ed] text-[#ed6c2d] shrink-0 border border-[#fed7aa]">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#242b26]">
                      Weekly &amp; Monthly Passes
                    </span>
                    <span className="rounded-full bg-[#ecfdf5] px-1.5 py-0.2 text-[9px] font-bold text-[#16a34a]">
                      Save 35%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#716155]">
                    Prepaid daily thalis. Zero checkout.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#9c897a] group-hover:text-[#ed6c2d] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </section>

        {/* Business Type Facility Filter Tabs */}
        <section className="px-4 pt-3 pb-1">
          <div className="flex gap-1.5 p-1 bg-[#ede4d8] rounded-2xl border border-[#ded2c3]">
            <button
              type="button"
              onClick={() => setBusinessTypeFilter("all")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                businessTypeFilter === "all"
                  ? "bg-white text-[#242b26] shadow-xs"
                  : "text-[#716155] hover:text-[#242b26]"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setBusinessTypeFilter("mess")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                businessTypeFilter === "mess"
                  ? "bg-[#16a34a] text-white shadow-xs"
                  : "text-[#716155] hover:text-[#16a34a]"
              }`}
            >
              <span>🍱</span>
              <span>Mess</span>
            </button>
            <button
              type="button"
              onClick={() => setBusinessTypeFilter("hotel")}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                businessTypeFilter === "hotel"
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-[#716155] hover:text-[#7c3aed]"
              }`}
            >
              <span>🏨</span>
              <span>Hotel</span>
            </button>
          </div>
        </section>

        {/* Cuisines Pill Bar */}
        <section className="px-4 pt-2 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickCuisines.map((c) => {
              const Icon = c.icon;
              const isSelected = activeCuisine === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCuisine(c.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#242b26] text-[#fff8ee] shadow-sm"
                      : "border border-[#e4d6c7] bg-[#fffbf5] text-[#716155] hover:bg-[#faeee1]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-[#e4661d]" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Vendor Cards List */}
        <section className="flex-1 px-4 pt-3 pb-24 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#8b7565]">
              Live Campus Counters ({filteredVendors.length})
            </h3>
            <button
              type="button"
              onClick={() => setVegOnly(!vegOnly)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
                vegOnly ? "bg-[#2d7a46] text-white border-[#2d7a46]" : "border-[#ddcfbf] text-[#716155] bg-[#fffaf4]"
              }`}
            >
              🌱 Veg Only
            </button>
          </div>

          {filteredVendors.map((vendor) => {
            const isLive = vendor.isOpen && !vendor.onBreak;
            const isOnBreak = vendor.onBreak;
            const features = getVendorFeatures(vendor.businessType);

            return (
              <article
                key={vendor.id}
                onClick={(e) => selectVendorForMenu(vendor.id, e)}
                className={`group cursor-pointer rounded-2xl border bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isLive ? "border-[#ecdccf]" : "border-[#e0d6cb] opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff0e2] font-black text-[#d65e1d] text-base border border-[#f7d6bf]">
                      {vendor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-extrabold text-[#29221d] group-hover:text-[#ed6c2d] transition-colors">
                          {vendor.name}
                        </h4>
                        {/* Business Type Badge */}
                        {vendor.businessType === "hotel" && (
                          <span className="rounded-full bg-[#f3e8ff] px-2 py-0.2 text-[9px] font-black text-[#7e22ce] border border-[#d8b4fe]">
                            🏨 Hotel Dining
                          </span>
                        )}
                        {vendor.businessType === "mess" && (
                          <span className="rounded-full bg-[#ecfdf5] px-2 py-0.2 text-[9px] font-black text-[#15803d] border border-[#a7f3d0]">
                            🍱 Mess Counter
                          </span>
                        )}
                        {vendor.businessType === "all" && (
                          <span className="rounded-full bg-[#fff7ed] px-2 py-0.2 text-[9px] font-black text-[#c2410c] border border-[#fed7aa]">
                            ⭐ All Facilities
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[#7d695b] line-clamp-1">
                        {vendor.cuisine}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {isOnBreak ? (
                    <span className="flex items-center gap-1 rounded-full bg-[#fde9e7] px-2 py-0.5 text-[10px] font-extrabold text-[#c93f30]">
                      <Pause className="h-3 w-3" /> On Break
                    </span>
                  ) : vendor.isOpen ? (
                    <span className="flex items-center gap-1 rounded-full bg-[#e8f4ec] px-2 py-0.5 text-[10px] font-extrabold text-[#2d7a46]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2d7a46] animate-pulse" />
                      Open
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#f1ebe4] px-2 py-0.5 text-[10px] font-bold text-[#867568]">
                      Closed
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#6e5d51] leading-relaxed line-clamp-1">
                  {vendor.tagline}
                </p>

                {/* Conditional Feature Capability Chips */}
                <div className="mt-2.5 rounded-xl bg-[#faf6f0] p-2.5 border border-[#ede3d5] text-[11px]">
                  <div className="flex items-center justify-between text-[#857263] mb-1.5 font-bold text-[10px] uppercase tracking-wider">
                    <span>Available Capabilities</span>
                    <span className="text-[#a8978a]">
                      {vendor.businessType === "hotel"
                        ? "Table Reservations & Meals"
                        : vendor.businessType === "mess"
                        ? "Passes, Tiffin & Mess Seats"
                        : "Full Facility Suite"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Hotel specific features */}
                    {vendor.businessType === "hotel" && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d28d9] border border-[#ddd6fe]">
                          <Armchair className="h-3 w-3" /> Table Reservations
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#faf5ff] px-2 py-0.5 text-[10px] font-bold text-[#7e22ce] border border-[#e9d5ff]">
                          <Utensils className="h-3 w-3" /> Available Meals &amp; Specials
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
                          No Pass Needed
                        </span>
                      </>
                    )}

                    {/* Mess specific features */}
                    {vendor.businessType === "mess" && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#166534] border border-[#bbf7d0]">
                          <Armchair className="h-3 w-3" /> Seat Reservations (Pass &amp; Regular)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#eff6ff] px-2 py-0.5 text-[10px] font-bold text-[#1e40af] border border-[#bfdbfe]">
                          <Ticket className="h-3 w-3" /> Weekly / Monthly Pass
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-bold text-[#9a3412] border border-[#fed7aa]">
                          <Package className="h-3 w-3" /> Tiffin Pickup (Pass or Regular)
                        </span>
                      </>
                    )}

                    {/* All features */}
                    {vendor.businessType === "all" && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#166534] border border-[#bbf7d0]">
                          <Armchair className="h-3 w-3" /> Table &amp; Mess Seats
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#eff6ff] px-2 py-0.5 text-[10px] font-bold text-[#1e40af] border border-[#bfdbfe]">
                          <Ticket className="h-3 w-3" /> Meal Passes
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-0.5 text-[10px] font-bold text-[#9a3412] border border-[#fed7aa]">
                          <Package className="h-3 w-3" /> Tiffin Dabba Pickup
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-bold text-[#6d28d9] border border-[#ddd6fe]">
                          <Utensils className="h-3 w-3" /> Dine-in Meals
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons matching Features */}
                <div className="mt-3 flex items-center justify-between border-t border-[#f3e7da] pt-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-extrabold text-[#29221d]">
                      <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" />
                      {vendor.rating}
                      <span className="text-[10px] font-normal text-[#938072]">
                        ({vendor.reviewsCount})
                      </span>
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-[#6e5d51]">
                      <Timer className="h-3.5 w-3.5 text-[#ed6c2d]" />
                      {vendor.prepTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If Hotel: Book Table CTA */}
                    {vendor.businessType === "hotel" && (
                      <button
                        type="button"
                        onClick={(e) => selectVendorForSeat(vendor.id, e)}
                        className="rounded-lg bg-[#7c3aed] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#6d28d9] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Armchair className="h-3 w-3" />
                        <span>Book Table</span>
                      </button>
                    )}

                    {/* If Mess: Seat/Tiffin Reservation & Passes CTAs */}
                    {vendor.businessType === "mess" && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => selectVendorForSeat(vendor.id, e)}
                          className="rounded-lg bg-[#16a34a] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#15803d] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Armchair className="h-3 w-3" />
                          <span>Seat / Tiffin</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => selectVendorForPass(vendor.id, e)}
                          className="rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-2 py-1 text-[10px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Ticket className="h-3 w-3" />
                          <span>Pass</span>
                        </button>
                      </>
                    )}

                    {/* If All: Table + Passes CTAs */}
                    {vendor.businessType === "all" && (
                      <button
                        type="button"
                        onClick={(e) => selectVendorForSeat(vendor.id, e)}
                        className="rounded-lg bg-[#16a34a] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#15803d] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Armchair className="h-3 w-3" />
                        <span>Tables &amp; Seats</span>
                      </button>
                    )}

                    {/* View Menu Button */}
                    <button
                      type="button"
                      onClick={(e) => selectVendorForMenu(vendor.id, e)}
                      className="flex items-center gap-1 rounded-lg bg-[#ed6c2d] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#d65b20] transition-colors cursor-pointer shadow-xs"
                    >
                      <span>
                        {vendor.businessType === "hotel"
                          ? "Meals"
                          : vendor.businessType === "mess"
                          ? "Thalis"
                          : "Menu"}
                      </span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredVendors.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#ddcfbf] bg-white p-8 text-center">
              <Store className="mx-auto h-8 w-8 text-[#988171] mb-2" />
              <h4 className="text-sm font-bold text-[#2d2420]">No Counters Found</h4>
              <p className="mt-0.5 text-xs text-[#8e7e72]">
                Try adjusting your facility filter, search query or campus location.
              </p>
            </div>
          )}
        </section>

        {/* Sticky Cart Bar (If items exist) */}
        {cartTotalItems > 0 && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] z-40">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("customer-flow/Checkout")}
              className="flex w-full items-center justify-between rounded-2xl bg-[#ed6c2d] px-4 py-3 text-white shadow-xl hover:bg-[#db5e20] active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-black/20 text-xs font-extrabold">
                  {cartTotalItems}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Order in progress</p>
                  <p className="text-[10px] text-white/80">{cart.vendorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black">₹{cartTotalPrice}</span>
                <span className="flex items-center gap-1 rounded-xl bg-white/20 px-2.5 py-1 text-xs font-extrabold">
                  <span>Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Discovery;
