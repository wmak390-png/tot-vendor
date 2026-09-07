import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  Filter,
  Layers,
  MapPin,
  Megaphone,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";

type Campus = {
  id: string;
  name: string;
  location: string;
  totalCounters: number;
  activeVendors: number;
  dailyPeakOrders: number;
  status: "active" | "maintenance";
  lunchRush: string;
  eveningRush: string;
};

const initialCampuses: Campus[] = [
  {
    id: "campus_etv",
    name: "Embassy TechVillage (ETV)",
    location: "Outer Ring Road, Devarabeesanahalli, Bengaluru",
    totalCounters: 8,
    activeVendors: 6,
    dailyPeakOrders: 420,
    status: "active",
    lunchRush: "12:30 PM – 2:30 PM",
    eveningRush: "4:30 PM – 6:30 PM",
  },
  {
    id: "campus_ecospace",
    name: "RMZ Ecospace Campus",
    location: "Bellandur, Outer Ring Road, Bengaluru",
    totalCounters: 10,
    activeVendors: 8,
    dailyPeakOrders: 580,
    status: "active",
    lunchRush: "12:45 PM – 2:15 PM",
    eveningRush: "5:00 PM – 6:45 PM",
  },
  {
    id: "campus_manyata",
    name: "Manyata Tech Park Hub",
    location: "Nagavara, Hebbal, Bengaluru",
    totalCounters: 14,
    activeVendors: 11,
    dailyPeakOrders: 890,
    status: "active",
    lunchRush: "1:00 PM – 2:30 PM",
    eveningRush: "4:45 PM – 6:30 PM",
  },
  {
    id: "campus_bagmane",
    name: "Bagmane Constellation Business Park",
    location: "K.R. Puram, Marathahalli Ring Rd, Bengaluru",
    totalCounters: 6,
    activeVendors: 4,
    dailyPeakOrders: 310,
    status: "active",
    lunchRush: "12:30 PM – 2:00 PM",
    eveningRush: "4:30 PM – 6:00 PM",
  },
];

