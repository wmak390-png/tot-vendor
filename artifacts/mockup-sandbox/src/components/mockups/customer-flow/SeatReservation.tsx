import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  GraduationCap,
  HeartPulse,
  Hotel,
  Info,
  MapPin,
  Maximize2,
  Navigation,
  Package,
  QrCode,
  Sparkles,
  Ticket,
  Timer,
  TrendingUp,
  User,
  Users,
  Utensils,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  takeOnTimeStore,
  getVendorFeatures,
  type Branch,
  type TableItem,
  type TableReservation,
  type TableZone,
  type Vendor,
  type VerticalType,
} from "@/lib/takeontime-store";

const VERTICAL_METADATA: Record<
  VerticalType,
  { label: string; icon: typeof Building; badgeColor: string; description: string }
> = {
  corporate: {
    label: "Tech Park / Corporate",
    icon: Building,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Office cafeteria bays & executive team seating",
  },
  institute: {
    label: "Colleges & Institutes",
    icon: GraduationCap,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Student mess, campus canteens & quiet study pods",
  },
  hospital: {
    label: "Hospitals & Healthcare",
    icon: HeartPulse,
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Dietary mess, attendant dining & doctor lounge",
  },
  industry: {
    label: "Industries & Factories",
    icon: Building,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "High-speed shift lunch halls & worker counters",
  },
  hotel: {
    label: "Hotels & Hospitality",
    icon: Hotel,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description: "All-day dining, garden terrace & buffet halls",
  },
};

const ZONES: { name: TableZone; icon: typeof Utensils; desc: string }[] = [
  { name: "AC Main Hall", icon: Utensils, desc: "Central climate-controlled cafeteria" },
  { name: "Quiet Study / Work Pods", icon: VolumeX, desc: "Noise-dampened with power outlets" },
  { name: "Express Counter Stools", icon: Zap, desc: "Quick 10-minute solo dining" },
  { name: "Outdoor Garden Terrace", icon: Coffee, desc: "Open-air seating & natural light" },
  { name: "Executive / Doctor Bay", icon: Sparkles, desc: "Reserved priority alcove" },
];

