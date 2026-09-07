import { useState } from "react";
import {
  AlertCircle,
  Armchair,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  HelpCircle,
  IdCard,
  Key,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

export function CustomerProfile({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [name, setName] = useState("Maya Rodriguez");
  const [email, setEmail] = useState("maya.rodriguez@techcorp.com");
  const [phone, setPhone] = useState("+91 98451 22910");
  const [campus, setCampus] = useState("Embassy TechVillage, Bengaluru");
  const [building, setBuilding] = useState("Block 2A, 4th Floor (Seat 412)");

  // Preferences
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [nutAllergy, setNutAllergy] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [inAppBuzzer, setInAppBuzzer] = useState(true);

  // Corporate pass verification
  const [corporateVerified, setCorporateVerified] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="min-h-screen w-full bg-[#f8faf8] text-[#1c241e] font-sans pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#131d15] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
          <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <header className="bg-[#1a261c] text-white px-4 pt-6 pb-8 sm:px-8 border-b border-[#2d4030]">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#f09562]">
                TakeOnTime
              </span>
              <span className="text-xs text-[#8a9e8f]">· Campus Pass</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/Discovery")}
                className="text-xs font-semibold text-[#8bf2a9] hover:underline"
              >
                Back to Food Courts
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#ed6c2d] flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-white/20">
              MR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{name}</h1>
                {corporateVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#274830] px-2.5 py-0.5 text-[11px] font-bold text-[#4ed976] border border-[#3b6646]">
                    <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED EMPLOYEE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a3bba9] mt-0.5">{campus}</p>
              <p className="text-[11px] text-[#718576] font-mono">{phone}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 -mt-4 space-y-4">
        {/* Corporate Perk Badge Card */}
        <section aria-label="Corporate Discount Benefit" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[#ea580c]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#1a221c]">Tech Park Pre-Order Privilege</h2>
                <span className="rounded bg-[#ffedd5] text-[#c2410c] text-[10px] font-extrabold px-1.5 py-0.2">
                  10% OFF
                </span>
              </div>
              <p className="text-xs text-[#617466]">Auto-applied at all verified counters in Embassy TechVillage</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#15803d] bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#bbf7d0]">
            Active
          </span>
        </section>

        {/* Prepaid Meal Pass Subscription */}
        <section aria-label="Prepaid Meal Pass" className="rounded-2xl bg-[#1e293b] p-4 text-white shadow-sm border border-[#334155]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ff6b00] flex items-center justify-center text-white shrink-0 shadow-md">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Monthly Executive 22-Day Pass</h2>
                  <span className="rounded bg-[#22c55e]/20 text-[#4ade80] text-[10px] font-extrabold px-1.5 py-0.2 border border-[#22c55e]/30">
                    17 MEALS LEFT
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Little Fern Kitchen · Counter 2 · Valid till Sep 30, 2026
                </p>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/MealPasses")}
                className="px-3 py-1.5 rounded-xl bg-[#ff6b00] hover:bg-[#ea580c] text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
              >
                Calendar &rarr;
              </button>
            )}
          </div>
        </section>

        {/* Active Canteen Seat & Table Reservation */}
        <section aria-label="Canteen Table Reservation" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ecfdf5] border border-[#bbf7d0] flex items-center justify-center text-[#15803d]">
              <Armchair className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#1a221c]">Table T-04 (AC Main Hall)</h2>
                <span className="rounded bg-[#fef3c7] text-[#92400e] text-[10px] font-extrabold px-1.5 py-0.2">
                  OTP: 6821
                </span>
              </div>
              <p className="text-xs text-[#617466]">Today, 12:45 PM – 01:30 PM · 2 Diners</p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("customer-flow/SeatReservation")}
              className="text-xs font-bold text-[#ed6c2d] hover:underline cursor-pointer"
            >
              View Pass &rarr;
            </button>
          )}
        </section>

        {/* Workstation & Pickup Details */}
        <section aria-label="Desk & Floor Location" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-[#ed6c2d]" /> Workstation & Desk Reference
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#617466] mb-1 font-semibold">Registered Campus</label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#617466] mb-1 font-semibold">Desk Location / Tower</label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium"
              />
            </div>
          </div>
        </section>

        {/* Dietary & Allergy Preferences */}
        <section aria-label="Dietary & Allergen Preferences" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-[#16a34a]" /> Dietary & Health Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#1c241e]">Strict Pure Veg Only</span>
                <p className="text-[11px] text-[#617466]">Hide egg and non-veg counters automatically across food courts</p>
              </div>
              <input
                type="checkbox"
                checked={pureVegOnly}
                onChange={(e) => {
                  setPureVegOnly(e.target.checked);
                  notify(e.target.checked ? "Pure Veg Filter enabled" : "Showing all counters");
                }}
                className="h-5 w-5 accent-[#16a34a] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#1c241e]">Peanut & Tree Nut Allergy Warning</span>
                <p className="text-[11px] text-[#617466]">Alert kitchen staff on all orders with auto-injected cooking note</p>
              </div>
              <input
                type="checkbox"
                checked={nutAllergy}
                onChange={(e) => {
                  setNutAllergy(e.target.checked);
                  notify(e.target.checked ? "Nut allergy safety tag added" : "Nut allergy tag removed");
                }}
                className="h-5 w-5 accent-[#ed6c2d] rounded"
              />
            </label>
          </div>
        </section>

        {/* Notification Channels */}
        <section aria-label="Notification Preferences" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-[#3b82f6]" /> Pickup Notifications & Alerts
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#1c241e]">WhatsApp Live Token & OTP</span>
                <p className="text-[11px] text-[#617466]">Receive pickup buzzer & 4-digit OTP directly on WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="h-5 w-5 accent-[#16a34a] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-[#1c241e]">In-App Audio Chime</span>
                <p className="text-[11px] text-[#617466]">Play gentle buzzer when chef marks your order "Ready at Counter"</p>
              </div>
              <input
                type="checkbox"
                checked={inAppBuzzer}
                onChange={(e) => setInAppBuzzer(e.target.checked)}
                className="h-5 w-5 accent-[#ed6c2d] rounded"
              />
            </label>
          </div>
        </section>

        {/* Saved Payment Methods */}
        <section aria-label="Saved Payment Instruments" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-[#6366f1]" /> Saved Payment Methods
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#059669] bg-[#ecfdf5] px-2 py-1 rounded border border-[#a7f3d0]">
                  UPI
                </span>
                <div>
                  <div className="font-bold text-[#1c241e]">maya.rodriguez@okaxis</div>
                  <div className="text-[11px] text-[#617466]">Google Pay · Default</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#15803d]">Verified</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#2563eb] bg-[#eff6ff] px-2 py-1 rounded border border-[#bfdbfe]">
                  MEAL CARD
                </span>
                <div>
                  <div className="font-bold text-[#1c241e]">Sodexo / Zeta Card (•••• 9102)</div>
                  <div className="text-[11px] text-[#617466]">Corporate Tax-Free Meal Benefit</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#15803d]">Active</span>
            </div>
          </div>
        </section>

        {/* Save button */}
        <button
          type="button"
          onClick={() => notify("Campus preferences & profile saved successfully!")}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#ed6c2d] hover:bg-[#d95d20] text-white shadow-md transition-all cursor-pointer"
        >
          Save All Preferences
        </button>
      </div>
    </main>
  );
}

export default CustomerProfile;