export function AdminCampusManagement({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [campuses, setCampuses] = useState<Campus[]>(initialCampuses);
  const [selectedCampus, setSelectedCampus] = useState<Campus>(initialCampuses[0]);
  const [broadcastText, setBroadcastText] = useState("");
  const [activeBroadcast, setActiveBroadcast] = useState<string | null>(
    "Food Court Floor 1 Central AC scheduled service at 3 PM today. Express pickup remains open."
  );
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setActiveBroadcast(broadcastText);
    setBroadcastText("");
    notify(`Published campus broadcast to all customer apps in ${selectedCampus.name}!`);
  };

  return (
    <main className="min-h-screen w-full bg-[#161d18] text-[#e8f0eb] p-3 sm:p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#0e1310] px-4 py-2.5 text-xs font-semibold text-[#8bf2a9] shadow-2xl flex items-center gap-2 border border-[#2b3a2f]">
            <CheckCircle2 className="h-4 w-4 text-[#4ed976]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#293c2e] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0284c7] shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Campus & Food Court Directory</h1>
                <span className="rounded-full bg-[#152e1c] px-2.5 py-0.5 text-xs font-semibold text-[#4ed976] border border-[#2b5235]">
                  4 Active Tech Parks
                </span>
              </div>
              <p className="text-xs text-[#8a9e8f]">
                Physical counter bays, rush windows, corporate meal subsidies & kiosk deployments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("admin-flow/AdminConsole")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#223126] hover:bg-[#2b3e30] text-[#b0c7b5] border border-[#304736] transition-colors"
              >
                Back to Admin Console
              </button>
            )}
          </div>
        </header>

        {/* Campus Grid */}
        <section aria-label="Partner Campuses" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {campuses.map((c) => {
            const isSelected = selectedCampus.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCampus(c)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#203024] border-[#4ed976] shadow-md"
                    : "bg-[#1a231d] border-[#293b2d] hover:bg-[#1e2a21]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-[#273a2c] flex items-center justify-center text-[#4ed976]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#162e1c] text-[#4ed976] border border-[#2c5335]">
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{c.name}</h3>
                <p className="text-[11px] text-[#8a9e8f] mt-1 line-clamp-1">{c.location}</p>

                <div className="mt-3 pt-3 border-t border-[#26372a] grid grid-cols-2 gap-1 text-[11px] text-[#8a9e8f]">
                  <div>
                    Counters: <strong className="text-white">{c.activeVendors}/{c.totalCounters}</strong>
                  </div>
                  <div>
                    Peak Vol: <strong className="text-[#f09562]">{c.dailyPeakOrders}/day</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Selected Campus Management Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Counter Bay Layout */}
          <div className="lg:col-span-7 rounded-2xl bg-[#19231c] border border-[#293b2d] p-5">
            <div className="flex items-center justify-between border-b border-[#26372a] pb-3 mb-4">
              <div>
                <h2 className="font-bold text-base text-white">{selectedCampus.name}</h2>
                <p className="text-xs text-[#8a9e8f]">Food Court Counter Bay Allotment</p>
              </div>
              <button
                type="button"
                onClick={() => notify("Added new Counter Bay 09 to floorplan")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#223326] text-[#8bf2a9] border border-[#2d4634] hover:bg-[#2a3e2f] flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Counter Bay
              </button>
            </div>

            {/* Bays Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { bay: "BAY 01", name: "Chai & Samosa Hub", category: "Chai & Snacks", status: "occupied", color: "#3b82f6" },
                { bay: "BAY 02", name: "Little Fern Kitchen", category: "South Indian & Coffee", status: "occupied", color: "#ed6c2d" },
                { bay: "BAY 03", name: "Royal Andhra Thali Co.", category: "Andhra & Biryani", status: "occupied", color: "#10b981" },
                { bay: "BAY 04", name: "Healthy Bowl Co.", category: "Salads & Smoothies", status: "occupied", color: "#8b5cf6" },
                { bay: "BAY 05", name: "Dosa Express", category: "Tawa Snacks", status: "occupied", color: "#f59e0b" },
                { bay: "BAY 06", name: "Vacant Bay", category: "Open for Bidding", status: "vacant", color: "#6b7280" },
              ].map((slot) => (
                <div
                  key={slot.bay}
                  className={`p-3 rounded-xl border text-xs ${
                    slot.status === "occupied"
                      ? "bg-[#141b16] border-[#253629]"
                      : "bg-[#161f18] border-dashed border-[#344b39]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#718576] font-bold">{slot.bay}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        slot.status === "occupied"
                          ? "bg-[#172d1d] text-[#4ed976]"
                          : "bg-[#252c26] text-[#9ca3af]"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                  <div className="font-bold text-white mt-1">{slot.name}</div>
                  <div className="text-[10px] text-[#8a9e8f]">{slot.category}</div>
                </div>
              ))}
            </div>

            {/* Rush Window Config */}
            <div className="mt-5 pt-4 border-t border-[#26372a]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9e8f] mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#ed6c2d]" /> Automated Peak Rush Scheduling
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#141b16] border border-[#253629]">
                  <span className="text-[#8a9e8f]">Lunch Rush Window:</span>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedCampus.lunchRush}</div>
                  <span className="text-[10px] text-[#4ed976]">Surge prep slots active</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141b16] border border-[#253629]">
                  <span className="text-[#8a9e8f]">Evening Chai Rush:</span>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedCampus.eveningRush}</div>
                  <span className="text-[10px] text-[#38bdf8]">Snack fast-track active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Emergency Campus Broadcast */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-[#19231c] border border-[#293b2d] p-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2 mb-1">
                <Megaphone className="h-4 w-4 text-[#f59e0b]" /> Campus Broadcast Banner
              </h3>
              <p className="text-xs text-[#8a9e8f] mb-4">
                Alerts displayed to all users ordering within {selectedCampus.name}
              </p>

              {activeBroadcast && (
                <div className="rounded-xl bg-[#2b2112] border border-[#59421e] p-3 text-xs text-[#fde68a] mb-4 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#f59e0b]">
                      Active Announcement
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBroadcast(null);
                        notify("Removed broadcast banner");
                      }}
                      className="text-[#f59e0b] hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#fed7aa]">{activeBroadcast}</p>
                </div>
              )}

              <form onSubmit={handlePublishBroadcast} className="space-y-3">
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g., Food Court North Entrance closed for painting. Please use East Skybridge."
                  className="w-full bg-[#121814] border border-[#2a3e2f] rounded-xl p-3 text-xs text-white placeholder-[#5a7161] focus:outline-none focus:border-[#4ed976]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#ed6c2d] hover:bg-[#d95d20] text-white transition-all cursor-pointer shadow-md"
                >
                  Publish Campus Announcement
                </button>
              </form>
            </div>

            {/* Corporate Subsidy Rule */}
            <div className="rounded-2xl bg-[#19231c] border border-[#293b2d] p-5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#4ed976]" /> Corporate Employee Subsidy
                </span>
                <span className="text-[#4ed976] font-bold">10% Platform Tier</span>
              </div>
              <p className="text-[#8a9e8f]">
                Employees possessing an @embassy, @google, or @cisco corporate email automatically receive 10% off canteen pre-orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminCampusManagement;
