import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  Headphones,
  Layers,
  Lock,
  Mail,
  Percent,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShieldAlert,
  Sliders,
  Store,
  Trash2,
  X,
  Zap,
} from "lucide-react";

export function AdminPlatformSettings({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [commissionRate, setCommissionRate] = useState("8.0");
  const [gstRate, setGstRate] = useState("5.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [categories, setCategories] = useState([
    "Breakfast & Tiffins",
    "Thalis & Combos",
    "Biryani & Rice Bowls",
    "Chai & Hot Beverages",
    "Juices & Smoothies",
    "Sandwiches & Quick Bites",
    "Desserts & Ice Creams",
  ]);
  const [newCat, setNewCat] = useState("");
  const [supportPhone, setSupportPhone] = useState("+91 80 4192 4000");
  const [supportEmail, setSupportEmail] = useState("ops@takeontime.in");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCategories([...categories, newCat.trim()]);
    setNewCat("");
    notify("Added new global category to food taxonomy");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
    notify(`Removed category: ${cat}`);
  };

  const handleSaveAll = () => {
    notify("Platform global settings successfully saved to Supabase config!");
  };

  return (
    <main className="min-h-screen w-full bg-[#161c18] text-[#e8f0eb] p-3 sm:p-6 font-sans">
      <div className="mx-auto max-w-4xl">
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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0284c7] shadow-md">
              <Sliders className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Platform Settings & Taxonomy</h1>
                <span className="rounded-full bg-[#152e1c] px-2.5 py-0.5 text-xs font-semibold text-[#4ed976] border border-[#2b5235]">
                  Live System Config
                </span>
              </div>
              <p className="text-xs text-[#8a9e8f]">
                Commission rates, GST tax rules, global menu category taxonomy & emergency killswitch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white transition-all cursor-pointer shadow-md"
            >
              <Save className="h-4 w-4" /> Save Global Configuration
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("admin-flow/AdminConsole")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#223126] hover:bg-[#2b3e30] text-[#b0c7b5] border border-[#304736] transition-colors"
              >
                Back to Console
              </button>
            )}
          </div>
        </header>

        {/* Emergency Killswitch Banner */}
        <section aria-label="Maintenance Mode" className="mb-6 rounded-2xl bg-[#261b17] border border-[#593026] p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#3f2119] flex items-center justify-center text-[#f87171]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Platform Emergency Maintenance Mode</h3>
              <p className="text-xs text-[#d1a396]">
                When enabled, pauses customer checkout across all tech parks with an emergency banner.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMaintenanceMode(!maintenanceMode);
              notify(
                !maintenanceMode
                  ? "EMERGENCY: Enabled Maintenance Mode! Customer ordering suspended."
                  : "Maintenance mode disabled. Normal operations resumed."
              );
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              maintenanceMode
                ? "bg-[#ef4444] text-white shadow-lg animate-pulse"
                : "bg-[#2d3a31] text-[#9ca3af] hover:text-white"
            }`}
          >
            {maintenanceMode ? "MAINTENANCE ACTIVE (Click to Disable)" : "Enable Maintenance Mode"}
          </button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Financial & Rate Settings */}
          <div className="rounded-2xl bg-[#19231c] border border-[#293b2d] p-5 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-[#253528] pb-3 flex items-center gap-2">
              <Percent className="h-4 w-4 text-[#ed6c2d]" /> Financial Commissions & Tax Rates
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#b0c7b5] mb-1">
                TakeOnTime Vendor Platform Commission (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full bg-[#121814] border border-[#2a3e2f] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#4ed976]"
                />
                <span className="text-xs font-bold text-[#8a9e8f]">%</span>
              </div>
              <p className="text-[10px] text-[#718576] mt-1">
                Automatically split from vendor gross sales during 11:30 PM Razorpay Route batch.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b0c7b5] mb-1">
                Standard Food GST Tax Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full bg-[#121814] border border-[#2a3e2f] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#4ed976]"
                />
                <span className="text-xs font-bold text-[#8a9e8f]">%</span>
              </div>
              <p className="text-[10px] text-[#718576] mt-1">
                Applied to customer item subtotals at checkout (2.5% CGST + 2.5% SGST).
              </p>
            </div>

            <div className="pt-2 border-t border-[#253528]">
              <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-[#38bdf8]" /> Operations Helpdesk Contacts
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#8a9e8f]">Support Hotline:</span>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full mt-1 bg-[#121814] border border-[#2a3e2f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[#8a9e8f]">Ops Email:</span>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full mt-1 bg-[#121814] border border-[#2a3e2f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Global Category Taxonomy */}
          <div className="rounded-2xl bg-[#19231c] border border-[#293b2d] p-5 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-[#253528] pb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4ed976]" /> Global Category Taxonomy
            </h2>
            <p className="text-xs text-[#8a9e8f]">
              Universal categories available for vendors when building food menus.
            </p>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="e.g. Healthy Salads & Wraps"
                className="flex-1 bg-[#121814] border border-[#2a3e2f] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5a7161] focus:outline-none focus:border-[#4ed976]"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl text-xs font-bold bg-[#223326] text-[#8bf2a9] border border-[#2d4634] hover:bg-[#2a3e2f] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </form>

            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141b16] border border-[#253629] text-xs text-white"
                >
                  <span className="font-medium">{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(c)}
                    className="p-1 text-[#718576] hover:text-[#f87171] transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Profile & Platform Sub-Staff */}
        <div className="mt-6 rounded-2xl bg-[#19231c] border border-[#293b2d] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253528] pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ed6c2d] flex items-center justify-center font-black text-white text-sm">
                AR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Aditi Rao (Platform Super Admin)</h2>
                  <span className="rounded-full bg-[#1e3a24] text-[#4ed976] px-2 py-0.5 text-[10px] font-bold border border-[#2e5937]">
                    ROOT ACCESS
                  </span>
                </div>
                <p className="text-xs text-[#8a9e8f]">aditi.rao@takeontime.in · +91 98451 22334 · Bengaluru HQ</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => notify("Admin credentials & 2FA keys re-verified")}
              className="px-3 py-1.5 rounded-xl bg-[#223326] text-[#8bf2a9] text-xs font-bold border border-[#2e4c36] hover:bg-[#2b4030] cursor-pointer"
            >
              Verify 2FA Keys
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9e8f]">
                Platform Operations Sub-Staff &amp; Regional Delegates
              </h3>
              <button
                type="button"
                onClick={() => notify("New platform staff invite code dispatched to email")}
                className="text-xs font-bold text-[#ed6c2d] hover:underline cursor-pointer"
              >
                + Invite Ops Staff
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#131a15] border border-[#253629] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Rohan Varma</span>
                  <span className="text-[9px] font-bold bg-[#1e2e22] text-[#8bf2a9] px-1.5 py-0.5 rounded">
                    CAMPUS AUDITOR
                  </span>
                </div>
                <p className="text-[#8a9e8f] text-[11px]">rohan.v@takeontime.in</p>
                <div className="text-[10px] text-[#55695a] pt-1">Audits FSSAI &amp; hygiene logs</div>
              </div>

              <div className="p-3 rounded-xl bg-[#131a15] border border-[#253629] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Sneha Nair</span>
                  <span className="text-[9px] font-bold bg-[#1e283b] text-[#93c5fd] px-1.5 py-0.5 rounded">
                    SETTLEMENT LEAD
                  </span>
                </div>
                <p className="text-[#8a9e8f] text-[11px]">sneha.n@takeontime.in</p>
                <div className="text-[10px] text-[#55695a] pt-1">NPCI Auto-Pay &amp; bank reconciliations</div>
              </div>

              <div className="p-3 rounded-xl bg-[#131a15] border border-[#253629] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Vikram Das</span>
                  <span className="text-[9px] font-bold bg-[#3b271d] text-[#fed7aa] px-1.5 py-0.5 rounded">
                    DISPATCH OPS
                  </span>
                </div>
                <p className="text-[#8a9e8f] text-[11px]">vikram.d@takeontime.in</p>
                <div className="text-[10px] text-[#55695a] pt-1">Express bays &amp; cubby lockers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminPlatformSettings;
