import { useState } from "react";
import {
  Bell,
  Building,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  FileBadge2,
  FileText,
  Headphones,
  HelpCircle,
  Landmark,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Store,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

export function MoreProfile({
  onNavigate,
  onLogout,
}: {
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrintKOT, setAutoPrintKOT] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#ede3d7] px-0 text-[#29221d] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fffdf9] shadow-[0_22px_75px_rgba(58,40,28,0.18)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-50 rounded-xl bg-[#2e3731] px-4 py-3 text-xs font-semibold text-[#fff9f1] shadow-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#79c394]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-[#ebdcd0] px-5 py-4 bg-[#fffdf9]">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dd693c] text-sm font-black text-[#fffbf5] shadow-sm">
              to
            </span>
            <div>
              <span className="font-extrabold text-[15px] tracking-tight text-[#2d2420]">More & Settings</span>
              <p className="text-[10px] text-[#8e7e72]">Store Profile, Payouts & Alerts</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("support")}
            className="flex items-center gap-1 text-[11px] font-bold text-[#dd693c] bg-[#fdf0e7] px-2.5 py-1 rounded-lg hover:bg-[#fae4d5]"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Help</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Store Profile Card */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-[#fbf5ee] p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dd693c] text-lg font-black text-[#fff9f1] shadow-sm">
                  LF
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-[#29221d]">Little Fern Kitchen</h2>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#e8f3ec] px-1.5 py-0.5 text-[9px] font-bold text-[#3d7a53]">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-[#7e6d61] mt-0.5">Partner ID: #TOT-VEN-104</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => notify("Store profile editor opened")}
                className="text-xs font-bold text-[#dd693c] hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="mt-3.5 border-t border-[#eee2d6] pt-3 text-xs space-y-1.5 text-[#6c5c50]">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#b09e91] shrink-0" />
                <span className="truncate">Koramangala 4th Block, Bengaluru · 560034</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#b09e91] shrink-0" />
                <span>+91 98765 43210 (Priya Sharma)</span>
              </div>
            </div>
          </div>

          {/* Bank & Payouts Card */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-[#fffdf9] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#dd693c]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7e6d61]">
                  Settlements & Banking
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-[#3d7a53] bg-[#eef7f0] px-2 py-0.5 rounded-full">
                Active NPCI Auto-Pay
              </span>
            </div>

            <div className="rounded-xl bg-[#f8f2eb] p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#847366]">Bank Name</span>
                <span className="font-bold text-[#2d2420]">HDFC Bank, Koramangala</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#847366]">Account Number</span>
                <span className="font-mono font-bold text-[#2d2420]">•••• •••• 7291</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#847366]">IFSC Code</span>
                <span className="font-mono font-bold text-[#2d2420]">HDFC0001234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#847366]">UPI Settlement VPA</span>
                <span className="font-bold text-[#dd693c]">littlefern@hdfcbank</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f0e3d7] text-xs">
              <div>
                <span className="text-[10px] text-[#847366] block">Next Daily Payout</span>
                <span className="font-extrabold text-[#2d2420]">Today at 11:30 PM (₹4,890)</span>
              </div>
              <button
                type="button"
                onClick={() => notify("Downloading GST & Statement PDF for September...")}
                className="flex items-center gap-1 font-bold text-[#dd693c] hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Statements</span>
              </button>
            </div>
          </div>

          {/* Compliance & FSSAI */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-[#fffdf9] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileBadge2 className="h-4 w-4 text-[#dd693c]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7e6d61]">
                  Food Safety & Compliance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("vendor-flow/Verification")}
                className="text-xs font-bold text-[#dd693c] hover:underline"
              >
                View
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#f8f2eb] p-3 text-xs">
              <div>
                <p className="font-bold text-[#2d2420]">FSSAI License #11223344556677</p>
                <p className="text-[11px] text-[#847366] mt-0.5">Valid through 31 Dec 2027 · Food Safety Authority</p>
              </div>
              <span className="rounded-full bg-[#e8f3ec] p-1 text-[#3d7a53]">
                <CheckCircle className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Kitchen Sound & KOT Hardware Preferences */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-[#fffdf9] p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7e6d61]">
              Kitchen Hardware & Alerts
            </h3>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fcf2e9] text-[#dd693c]">
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-[#9c897c]" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2d2420]">Incoming Order Bell Chime</p>
                  <p className="text-[10px] text-[#847366]">Loud tone until kitchen accepts order</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  notify(soundEnabled ? "Kitchen sound alerts muted" : "Kitchen loud chime enabled");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? "bg-[#dd693c]" : "bg-[#ded0c3]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#f0e3d7]">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fcf2e9] text-[#dd693c]">
                  <Printer className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2d2420]">Auto-Print Kitchen Tickets (KOT)</p>
                  <p className="text-[10px] text-[#847366]">Thermal receipt printer over Bluetooth</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAutoPrintKOT(!autoPrintKOT);
                  notify(autoPrintKOT ? "KOT auto-printing disabled" : "Thermal printer paired and enabled");
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoPrintKOT ? "bg-[#dd693c]" : "bg-[#ded0c3]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoPrintKOT ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick Support Links */}
          <div className="rounded-2xl border border-[#ebdcd0] bg-[#fffdf9] p-3 divide-y divide-[#f2e7dd]">
            <button
              type="button"
              onClick={() => setActiveModal("support")}
              className="flex w-full items-center justify-between py-2.5 px-1 text-xs font-bold text-[#352a24] hover:text-[#dd693c]"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-[#dd693c]" />
                <span>TakeOnTime Partner WhatsApp Care</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#b9a89c]" />
            </button>

            <button
              type="button"
              onClick={() => notify("Opening TakeOnTime Terms of Service")}
              className="flex w-full items-center justify-between py-2.5 px-1 text-xs font-bold text-[#352a24] hover:text-[#dd693c]"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-[#8a796e]" />
                <span>Merchant Terms & Pricing Agreement</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#b9a89c]" />
            </button>

            <button
              type="button"
              onClick={() => {
                notify("Logged out of store session");
                if (onLogout) onLogout();
              }}
              className="flex w-full items-center justify-between py-2.5 px-1 text-xs font-bold text-[#c93f30] hover:bg-[#fff5f4] rounded-lg"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4" />
                <span>Log Out of Kitchen</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-center text-[10px] text-[#9a897e] pb-2">
            TakeOnTime Vendor v1.2 · Powered by Cloud Kitchen Engine
          </p>
        </div>

        {/* Support Modal */}
        {activeModal === "support" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#e8dccf]">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0e3d7]">
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-[#dd693c]" />
                  <h3 className="font-extrabold text-sm text-[#2d2420]">TakeOnTime Merchant Care</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 text-[#8e7e72] hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-[#52443a]">
                <p className="leading-relaxed">
                  Need assistance with live orders, payouts, or menu changes? Our Bengaluru merchant operations desk is available 7:00 AM – 11:00 PM daily.
                </p>

                <div className="rounded-xl bg-[#f8f2eb] p-3 space-y-2 font-medium">
                  <p><strong>WhatsApp Support:</strong> +91 80 4718 2000</p>
                  <p><strong>Merchant Email:</strong> partners@takeontime.com</p>
                  <p><strong>Emergency Kitchen Line:</strong> 1800 200 8686</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    notify("Connecting to Merchant Desk WhatsApp...");
                    setActiveModal(null);
                  }}
                  className="w-full rounded-xl bg-[#2e3731] py-2.5 text-center font-bold text-white hover:bg-[#3d4942]"
                >
                  Chat on WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
export default MoreProfile;
