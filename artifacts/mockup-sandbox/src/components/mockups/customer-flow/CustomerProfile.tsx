import { useState, useEffect } from "react";
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
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  User,
  UserPlus,
  Users,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";
import { takeOnTimeStore, type CustomerProfile as CustomerProfileType } from "@/lib/takeontime-store";

export function CustomerProfile({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [profile, setProfile] = useState<CustomerProfileType>(() =>
    takeOnTimeStore.getCustomerProfile()
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editCampus, setEditCampus] = useState(profile.campus);
  const [editDesk, setEditDesk] = useState(profile.deskLocation);
  const [editIdNumber, setEditIdNumber] = useState(profile.corporateId || "EMP-94821");

  // Pickup Buddy / Sub-staff delegate state
  const [buddyName, setBuddyName] = useState("Karan Patel");
  const [buddyPhone, setBuddyPhone] = useState("+91 98450 77123");
  const [buddyRole, setBuddyRole] = useState("Desk Mate / Pickup Sub-Delegate");
  const [showAddBuddy, setShowAddBuddy] = useState(false);

  // Preferences
  const [pureVegOnly, setPureVegOnly] = useState(profile.pureVegOnly);
  const [nutAllergy, setNutAllergy] = useState(profile.nutAllergy);
  const [whatsappAlerts, setWhatsappAlerts] = useState(profile.whatsappAlerts);
  const [inAppBuzzer, setInAppBuzzer] = useState(profile.inAppBuzzer);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      const p = takeOnTimeStore.getCustomerProfile();
      setProfile(p);
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = () => {
    takeOnTimeStore.updateCustomerProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      campus: editCampus,
      deskLocation: editDesk,
      corporateId: editIdNumber,
      pureVegOnly,
      nutAllergy,
      whatsappAlerts,
      inAppBuzzer,
    });
    setIsEditing(false);
    notify("Profile & campus preferences updated successfully!");
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
              <span className="text-xs text-[#8a9e8f]">· Campus Profile &amp; Pass</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/Discovery")}
                className="text-xs font-semibold text-[#8bf2a9] hover:underline cursor-pointer"
              >
                Back to Food Courts
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#ed6c2d] flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-white/20">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">{profile.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#274830] px-2.5 py-0.5 text-[11px] font-bold text-[#4ed976] border border-[#3b6646]">
                    <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED EMPLOYEE
                  </span>
                </div>
                <p className="text-xs text-[#a3bba9] mt-0.5">{profile.campus}</p>
                <p className="text-[11px] text-[#718576] font-mono">
                  {profile.phone} · ID: {profile.corporateId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 -mt-4 space-y-4">
        {/* Profile Edit Card (when toggled) */}
        {isEditing && (
          <section
            aria-label="Edit Profile"
            className="rounded-2xl bg-white p-5 shadow-md border-2 border-[#ed6c2d] animate-in fade-in"
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#f0e8dc] pb-2.5">
              <h2 className="text-sm font-black text-[#1c241e] flex items-center gap-2">
                <User className="h-4 w-4 text-[#ed6c2d]" /> Edit Personal &amp; Campus Details
              </h2>
              <span className="text-[10px] font-bold text-[#ed6c2d] uppercase">Instant Store Sync</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>

              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Work Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>

              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>

              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Employee / Student ID</label>
                <input
                  type="text"
                  value={editIdNumber}
                  onChange={(e) => setEditIdNumber(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>

              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Registered Campus</label>
                <input
                  type="text"
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>

              <div>
                <label className="block text-[#617466] mb-1 font-semibold">Desk Location / Tower</label>
                <input
                  type="text"
                  value={editDesk}
                  onChange={(e) => setEditDesk(e.target.value)}
                  className="w-full bg-[#f4f7f4] border border-[#d9e2da] rounded-xl px-3 py-2 text-[#1c241e] font-medium focus:outline-none focus:ring-2 focus:ring-[#ed6c2d]"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-[#d9e2da] text-xs font-semibold text-[#617466] hover:bg-[#f4f7f4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded-xl bg-[#ed6c2d] hover:bg-[#d95d20] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </section>
        )}

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

        {/* Authorized Pickup Buddies / Sub-Delegates */}
        <section aria-label="Authorized Sub-Delegates" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#617466] flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#ed6c2d]" /> Pickup Buddies &amp; Sub-Delegates
              </h2>
              <p className="text-[11px] text-[#86998b] mt-0.5">
                Authorized colleagues or family who can collect your hot food, tiffins, or meal passes with OTP
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBuddy(!showAddBuddy)}
              className="flex items-center gap-1 text-xs font-bold text-[#ed6c2d] hover:bg-[#fff7ed] px-2.5 py-1 rounded-lg border border-[#fed7aa] transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{showAddBuddy ? "Close" : "Add Buddy"}</span>
            </button>
          </div>

          {showAddBuddy && (
            <div className="mb-3 p-3 rounded-xl bg-[#fff7ed]/60 border border-[#fed7aa] space-y-2 text-xs">
              <span className="font-bold text-[#9a3412]">Register New Pickup Sub-Delegate</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Delegate Full Name"
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  className="bg-white border border-[#fed7aa] rounded-lg px-2.5 py-1.5"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+91 ...)"
                  value={buddyPhone}
                  onChange={(e) => setBuddyPhone(e.target.value)}
                  className="bg-white border border-[#fed7aa] rounded-lg px-2.5 py-1.5"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddBuddy(false);
                  notify(`Pickup authorization granted to ${buddyName} (${buddyPhone})!`);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#ed6c2d] text-white text-xs font-bold hover:bg-[#de5f20] cursor-pointer"
              >
                Authorize Delegate
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8faf8] border border-[#e6ece6] text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#e0f2fe] text-[#0369a1] font-bold flex items-center justify-center text-xs">
                  KP
                </div>
                <div>
                  <div className="font-bold text-[#1c241e] flex items-center gap-1.5">
                    <span>{buddyName}</span>
                    <span className="bg-[#e0e7ff] text-[#3730a3] text-[9px] font-bold px-1.5 py-0.2 rounded">
                      DELEGATE
                    </span>
                  </div>
                  <div className="text-[11px] text-[#617466]">{buddyPhone} · {buddyRole}</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#15803d] bg-[#f0fdf4] px-2 py-0.5 rounded border border-[#bbf7d0]">
                OTP Shared
              </span>
            </div>
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
          onClick={handleSaveProfile}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#ed6c2d] hover:bg-[#d95d20] text-white shadow-md transition-all cursor-pointer"
        >
          Save All Preferences &amp; Profile
        </button>
      </div>
    </main>
  );
}

export default CustomerProfile;
