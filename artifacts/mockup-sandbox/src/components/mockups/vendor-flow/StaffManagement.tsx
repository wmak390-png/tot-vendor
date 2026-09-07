import { useState, useEffect } from "react";
import {
  AlertCircle,
  Armchair,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Coffee,
  Crown,
  Eye,
  Flame,
  KeyRound,
  Layers,
  Lock,
  PackageCheck,
  Phone,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import {
  takeOnTimeStore,
  type Branch,
  type StaffMember,
  type StaffRole,
} from "@/lib/takeontime-store";

const ROLE_INFO: Record<
  StaffRole,
  {
    title: string;
    icon: typeof Crown;
    badgeBg: string;
    description: string;
    defaultPermissions: string[];
  }
> = {
  owner: {
    title: "Owner / General Manager",
    icon: Crown,
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    description: "Full administrative rights, billing, banking, staff roster & branch expansion",
    defaultPermissions: [
      "Full System Admin Access",
      "Financial Settlements & Payouts",
      "Staff Accounts & Role Permissions",
      "Menu & Pass Pricing Management",
      "Multi-Branch Configuration",
    ],
  },
  cook: {
    title: "Chef / Kitchen Cook",
    icon: ChefHat,
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    description: "Kitchen Display Station (KDS), bump bar, cooking timers & 86 item stockouts",
    defaultPermissions: [
      "Kitchen Display Station (KDS)",
      "Live Ticket Bump Bar",
      "Item Preparation Timer Calibration",
      "Stockout (86) Ingredients Toggle",
    ],
  },
  waiter: {
    title: "Order Taker / Floor Waiter",
    icon: Utensils,
    badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
    description: "Table floorplan view, dine-in order punching, seating guest OTPs & table cleaning",
    defaultPermissions: [
      "Table Floorplan View",
      "Punch Dine-in Order",
      "Verify Customer Seat OTP",
      "Mark Table Clean / Occupied",
    ],
  },
  dispatcher: {
    title: "Pickup / Express Bay Dispatcher",
    icon: PackageCheck,
    badgeBg: "bg-purple-100 text-purple-900 border-purple-300",
    description: "Express cubby slot assignment, customer OTP collection & fast takeaway bag handover",
    defaultPermissions: [
      "Express Pickup Counter View",
      "Customer Takeaway OTP Verification",
      "Canteen Cubby Slot Assignment",
      "Daily Dispatch & Handover Log",
    ],
  },
};

export function StaffManagement({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [branches, setBranches] = useState<Branch[]>(() => takeOnTimeStore.getBranches());
  const [staffList, setStaffList] = useState<StaffMember[]>(() => takeOnTimeStore.getStaffMembers());
  const [currentRole, setCurrentRole] = useState<StaffRole>(() => takeOnTimeStore.getCurrentStaffRole());
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("cook");
  const [newBranchId, setNewBranchId] = useState("branch_cybercity");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPin, setNewPin] = useState("4582");
  const [newShift, setNewShift] = useState("Morning Shift (07:30 AM – 03:30 PM)");

  // KDS Interactive Demo State (for Cook View)
  const [kdsOrders, setKdsOrders] = useState([
    {
      id: "KDS-101",
      table: "Table T-04",
      type: "DINE-IN",
      timer: "3m 40s remaining",
      urgency: "normal",
      items: ["1x Executive South Indian Thali", "1x Filter Coffee (Extra Strong)"],
      status: "cooking",
    },
    {
      id: "KDS-102",
      table: "Cubby B-12",
      type: "EXPRESS PICKUP",
      timer: "1m 15s remaining",
      urgency: "rush",
      items: ["2x Mysore Masala Dosa", "2x Fresh Badam Milk"],
      status: "cooking",
    },
    {
      id: "KDS-103",
      table: "Table G-02",
      type: "TEAM MEAL",
      timer: "12m 00s remaining",
      urgency: "normal",
      items: ["5x South Indian Deluxe Thali", "5x Masala Buttermilk"],
      status: "cooking",
    },
  ]);

  // Dispatcher Interactive Demo State
  const [dispatcherOtp, setDispatcherOtp] = useState("");
  const [verifiedCustomer, setVerifiedCustomer] = useState<{
    name: string;
    orderId: string;
    items: string;
    slot: string;
  } | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setBranches(takeOnTimeStore.getBranches());
      setStaffList(takeOnTimeStore.getStaffMembers());
      setCurrentRole(takeOnTimeStore.getCurrentStaffRole());
    });
    return unsub;
  }, []);

  const handleRoleSimulate = (role: StaffRole) => {
    takeOnTimeStore.setCurrentStaffRole(role);
    setCurrentRole(role);
    setToast(`Simulating App as: ${ROLE_INFO[role].title}`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const assignedBranch = branches.find((b) => b.id === newBranchId);

    takeOnTimeStore.addStaffMember({
      vendorId: "vendor_little_fern",
      branchId: newBranchId,
      branchName: assignedBranch?.name || "Little Fern",
      name: newName.trim(),
      role: newRole,
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      pin: newPin,
      status: "active",
      permissions: ROLE_INFO[newRole].defaultPermissions,
      shift: newShift,
    });

    setIsAddModalOpen(false);
    setToast(`Staff member ${newName} added with PIN: ${newPin}`);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewPin(Math.floor(1000 + Math.random() * 9000).toString());
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusToggle = (staff: StaffMember) => {
    const nextStatus =
      staff.status === "active"
        ? "on-break"
        : staff.status === "on-break"
        ? "inactive"
        : "active";
    takeOnTimeStore.updateStaffStatus(staff.id, nextStatus);
    setToast(`${staff.name} is now ${nextStatus.toUpperCase()}`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRemoveStaff = (staffId: string, name: string) => {
    if (confirm(`Remove ${name} from staff roster?`)) {
      takeOnTimeStore.removeStaffMember(staffId);
      setToast(`Removed ${name} from roster.`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleBumpKdsTicket = (id: string) => {
    setKdsOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ready" } : o))
    );
    setToast(`Ticket ${id} marked READY for counter pickup!`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleVerifyDispatcherOtp = () => {
    if (dispatcherOtp === "4921" || dispatcherOtp === "6821" || dispatcherOtp.length === 4) {
      setVerifiedCustomer({
        name: "Rahul Sharma (Pass Diner)",
        orderId: "ORD-SUB-701",
        items: "Executive South Indian Thali + Payasam",
        slot: "Cubby Counter #2",
      });
      setToast("OTP Verified! Release order to customer.");
    } else {
      setToast("Invalid OTP. Try 4921 or 6821");
    }
    setTimeout(() => setToast(null), 3500);
  };

  const filteredStaff = staffList.filter((s) => {
    if (selectedBranchFilter !== "all" && s.branchId !== selectedBranchFilter) return false;
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.role.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.phone.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f1eb] pb-24 text-[#202823]">
      {/* Toast */}
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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d2520] text-white shadow-sm font-black text-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#1b251f]">
                  Multi-Staff &amp; Role-Based Access (RBAC)
                </h1>
                <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-black text-[#92400e] border border-[#fde68a]">
                  CREDENTIALS &amp; ROLES
                </span>
              </div>
              <p className="text-[11px] text-[#6d6459]">
                Assign roles, login PINs &amp; view customized screens for Owner, Cook, Waiter &amp; Dispatcher
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ed6c2d] px-3.5 py-2 text-xs font-black text-white hover:bg-[#de5f20] transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4 space-y-4">
        {/* ROLE SIMULATION TOGGLE BAR */}
        <section
          aria-label="Role Simulator Switcher"
          className="rounded-2xl bg-gradient-to-br from-[#1d2520] to-[#28352d] p-4 text-white shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3b4b40]">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#ed6c2d] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  ROLE SIMULATOR MODE
                </span>
                <span className="text-xs text-[#a4b8ab]">
                  Preview how the app morphs for each staff role
                </span>
              </div>
              <h2 className="mt-1 text-base font-black text-white">
                Currently Viewing App As:{" "}
                <span className="text-[#4ade80]">{ROLE_INFO[currentRole].title}</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121914] p-1.5 rounded-xl border border-[#303e34]">
              {(["owner", "cook", "waiter", "dispatcher"] as StaffRole[]).map((r) => {
                const isSelected = currentRole === r;
                const Icon = ROLE_INFO[r].icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSimulate(r)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#ed6c2d] text-white shadow-xs font-black"
                        : "text-[#94a89b] hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="capitalize">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-2.5 text-xs text-[#c6d7cc]">
            {ROLE_INFO[currentRole].description}
          </p>
        </section>

        {/* ROLE-SPECIFIC DEDICATED PREVIEW SCREEN */}
        {/* 1. COOK / CHEF VIEW (KDS) */}
        {currentRole === "cook" && (
          <div className="rounded-2xl bg-[#18201a] border border-[#2b3930] p-4 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#2b3930] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#15803d] text-white">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Kitchen Display Station (KDS) &amp; Bump Bar
                  </h3>
                  <p className="text-[11px] text-[#93a699]">
                    Touch or tap to mark orders cooked &amp; ready for counter or table runner
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 text-xs font-black animate-pulse">
                3 Active Tickets Prepping
              </span>
            </div>

            {/* KDS Ticket Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {kdsOrders.map((tkt) => {
                const isReady = tkt.status === "ready";
                return (
                  <div
                    key={tkt.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      isReady
                        ? "bg-[#112417] border-emerald-700 opacity-70"
                        : tkt.urgency === "rush"
                        ? "bg-[#2b1812] border-rose-600"
                        : "bg-[#1f2a22] border-[#36473b]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-[#f59e0b]">
                          {tkt.id}
                        </span>
                        <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase text-[#cbd5e1]">
                          {tkt.type}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4 className="text-base font-black text-white">{tkt.table}</h4>
                        <div className="flex items-center gap-1 text-xs text-[#f87171] font-bold mt-0.5">
                          <Timer className="h-3.5 w-3.5" />
                          <span>{tkt.timer}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                        {tkt.items.map((it, idx) => (
                          <div key={idx} className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ed6c2d]" />
                            <span>{it}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isReady}
                      onClick={() => handleBumpKdsTicket(tkt.id)}
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        isReady
                          ? "bg-emerald-800 text-white cursor-default"
                          : "bg-[#22c55e] text-[#0d3319] hover:bg-[#16a34a] hover:text-white"
                      }`}
                    >
                      {isReady ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>ORDER READY (BUMPED)</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>BUMP TICKET (COOKED)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DISPATCHER VIEW */}
        {currentRole === "dispatcher" && (
          <div className="rounded-2xl bg-white border border-[#e1d8cc] p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7e22ce] text-white">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1b251f]">
                    Express Counter &amp; Takeaway Bay Dispatcher View
                  </h3>
                  <p className="text-[11px] text-[#6d6459]">
                    Verify customer 4-digit OTP or scan QR token to release meal pass thali / takeaway bags
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 text-xs font-black">
                Counter #2 Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#faf6ef] p-4 border border-[#dfd5c5]">
                <label className="text-xs font-black uppercase text-[#6b5f52] block mb-1.5">
                  Verify Customer Takeaway / Meal Pass OTP
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4921 or 6821"
                    value={dispatcherOtp}
                    onChange={(e) => setDispatcherOtp(e.target.value)}
                    className="w-44 rounded-xl border border-[#d6cbbe] bg-white px-3 py-2.5 font-mono text-base font-black text-[#1f2721] focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDispatcherOtp}
                    className="rounded-xl bg-[#ed6c2d] px-4 py-2.5 text-xs font-black text-white hover:bg-[#de5f20] transition-colors cursor-pointer shadow-xs"
                  >
                    Verify &amp; Handover
                  </button>
                </div>
                <p className="text-[11px] text-[#867766] mt-2">
                  Demo hint: Type <strong>4921</strong> for Rahul Sharma's scheduled South Indian Thali.
                </p>
              </div>

              {verifiedCustomer ? (
                <div className="rounded-2xl bg-[#f0fdf4] border border-[#86efac] p-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800">
                      OTP MATCH CONFIRMED
                    </span>
                    <span className="rounded bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                      {verifiedCustomer.orderId}
                    </span>
                  </div>
                  <h4 className="mt-1 text-base font-black text-emerald-950">
                    {verifiedCustomer.name}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                    {verifiedCustomer.items}
                  </p>
                  <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Assigned Location:</span>
                    <span className="font-black text-emerald-800">{verifiedCustomer.slot}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedCustomer(null);
                      setDispatcherOtp("");
                      setToast("Order handed over successfully!");
                    }}
                    className="mt-3 w-full py-2 rounded-xl bg-emerald-700 text-white font-black text-xs hover:bg-emerald-800 cursor-pointer"
                  >
                    Complete Handover
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#faf7f2] border border-[#e8ded0] p-4 flex items-center justify-center text-center">
                  <div>
                    <QrCode className="h-8 w-8 mx-auto text-[#b0a08e]" />
                    <p className="text-xs text-[#716557] mt-1 font-medium">
                      Waiting for customer OTP verification
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. WAITER VIEW */}
        {currentRole === "waiter" && (
          <div className="rounded-2xl bg-white border border-[#e1d8cc] p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#2563eb] text-white">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1b251f]">
                    Floor Waiter &amp; Table Service Terminal
                  </h3>
                  <p className="text-[11px] text-[#6d6459]">
                    Check diners in, serve food to tables &amp; alert busboy when diners leave
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate("vendor-flow/VendorTableManagement")}
                  className="rounded-xl bg-[#2563eb] px-3 py-1.5 text-xs font-black text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Open Table Floorplan &rarr;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#ded5c7]">
                <span className="text-[10px] font-extrabold uppercase text-[#736657]">
                  Table T-04 (Reserved)
                </span>
                <p className="text-xs font-black text-[#1e2721] mt-0.5">
                  Rahul Sharma · 2 Diners
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-[#4c4135]">
                    OTP: 6821
                  </span>
                  <button
                    type="button"
                    onClick={() => setToast("Table T-04 Diners Seated!")}
                    className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Seat Now
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#ded5c7]">
                <span className="text-[10px] font-extrabold uppercase text-[#736657]">
                  Table T-01 (Occupied)
                </span>
                <p className="text-xs font-black text-[#1e2721] mt-0.5">
                  Served 20 mins ago
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setToast("Table T-01 sent to busboy for cleaning")}
                    className="rounded-lg bg-purple-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-purple-800 cursor-pointer"
                  >
                    Diners Left (Send to Clean)
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#ded5c7]">
                <span className="text-[10px] font-extrabold uppercase text-[#736657]">
                  Table E-01 (Cleaning)
                </span>
                <p className="text-xs font-black text-[#1e2721] mt-0.5">
                  Doctor Bay Booth
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setToast("Table E-01 is now sanitized & available")}
                    className="rounded-lg bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-800 cursor-pointer"
                  >
                    Mark Clean &amp; Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF DIRECTORY & ROSTER (ALL ROLES) */}
        <section aria-label="Staff Directory" className="rounded-2xl bg-white border border-[#e1d8cc] p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e8dc]">
            <div>
              <h3 className="text-sm font-black text-[#1b251f]">
                Active Staff Roster &amp; Credentials
              </h3>
              <p className="text-[11px] text-[#6d6459]">
                Employees, assigned premises, roles, shifts and PIN credentials
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Branch Filter */}
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="rounded-xl border border-[#d6cbbe] bg-[#faf6ef] px-3 py-1.5 text-xs font-bold text-[#1f2721] focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
              >
                <option value="all">All Premises ({branches.length})</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-[#998b7c]" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-[#d6cbbe] bg-[#faf6ef] pl-8 pr-3 py-1.5 text-xs font-medium text-[#1f2721] focus:outline-none focus:ring-2 focus:ring-[#ed6c2d] w-36 sm:w-44"
                />
              </div>
            </div>
          </div>

          {/* Staff Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStaff.map((staff) => {
              const meta = ROLE_INFO[staff.role];
              const Icon = meta.icon;
              const isActive = staff.status === "active";
              const isOnBreak = staff.status === "on-break";

              return (
                <div
                  key={staff.id}
                  className="rounded-2xl border border-[#e3dbcf] p-4 bg-white hover:border-[#cfc3b3] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf5ee] border border-[#e4d8c8] text-[#1e2721] font-black text-sm">
                          <Icon className="h-5 w-5 text-[#ed6c2d]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-[#1b251f]">
                              {staff.name}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${meta.badgeBg}`}
                            >
                              {staff.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6e6356]">{staff.branchName}</p>
                        </div>
                      </div>

                      {/* Status pill button */}
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(staff)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase transition-all cursor-pointer border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : isOnBreak
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                        title="Click to toggle status (Active / On Break / Inactive)"
                      >
                        {staff.status}
                      </button>
                    </div>

                    {/* Shift & Contact */}
                    <div className="mt-3 pt-2.5 border-t border-[#f0e8dc] text-xs space-y-1">
                      <div className="flex justify-between text-[#685e52]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#ed6c2d]" /> Shift
                        </span>
                        <span className="font-bold text-[#1f2722]">{staff.shift}</span>
                      </div>
                      <div className="flex justify-between text-[#685e52]">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-[#ed6c2d]" /> Phone
                        </span>
                        <span className="font-bold text-[#1f2722]">{staff.phone}</span>
                      </div>
                      <div className="flex justify-between text-[#685e52]">
                        <span className="flex items-center gap-1">
                          <KeyRound className="h-3 w-3 text-[#ed6c2d]" /> Quick PIN
                        </span>
                        <span className="font-mono font-black text-[#1b251f] bg-[#faf6ef] px-2 py-0.5 rounded border border-[#e2d7c9]">
                          {staff.pin}
                        </span>
                      </div>
                    </div>

                    {/* Permissions list */}
                    <div className="mt-3 pt-2.5 border-t border-[#f0e8dc]">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#827566] block mb-1">
                        Granted Access
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.map((p, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[#faf6ef] border border-[#e2d8ca] px-1.5 py-0.5 text-[9px] font-semibold text-[#5c5043]"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#f0e8dc] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleRoleSimulate(staff.role)}
                      className="text-xs font-bold text-[#ed6c2d] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Test as {staff.name}</span>
                    </button>

                    {staff.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(staff.id, staff.name)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                        title="Remove staff member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ADD STAFF MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#e4ded5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#ed6c2d]" />
                <h3 className="text-base font-black text-[#1b251f]">
                  Add Staff &amp; Issue Role Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-[#f4ece1] text-[#5a4e42] hover:bg-[#e8dcce] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#4c4238]">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4c4238]">System Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as StaffRole)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  >
                    <option value="cook">Cook / Chef (KDS Only)</option>
                    <option value="waiter">Order Taker / Floor Waiter</option>
                    <option value="dispatcher">Express Bay Dispatcher</option>
                    <option value="owner">Co-Owner / Manager</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#4c4238]">Assign Branch Premise</label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#4c4238]">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#4c4238]">4-Digit Terminal PIN</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-mono font-black focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#4c4238]">Shift Timings</label>
                <input
                  type="text"
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d6cbbe] p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#ed6c2d] focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-[#faf6ef] p-3 border border-[#ded5c7]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#827566] block mb-1">
                  Default Permissions for {ROLE_INFO[newRole].title}
                </span>
                <div className="flex flex-wrap gap-1">
                  {ROLE_INFO[newRole].defaultPermissions.map((p, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-white border border-[#ded5c7] px-1.5 py-0.5 text-[9px] font-medium text-[#4d4236]"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-[#ded5c7] px-4 py-2 text-xs font-bold text-[#554b42] hover:bg-[#ede3d5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ed6c2d] px-5 py-2 text-xs font-black text-white hover:bg-[#de5f20] shadow-md cursor-pointer"
                >
                  Issue Credentials &amp; Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default StaffManagement;
