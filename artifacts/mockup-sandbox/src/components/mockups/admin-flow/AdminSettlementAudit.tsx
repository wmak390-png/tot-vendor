import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Landmark,
  Layers,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

type VendorSettlementEntry = {
  vendorId: string;
  vendorName: string;
  bankAccount: string;
  ifsc: string;
  ordersCount: number;
  grossSales: number;
  platformFee: number; // 8%
  pgFee: number; // 1.8%
  netPayout: number;
  utrNumber: string;
  status: "credited" | "processing" | "retry_needed";
};

const mockVendorSettlements: VendorSettlementEntry[] = [
  {
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    bankAccount: "••••••••7291 (HDFC)",
    ifsc: "HDFC0001234",
    ordersCount: 18,
    grossSales: 4890,
    platformFee: 391,
    pgFee: 88,
    netPayout: 4411,
    utrNumber: "Pending (11:30 PM Batch)",
    status: "processing",
  },
  {
    vendorId: "vendor_chai_point",
    vendorName: "Chai & Samosa Hub",
    bankAccount: "••••••••4812 (ICICI)",
    ifsc: "ICIC0000456",
    ordersCount: 26,
    grossSales: 3120,
    platformFee: 250,
    pgFee: 56,
    netPayout: 2814,
    utrNumber: "Pending (11:30 PM Batch)",
    status: "processing",
  },
  {
    vendorId: "vendor_dosa_corner",
    vendorName: "Royal Andhra Thali Co.",
    bankAccount: "••••••••3910 (SBI)",
    ifsc: "SBIN0004128",
    ordersCount: 14,
    grossSales: 3640,
    platformFee: 291,
    pgFee: 66,
    netPayout: 3283,
    utrNumber: "SBIN26250918001",
    status: "credited",
  },
  {
    vendorId: "vendor_healthy_bowl",
    vendorName: "Healthy Bowl Co.",
    bankAccount: "••••••••1190 (Axis)",
    ifsc: "UTIB0000918",
    ordersCount: 11,
    grossSales: 2450,
    platformFee: 196,
    pgFee: 44,
    netPayout: 2210,
    utrNumber: "Failed (NPCI Bank Timeout)",
    status: "retry_needed",
  },
];

