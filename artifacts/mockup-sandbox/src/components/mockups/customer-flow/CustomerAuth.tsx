import { useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";

export function CustomerAuth({
  onComplete,
  onNavigate,
}: {
  onComplete?: () => void;
  onNavigate?: (tab: string) => void;
}) {
  const [step, setStep] = useState<"phone" | "otp" | "campus">("phone");
  const [phone, setPhone] = useState("9845012345");
  const [otp, setOtp] = useState(["4", "9", "2", "1"]);
  const [corporateEmail, setCorporateEmail] = useState("rahul.s@cisco.com");
  const [selectedCampus, setSelectedCampus] = useState("Embassy TechVillage (ETV)");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      notify("Please enter a valid 10-digit mobile number");
      return;
    }
    setStep("otp");
    notify("Sent 4-digit OTP to +91 " + phone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("campus");
    notify("Phone verified! Choose your campus to unlock order-ahead.");
  };

  const handleFinish = () => {
    notify("Welcome to TakeOnTime! 10% Corporate Subsidy perk active.");
    if (onComplete) onComplete();
    if (onNavigate) onNavigate("customer-flow/Discovery");
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f8f9fa] px-0 text-[#1f2937] font-sans sm:px-4 sm:py-8 flex flex-col justify-between">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#1f2937] px-4 py-2.5 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 border border-[#374151]">
          <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-md bg-white sm:rounded-3xl sm:border sm:border-[#e5e7eb] sm:shadow-lg overflow-hidden flex flex-col min-h-[640px]">
        {/* Top Header */}
        <header className="p-6 bg-gradient-to-br from-[#ff6b00] to-[#ea580c] text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white font-black text-sm backdrop-blur-sm">
              to
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
              Pre-Order & Pickup
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Skip the Canteen Queue
          </h1>
          <p className="text-xs text-white/90 mt-1">
            Order ahead from your tech park food court, pay online, pick up on time.
          </p>
        </header>

        {/* Form Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 focus-within:border-[#ff6b00] focus-within:ring-1 focus-within:ring-[#ff6b00]">
                  <span className="text-xs font-bold text-[#6b7280] mr-2 pr-2 border-r border-[#e5e7eb]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    className="w-full text-xs font-bold text-[#111827] focus:outline-none bg-transparent"
                    required
                  />
                  <Phone className="h-4 w-4 text-[#9ca3af]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Work Email (Optional — unlocks 10% campus perk)
                </label>
                <div className="flex items-center rounded-xl border border-[#d1d5db] bg-white px-3 py-2.5 focus-within:border-[#ff6b00] focus-within:ring-1 focus-within:ring-[#ff6b00]">
                  <input
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs font-medium text-[#111827] focus:outline-none bg-transparent"
                  />
                  <Mail className="h-4 w-4 text-[#9ca3af]" />
                </div>
                <p className="text-[10px] text-[#16a34a] font-semibold mt-1 flex items-center gap-1">
                  <BadgePercent className="h-3 w-3" /> Cisco employee pass detected: 10% instant discount
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Send Verification OTP <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] transition-all flex items-center justify-center gap-1.5"
              >
                <Compass className="h-3.5 w-3.5" /> Continue as Guest Explorer
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#374151]">Enter 4-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-[11px] font-bold text-[#ff6b00] hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <p className="text-[11px] text-[#6b7280] mb-3">
                  Sent to +91 {phone} (Demo auto-filled: 4921)
                </p>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[i] = e.target.value;
                        setOtp(newOtp);
                      }}
                      className="h-12 w-12 rounded-xl border border-[#d1d5db] text-center text-lg font-black text-[#111827] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Verify & Continue <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {step === "campus" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Select Your Tech Park Food Court
                </label>
                <p className="text-[11px] text-[#6b7280] mb-3">
                  Choose your workplace canteen to see nearby live counters:
                </p>

                <div className="space-y-2">
                  {[
                    "Embassy TechVillage (ETV)",
                    "RMZ Ecospace Campus",
                    "Manyata Tech Park Hub",
                    "Bagmane Constellation Park",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCampus(c)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                        selectedCampus === c
                          ? "bg-[#fff7ed] border-[#ff6b00] text-[#ff6b00] shadow-sm"
                          : "bg-white border-[#e5e7eb] text-[#374151] hover:border-[#d1d5db]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> {c}
                      </span>
                      {selectedCampus === c && <CheckCircle2 className="h-4 w-4 text-[#ff6b00]" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#ff6b00] hover:bg-[#ea580c] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore Canteen Outlets <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Privacy Note */}
          <div className="pt-4 border-t border-[#f3f4f6] text-center text-[10px] text-[#9ca3af]">
            By continuing, you agree to TakeOnTime Terms of Service and Campus Privacy Guidelines.
          </div>
        </div>
      </div>
    </main>
  );
}

export default CustomerAuth;
