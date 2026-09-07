import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  History,
  Info,
  Landmark,
  Layers,
  Receipt,
  RotateCw,
  Search,
  ShieldCheck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

type SettlementBatch = {
  id: string;
  date: string;
  ordersCount: number;
  grossGMV: number;
  platformFee: number;
  pgCharges: number;
  tds: number;
  netPayout: number;
  utrNumber: string;
  status: "credited" | "processing" | "scheduled";
  bankAccount: string;
};

const mockSettlements: SettlementBatch[] = [
  {
    id: "SET-20260907",
    date: "Today, 07 Sep 2026",
    ordersCount: 18,
    grossGMV: 4890,
    platformFee: 391, // 8%
    pgCharges: 88, // 1.8%
    tds: 49, // 1%
    netPayout: 4362,
    utrNumber: "Pending (Auto at 11:30 PM)",
    status: "scheduled",
    bankAccount: "HDFC Bank (••••7291)",
  },
  {
    id: "SET-20260906",
    date: "Yesterday, 06 Sep 2026",
    ordersCount: 34,
    grossGMV: 9140,
    platformFee: 731,
    pgCharges: 165,
    tds: 91,
    netPayout: 8153,
    utrNumber: "HDFCN26250918274",
    status: "credited",
    bankAccount: "HDFC Bank (••••7291)",
  },
  {
    id: "SET-20260905",
    date: "05 Sep 2026",
    ordersCount: 41,
    grossGMV: 11200,
    platformFee: 896,
    pgCharges: 202,
    tds: 112,
    netPayout: 9990,
    utrNumber: "HDFCN26249910482",
    status: "credited",
    bankAccount: "HDFC Bank (••••7291)",
  },
  {
    id: "SET-20260904",
    date: "04 Sep 2026",
    ordersCount: 29,
    grossGMV: 7850,
    platformFee: 628,
    pgCharges: 141,
    tds: 79,
    netPayout: 7002,
    utrNumber: "HDFCN26248901823",
    status: "credited",
    bankAccount: "HDFC Bank (••••7291)",
  },
];