export function AdminSettlementAudit({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [entries, setEntries] = useState<VendorSettlementEntry[]>(mockVendorSettlements);
  const [runningBatch, setRunningBatch] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalGross = entries.reduce((s, e) => s + e.grossSales, 0);
  const totalPlatformCut = entries.reduce((s, e) => s + e.platformFee, 0);
  const totalPGCut = entries.reduce((s, e) => s + e.pgFee, 0);
  const totalNetVendor = entries.reduce((s, e) => s + e.netPayout, 0);

  const handleTriggerManualBatch = () => {
    setRunningBatch(true);
    setTimeout(() => {
      setRunningBatch(false);
      setEntries((prev) =>
        prev.map((item) => ({
          ...item,
          status: "credited",
          utrNumber: `RZP${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        }))
      );
      notify("Executed Razorpay Route automated settlement batch! All vendor payouts disbursed.");
    }, 1500);
  };

  const handleRetryFailed = (vendorId: string) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.vendorId !== vendorId) return item;
        return {
          ...item,
          status: "credited",
          utrNumber: `RZP${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        };
      })
    );
    notify("Transfer retried and confirmed via Axis Bank IMPS gateway!");
  };

  return (
    <main className="min-h-screen w-full bg-[#161c18] text-[#e8f0eb] p-3 sm:p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#0b100d] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
            <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#293c2d] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#15803d] shadow-md">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Automated Settlement Batches</h1>
                <span className="rounded-full bg-[#1b3422] px-2.5 py-0.5 text-xs font-semibold text-[#4ed976] border border-[#2c5335]">
                  Daily 11:30 PM Auto-Cycle
                </span>
              </div>
              <p className="text-xs text-[#8a9e8f]">
                Razorpay Route multi-vendor split settlements with automated IMPS/NEFT disbursements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={runningBatch}
              onClick={handleTriggerManualBatch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {runningBatch ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
              {runningBatch ? "Executing Transfers..." : "Force Execute Batch Payout"}
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("admin-flow/AdminConsole")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#223126] hover:bg-[#2b3e30] text-[#b0c7b5] border border-[#304736] transition-colors"
              >
                Back to Admin Console
              </button>
            )}
          </div>
        </header>

        {/* Top KPI Metrics */}
        <section aria-label="Settlement Financial Overview" className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-[#1b251e] border border-[#2b3c2f] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Total Gross GMV Today</div>
            <div className="text-2xl font-black text-white">₹{totalGross.toLocaleString()}</div>
            <div className="text-[11px] text-[#4ed976] mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> 69 campus orders
            </div>
          </div>

          <div className="rounded-2xl bg-[#1b251e] border border-[#2b3c2f] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">TakeOnTime Commission (8%)</div>
            <div className="text-2xl font-black text-[#f09562]">₹{totalPlatformCut.toLocaleString()}</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">Platform operational revenue</div>
          </div>

          <div className="rounded-2xl bg-[#1b251e] border border-[#2b3c2f] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Payment Gateway Fees (1.8%)</div>
            <div className="text-2xl font-black text-white">₹{totalPGCut.toLocaleString()}</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">Razorpay UPI processing cost</div>
          </div>

          <div className="rounded-2xl bg-[#1b251e] border border-[#2b3c2f] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Net Disbursed to Vendors</div>
            <div className="text-2xl font-black text-[#4ed976]">₹{totalNetVendor.toLocaleString()}</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">Direct to verified current accounts</div>
          </div>
        </section>

        {/* Batch Table */}
        <section aria-label="Vendor Breakdown Table" className="rounded-2xl bg-[#18221b] border border-[#28382c] overflow-hidden">
          <div className="p-4 border-b border-[#253528] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Vendor Daily Disbursement Ledger</h2>
              <p className="text-xs text-[#8a9e8f]">Cycle: 07 Sep 2026 · Batch #BATCH-20260907-2330</p>
            </div>

            <button
              type="button"
              onClick={() => notify("Exported accounting ledger for Tally / SAP")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#223126] text-[#b3cbb7] border border-[#314837] hover:bg-[#2c3d2f]"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#4ed976]" />
              Export Full Report (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#131b15] text-[#8a9e8f] border-b border-[#253528]">
                <tr>
                  <th className="p-3.5 font-semibold">Vendor & Bank Account</th>
                  <th className="p-3.5 font-semibold">Orders</th>
                  <th className="p-3.5 font-semibold">Gross Sales</th>
                  <th className="p-3.5 font-semibold">Platform (8%)</th>
                  <th className="p-3.5 font-semibold">Net Payout</th>
                  <th className="p-3.5 font-semibold">Status / UTR</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233126]">
                {entries.map((item) => (
                  <tr key={item.vendorId} className="hover:bg-[#1d2920] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{item.vendorName}</div>
                      <div className="text-[11px] text-[#8a9e8f] mt-0.5">
                        {item.bankAccount} · <span className="font-mono text-white">{item.ifsc}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#b0c4b4] font-medium">{item.ordersCount} orders</td>
                    <td className="p-3.5 font-bold text-white">₹{item.grossSales}</td>
                    <td className="p-3.5 text-[#f09562] font-semibold">-₹{item.platformFee}</td>
                    <td className="p-3.5 font-black text-[#4ed976] text-sm">₹{item.netPayout}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          item.status === "credited"
                            ? "bg-[#183420] text-[#4ed976] border border-[#2b5235]"
                            : item.status === "processing"
                            ? "bg-[#332212] text-[#fbbf24] border border-[#593e21]"
                            : "bg-[#331515] text-[#f87171] border border-[#592323]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "credited" ? "bg-[#4ed976]" : item.status === "processing" ? "bg-[#fbbf24]" : "bg-[#f87171]"
                          }`}
                        ></span>
                        {item.status.toUpperCase()}
                      </span>
                      <div className="font-mono text-[10px] text-[#718576] mt-1">{item.utrNumber}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status === "retry_needed" ? (
                        <button
                          type="button"
                          onClick={() => handleRetryFailed(item.vendorId)}
                          className="px-2.5 py-1 rounded bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold transition-all shadow-sm"
                        >
                          Retry Transfer
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#4ed976] font-medium">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminSettlementAudit;
