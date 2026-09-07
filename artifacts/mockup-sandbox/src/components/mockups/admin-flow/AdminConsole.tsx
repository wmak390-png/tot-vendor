import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Filter,
  Landmark,
  Layers,
  Pause,
  Play,
  Radio,
  Receipt,
  RotateCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, type Vendor, type Order } from "@/lib/takeontime-store";

type AdminTab = "approvals" | "orders_monitor" | "vendors" | "settlements";

export function AdminConsole({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("approvals");
  const [vendors, setVendors] = useState<Vendor[]>(takeOnTimeStore.getVendors());
  const [orders, setOrders] = useState<Order[]>(takeOnTimeStore.getOrders());

  // Reject Vendor Modal
  const [rejectingVendor, setRejectingVendor] = useState<Vendor | null>(null);
  const [rejectReason, setRejectReason] = useState("Incomplete FSSAI license documentation");

  // Inspect Vendor Modal
  const [inspectingVendor, setInspectingVendor] = useState<Vendor | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setVendors(takeOnTimeStore.getVendors());
      setOrders(takeOnTimeStore.getOrders());
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const pendingVendors = vendors.filter((v) => !v.isApproved && v.approvalStatus === "pending");
  const activeVendors = vendors.filter((v) => v.isApproved);

  const totalGMV = orders.reduce((sum, o) => sum + o.amountNum, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length;

  const handleApprove = (vendorId: string, vendorName: string) => {
    takeOnTimeStore.approveVendor(vendorId);
    notify(`Approved ${vendorName}! Outlet is now live for campus customer pre-orders.`);
  };

  const handleConfirmReject = () => {
    if (!rejectingVendor) return;
    takeOnTimeStore.rejectVendor(rejectingVendor.id, rejectReason);
    notify(`Declined ${rejectingVendor.name}: ${rejectReason}`);
    setRejectingVendor(null);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#1e2420] px-3 py-4 text-[#e8f0eb] font-sans sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#0e1310] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
            <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Admin Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d3a31] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ed6c2d] shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#f09562]">
                  TakeOnTime Operations
                </span>
                <span className="rounded-md bg-[#2d3b31] px-2 py-0.5 text-[10px] font-mono font-bold text-[#7fe09b]">
                  ADMIN HQ
                </span>
              </div>
              <h1 className="text-xl font-black text-white">Central Operations & Compliance Console</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Seed a new vendor application to test approval flow
                const sample = takeOnTimeStore.registerNewVendor({
                  name: `Campus Bowl Co. #${Math.floor(10 + Math.random() * 90)}`,
                  tagline: "Healthy protein rice bowls & freshly squeezed juices",
                  campus: "Manyata Tech Park North Gate Canteen",
                  cuisine: "Bowls · Salads · Smoothies",
                  rating: 4.9,
                  reviewsCount: 12,
                  prepTime: "6-8 min",
                  isOpen: true,
                  onBreak: false,
                  fssaiNumber: `1192${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                  ownerName: "Akash Verma",
                  phone: "+91 99881 22345",
                  bankAccount: "••••••••5512 (Axis Bank)",
                  ifsc: "UTIB0001923",
                  upiId: "akash.bowls@axis",
                });
                notify(`Generated new vendor application from ${sample.name}! Check Approvals Queue.`);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#2b3a2f] px-3 py-2 text-xs font-bold text-[#b9e5c5] hover:bg-[#384c3e]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#f09562]" />
              <span>Simulate New Vendor Signup</span>
            </button>
          </div>
        </header>

        {/* Global Platform KPIs */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-3.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98b3a0]">
              Platform GMV Today
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-white">₹{totalGMV}</p>
            <p className="text-[10px] text-[#55cf79] mt-0.5 font-bold">100% Prepaid via Razorpay</p>
          </div>

          <div className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-3.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98b3a0]">
              Pending Approvals
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-[#f09562]">
              {pendingVendors.length}
            </p>
            <p className="text-[10px] text-[#f09562] mt-0.5 font-bold">Requires FSSAI & Bank Review</p>
          </div>

          <div className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-3.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98b3a0]">
              Active Kitchen Outlets
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-[#55cf79]">
              {activeVendors.length}
            </p>
            <p className="text-[10px] text-[#98b3a0] mt-0.5">Across 4 Tech Park Hubs</p>
          </div>

          <div className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-3.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98b3a0]">
              Active Kitchen Orders
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-white">
              {activeOrdersCount}
            </p>
            <p className="text-[10px] text-[#98b3a0] mt-0.5 font-mono">Avg prep: 8.4 mins</p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-2 border-b border-[#2d3a31] pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: "approvals", label: "Vendor Approvals", count: pendingVendors.length, icon: FileCheck },
            { id: "orders_monitor", label: "Live Orders Monitor", count: orders.length, icon: Radio },
            { id: "vendors", label: "Canteen Directory", count: vendors.length, icon: Store },
            { id: "settlements", label: "Daily Payout Batches", count: "11:30 PM", icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#ed6c2d] text-white shadow-md"
                    : "bg-[#242d27] text-[#98b3a0] hover:bg-[#2b372f] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isSelected ? "bg-black/20 text-white" : "bg-[#1b231d] text-[#78c991]"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content: Approvals Queue */}
        {activeTab === "approvals" && (
          <section className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#98b3a0]">
                Pending Vendor Onboarding Applications ({pendingVendors.length})
              </h2>
              <span className="text-[11px] text-[#718b79]">
                Mandatory: Verify 14-digit FSSAI food license & bank settlement account
              </span>
            </div>

            {pendingVendors.map((vendor) => (
              <article
                key={vendor.id}
                className="rounded-2xl border border-[#3b4b40] bg-[#242d27] p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#36443a] text-lg font-black text-[#f09562]">
                      {vendor.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">{vendor.name}</h3>
                        <span className="rounded-md bg-[#443024] px-2 py-0.5 text-[10px] font-bold text-[#f7a272]">
                          Needs Review
                        </span>
                      </div>
                      <p className="text-xs text-[#98b3a0] mt-0.5">{vendor.campus}</p>
                      <p className="text-xs text-[#6e8574] mt-0.5">
                        Owner: <strong>{vendor.ownerName}</strong> ({vendor.phone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingVendor(vendor)}
                      className="rounded-xl border border-[#3f5245] px-3 py-2 text-xs font-bold text-[#b9e5c5] hover:bg-[#2d3a31]"
                    >
                      View KYC Docs
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingVendor(vendor)}
                      className="rounded-xl border border-[#5a2e28] bg-[#3a1d1a] px-3 py-2 text-xs font-bold text-[#f87171] hover:bg-[#4a2420]"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(vendor.id, vendor.name)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#2d8442] px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-[#256c36]"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve Vendor</span>
                    </button>
                  </div>
                </div>

                {/* Verification Check List */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-xl bg-[#1c231e] p-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#718b79] block">
                      FSSAI Food License (14-Digit)
                    </span>
                    <span className="font-mono text-xs font-extrabold text-[#98e2ac]">
                      {vendor.fssaiNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#718b79] block">
                      Bank Settlement (Penny-Dropped)
                    </span>
                    <span className="font-mono text-xs font-semibold text-white">
                      {vendor.bankAccount} · {vendor.ifsc}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#718b79] block">
                      UPI Settlement VPA
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#f09562]">
                      {vendor.upiId}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {pendingVendors.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#344237] bg-[#222a24] p-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-[#4ed976] mb-2" />
                <h3 className="text-base font-bold text-white">Approvals Queue is Clear</h3>
                <p className="text-xs text-[#829c8b] mt-1">
                  All food vendors on TakeOnTime are verified and active for prepaid orders.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Tab Content: Live Orders Monitor */}
        {activeTab === "orders_monitor" && (
          <section className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#98b3a0]">
                Cross-Platform Realtime Orders Stream ({orders.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4ed976] animate-ping" />
                <span className="text-[11px] font-mono text-[#829c8b]">Supabase Realtime Synced</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2d3a31] bg-[#242d27] p-3.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1c231e] font-mono font-bold text-[#f09562]">
                      #{order.id.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{order.customer}</span>
                        <span className="font-mono text-[11px] text-[#718b79]">({order.phone})</span>
                      </div>
                      <p className="text-[#98b3a0]">
                        Counter: <strong className="text-white">{order.vendorName}</strong> · Pickup Window: {order.pickupRange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono text-sm font-black text-white">{order.amount}</span>
                      <span className="block font-mono text-[10px] text-[#55cf79]">Razorpay Verified</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-[#1c231e] px-2 py-1 font-mono text-xs font-extrabold text-[#7fe09b]">
                        OTP: {order.otp}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                          order.status === "new"
                            ? "bg-[#542d18] text-[#f7a272]"
                            : order.status === "in-progress"
                            ? "bg-[#1e4630] text-[#7fe09b]"
                            : order.status === "ready"
                            ? "bg-[#183942] text-[#8ce0f2]"
                            : "bg-[#2c332e] text-[#a4b5a8]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Content: Canteen Directory */}
        {activeTab === "vendors" && (
          <section className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#98b3a0]">
                All Onboarded Canteens & Kitchens ({vendors.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-4 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{v.name}</h3>
                      <p className="text-[11px] text-[#98b3a0]">{v.campus}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.isApproved ? "bg-[#1e4630] text-[#7fe09b]" : "bg-[#443024] text-[#f7a272]"
                      }`}
                    >
                      {v.isApproved ? "Active" : "Pending"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#1c231e] p-2.5 space-y-1 text-[#98b3a0]">
                    <div className="flex justify-between">
                      <span>Cuisine</span>
                      <strong className="text-white">{v.cuisine}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>FSSAI License</span>
                      <strong className="font-mono text-white">{v.fssaiNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Today&apos;s Gross Volume</span>
                      <strong className="font-mono text-[#7fe09b]">₹{v.todaySales}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        takeOnTimeStore.toggleVendorOpen(v.id);
                        notify(`Toggled store open/close for ${v.name}`);
                      }}
                      className="rounded-xl border border-[#3f5245] px-3 py-1.5 text-xs font-semibold text-[#b9e5c5] hover:bg-[#2d3a31]"
                    >
                      {v.isOpen ? "Close Temporarily" : "Re-open Counter"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) onNavigate("vendor-flow/VendorDashboard");
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#ed6c2d] hover:underline"
                    >
                      <span>Vendor View</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Content: Daily Payout Batches */}
        {activeTab === "settlements" && (
          <section className="mt-4 space-y-3.5">
            <div className="rounded-2xl border border-[#2d3a31] bg-[#242d27] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#313f35]">
                <div>
                  <h3 className="text-base font-black text-white">Daily 11:30 PM Settlement Cycle</h3>
                  <p className="text-xs text-[#98b3a0] mt-0.5">
                    Automated NEFT / IMPS disbursement via Razorpay Route to vendor accounts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => notify("Manual settlement run triggered successfully. Bank ACK: OK.")}
                  className="rounded-xl bg-[#ed6c2d] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#db5e20]"
                >
                  Trigger Instant Payout Batch
                </button>
              </div>

              <div className="mt-4 divide-y divide-[#2d3a31] text-xs">
                {activeVendors.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-white text-sm">{v.name}</p>
                      <p className="text-[#718b79] font-mono text-[11px]">
                        {v.bankAccount} · IFSC: {v.ifsc}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base font-black text-[#7fe09b]">
                        ₹{v.todaySales}
                      </span>
                      <span className="block text-[10px] text-[#98b3a0]">Net Payout (0% fee)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Inspect Vendor KYC Modal */}
        {inspectingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-[#242d27] p-6 shadow-2xl border border-[#3b4b40] text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#334237]">
                <h3 className="text-base font-black text-white">KYC & Compliance Dossier</h3>
                <button
                  type="button"
                  onClick={() => setInspectingVendor(null)}
                  className="p-1 text-[#829c8b] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-[#1c231e] p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#718b79] block">
                    Entity & Campus Location
                  </span>
                  <p className="text-sm font-extrabold text-white mt-0.5">{inspectingVendor.name}</p>
                  <p className="text-[#98b3a0] mt-0.5">{inspectingVendor.campus}</p>
                </div>

                <div className="rounded-xl bg-[#1c231e] p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#718b79] block">
                    FSSAI Food License Certificate
                  </span>
                  <p className="font-mono text-sm font-bold text-[#7fe09b] mt-0.5">
                    {inspectingVendor.fssaiNumber}
                  </p>
                  <p className="text-[10px] text-[#55cf79] mt-0.5 font-semibold">
                    ✓ Validated against Food Safety and Standards Authority of India database
                  </p>
                </div>

                <div className="rounded-xl bg-[#1c231e] p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#718b79] block">
                    Bank Account & Penny-Drop Status
                  </span>
                  <p className="font-mono text-sm text-white mt-0.5">{inspectingVendor.bankAccount}</p>
                  <p className="font-mono text-[11px] text-[#98b3a0]">
                    IFSC: {inspectingVendor.ifsc} · UPI: {inspectingVendor.upiId}
                  </p>
                  <p className="text-[10px] text-[#7fe09b] mt-0.5 font-semibold">
                    ✓ ₹1 penny-drop test successful. Name match: {inspectingVendor.ownerName}.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingVendor(null)}
                  className="flex-1 rounded-xl border border-[#3f5245] py-2.5 text-xs font-bold text-[#b9e5c5]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(inspectingVendor.id, inspectingVendor.name);
                    setInspectingVendor(null);
                  }}
                  className="flex-1 rounded-xl bg-[#2d8442] py-2.5 text-xs font-black text-white hover:bg-[#256c36]"
                >
                  Approve Outlet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Vendor Modal */}
        {rejectingVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#242d27] p-5 shadow-2xl border border-[#5a2e28] text-xs">
              <div className="flex items-center gap-2 text-[#f87171] mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm">Decline {rejectingVendor.name}?</h3>
              </div>
              <p className="text-[#98b3a0] leading-relaxed">
                Provide a reason for rejection. The vendor will receive an in-app notice under{" "}
                <code className="text-[#f7a272]">AccountIssuePage</code> with instructions to fix it.
              </p>

              <div className="mt-3 space-y-1.5">
                {[
                  "Incomplete FSSAI license documentation",
                  "Bank account holder name mismatch",
                  "Campus canteen agreement pending clearance",
                  "Outlet menu prices exceed campus cap",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`w-full rounded-lg border p-2 text-left text-xs font-semibold ${
                      rejectReason === reason
                        ? "border-[#f87171] bg-[#3a1d1a] text-[#f87171]"
                        : "border-[#3b4b40] bg-[#1c231e] text-[#98b3a0]"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingVendor(null)}
                  className="flex-1 rounded-xl border border-[#3f5245] py-2 text-xs font-bold text-[#b9e5c5]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="flex-1 rounded-xl bg-[#c93f30] py-2 text-xs font-bold text-white hover:bg-[#b03224]"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminConsole;
