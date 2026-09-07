import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileWarning,
  HelpCircle,
  Landmark,
  Lock,
  Mail,
  Phone,
  QrCode,
  ShieldCheck,
  Store,
  UploadCloud,
  User,
  UtensilsCrossed,
} from "lucide-react";

type AuthMode = "login" | "signup" | "bank_details" | "pending_approval" | "account_issue";

export function OnboardingAuth({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("9876543210");
  const [password, setPassword] = useState("••••••••");
  const [ownerName, setOwnerName] = useState("Priya Sharma");
  const [kitchenName, setKitchenName] = useState("Little Fern Kitchen");
  const [category, setCategory] = useState("South Indian & Thalis");
  const [campus, setCampus] = useState("Koramangala 4th Block, Bengaluru");

  // Bank & Legal Details (Step 3)
  const [accountHolder, setAccountHolder] = useState("Priya Sharma");
  const [accountNumber, setAccountNumber] = useState("50100492817291");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("50100492817291");
  const [ifsc, setIfsc] = useState("HDFC0001234");
  const [bankName, setBankName] = useState("HDFC Bank, Koramangala");
  const [upiId, setUpiId] = useState("littlefern@hdfcbank");
  const [fssaiNumber, setFssaiNumber] = useState("11223344556677");
  const [gstin, setGstin] = useState("29ABCDE1234F1Z5");
  const [docUploaded, setDocUploaded] = useState(true);

  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#ede3d7] px-0 text-[#29221d] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fffdf9] shadow-[0_22px_75px_rgba(58,40,28,0.18)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        {/* Header Toast */}
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-50 rounded-xl bg-[#2e3731] px-4 py-3 text-xs font-semibold text-[#fff9f1] shadow-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#79c394]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Branding Navigation */}
        <header className="flex items-center justify-between border-b border-[#ebdcd0] px-5 py-4 bg-[#fffdf9]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dd693c] text-sm font-black text-[#fffbf5] shadow-sm">
              to
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-[#2d2420]">TakeOnTime</span>
                <span className="rounded-md bg-[#fdf0e7] px-1.5 py-0.5 text-[9px] font-bold text-[#cf5927]">VENDOR</span>
              </div>
              <p className="text-[10px] text-[#8e7e72]">Food Partner Onboarding & Auth</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (mode === "login") setMode("signup");
                else if (mode === "signup") setMode("bank_details");
                else if (mode === "bank_details") setMode("pending_approval");
                else if (mode === "pending_approval") setMode("account_issue");
                else setMode("login");
              }}
              className="text-[11px] font-bold text-[#dd693c] hover:underline px-2 py-1"
            >
              Switch Step
            </button>
          </div>
        </header>

        {/* Mode 1: LOGIN (Matching vendorl_login_1788625764514.png) */}
        {mode === "login" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="inline-block rounded-full bg-[#fdeee4] px-3 py-1 text-[11px] font-extrabold text-[#d25c28] tracking-wide uppercase">
                  Welcome Back
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#29221d]">
                  Vendor Sign In
                </h1>
                <p className="mt-1 text-xs text-[#7e6d61] leading-relaxed">
                  Sign in to manage your kitchen orders, menu items, and today&apos;s live availability.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  notify("Signed in successfully. Loading store...");
                  if (onComplete) onComplete();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#56483e] mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-[#867568] border-r border-[#e3d3c4] pr-2">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] pl-16 pr-3.5 py-3 text-sm font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none focus:ring-1 focus:ring-[#dd693c]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#56483e]">
                      Password / Security PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => notify("OTP sent to your registered mobile number")}
                      className="text-[11px] font-bold text-[#dd693c] hover:underline"
                    >
                      Login via OTP
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#a39183]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] pl-10 pr-3.5 py-3 text-sm font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none focus:ring-1 focus:ring-[#dd693c]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 font-medium text-[#6c5c50] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[#decbb9] text-[#dd693c] focus:ring-[#dd693c]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => notify("Password reset link sent via SMS")}
                    className="font-bold text-[#91796b] hover:text-[#2d2420]"
                  >
                    Forgot?
                  </button>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-[#2e3731] py-3.5 text-center text-sm font-extrabold text-[#fff8ef] shadow-md transition-transform active:scale-[0.98] hover:bg-[#3d4942]"
                >
                  Enter Kitchen Control Room
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-[#e8d7c9] bg-[#fbf5ee] p-3.5 text-xs text-[#726154]">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#dd693c] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#352a24]">Prepaid Order Protection</p>
                    <p className="mt-0.5 text-[11px] text-[#7f6c5f]">
                      All customer pickups on TakeOnTime are 100% prepaid online. No cash handling or unpaid orders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eee2d6] pt-4 text-center">
              <p className="text-xs text-[#7c6a5d]">
                Want to list your canteen or cloud kitchen?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-extrabold text-[#dd693c] hover:underline"
                >
                  Register Partner
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Mode 2: SIGNUP (Matching vendor_signup_1788625764513.png) */}
        {mode === "signup" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-[#fdeee4] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#d25c28]">
                  Step 1 of 3: Business Setup
                </span>
                <span className="text-xs font-bold text-[#8f7e71]">TakeOnTime Partner</span>
              </div>

              <h1 className="text-xl font-black text-[#29221d]">
                Register Your Kitchen
              </h1>
              <p className="mt-1 text-xs text-[#7e6d61]">
                Join local canteens, cafes, and cloud kitchens serving fast pre-orders.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setMode("bank_details");
                }}
                className="mt-5 space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#56483e] mb-1">
                    Store / Kitchen Name
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-3.5 h-4 w-4 text-[#a39183]" />
                    <input
                      type="text"
                      value={kitchenName}
                      onChange={(e) => setKitchenName(e.target.value)}
                      required
                      placeholder="e.g. Spice Bowl Canteen"
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] pl-10 pr-3.5 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#56483e] mb-1">
                    Primary Owner / Manager Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#a39183]" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] pl-10 pr-3.5 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#56483e] mb-1">
                      Cuisine / Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                    >
                      <option>South Indian & Thalis</option>
                      <option>North Indian & Biryani</option>
                      <option>Quick Bites & Rolls</option>
                      <option>Beverages & Chai</option>
                      <option>Bakery & Cafe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#56483e] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#56483e] mb-1">
                    Campus / Area / Landmark
                  </label>
                  <input
                    type="text"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    required
                    placeholder="College Campus / Tech Park / Street"
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#dd693c] py-3 text-center text-xs font-extrabold text-[#fff8ef] shadow-md hover:bg-[#c95b30]"
                >
                  <span>Continue to Bank Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            <div className="border-t border-[#eee2d6] pt-4 text-center">
              <p className="text-xs text-[#7c6a5d]">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-extrabold text-[#dd693c] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Mode 3: STEP 3 BANK DETAILS (Matching step3_bank_details_1788625764511.png) */}
        {mode === "bank_details" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="flex items-center gap-1 text-xs font-bold text-[#7d6c60] hover:text-[#2d2420]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="rounded-full bg-[#fdeee4] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#d25c28]">
                  Step 3 of 3: Bank & Regulatory
                </span>
              </div>

              <h1 className="text-xl font-black text-[#29221d]">
                Payout & Legal Details
              </h1>
              <p className="mt-1 text-xs text-[#7e6d61]">
                Daily automatic settlements for all customer prepaid pickups are remitted here.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  notify("Bank details verified! Submitting for onboarding review.");
                  setMode("pending_approval");
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                    Account Holder Name (as per Bank)
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      required
                      className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] uppercase focus:border-[#dd693c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                    Bank Name & Branch
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                    Instant UPI Payout ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="merchant@upi"
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-[#56483e] mb-1">
                    14-Digit FSSAI License Number
                  </label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    maxLength={14}
                    onChange={(e) => setFssaiNumber(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="14-digit registration number"
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2 text-xs font-semibold text-[#29221d] tracking-wider focus:border-[#dd693c] focus:outline-none"
                  />
                  <span className="mt-1 block text-[10px] text-[#918174]">
                    Mandatory under Indian Food Safety & Standards Authority guidelines.
                  </span>
                </div>

                <button
                  type="submit"
                  className="mt-3 w-full rounded-xl bg-[#2e3731] py-3 text-center text-xs font-extrabold text-[#fff8ef] shadow-md hover:bg-[#3a453d]"
                >
                  Submit for Approval
                </button>
              </form>
            </div>

            <p className="mt-3 text-center text-[11px] text-[#8e7e72]">
              Bank details are encrypted using 256-bit SSL and verified with NPCI.
            </p>
          </div>
        )}

        {/* Mode 4: PENDING APPROVAL (Matching PRD & Architecture router specs) */}
        {mode === "pending_approval" && (
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fdeee4] text-[#dd693c] shadow-inner mb-4">
                <FileCheck2 className="h-8 w-8" />
              </div>

              <span className="inline-block rounded-full bg-[#eef5ee] px-3 py-1 text-[11px] font-extrabold uppercase text-[#3c7e52] tracking-wider">
                Application Submitted
              </span>

              <h2 className="mt-3 text-2xl font-black text-[#29221d]">
                Account Under Review
              </h2>
              <p className="mt-2 text-xs text-[#7a6b60] leading-relaxed max-w-xs mx-auto">
                Thank you, <span className="font-bold text-[#29221d]">{ownerName}</span>. Your registration for{" "}
                <span className="font-bold text-[#29221d]">{kitchenName}</span> has been received.
              </p>

              <div className="mt-6 rounded-2xl border border-[#eedecf] bg-[#fbf5ee] p-4 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#e9dcce]">
                  <span className="text-[#847366] font-medium">Store Status</span>
                  <span className="font-bold text-[#d25c28] bg-[#fdf0e7] px-2 py-0.5 rounded-md">Pending Verification</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#e9dcce]">
                  <span className="text-[#847366] font-medium">FSSAI License</span>
                  <span className="font-bold text-[#352a24]">{fssaiNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#847366] font-medium">Payout Bank</span>
                  <span className="font-bold text-[#352a24]">{bankName}</span>
                </div>
              </div>

              <div className="mt-6 text-left rounded-xl bg-[#f5efe7] p-3.5 text-[11px] text-[#716155] leading-relaxed">
                <p className="font-bold text-[#352a24] mb-1">What happens next?</p>
                TakeOnTime operations team verifies canteen locations and food licenses within 12–24 hours. You will receive an SMS as soon as your menu goes live.
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  notify("Demo mode: Fast-tracking approval to explore the app!");
                  if (onComplete) onComplete();
                }}
                className="w-full rounded-xl bg-[#dd693c] py-3 text-xs font-extrabold text-[#fff8ef] shadow-md hover:bg-[#c95b30]"
              >
                Approve & Enter Control Room (Demo)
              </button>
              <button
                type="button"
                onClick={() => setMode("account_issue")}
                className="w-full py-2 text-xs font-bold text-[#867568] hover:text-[#2d2420]"
              >
                Simulate &quot;Account Issue / Action Required&quot;
              </button>
            </div>
          </div>
        )}

        {/* Mode 5: ACCOUNT ISSUE (Matching account_issue_page_1788625764509.png) */}
        {mode === "account_issue" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("pending_approval")}
                  className="flex items-center gap-1 text-xs font-bold text-[#7d6c60] hover:text-[#2d2420]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="rounded-full bg-[#fbebe9] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#c93f30]">
                  Action Required
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#faeceb] text-[#c93f30]">
                  <FileWarning className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-[#29221d]">
                    Verification Discrepancy
                  </h1>
                  <p className="text-xs text-[#7e6d61]">
                    Review notes from TakeOnTime compliance team
                  </p>
                </div>
              </div>

              {/* Rejection / Note Card */}
              <div className="mt-5 rounded-2xl border border-[#f4cfcb] bg-[#fff5f4] p-4 text-xs">
                <p className="font-extrabold text-[#a93325]">FSSAI Certificate Unclear</p>
                <p className="mt-1 text-[#6a4c48] leading-relaxed">
                  The uploaded FSSAI registration document for <span className="font-bold">{kitchenName}</span> was blurred or expired. Please upload a clear photo or PDF of the valid 14-digit certificate.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-xs font-bold text-[#56483e]">
                  Re-upload FSSAI Document
                </label>
                <div className="rounded-2xl border-2 border-dashed border-[#decbb9] bg-[#fffaf5] p-5 text-center cursor-pointer hover:border-[#dd693c]">
                  <UploadCloud className="mx-auto h-7 w-7 text-[#dd693c]" />
                  <p className="mt-1.5 text-xs font-bold text-[#352a24]">
                    Tap to upload valid document
                  </p>
                  <p className="text-[10px] text-[#8e7e72]">PDF, JPG, or PNG up to 5MB</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#56483e] mb-1">
                    Corrected License Number
                  </label>
                  <input
                    type="text"
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3.5 py-2.5 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  notify("Appeal and updated document submitted to Compliance!");
                  setMode("pending_approval");
                }}
                className="w-full rounded-xl bg-[#2e3731] py-3 text-xs font-extrabold text-[#fff8ef] shadow-md hover:bg-[#3d4942]"
              >
                Submit Updated Details
              </button>
              <button
                type="button"
                onClick={() => notify("Connecting with TakeOnTime Merchant Care on WhatsApp...")}
                className="w-full py-2 text-xs font-bold text-[#dd693c] hover:underline text-center flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Contact Merchant Support</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
export default OnboardingAuth;
