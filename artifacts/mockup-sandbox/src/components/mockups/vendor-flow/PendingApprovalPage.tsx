import { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  Headphones,
  HelpCircle,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Store,
  Timer,
  Utensils,
  X,
} from "lucide-react";
import { takeOnTimeStore, type Vendor } from "@/lib/takeontime-store";

export function PendingApprovalPage({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [checking, setChecking] = useState(false);
  const [vendor, setVendor] = useState<Vendor>(takeOnTimeStore.getVendors()[0]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      const v = takeOnTimeStore.getVendors().find((x) => x.id === "vendor_little_fern");
      if (v) setVendor(v);
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefreshStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      notify("Status checked: Application is currently in Tier-1 FSSAI Compliance verification queue.");
    }, 1000);
  };

  const handleSimulateApproval = () => {
    takeOnTimeStore.approveVendor(vendor.id);
    notify("Admin approved! You now have full access to the Vendor Dashboard & Kitchen Queue.");
    if (onNavigate) {
      setTimeout(() => onNavigate("vendor-flow/VendorDashboard"), 1200);
    }
  };

  const handleSimulateRejection = () => {
    takeOnTimeStore.rejectVendor(vendor.id, "FSSAI Certificate image is blurry. Please re-upload page 1 with clear seal.");
    notify("Admin flagged document issue. Redirecting to Account Issue correction page...");
    if (onNavigate) {
      setTimeout(() => onNavigate("vendor-flow/AccountIssuePage"), 1200);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f9fa] px-4 py-8 text-[#1f2937] font-sans flex flex-col justify-between">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1f2937] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 border border-[#374151]">
          <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-md">
        {/* Header Branding */}
        <header className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff6b00] text-sm font-black text-white shadow-sm">
              to
            </span>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#111827]">TakeOnTime</span>
              <span className="ml-1.5 rounded-md bg-[#fff2e8] px-1.5 py-0.5 text-[10px] font-bold text-[#ff6b00]">
                VENDOR PORTAL
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate("vendor-flow/OnboardingAuth")}
            className="text-xs font-semibold text-[#6b7280] hover:text-[#111827] flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </header>

        {/* Main Status Hero */}
        <div className="rounded-2xl bg-white border border-[#e5e7eb] p-6 shadow-sm text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#fff7ed] border border-[#ffedd5] text-[#ff6b00]">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-bold text-[#92400e] border border-[#fde68a] mb-2">
            <Timer className="h-3.5 w-3.5" /> Verification in Progress
          </div>

          <h1 className="text-xl font-black tracking-tight text-[#111827]">
            Application Under Review
          </h1>
          <p className="text-xs text-[#6b7280] mt-1.5 leading-relaxed">
            Our campus compliance operations team is verifying your FSSAI license and bank payout credentials.
          </p>

          <div className="mt-5 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Outlet Name:</span>
              <span className="font-bold text-[#111827]">{vendor.name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Campus Food Court:</span>
              <span className="font-semibold text-[#111827]">{vendor.campus}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">FSSAI License:</span>
              <span className="font-mono font-bold text-[#111827]">{vendor.fssaiNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6b7280]">Turnaround Promise:</span>
              <span className="font-bold text-[#16a34a]">Within 24 Hours</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              disabled={checking}
              onClick={handleRefreshStatus}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking Compliance Server..." : "Check Status Now"}
            </button>

            <a
              href="https://wa.me/919845122910"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl text-xs font-bold bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#16a34a]" />
              Chat with TakeOnTime Ops on WhatsApp
            </a>
          </div>
        </div>

        {/* Demo Reviewer Controls */}
        <div className="mt-6 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#166534] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#16a34a]" /> Evaluator State Simulation
            </span>
            <span className="text-[10px] text-[#15803d] font-semibold">Test Transitions</span>
          </div>
          <p className="text-[#166534] text-[11px] mb-3 leading-normal">
            To test your router behavior without waiting 24 hours:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSimulateApproval}
              className="py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs shadow-sm transition-all"
            >
              Simulate Approve (Go to Dashboard)
            </button>
            <button
              type="button"
              onClick={handleSimulateRejection}
              className="py-2 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-sm transition-all"
            >
              Simulate Reject (Go to Issue Page)
            </button>
          </div>
        </div>
      </div>

      {/* Footer Support */}
      <footer className="mx-auto w-full max-w-md pt-6 text-center text-xs text-[#9ca3af]">
        <div className="flex items-center justify-center gap-4 text-[#6b7280]">
          <span className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5" /> Support: 1800-419-TIME
          </span>
          <span>·</span>
          <span>help@takeontime.in</span>
        </div>
      </footer>
    </main>
  );
}

export default PendingApprovalPage;
