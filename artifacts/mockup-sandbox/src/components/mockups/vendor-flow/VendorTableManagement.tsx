import { useState, useEffect } from "react";
import {
  AlertCircle,
  Armchair,
  ArrowRight,
  BadgeAlert,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Filter,
  Flame,
  GraduationCap,
  HeartPulse,
  Hotel,
  Layers,
  MapPin,
  Maximize2,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import {
  takeOnTimeStore,
  type Branch,
  type TableItem,
  type TableReservation,
  type TableStatus,
  type TableZone,
  type VerticalType,
} from "@/lib/takeontime-store";

export function VendorTableManagement({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [branches, setBranches] = useState<Branch[]>(() => takeOnTimeStore.getBranches());
  const [activeBranchId, setActiveBranchId] = useState<string>(() => takeOnTimeStore.getActiveBranchId());
  const [tables, setTables] = useState<TableItem[]>(() => takeOnTimeStore.getTables());
  const [reservations, setReservations] = useState<TableReservation[]>(() =>
    takeOnTimeStore.getTableReservations()
  );

  // Active view tab: "floor" | "reservations" | "branches"
  const [viewTab, setViewTab] = useState<"floor" | "reservations" | "branches">("floor");
  const [zoneFilter, setZoneFilter] = useState<"all" | TableZone>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TableStatus>("all");

  // Selected table for quick action
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [seatOtpInput, setSeatOtpInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // New Branch Modal
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchVertical, setNewBranchVertical] = useState<VerticalType>("corporate");
  const [newBranchFacility, setNewBranchFacility] = useState("");
  const [newBranchFloor, setNewBranchFloor] = useState("Bay 1, Ground Floor");
  const [newBranchTables, setNewBranchTables] = useState(20);
  const [newBranchSeats, setNewBranchSeats] = useState(80);
  const [newBranchHours, setNewBranchHours] = useState("08:00 AM – 10:00 PM");

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setBranches(takeOnTimeStore.getBranches());
      setTables(takeOnTimeStore.getTables(activeBranchId));
      setReservations(takeOnTimeStore.getTableReservations(activeBranchId));
    });
    return unsub;
  }, [activeBranchId]);

  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleBranchSwitch = (branchId: string) => {
    setActiveBranchId(branchId);
    takeOnTimeStore.setActiveBranch(branchId);
    setTables(takeOnTimeStore.getTables(branchId));
    setReservations(takeOnTimeStore.getTableReservations(branchId));
    setSelectedTable(null);
  };

  const handleStatusChange = (tableId: string, nextStatus: TableStatus) => {
    takeOnTimeStore.updateTableStatus(tableId, nextStatus);
    setToast(`Table status updated to ${nextStatus.toUpperCase()}`);
    setTimeout(() => setToast(null), 2500);
    setSelectedTable(null);
  };

  const handleSeatWithOtp = (table: TableItem) => {
    if (table.currentReservation) {
      if (seatOtpInput && seatOtpInput !== table.currentReservation.otp) {
        setToast("Incorrect OTP! Expected OTP: " + table.currentReservation.otp);
        return;
      }
      takeOnTimeStore.seatReservation(table.currentReservation.reservationId);
      setToast(`Guests seated at Table ${table.tableNumber}!`);
    } else {
      takeOnTimeStore.updateTableStatus(table.id, "occupied");
      setToast(`Walk-in guests seated at Table ${table.tableNumber}!`);
    }
    setSeatOtpInput("");
    setSelectedTable(null);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchFacility.trim()) return;

    const created = takeOnTimeStore.addBranch({
      vendorId: "vendor_little_fern",
      name: newBranchName.trim(),
      vertical: newBranchVertical,
      campusOrFacility: newBranchFacility.trim(),
      floorOrBay: newBranchFloor.trim(),
      totalTables: newBranchTables,
      totalSeats: newBranchSeats,
      occupiedSeats: 0,
      currentRush: "low",
      occupancyPercent: 0,
      expectedWaitMins: 0,
      openHours: newBranchHours,
      activeStaffCount: 4,
      features: ["AC Dining Hall", "Fast Ordering POS", "TakeOnTime Express Bay"],
    });

    setIsAddBranchOpen(false);
    setActiveBranchId(created.id);
    setToast(`New branch "${created.name}" created and active!`);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredTables = tables.filter((t) => {
    if (zoneFilter !== "all" && t.zone !== zoneFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const cleaningCount = tables.filter((t) => t.status === "cleaning").length;

  return (
    <div className="min-h-screen bg-[#f5f1eb] pb-24 text-[#202823]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#1d2520] px-4 py-3 text-sm font-semibold text-[#fffdfa] shadow-xl border border-[#354339] animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#e1d8cc] bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ed6c2d] text-white shadow-sm font-black text-sm">
              <Armchair className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1b251f]">
                  Tables, Seating &amp; Multi-Branch Control
                </h1>
                <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-black text-[#15803d] border border-[#bbf7d0]">
                  LIVE FLOORPLAN
                </span>
              </div>
              <p className="text-[11px] text-[#6d6459]">
                Real-time seat reservations, rush calibration &amp; table turns across all premises
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-[#ede5d8] p-1 border border-[#dfd5c5]">
            <button
              type="button"
              onClick={() => setViewTab("floor")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewTab === "floor"
                  ? "bg-white text-[#1d2520] shadow-xs"
                  : "text-[#6d6153] hover:text-[#1d2520]"
              }`}
            >
              <Armchair className="h-3.5 w-3.5" />
              <span>Floor Map ({tables.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("reservations")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewTab === "reservations"
                  ? "bg-white text-[#1d2520] shadow-xs"
                  : "text-[#6d6153] hover:text-[#1d2520]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Seat Bookings ({reservations.filter((r) => r.status === "confirmed").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab("branches")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewTab === "branches"
                  ? "bg-white text-[#1d2520] shadow-xs"
                  : "text-[#6d6153] hover:text-[#1d2520]"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>All Branches ({branches.length})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4 space-y-4">
        {/* Multi-Branch Selector Strip */}
        <section aria-label="Branch Switcher" className="rounded-2xl bg-white p-4 border border-[#e3dbcf] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e8dc]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#796e62] flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-[#ed6c2d]" /> Current Active Branch:
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={activeBranchId}
                  onChange={(e) => handleBranchSwitch(e.target.value)}
                  className="rounded-xl border border-[#d6cbbe] bg-[#faf6ef] px-3 py-1.5 text-xs font-black text-[#1b251f] focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} [{b.vertical.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1d2520] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2b3830] transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Branch / Facility</span>
              </button>
            </div>
          </div>

          {/* Branch Details & Rush Meter Controller */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#e5dcd0]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#827566]">
                Premises &amp; Sector
              </span>
              <p className="mt-0.5 text-xs font-black text-[#1e2721]">
                {currentBranch.campusOrFacility}
              </p>
              <p className="text-[11px] text-[#6d6356]">{currentBranch.floorOrBay}</p>
            </div>

            <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#e5dcd0]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#827566]">
                Seating Capacity
              </span>
              <p className="mt-0.5 text-xs font-black text-[#1e2721]">
                {tables.length} Tables · {currentBranch.totalSeats} Total Seats
              </p>
              <p className="text-[11px] text-[#6d6356]">
                {occupiedCount} in use · {availableCount} free
              </p>
            </div>

            {/* Rush Level Controller */}
            <div className="md:col-span-2 rounded-xl bg-[#faf6ef] p-3 border border-[#e5dcd0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#827566] flex items-center gap-1">
                  <Flame className="h-3 w-3 text-[#ed6c2d]" /> Rush Calibration (Controls Customer App)
                </span>
                <span className="text-[11px] font-bold text-[#ed6c2d]">
                  {currentBranch.currentRush.toUpperCase()} RUSH ({currentBranch.occupancyPercent}%)
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                {[
                  { rush: "low", label: "Low Rush (20%)", wait: 0, color: "bg-emerald-500" },
                  { rush: "moderate", label: "Moderate (55%)", wait: 5, color: "bg-amber-500" },
                  { rush: "peak", label: "Peak Rush (85%)", wait: 12, color: "bg-rose-500" },
                ].map((r) => {
                  const isCurrent = currentBranch.currentRush === r.rush;
                  return (
                    <button
                      key={r.rush}
                      type="button"
                      onClick={() =>
                        takeOnTimeStore.setBranchRushLevel(
                          currentBranch.id,
                          r.rush as "low" | "moderate" | "peak",
                          r.rush === "low" ? 20 : r.rush === "moderate" ? 55 : 85,
                          r.wait
                        )
                      }
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        isCurrent
                          ? "bg-[#1d2520] text-white border-[#1d2520] shadow-xs"
                          : "bg-white text-[#554b42] border-[#ded5c7] hover:bg-[#ede3d5]"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* VIEW 1: FLOOR MAP & LIVE TABLE MATRIX */}
        {viewTab === "floor" && (
          <div className="space-y-4">
            {/* Quick Status Counter Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "available" ? "all" : "available")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  statusFilter === "available"
                    ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500"
                    : "bg-white border-[#e3dbcf] hover:border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Available Tables</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-1 text-2xl font-black text-emerald-900">{availableCount}</div>
                <p className="text-[10px] text-emerald-700">Ready for walk-in / booking</p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "reserved" ? "all" : "reserved")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  statusFilter === "reserved"
                    ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500"
                    : "bg-white border-[#e3dbcf] hover:border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Reserved Passes</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div className="mt-1 text-2xl font-black text-amber-900">{reservedCount}</div>
                <p className="text-[10px] text-amber-700">Awaiting customer arrival</p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "occupied" ? "all" : "occupied")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  statusFilter === "occupied"
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500"
                    : "bg-white border-[#e3dbcf] hover:border-rose-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800">Currently Dining</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                </div>
                <div className="mt-1 text-2xl font-black text-rose-900">{occupiedCount}</div>
                <p className="text-[10px] text-rose-700">Active table service</p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === "cleaning" ? "all" : "cleaning")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  statusFilter === "cleaning"
                    ? "bg-purple-50 border-purple-300 ring-2 ring-purple-500"
                    : "bg-white border-[#e3dbcf] hover:border-purple-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800">Needs Cleaning</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                </div>
                <div className="mt-1 text-2xl font-black text-purple-900">{cleaningCount}</div>
                <p className="text-[10px] text-purple-700">Busboy / sanitization queue</p>
              </button>
            </div>

            {/* Zone Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-[#6d6356] flex items-center gap-1 shrink-0">
                <Filter className="h-3 w-3" /> Zone:
              </span>
              <button
                type="button"
                onClick={() => setZoneFilter("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  zoneFilter === "all"
                    ? "bg-[#1d2520] text-white border-[#1d2520]"
                    : "bg-white text-[#52473c] border-[#ded5c7] hover:bg-[#ede3d5]"
                }`}
              >
                All Zones
              </button>
              {(
                [
                  "AC Main Hall",
                  "Quiet Study / Work Pods",
                  "Express Counter Stools",
                  "Outdoor Garden Terrace",
                  "Executive / Doctor Bay",
                ] as TableZone[]
              ).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoneFilter(z)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    zoneFilter === z
                      ? "bg-[#1d2520] text-white border-[#1d2520]"
                      : "bg-white text-[#52473c] border-[#ded5c7] hover:bg-[#ede3d5]"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Interactive Table Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                const isReserved = tbl.status === "reserved";
                const isOccupied = tbl.status === "occupied";
                const isCleaning = tbl.status === "cleaning";
                const isAvailable = tbl.status === "available";

                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTable(tbl)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "border-[#ed6c2d] ring-2 ring-[#ed6c2d] bg-[#fffaf5] shadow-md"
                        : isAvailable
                        ? "bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-xs"
                        : isReserved
                        ? "bg-[#fefce8] border-amber-300 hover:border-amber-400 hover:shadow-xs"
                        : isOccupied
                        ? "bg-[#fff1f2] border-rose-200 hover:border-rose-400"
                        : "bg-[#faf5ff] border-purple-200 hover:border-purple-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black tracking-tight text-[#1b251f]">
                          {tbl.tableNumber}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-800"
                              : isReserved
                              ? "bg-amber-100 text-amber-900"
                              : isOccupied
                              ? "bg-rose-100 text-rose-900"
                              : "bg-purple-100 text-purple-900"
                          }`}
                        >
                          {tbl.status}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-[#6e6357] font-medium">{tbl.zone}</p>
                      <p className="text-[11px] text-[#84786a]">{tbl.capacity} Seats ({tbl.shape})</p>

                      {/* Reservation Details if booked */}
                      {tbl.currentReservation && (
                        <div className="mt-2.5 pt-2 border-t border-amber-200 text-xs">
                          <p className="font-extrabold text-[#92400e] truncate">
                            {tbl.currentReservation.customerName}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-[#b45309] mt-0.5">
                            <span>{tbl.currentReservation.timeSlot.split("–")[0]}</span>
                            <span className="font-mono font-bold">OTP: {tbl.currentReservation.otp}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f0e8dc] flex items-center justify-between text-[10px] font-bold text-[#6d6356]">
                      <span>Tap to action</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Drawer / Panel when table selected */}
            {selectedTable && (
              <div className="rounded-2xl bg-white border-2 border-[#ed6c2d] p-5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-3 border-b border-[#f0e8dc] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#1b251f]">
                        Manage Table {selectedTable.tableNumber}
                      </h3>
                      <span className="rounded-md bg-[#ed6c2d]/10 px-2 py-0.5 text-xs font-black text-[#ed6c2d] capitalize">
                        {selectedTable.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6e6356] mt-0.5">
                      {selectedTable.zone} · {selectedTable.capacity} Seats · {currentBranch.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0e8dc] text-[#554b42] hover:bg-[#ded2c3] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {selectedTable.status === "reserved" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Enter 4-Digit OTP"
                        value={seatOtpInput}
                        onChange={(e) => setSeatOtpInput(e.target.value)}
                        className="rounded-xl border border-[#d6cbbe] px-3 py-2 text-xs font-mono font-bold w-36 focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSeatWithOtp(selectedTable)}
                        className="rounded-xl bg-[#15803d] px-4 py-2 text-xs font-black text-white hover:bg-[#166534] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Seat Guests (Verify OTP)</span>
                      </button>
                    </div>
                  )}

                  {selectedTable.status === "available" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTable.id, "occupied")}
                      className="rounded-xl bg-[#ed6c2d] px-4 py-2 text-xs font-black text-white hover:bg-[#de5f20] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Seat Walk-in Diners</span>
                    </button>
                  )}

                  {selectedTable.status === "occupied" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTable.id, "cleaning")}
                      className="rounded-xl bg-[#7e22ce] px-4 py-2 text-xs font-black text-white hover:bg-[#6b21a8] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Diners Left (Send for Cleaning)</span>
                    </button>
                  )}

                  {selectedTable.status === "cleaning" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTable.id, "available")}
                      className="rounded-xl bg-[#15803d] px-4 py-2 text-xs font-black text-white hover:bg-[#166534] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Table Sanitized &amp; Ready</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTable.id, "available")}
                    className="rounded-xl border border-[#ded5c7] bg-[#faf6ef] px-3 py-2 text-xs font-bold text-[#554b42] hover:bg-[#ede3d5] transition-colors cursor-pointer"
                  >
                    Force Mark Available
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RESERVATIONS ROSTER */}
        {viewTab === "reservations" && (
          <div className="rounded-2xl bg-white border border-[#e3dbcf] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8dc]">
              <div>
                <h3 className="text-sm font-black text-[#1b251f]">
                  Upcoming Seat Reservations
                </h3>
                <p className="text-[11px] text-[#6e6356]">
                  Pre-booked canteen seats linked to orders &amp; meal passes
                </p>
              </div>
              <span className="rounded-full bg-[#ffedd5] px-2.5 py-1 text-xs font-extrabold text-[#c2410c]">
                {reservations.length} Bookings Today
              </span>
            </div>

            <div className="divide-y divide-[#f2ebe0]">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf5ec] text-[#ed6c2d] font-black text-xs shrink-0 border border-[#edd9c5]">
                      {res.tableNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#1b251f]">
                          {res.customerName}
                        </span>
                        <span className="rounded bg-[#faf5ee] border border-[#e1d5c4] px-1.5 py-0.2 text-[10px] font-bold text-[#6a5e52]">
                          {res.partySize} Guests
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                            res.status === "confirmed"
                              ? "bg-amber-100 text-amber-800"
                              : res.status === "seated"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6c6155] mt-0.5">
                        Slot: {res.timeSlot} · Zone: {res.zone} · Phone: {res.phone}
                      </p>
                      {res.linkedOrderOrPlan && (
                        <p className="text-[10px] font-extrabold text-[#15803d] mt-0.5">
                          ✓ {res.linkedOrderOrPlan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="rounded-lg bg-[#f7f3eb] px-2.5 py-1 font-mono text-xs font-black text-[#3a3229] border border-[#e5dcce]">
                      OTP: {res.otp}
                    </span>
                    {res.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => {
                          takeOnTimeStore.seatReservation(res.id);
                          setToast(`Diners for booking ${res.id} seated at Table ${res.tableNumber}!`);
                        }}
                        className="rounded-xl bg-[#15803d] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#166534] transition-colors cursor-pointer"
                      >
                        Seat Diners
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ALL BRANCHES DIRECTORY */}
        {viewTab === "branches" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {branches.map((b) => {
                const isSelected = b.id === activeBranchId;
                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "bg-white border-[#ed6c2d] ring-2 ring-[#ed6c2d] shadow-sm"
                        : "bg-white border-[#e3dbcf] hover:border-[#cfc3b3]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#faf4ec] text-[#a0522d] border border-[#e8d7c4] px-1.5 py-0.2 text-[9px] font-black uppercase">
                            {b.vertical}
                          </span>
                          <span className="text-[11px] text-[#716559]">{b.openHours}</span>
                        </div>
                        <h4 className="mt-1 text-sm font-black text-[#1b251f]">{b.name}</h4>
                        <p className="text-xs text-[#6e6356] mt-0.5">{b.campusOrFacility}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBranchSwitch(b.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#ed6c2d] text-white shadow-xs"
                            : "bg-[#faf6ef] text-[#554b42] border border-[#d6cbbe] hover:bg-[#ede3d5]"
                        }`}
                      >
                        {isSelected ? "Active Branch" : "Switch Here"}
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#f0e8dc] grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-[#faf6ef] p-1.5">
                        <span className="text-[10px] text-[#807466]">Capacity</span>
                        <div className="font-black text-[#1d2520]">{b.totalSeats} Seats</div>
                      </div>
                      <div className="rounded-lg bg-[#faf6ef] p-1.5">
                        <span className="text-[10px] text-[#807466]">Rush</span>
                        <div className="font-black text-[#1d2520] capitalize">{b.currentRush}</div>
                      </div>
                      <div className="rounded-lg bg-[#faf6ef] p-1.5">
                        <span className="text-[10px] text-[#807466]">Staff</span>
                        <div className="font-black text-[#1d2520]">{b.activeStaffCount} On Duty</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* CREATE NEW BRANCH MODAL */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#e4ded5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#ed6c2d]" />
                <h3 className="text-base font-black text-[#1b251f]">
                  Add New Branch / Facility Counter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-[#f4ece1] text-[#5a4e42] hover:bg-[#e8dcce] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#4c4238]">Branch / Outlet Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Little Fern - MedCity Hospital Canteen"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4c4238]">Vertical Category</label>
                  <select
                    value={newBranchVertical}
                    onChange={(e) => setNewBranchVertical(e.target.value as VerticalType)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  >
                    <option value="corporate">Corporate / Tech Park</option>
                    <option value="institute">College / Institute Mess</option>
                    <option value="hospital">Hospital / Healthcare</option>
                    <option value="industry">Industry / Factory</option>
                    <option value="hotel">Hotel / Hospitality</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4c4238]">Floor / Bay Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bay 3, Ground Floor"
                    value={newBranchFloor}
                    onChange={(e) => setNewBranchFloor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4c4238]">Full Campus / Building Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Hospital MedCity, Bannerghatta Road"
                  value={newBranchFacility}
                  onChange={(e) => setNewBranchFacility(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#4c4238]">Tables Count</label>
                  <input
                    type="number"
                    min={4}
                    max={150}
                    value={newBranchTables}
                    onChange={(e) => setNewBranchTables(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4c4238]">Total Seats</label>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={newBranchSeats}
                    onChange={(e) => setNewBranchSeats(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#4c4238]">Daily Hours</label>
                  <input
                    type="text"
                    value={newBranchHours}
                    onChange={(e) => setNewBranchHours(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="rounded-xl border border-[#ded5c7] px-4 py-2 text-xs font-bold text-[#554b42] hover:bg-[#ede3d5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ed6c2d] px-5 py-2 text-xs font-black text-white hover:bg-[#de5f20] shadow-md cursor-pointer"
                >
                  Create Branch &amp; Init Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default VendorTableManagement;