export function SeatReservation({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [currentVendor, setCurrentVendor] = useState<Vendor>(() => takeOnTimeStore.getCurrentVendor());
  const [branches, setBranches] = useState<Branch[]>(() => takeOnTimeStore.getBranches());
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => takeOnTimeStore.getActiveBranchId());
  const [verticalFilter, setVerticalFilter] = useState<"all" | VerticalType>("all");
  const [activeTab, setActiveTab] = useState<"book" | "my-pass">("book");

  // Selection state
  const [reservationType, setReservationType] = useState<"seat" | "tiffin">("seat");
  const [customerCategory, setCustomerCategory] = useState<"pass" | "regular">("regular");
  const [tiffinDabbaType, setTiffinDabbaType] = useState<"mess_dabba" | "bring_own">("mess_dabba");
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedZone, setSelectedZone] = useState<TableZone>("AC Main Hall");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("12:45 PM – 01:30 PM");
  const [selectedTableId, setSelectedTableId] = useState<string | null>("tab_02");
  const [withFoodOrder, setWithFoodOrder] = useState(true);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Store data
  const [tables, setTables] = useState<TableItem[]>(() => takeOnTimeStore.getTables(selectedBranchId));
  const [userReservation, setUserReservation] = useState<TableReservation | null>(() =>
    takeOnTimeStore.getUserActiveTableReservation()
  );

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setCurrentVendor(takeOnTimeStore.getCurrentVendor());
      setBranches(takeOnTimeStore.getBranches());
      setTables(takeOnTimeStore.getTables(selectedBranchId));
      setUserReservation(takeOnTimeStore.getUserActiveTableReservation());
    });
    return unsub;
  }, [selectedBranchId]);

  const vendorFeatures = useMemo(() => {
    return getVendorFeatures(currentVendor.businessType);
  }, [currentVendor.businessType]);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const filteredBranches =
    verticalFilter === "all"
      ? branches
      : branches.filter((b) => b.vertical === verticalFilter);

  const availableTablesInZone = tables.filter(
    (t) => t.zone === selectedZone && t.capacity >= partySize
  );

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    takeOnTimeStore.setActiveBranch(branchId);
    setTables(takeOnTimeStore.getTables(branchId));
    setSelectedTableId(null);
  };

  const handleConfirmBooking = () => {
    const tableToBook = tables.find((t) => t.id === selectedTableId) || availableTablesInZone[0];
    if (!tableToBook) {
      setToast("Please select an available table or adjust party size");
      return;
    }

    let linkedText = "";
    if (currentVendor.businessType === "hotel") {
      linkedText = withFoodOrder ? "Auto-linked with Hotel Chef Available Meals" : "Table Seating Only";
    } else if (currentVendor.businessType === "mess") {
      if (reservationType === "tiffin") {
        linkedText = `Tiffin Pickup (${customerCategory === "pass" ? "Meal Pass Holder" : "Single Regular"}) · ${
          tiffinDabbaType === "mess_dabba" ? "Insulated Mess Dabba" : "Personal Dabba"
        }`;
      } else {
        linkedText = `Mess Seat (${customerCategory === "pass" ? "Monthly Pass" : "Single Regular"}) ${
          withFoodOrder ? "· Hot Thali Pre-ordered" : ""
        }`;
      }
    } else {
      linkedText = withFoodOrder ? "Auto-linked with Meal Order / Pass" : undefined || "";
    }

    const newRes = takeOnTimeStore.createSeatReservation({
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      facilityName: currentBranch.campusOrFacility,
      vertical: currentBranch.vertical,
      tableId: tableToBook.id,
      tableNumber: reservationType === "tiffin" ? `Tiffin-Bay-${tableToBook.tableNumber.replace("T-", "")}` : tableToBook.tableNumber,
      zone: reservationType === "tiffin" ? "Express Counter Stools" : selectedZone,
      customerName: "Rahul Sharma",
      phone: "+91 98450 12345",
      partySize: reservationType === "tiffin" ? 1 : partySize,
      dateStr: "2026-09-07",
      timeSlot: selectedTimeSlot,
      rushLevelAtBooking: currentBranch.currentRush,
      linkedOrderOrPlan: linkedText || undefined,
      notes: notes || undefined,
    });

    setUserReservation(newRes);
    setActiveTab("my-pass");
    setToast(
      reservationType === "tiffin"
        ? `Tiffin pickup slot confirmed! Dabba OTP: ${newRes.otp}`
        : `Seat confirmed at Table ${tableToBook.tableNumber}! OTP: ${newRes.otp}`
    );
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancelBooking = (resId: string) => {
    if (confirm("Are you sure you want to cancel this table reservation?")) {
      takeOnTimeStore.cancelSeatReservation(resId);
      setUserReservation(null);
      setToast("Reservation cancelled and table released.");
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] pb-24 text-[#202722]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#1d2520] px-4 py-3 text-sm font-semibold text-[#fffdfa] shadow-xl border border-[#354339] animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5ded4] bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#e2d9cd] bg-[#faf6f0] text-[#554b42] hover:bg-[#ede3d5] transition-colors cursor-pointer"
              title="Back to Discovery"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1b251f]">
                  Table &amp; Seat Reservations
                </h1>
                <span className="rounded-full bg-[#ffedd5] px-2 py-0.5 text-[10px] font-black text-[#c2410c] uppercase tracking-wider">
                  Live Rush Smart Pass
                </span>
              </div>
              <p className="text-[11px] text-[#6d645a]">
                Reserve canteen &amp; mess seats based on live crowd, rush &amp; comfort
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#f0e9df] p-1 border border-[#dfd6c8]">
            <button
              type="button"
              onClick={() => setActiveTab("my-pass")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "my-pass"
                  ? "bg-white text-[#1d2520] shadow-xs"
                  : "text-[#6c6155] hover:text-[#1d2520]"
              }`}
            >
              <Armchair className="h-3.5 w-3.5" />
              <span>Active Seat Pass</span>
              {userReservation && (
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("book")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "book"
                  ? "bg-white text-[#1d2520] shadow-xs"
                  : "text-[#6c6155] hover:text-[#1d2520]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Book Table</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-4 space-y-5">
        {/* System Vertical Filters */}
        <section aria-label="System Categories" className="rounded-2xl bg-white p-3.5 border border-[#e4ded5] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#796e62] flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" /> Select Facility Type / Sector
            </span>
            <span className="text-[11px] text-[#938779]">
              Works for Colleges, Tech Parks, Hospitals, Factories, Hotels
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setVerticalFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                verticalFilter === "all"
                  ? "bg-[#1d2520] text-white border-[#1d2520] shadow-xs"
                  : "bg-[#f8f5ee] text-[#554b42] border-[#e2d8cb] hover:bg-[#ede5d8]"
              }`}
            >
              All Systems ({branches.length})
            </button>
            {(Object.keys(VERTICAL_METADATA) as VerticalType[]).map((vt) => {
              const meta = VERTICAL_METADATA[vt];
              const Icon = meta.icon;
              const isSelected = verticalFilter === vt;
              return (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setVerticalFilter(vt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#1d2520] text-white border-[#1d2520] shadow-xs"
                      : "bg-[#f8f5ee] text-[#554b42] border-[#e2d8cb] hover:bg-[#ede5d8]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Current Branch Selector Dropdown / Cards */}
          <div className="mt-3 pt-3 border-t border-[#f0e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#554b42]">Current Venue:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="rounded-xl border border-[#d8cdbf] bg-[#faf6ef] px-3 py-1.5 text-xs font-bold text-[#1f2822] focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
              >
                {filteredBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.campusOrFacility})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Rush Indicator */}
            <div className="flex items-center gap-2.5 bg-[#faf6ef] px-3 py-1.5 rounded-xl border border-[#e4d9cc]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    currentBranch.currentRush === "low"
                      ? "bg-emerald-500"
                      : currentBranch.currentRush === "moderate"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-rose-500 animate-ping"
                  }`}
                />
                <span className="text-xs font-extrabold text-[#1e2721] capitalize">
                  {currentBranch.currentRush} Rush
                </span>
                <span className="text-[11px] text-[#6d6459]">
                  ({currentBranch.occupancyPercent}% Occupied)
                </span>
              </div>
              <span className="text-[#c4b9aa]">|</span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#5c5145]">
                <Clock className="h-3 w-3 text-[#ed6c2d]" />
                <span>
                  {currentBranch.expectedWaitMins === 0
                    ? "Instant Seating (0m wait)"
                    : `~${currentBranch.expectedWaitMins}m wait`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TAB 1: ACTIVE SEAT PASS */}
        {activeTab === "my-pass" && (
          <div className="space-y-4">
            {userReservation ? (
              <div className="rounded-3xl bg-white border border-[#e4ded5] p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0e8dc] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#22c55e]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#15803d] border border-[#22c55e]/30">
                        CONFIRMED SEAT PASS
                      </span>
                      <span className="text-xs text-[#877c6e]">Booking ID: {userReservation.id}</span>
                    </div>
                    <h2 className="mt-1 text-xl font-black text-[#1b251f]">
                      {userReservation.branchName}
                    </h2>
                    <p className="text-xs text-[#6e6356] flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-[#ed6c2d]" />
                      {userReservation.facilityName} · {userReservation.zone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCancelBooking(userReservation.id)}
                    className="text-xs font-bold text-[#b91c1c] hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    Cancel Reservation
                  </button>
                </div>

                {/* Big Table & OTP Banner */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-gradient-to-br from-[#1d2520] to-[#2b3930] p-4 text-white flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#95ab9c]">
                        Allocated Table
                      </span>
                      <p className="mt-1 text-3xl font-black tracking-tight text-white">
                        {userReservation.tableNumber}
                      </p>
                      <p className="text-xs text-[#d1dfd5] mt-0.5">
                        {userReservation.partySize} Diner{userReservation.partySize > 1 ? "s" : ""} · {userReservation.zone}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#3d4f43] flex items-center gap-1.5 text-[11px] text-[#95ab9c]">
                      <Armchair className="h-3.5 w-3.5 text-[#4ade80]" />
                      <span>Table reserved for you</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#fff7ed] border border-[#fed7aa] p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c2410c]">
                        Arrival Time Slot
                      </span>
                      <p className="mt-1 text-xl font-black text-[#9a3412]">
                        {userReservation.timeSlot}
                      </p>
                      <p className="text-xs text-[#9a3412]/80 mt-0.5">
                        Today, Sept 07, 2026
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#ffedd5] flex items-center gap-1.5 text-[11px] font-bold text-[#c2410c]">
                      <Timer className="h-3.5 w-3.5" />
                      <span>Reserved 15 mins prior to slot</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#15803d]">
                        Check-in Table OTP
                      </span>
                      <p className="mt-1 font-mono text-3xl font-black tracking-widest text-[#166534]">
                        {userReservation.otp}
                      </p>
                      <p className="text-xs text-[#166534]/80 mt-0.5">
                        Show to floor waiter / tap table NFC
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#dcfce7] flex items-center justify-between text-[11px] font-bold text-[#15803d]">
                      <span>Table NFC Ready</span>
                      <QrCode className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Linked Food Status */}
                {userReservation.linkedOrderOrPlan && (
                  <div className="mt-4 rounded-2xl bg-[#fbf9f5] border border-[#e8dfd2] p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed6c2d]/10 text-[#ed6c2d]">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#222a24]">
                            Food Pre-Order Synchronized
                          </span>
                          <span className="rounded bg-[#22c55e]/20 px-1.5 py-0.2 text-[9px] font-black text-[#15803d]">
                            KITCHEN PREPPING
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6d6459]">
                          {userReservation.linkedOrderOrPlan} · Hot meal will be served directly at {userReservation.tableNumber}
                        </p>
                      </div>
                    </div>
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate("customer-flow/MealPasses")}
                        className="text-xs font-bold text-[#ed6c2d] hover:underline cursor-pointer"
                      >
                        View Pass &rarr;
                      </button>
                    )}
                  </div>
                )}

                {/* Directions to Table */}
                <div className="mt-4 rounded-2xl bg-[#faf7f2] border border-[#ece4d8] p-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#695e52] flex items-center gap-1.5 mb-2">
                    <Navigation className="h-3.5 w-3.5 text-[#ed6c2d]" /> Walking Directions inside Canteen
                  </h3>
                  <div className="text-xs text-[#52483d] space-y-1.5">
                    <p>1. Enter via <strong>North Gate / Main Cafeteria Glass Door</strong>.</p>
                    <p>2. Walk past Counter 2 Express Bay and take the right aisle into the <strong>{userReservation.zone}</strong>.</p>
                    <p>3. Table <strong>{userReservation.tableNumber}</strong> has a glowing green digital reservation beacon.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* No Active Pass State */
              <div className="rounded-3xl bg-white border border-[#e4ded5] p-8 text-center shadow-xs">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#faf5ed] text-[#867868] border border-[#e7ddd0]">
                  <Armchair className="h-8 w-8" />
                </div>
                <h3 className="mt-3 text-lg font-black text-[#1b251f]">No Active Seat Reservation</h3>
                <p className="mt-1 text-xs text-[#6e6356] max-w-sm mx-auto">
                  Planning to eat at the cafeteria or mess? Reserve your seat ahead to avoid lunch rush, long queues, and table hunting!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("book")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ed6c2d] px-5 py-2.5 text-xs font-black text-white hover:bg-[#de5f20] shadow-md transition-all cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Reserve Table for Today</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOK TABLE INTERACTION */}
        {activeTab === "book" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form & Zone Preferences */}
            <div className="lg:col-span-7 space-y-4">
              {/* Vendor Feature Condition Notice Banner */}
              <div
                className={`rounded-2xl p-4 border ${
                  currentVendor.businessType === "hotel"
                    ? "bg-[#faf5ff] border-[#e9d5ff] text-[#581c87]"
                    : currentVendor.businessType === "mess"
                    ? "bg-[#ecfdf5] border-[#bbf7d0] text-[#14532d]"
                    : "bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {currentVendor.businessType === "hotel"
                          ? "🏨"
                          : currentVendor.businessType === "mess"
                          ? "🍱"
                          : "⭐"}
                      </span>
                      <h2 className="text-sm font-black">
                        {currentVendor.name} ·{" "}
                        {currentVendor.businessType === "hotel"
                          ? "Hotel Table Reservations & Available Meals"
                          : currentVendor.businessType === "mess"
                          ? "Mess Seats & Tiffin Pickup System"
                          : "Full Facility Hub (Hotel + Mess)"}
                      </h2>
                    </div>
                    <p className="text-xs mt-1 opacity-90 leading-relaxed">
                      {currentVendor.businessType === "hotel" &&
                        "Active features: Reserved dining tables, private family/team booths, and available chef special meals. (Passes & tiffin pickup disabled for hotel vendor)."}
                      {currentVendor.businessType === "mess" &&
                        "Active features: Table/seat reservations (for passes, or single regular), weekly/monthly pass redemption, and tiffin pickup (for passes, or single regular)."}
                      {currentVendor.businessType === "all" &&
                        "Active features: All options available (Hotel tables, mess seating, meal passes, and insulated tiffin pickup)."}
                    </p>
                  </div>
                </div>

                {/* Conditional Mess Controls (For Mess & All) */}
                {(currentVendor.businessType === "mess" || currentVendor.businessType === "all") && (
                  <div className="mt-3 pt-3 border-t border-black/10 space-y-2.5">
                    {/* Option 1: Reservation Mode (Seat vs Tiffin) */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block mb-1">
                        Service Type
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setReservationType("seat")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            reservationType === "seat"
                              ? "bg-white text-[#15803d] border-[#16a34a] shadow-xs"
                              : "bg-black/5 text-[#4b5563] border-transparent hover:bg-black/10"
                          }`}
                        >
                          <Armchair className="h-3.5 w-3.5" />
                          <span>Dine-in Mess Seat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReservationType("tiffin")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            reservationType === "tiffin"
                              ? "bg-white text-[#ea580c] border-[#ea580c] shadow-xs"
                              : "bg-black/5 text-[#4b5563] border-transparent hover:bg-black/10"
                          }`}
                        >
                          <Package className="h-3.5 w-3.5" />
                          <span>Tiffin Dabba Pickup</span>
                        </button>
                      </div>
                    </div>

                    {/* Option 2: Customer Category (Pass vs Regular) */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block mb-1">
                        Diner Status (For Passes or Single Regular)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerCategory("pass")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            customerCategory === "pass"
                              ? "bg-white text-[#1d4ed8] border-[#2563eb] shadow-xs"
                              : "bg-black/5 text-[#4b5563] border-transparent hover:bg-black/10"
                          }`}
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          <span>Meal Pass Holder</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerCategory("regular")}
                          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            customerCategory === "regular"
                              ? "bg-white text-[#1f2937] border-[#374151] shadow-xs"
                              : "bg-black/5 text-[#4b5563] border-transparent hover:bg-black/10"
                          }`}
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>Single Regular Diner</span>
                        </button>
                      </div>
                    </div>

                    {/* If Tiffin Mode is active, show container choice */}
                    {reservationType === "tiffin" && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-[#fed7aa] space-y-1.5 text-xs">
                        <span className="font-bold text-[#9a3412] flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" /> Tiffin Dabba Packaging:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="tiffin_choice"
                              checked={tiffinDabbaType === "mess_dabba"}
                              onChange={() => setTiffinDabbaType("mess_dabba")}
                              className="accent-[#ea580c]"
                            />
                            <span>Mess Insulated Dabba (Return next day)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="tiffin_choice"
                              checked={tiffinDabbaType === "bring_own"}
                              onChange={() => setTiffinDabbaType("bring_own")}
                              className="accent-[#ea580c]"
                            />
                            <span>Bring Personal Stainless Steel Dabba</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 1: Party Size */}
              <div className="rounded-2xl bg-white p-4 border border-[#e4ded5] shadow-xs">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d6356] flex items-center justify-between mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#ed6c2d]" /> 1. How many diners?
                  </span>
                  <span className="text-[11px] font-bold text-[#ed6c2d]">
                    {partySize} Person{partySize > 1 ? "s" : ""}
                  </span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { count: 1, label: "Solo Pod", icon: User },
                    { count: 2, label: "2 Diners", icon: Users },
                    { count: 4, label: "4-Booth", icon: Users },
                    { count: 6, label: "Team (6+)", icon: Users },
                  ].map((p) => {
                    const isSelected = partySize === p.count;
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.count}
                        type="button"
                        onClick={() => setPartySize(p.count)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1d2520] text-white border-[#1d2520] shadow-sm"
                            : "bg-[#faf6ef] text-[#4d443a] border-[#ded5c7] hover:bg-[#ede3d5]"
                        }`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1 opacity-80" />
                        <div className="text-xs font-black">{p.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Dining Zone Selection */}
              <div className="rounded-2xl bg-white p-4 border border-[#e4ded5] shadow-xs">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d6356] flex items-center justify-between mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-[#ed6c2d]" /> 2. Preferred Canteen Zone
                  </span>
                </label>

                <div className="space-y-2">
                  {ZONES.map((z) => {
                    const isSelected = selectedZone === z.name;
                    const Icon = z.icon;
                    const tableCountInZone = tables.filter(
                      (t) => t.zone === z.name && t.status === "available"
                    ).length;

                    return (
                      <button
                        key={z.name}
                        type="button"
                        onClick={() => {
                          setSelectedZone(z.name);
                          setSelectedTableId(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-[#fef4ea] border-[#ed6c2d] ring-1 ring-[#ed6c2d]"
                            : "bg-[#faf6ef] border-[#ded5c7] hover:border-[#c9bea9]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg grid place-items-center ${
                              isSelected ? "bg-[#ed6c2d] text-white" : "bg-[#ece3d4] text-[#6d6356]"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#1e2721]">{z.name}</div>
                            <div className="text-[11px] text-[#6e6357]">{z.desc}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              tableCountInZone > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {tableCountInZone > 0 ? `${tableCountInZone} free tables` : "Filling fast"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Time Slot */}
              <div className="rounded-2xl bg-white p-4 border border-[#e4ded5] shadow-xs">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#6d6356] flex items-center gap-1.5 mb-2.5">
                  <Clock className="h-3.5 w-3.5 text-[#ed6c2d]" /> 3. Lunch / Dinner Arrival Slot
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "12:15 PM – 01:00 PM",
                    "12:45 PM – 01:30 PM",
                    "01:15 PM – 02:00 PM",
                    "01:45 PM – 02:30 PM",
                    "07:30 PM – 08:15 PM",
                    "08:15 PM – 09:00 PM",
                  ].map((slot) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1d2520] text-white border-[#1d2520] shadow-sm"
                            : "bg-[#faf6ef] text-[#4d443a] border-[#ded5c7] hover:bg-[#ede3d5]"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Add Food Pre-order / Pass Link */}
              <div className="rounded-2xl bg-white p-4 border border-[#e4ded5] shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="food-link-check"
                      checked={withFoodOrder}
                      onChange={(e) => setWithFoodOrder(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-[#ed6c2d] cursor-pointer"
                    />
                    <div>
                      <label htmlFor="food-link-check" className="text-xs font-black text-[#1e2721] cursor-pointer">
                        Pair with Prepaid Meal Pass or Food Order
                      </label>
                      <p className="text-[11px] text-[#6d6459] mt-0.5">
                        Kitchen will auto-schedule your hot food to arrive at your reserved table 2 minutes after you check in.
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-[#ffedd5] text-[#c2410c] text-[10px] font-extrabold px-2 py-0.5 shrink-0">
                    Recommended
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Table Floor Map & Confirmation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-white p-4 border border-[#e4ded5] shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-[#f0e8dc] pb-2.5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1e2721]">
                      Interactive Floorplan Map
                    </h3>
                    <p className="text-[11px] text-[#6e6356]">
                      {currentBranch.name} · {selectedZone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Free
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Booked
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-bold">
                      <span className="h-2 w-2 rounded-full bg-rose-500" /> Dining
                    </span>
                  </div>
                </div>

                {/* Table Map Visual Grid */}
                <div className="rounded-xl bg-[#faf6ef] p-4 border border-[#dfd5c5]">
                  <div className="grid grid-cols-3 gap-2.5">
                    {tables
                      .filter((t) => t.zone === selectedZone)
                      .map((tbl) => {
                        const isSelected = selectedTableId === tbl.id;
                        const isAvailable = tbl.status === "available";

                        return (
                          <button
                            key={tbl.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedTableId(tbl.id)}
                            className={`p-3 rounded-xl border text-center transition-all relative ${
                              isSelected
                                ? "bg-[#ed6c2d] text-white border-[#ed6c2d] shadow-md scale-105"
                                : isAvailable
                                ? "bg-white text-[#1f2722] border-emerald-300 hover:border-emerald-500 cursor-pointer shadow-2xs"
                                : tbl.status === "reserved"
                                ? "bg-[#fef3c7] text-[#92400e] border-[#fde68a] cursor-not-allowed opacity-80"
                                : "bg-[#fee2e2] text-[#991b1b] border-[#fecaca] cursor-not-allowed opacity-80"
                            }`}
                          >
                            <div className="text-xs font-black">{tbl.tableNumber}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">
                              {tbl.capacity} Seats
                            </div>
                            <div className="mt-1">
                              <span
                                className={`inline-block text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : isAvailable
                                    ? "bg-emerald-100 text-emerald-800"
                                    : tbl.status === "reserved"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {isSelected ? "SELECTED" : tbl.status}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  {tables.filter((t) => t.zone === selectedZone).length === 0 && (
                    <div className="py-6 text-center text-xs text-[#7e7467]">
                      No tables found in this zone for the selected branch.
                    </div>
                  )}
                </div>

                {/* Reservation Summary */}
                <div className="mt-4 pt-3 border-t border-[#f0e8dc] space-y-2 text-xs">
                  <div className="flex justify-between text-[#685e52]">
                    <span>Facility / Sector</span>
                    <span className="font-bold text-[#1f2722]">{currentBranch.campusOrFacility}</span>
                  </div>
                  <div className="flex justify-between text-[#685e52]">
                    <span>Zone</span>
                    <span className="font-bold text-[#1f2722]">{selectedZone}</span>
                  </div>
                  <div className="flex justify-between text-[#685e52]">
                    <span>Party Size</span>
                    <span className="font-bold text-[#1f2722]">{partySize} Diners</span>
                  </div>
                  <div className="flex justify-between text-[#685e52]">
                    <span>Time Window</span>
                    <span className="font-bold text-[#1f2722]">{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between text-[#685e52]">
                    <span>Table Selected</span>
                    <span className="font-extrabold text-[#ed6c2d]">
                      {tables.find((t) => t.id === selectedTableId)?.tableNumber || "Auto-Assign Best Free Table"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#685e52]">
                    <span>Reservation Fee</span>
                    <span className="font-black text-emerald-600">FREE (Zero Wait Campus Perk)</span>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="mt-4 w-full rounded-xl bg-[#ed6c2d] py-3 text-xs font-black text-white hover:bg-[#de5f20] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Table Reservation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default SeatReservation;
