import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Headphones,
  HelpCircle,
  Landmark,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  UploadCloud,
  X,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

export function AccountIssuePage({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [fssaiNumber, setFssaiNumber] = useState("11223344556677");
  const [ifsc, setIfsc] = useState("HDFC0001234");
  const [fileName, setFileName] = useState<string | null>("fssai_cert_signed.pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      takeOnTimeStore.approveVendor("vendor_little_fern");
      notify("Corrections submitted to Compliance desk! Status reset to under-review.");
      if (onNavigate) {
        setTimeout(() => onNavigate("vendor-flow/PendingApprovalPage"), 1200);
      }
    }, 1200);
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
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-6">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("vendor-flow/OnboardingAuth")}
            className="text-xs font-semibold text-[#6b7280] hover:text-[#111827] flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </button>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#dc2626] bg-[#fef2f2] px-2 py-0.5 rounded-full border border-[#fecaca]">
            <ShieldAlert className="h-3.5 w-3.5" /> Action Required
          </div>
        </header>

        {/* Issue Warning Card */}
        <div className="rounded-2xl bg-white border border-[#fecaca] p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
              <FileWarning className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#111827]">Account Setup Incomplete</h1>
              <p className="text-xs text-[#6b7280] mt-0.5">
                TakeOnTime Compliance flagged missing or unreadable documents.
              </p>
            </div>
          </div>

          {/* Reason Box */}
          <div className="mt-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3] p-3.5 text-xs text-[#9f1239]">
            <div className="font-bold flex items-center gap-1.5 text-[#e11d48] mb-1">
              <AlertCircle className="h-4 w-4" /> Flagged Reason:
            </div>
            <p className="leading-relaxed text-[11px]">
              &ldquo;FSSAI Certificate image submitted is blurry with an unreadable license number and seal.
              Please re-upload a clear scanned PDF or JPG of page 1.&rdquo;
            </p>
          </div>

          {/* Form to Correct */}
          <form onSubmit={handleResubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                FSSAI 14-Digit License Number
              </label>
              <input
                type="text"
                maxLength={14}
                value={fssaiNumber}
                onChange={(e) => setFssaiNumber(e.target.value)}
                className="w-full rounded-xl border border-[#d1d5db] px-3 py-2.5 text-xs font-mono font-bold text-[#111827] focus:border-[#ff6b00] focus:outline-none focus:ring-1 focus:ring-[#ff6b00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Settlement Bank IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-[#d1d5db] px-3 py-2.5 text-xs font-mono font-bold text-[#111827] focus:border-[#ff6b00] focus:outline-none focus:ring-1 focus:ring-[#ff6b00]"
              />
            </div>

            {/* Document Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Upload Clear FSSAI Document / Cheque
              </label>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d1d5db] bg-[#f9fafb] p-4 text-center cursor-pointer hover:bg-[#f3f4f6] transition-colors">
                <UploadCloud className="h-7 w-7 text-[#ff6b00] mb-1" />
                <span className="text-xs font-bold text-[#111827]">
                  {fileName || "Click to browse replacement file"}
                </span>
                <span className="text-[10px] text-[#9ca3af] mt-0.5">
                  PDF, JPG or PNG (Max 5MB) · High-resolution scan
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileName(file.name);
                      notify(`Selected ${file.name}`);
                    }
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
              {isSubmitting ? "Submitting Re-evaluation..." : "Submit Corrections for Review"}
            </button>
          </form>
        </div>

        {/* Immediate Assistance */}
        <div className="mt-5 rounded-2xl bg-white border border-[#e5e7eb] p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111827] flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-[#ff6b00]" /> Need Help Uploading?
            </span>
            <a
              href="https://wa.me/919845122910"
              target="_blank"
              rel="noreferrer"
              className="text-[#16a34a] font-bold flex items-center gap-1 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Support
            </a>
          </div>
          <p className="text-[#6b7280] text-[11px] mt-1">
            Send your FSSAI certificate to our onboarding officer directly on WhatsApp for manual verification.
          </p>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-md pt-6 text-center text-xs text-[#9ca3af]">
        TakeOnTime Compliance Operations Desk · Ref: #FLG-20260907-8821
      </footer>
    </main>
  );
}

export default AccountIssuePage;
