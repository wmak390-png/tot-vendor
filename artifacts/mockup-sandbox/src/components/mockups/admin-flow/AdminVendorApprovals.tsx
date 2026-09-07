import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Landmark,
  Layers,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  User,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, type Vendor } from "@/lib/takeontime-store";

export function AdminVendorApprovals({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [vendors, setVendors] = useState<Vendor[]>(takeOnTimeStore.getVendors());
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(
    vendors.find((v) => !v.isApproved) || vendors[0]
  );
  const [activeDocTab, setActiveDocTab] = useState<"fssai" | "gst" | "bank" | "hygiene">("fssai");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("FSSAI License registration document blurry or unverified");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (v: Vendor) => {
    takeOnTimeStore.approveVendor(v.id);
    setVendors(takeOnTimeStore.getVendors());
    setSelectedVendor({ ...v, isApproved: true, approvalStatus: "approved" });
    notify(`Approved ${v.name}! Outlet is now live on tech park student & employee kiosks.`);
  };

  const handleConfirmReject = () => {
    if (!selectedVendor) return;
    takeOnTimeStore.rejectVendor(selectedVendor.id, rejectReason);
    setVendors(takeOnTimeStore.getVendors());
    setSelectedVendor({
      ...selectedVendor,
      isApproved: false,
      approvalStatus: "rejected",
      rejectionReason: rejectReason,
    });
    setRejectModalOpen(false);
    notify(`Sent compliance revision notice to ${selectedVendor.name}.`);
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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ed6c2d] shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Vendor KYC & Compliance Audit</h1>
                <span className="rounded-full bg-[#322312] px-2.5 py-0.5 text-xs font-semibold text-[#f59e0b] border border-[#523d21]">
                  FSSAI & Bank Verification HQ
                </span>
              </div>
              <p className="text-xs text-[#8a9e8f]">
                Strict food safety statutory verification before granting campus POS terminals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("admin-flow/AdminConsole")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#233327] hover:bg-[#2d4031] text-[#b0c7b5] border border-[#324937] transition-colors"
              >
                Back to Admin Console
              </button>
            )}
          </div>
        </header>

        {/* Split View: Vendor Queue Left, Detailed Inspector Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Vendor List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8a9e8f] flex items-center justify-between">
              <span>Onboarding Applications ({vendors.length})</span>
              <span className="text-[#f09562]">
                {vendors.filter((v) => !v.isApproved && v.approvalStatus === "pending").length} Pending
              </span>
            </h2>

            <div className="space-y-2">
              {vendors.map((v) => {
                const isSelected = selectedVendor?.id === v.id;
                const isPending = !v.isApproved && v.approvalStatus === "pending";
                const isApproved = v.isApproved;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVendor(v)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#212f25] border-[#4ed976] shadow-md"
                        : "bg-[#1a231d] border-[#293a2d] hover:bg-[#1f2b23]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm text-white">{v.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isApproved
                            ? "bg-[#183420] text-[#4ed976] border border-[#2d5236]"
                            : isPending
                            ? "bg-[#332212] text-[#fbbf24] border border-[#593e21]"
                            : "bg-[#331515] text-[#f87171] border border-[#592323]"
                        }`}
                      >
                        {v.approvalStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#8a9e8f] mt-1">{v.campus}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#28382c] text-[11px] text-[#718576]">
                      <span>FSSAI: {v.fssaiNumber}</span>
                      <span className="text-[#b0c4b4]">{v.ownerName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep-Dive Document Inspection Workbench */}
          {selectedVendor ? (
            <div className="lg:col-span-8 rounded-2xl bg-[#19231c] border border-[#2b3d2f] p-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#283b2d] pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{selectedVendor.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        selectedVendor.isApproved
                          ? "bg-[#183420] text-[#4ed976] border border-[#2d5236]"
                          : "bg-[#332212] text-[#fbbf24] border border-[#593e21]"
                      }`}
                    >
                      {selectedVendor.approvalStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a9e8f] mt-0.5">
                    {selectedVendor.campus} · Operated by {selectedVendor.ownerName} ({selectedVendor.phone})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedVendor.isApproved ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedVendor)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2e7d32] hover:bg-[#256628] text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
                      >
                        <Check className="h-4 w-4" /> Approve & Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#381e1e] hover:bg-[#482525] text-[#fca5a5] border border-[#582d2d] transition-colors cursor-pointer"
                      >
                        Decline / Audit Flag
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4ed976] bg-[#162f1d] px-3 py-1.5 rounded-xl border border-[#2b5235]">
                      <CheckCircle2 className="h-4 w-4" /> Live Verified Outlet
                    </span>
                  )}
                </div>
              </div>

              {/* Document Tabs */}
              <div className="flex border-b border-[#283b2d] mb-4 gap-1">
                {[
                  { id: "fssai", label: "FSSAI Food License", icon: ShieldCheck },
                  { id: "bank", label: "Bank & Penny Drop", icon: Landmark },
                  { id: "gst", label: "GSTIN & Trade Reg", icon: FileCheck },
                  { id: "hygiene", label: "Kitchen Hygiene Photos", icon: Utensils },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveDocTab(t.id as unknown as "fssai" | "gst" | "bank" | "hygiene")}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                        activeDocTab === t.id
                          ? "border-[#ed6c2d] text-white bg-[#222e25]"
                          : "border-transparent text-[#8a9e8f] hover:text-white"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: FSSAI Audit */}
              {activeDocTab === "fssai" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#131a15] border border-[#243427] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs font-bold text-white">Government FSSAI License Number</div>
                        <div className="text-lg font-mono font-black text-[#4ed976] mt-0.5">
                          {selectedVendor.fssaiNumber}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4ed976] bg-[#162e1c] px-2.5 py-1 rounded-lg border border-[#2b5435]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> FOSCOS Portal Validated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#8a9e8f] border-t border-[#233326] pt-3">
                      <div>
                        <span className="text-[10px] text-[#637968] block">Issued Entity:</span>
                        <strong className="text-white">{selectedVendor.name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#637968] block">Expiry Date:</span>
                        <strong className="text-white">31 Dec 2028</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#637968] block">License Category:</span>
                        <strong className="text-white">Food Services (Canteen)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Visual Document Mockup Preview */}
                  <div className="rounded-xl bg-[#131b15] border border-[#253629] p-6 text-center">
                    <FileText className="h-10 w-10 text-[#49624f] mx-auto mb-2" />
                    <div className="text-xs font-bold text-white">FSSAI_Certificate_Scan_2026.pdf</div>
                    <p className="text-[11px] text-[#8a9e8f] mt-0.5">
                      Digitally signed official Form C issued by Department of Food Safety Karnataka.
                    </p>
                    <button
                      type="button"
                      onClick={() => notify("Viewing verified Government PDF in sandbox")}
                      className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#223126] text-[#8bf2a9] border border-[#2e4434] inline-flex items-center gap-1.5 hover:bg-[#2b3d2f]"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Full Document
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Bank & Penny Drop */}
              {activeDocTab === "bank" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#131a15] border border-[#243427] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs font-bold text-white">Settlement Account</div>
                        <div className="text-sm font-mono font-bold text-white mt-0.5">
                          {selectedVendor.bankAccount}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4ed976] bg-[#162e1c] px-2.5 py-1 rounded-lg border border-[#2b5435]">
                        <ShieldCheck className="h-3.5 w-3.5" /> ₹1.00 Penny Drop Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-[#8a9e8f] border-t border-[#233326] pt-3">
                      <div>
                        <span className="text-[10px] text-[#637968] block">IFSC Code:</span>
                        <strong className="text-white font-mono">{selectedVendor.ifsc}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#637968] block">Beneficiary Name (NPCI Match):</span>
                        <strong className="text-[#4ed976]">{selectedVendor.ownerName} Food Services</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#17241b] border border-[#2a4431] p-3.5 text-xs text-[#a3c9ab] flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#4ed976] shrink-0 mt-0.5" />
                    <div>
                      <strong>Automated Daily 11:30 PM Transfer Ready:</strong>
                      <p className="text-[11px] text-[#8a9e8f] mt-0.5">
                        Razorpay Route linked account created. Net proceeds will settle automatically every night via IMPS.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: GSTIN */}
              {activeDocTab === "gst" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#131a15] border border-[#243427] p-4 text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#8a9e8f]">GSTIN Registration:</span>
                      <strong className="font-mono text-white text-sm">29ABCDE1234F1Z5</strong>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#8a9e8f]">Taxpayer Status:</span>
                      <strong className="text-[#4ed976]">Active Regular</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8a9e8f]">GST Return Filings (GSTR-3B):</span>
                      <strong className="text-white">Up-to-date (August 2026)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Kitchen Hygiene */}
              {activeDocTab === "hygiene" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#131b15] border border-[#253528] p-3 text-center">
                      <div className="h-28 bg-[#1e2b21] rounded-lg mb-2 flex items-center justify-center text-[#617967] text-xs">
                        [ Cooking Range & Exhaust Hood ]
                      </div>
                      <div className="text-xs font-bold text-white">Commercial Exhaust Cleanliness</div>
                      <span className="text-[10px] text-[#4ed976]">Passed visual inspection</span>
                    </div>

                    <div className="rounded-xl bg-[#131b15] border border-[#253528] p-3 text-center">
                      <div className="h-28 bg-[#1e2b21] rounded-lg mb-2 flex items-center justify-center text-[#617967] text-xs">
                        [ Cold Storage & Thermometer Log ]
                      </div>
                      <div className="text-xs font-bold text-white">Chiller Temp (&lt; 4°C)</div>
                      <span className="text-[10px] text-[#4ed976]">HACCP compliant</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-8 rounded-2xl bg-[#19231c] border border-[#2b3d2f] p-12 text-center">
              <Store className="h-10 w-10 text-[#4c6252] mx-auto mb-2" />
              <p className="text-xs text-[#8a9e8f]">Select an onboarding vendor to inspect compliance documents</p>
            </div>
          )}
        </div>

        {/* Rejection Modal */}
        {rejectModalOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-[#19231c] border border-[#3b2727] p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-[#2d3a30] pb-3 mb-4">
                <h3 className="font-bold text-base text-[#f87171]">Compliance Correction Request</h3>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="p-1 text-[#8a9e8f] hover:bg-[#253328] rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                <p className="text-[#a4b8a9]">
                  Specify the compliance deficiency for <strong>{selectedVendor.name}</strong>:
                </p>

                {[
                  "FSSAI License registration document blurry or unverified",
                  "Bank account beneficiary name differs from FSSAI company name",
                  "Missing Campus Canteen Tenancy allotment letter",
                  "Kitchen fire safety and hygiene clearance pending",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer ${
                      rejectReason === reason
                        ? "bg-[#331c1c] border-[#ef4444] text-[#fca5a5]"
                        : "bg-[#141b16] border-[#293a2e] text-[#8a9e8f]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reject"
                      checked={rejectReason === reason}
                      onChange={() => setRejectReason(reason)}
                      className="accent-[#ef4444]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#dc2626] hover:bg-[#b91c1c] text-white cursor-pointer shadow-md"
                >
                  Issue Correction Notice
                </button>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#233127] text-[#9db2a2]"
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

export default AdminVendorApprovals;