export function VendorSettlements({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [batches, setBatches] = useState<SettlementBatch[]>(mockSettlements);
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Bank Form State
  const [newAcc, setNewAcc] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [pennyDropSuccess, setPennyDropSuccess] = useState(false);
  const [verifyingBank, setVerifyingBank] = useState(false);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadInvoice = (batchId: string) => {
    notify(`Downloaded GST Tax Invoice for Batch #${batchId}`);
  };

  const handleDownloadCsv = () => {
    notify("Exported settlement reconciliation CSV ledger for September 2026");
  };

  const handleTriggerPennyDrop = () => {
    if (!newAcc || !newIfsc) {
      notify("Please provide valid Account number and IFSC code");
      return;
    }
    setVerifyingBank(true);
    setTimeout(() => {
      setVerifyingBank(false);
      setPennyDropSuccess(true);
      notify("Penny Drop Verified! ₹1.00 deposited. Registered Name: Little Fern Food LLP");
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full bg-[#171d18] text-[#e8f0eb] p-3 sm:p-6 font-sans">
      <div className="mx-auto max-w-5xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#0e1310] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
            <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#28382c] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2e7d32] shadow-md">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Daily Payouts & Settlements</h1>
                <span className="rounded-full bg-[#1b3422] px-2.5 py-0.5 text-xs font-semibold text-[#4ed976] border border-[#2c5335]">
                  T+0 Same Day Settlement
                </span>
              </div>
              <p className="text-xs text-[#8a9e8f]">
                Automated 11:30 PM NEFT/IMPS cycle · Direct transfer to verified current account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#212c23] hover:bg-[#2c3a2f] text-[#b3c7b8] border border-[#304234] transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#4ed976]" />
              Export CSV Ledger
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("vendor-flow/VendorDashboard")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ed6c2d] hover:bg-[#d95d20] text-white transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </header>

        {/* Summary Metric Cards */}
        <section aria-label="Settlement KPIs" className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-[#1d2720] border border-[#2d3e31] p-4">
            <div className="flex items-center justify-between text-xs text-[#8a9e8f] mb-1">
              <span>Today's Net Accrual</span>
              <span className="h-2 w-2 rounded-full bg-[#4ed976] animate-ping"></span>
            </div>
            <div className="text-2xl font-black text-white">₹4,362</div>
            <div className="text-[11px] text-[#4ed976] mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Scheduled for 11:30 PM tonight
            </div>
          </div>

          <div className="rounded-2xl bg-[#1d2720] border border-[#2d3e31] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Lifetime Transferred</div>
            <div className="text-2xl font-black text-[#93c5fd]">₹1,84,320</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">100% on-time settlement record</div>
          </div>

          <div className="rounded-2xl bg-[#1d2720] border border-[#2d3e31] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Platform Take Rate</div>
            <div className="text-2xl font-black text-[#f09562]">8.0%</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">Order-ahead canteen tier</div>
          </div>

          <div className="rounded-2xl bg-[#1d2720] border border-[#2d3e31] p-4">
            <div className="text-xs text-[#8a9e8f] mb-1">Payment Gateway Rate</div>
            <div className="text-2xl font-black text-white">1.8%</div>
            <div className="text-[11px] text-[#8a9e8f] mt-1">Razorpay UPI & Cards pass-through</div>
          </div>
        </section>

        {/* Bank Details Card */}
        <section aria-label="Registered Settlement Account" className="rounded-2xl bg-[#1a251d] border border-[#2b3c2f] p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#233327] border border-[#324a38]">
                <Building2 className="h-5 w-5 text-[#4ed976]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">HDFC Bank Limited · Current Account</h3>
                  <span className="inline-flex items-center gap-1 rounded bg-[#162e1c] px-2 py-0.5 text-[10px] font-bold text-[#4ed976] border border-[#2b5435]">
                    <ShieldCheck className="h-3 w-3" /> PENNY-DROP VERIFIED
                  </span>
                </div>
                <p className="text-xs text-[#8a9e8f] mt-0.5">
                  A/C: <span className="font-mono text-white">50200048197291</span> · IFSC:{" "}
                  <span className="font-mono text-white">HDFC0001234</span> · Beneficiary: Little Fern Food LLP
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBankModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#263328] hover:bg-[#314234] text-[#b5cbba] border border-[#384c3c] transition-colors"
            >
              Update Bank Details
            </button>
          </div>
        </section>

        {/* Settlements Table */}
        <section aria-label="Settlement Batches" className="rounded-2xl bg-[#18211b] border border-[#28392d] overflow-hidden">
          <div className="p-4 border-b border-[#253528] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Daily Settlement Batches</h2>
              <p className="text-xs text-[#8a9e8f]">Click any batch row to inspect itemized order calculations</p>
            </div>
            <span className="text-xs font-semibold text-[#4ed976] bg-[#1a2d1f] px-2.5 py-1 rounded-lg border border-[#2d4e36]">
              Auto-Batching Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141b16] text-[#8a9e8f] border-b border-[#253528]">
                <tr>
                  <th className="p-3.5 font-semibold">Date & Batch ID</th>
                  <th className="p-3.5 font-semibold">Orders</th>
                  <th className="p-3.5 font-semibold">Gross GMV</th>
                  <th className="p-3.5 font-semibold">Platform Fee (8%)</th>
                  <th className="p-3.5 font-semibold">Net Payout</th>
                  <th className="p-3.5 font-semibold">Status / UTR</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233126]">
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className="hover:bg-[#1d2920] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-white">{batch.date}</div>
                      <div className="font-mono text-[11px] text-[#718576]">{batch.id}</div>
                    </td>
                    <td className="p-3.5 text-[#b0c4b4] font-medium">{batch.ordersCount} orders</td>
                    <td className="p-3.5 font-bold text-white">₹{batch.grossGMV.toLocaleString()}</td>
                    <td className="p-3.5 text-[#f09562] font-semibold">-₹{batch.platformFee}</td>
                    <td className="p-3.5 font-black text-[#4ed976] text-sm">₹{batch.netPayout.toLocaleString()}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            batch.status === "credited" ? "bg-[#4ed976]" : "bg-[#f59e0b]"
                          }`}
                        ></span>
                        <span className="capitalize font-semibold text-white">{batch.status}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#8a9e8f] mt-0.5">{batch.utrNumber}</div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(batch.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#243327] hover:bg-[#2d4031] text-[#9fc7a6] border border-[#314636] transition-colors"
                        title="Download Tax Invoice"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selected Batch Drilldown Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#19231c] border border-[#2c3e30] p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-[#293c2d] pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-base">Settlement Batch Breakdown</h3>
                  <p className="text-xs text-[#8a9e8f] font-mono">{selectedBatch.id} · {selectedBatch.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="p-1.5 rounded-lg text-[#8a9e8f] hover:bg-[#233126]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Math Reconciliation Ledger */}
              <div className="space-y-3 bg-[#131b15] p-4 rounded-xl border border-[#243427] text-xs mb-4">
                <div className="flex justify-between font-medium">
                  <span className="text-[#8a9e8f]">Gross Food Sales (Customer payments)</span>
                  <span className="font-bold text-white">₹{selectedBatch.grossGMV}</span>
                </div>
                <div className="flex justify-between font-medium text-[#f09562]">
                  <span>TakeOnTime Canteen Platform Fee (8%)</span>
                  <span>-₹{selectedBatch.platformFee}</span>
                </div>
                <div className="flex justify-between font-medium text-[#f09562]">
                  <span>Razorpay Payment Gateway Fee (1.8% + GST)</span>
                  <span>-₹{selectedBatch.pgCharges}</span>
                </div>
                <div className="flex justify-between font-medium text-[#93c5fd]">
                  <span>Income Tax TDS (Section 194-O, 1%)</span>
                  <span>-₹{selectedBatch.tds}</span>
                </div>
                <div className="border-t border-[#293c2e] pt-2 flex justify-between font-extrabold text-sm">
                  <span className="text-[#4ed976]">Net Disbursed to Bank Account</span>
                  <span className="text-[#4ed976]">₹{selectedBatch.netPayout}</span>
                </div>
              </div>

              <div className="bg-[#17241b] border border-[#2b4432] p-3 rounded-xl text-xs space-y-1 mb-5">
                <div className="text-[#8bf2a9] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#4ed976]" /> Payout Destination
                </div>
                <p className="text-[#8a9e8f]">
                  Transferred via NEFT to <span className="text-white font-medium">{selectedBatch.bankAccount}</span>.
                </p>
                <p className="text-[11px] text-[#718576] font-mono">Reference UTR: {selectedBatch.utrNumber}</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedBatch.id)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="h-4 w-4" /> Download GST Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#233126] hover:bg-[#2c3d2f] text-[#b0c4b4]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bank Account Update Modal */}
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-[#19231c] border border-[#2c3e30] p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-[#293c2d] pb-3 mb-4">
                <h3 className="font-bold text-base">Change Settlement Account</h3>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="p-1 text-[#8a9e8f] hover:bg-[#233126] rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="block text-[#8a9e8f] mb-1 font-semibold">New Account Number</label>
                  <input
                    type="text"
                    value={newAcc}
                    onChange={(e) => setNewAcc(e.target.value)}
                    placeholder="e.g. 50200098124501"
                    className="w-full bg-[#121814] border border-[#2c3f30] rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#4ed976]"
                  />
                </div>

                <div>
                  <label className="block text-[#8a9e8f] mb-1 font-semibold">Bank IFSC Code</label>
                  <input
                    type="text"
                    value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0000128"
                    className="w-full bg-[#121814] border border-[#2c3f30] rounded-xl px-3 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-[#4ed976]"
                  />
                </div>

                {pennyDropSuccess && (
                  <div className="rounded-xl bg-[#152e1c] border border-[#295634] p-3 text-[#8bf2a9]">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-[#4ed976]" /> Penny Drop Success!
                    </div>
                    <p className="text-[11px] text-[#a4c7ad] mt-1">
                      NPCI verified account holder: <strong className="text-white">Little Fern Food LLP</strong>. Ready to switch.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!pennyDropSuccess ? (
                  <button
                    type="button"
                    disabled={verifyingBank}
                    onClick={handleTriggerPennyDrop}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#2e7d32] hover:bg-[#256628] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {verifyingBank ? <RotateCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {verifyingBank ? "Verifying with NPCI..." : "Run ₹1.00 Penny Drop"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowBankModal(false);
                      notify("Updated settlement bank account successfully!");
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white cursor-pointer shadow-md"
                  >
                    Confirm & Save Account
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#233126] hover:bg-[#2c3d2f] text-[#b0c4b4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default VendorSettlements;
