import { useMemo, useState, type ReactNode } from "react";
import {
  Armchair,
  ArrowUpRight,
  Bell,
  Building,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDot,
  Clock3,
  Grid2X2,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  MenuSquare,
  MoreHorizontal,
  PackageCheck,
  Pause,
  Play,
  Plus,
  ReceiptIndianRupee,
  Settings2,
  ShieldCheck,
  Ticket,
  Utensils,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

type OrderStatus = "new" | "prepping" | "ready";
type ServiceWindow = "Breakfast" | "Lunch" | "Dinner";

type VendorOrder = {
  id: string;
  customer: string;
  initials: string;
  items: string;
  total: string;
  pickup: string;
  status: OrderStatus;
  plan: "Pass" | "Prepaid";
};

const initialOrders: VendorOrder[] = [
  {
    id: "TOT-1842",
    customer: "Ananya Rao",
    initials: "AR",
    items: "2 × Paneer tikka bowl · 1 × lime soda",
    total: "₹468",
    pickup: "12:40–12:50",
    status: "new",
    plan: "Pass",
  },
  {
    id: "TOT-1839",
    customer: "Kabir Mehta",
    initials: "KM",
    items: "1 × Andhra thali · 1 × filter coffee",
    total: "₹327",
    pickup: "12:35–12:45",
    status: "prepping",
    plan: "Prepaid",
  },
  {
    id: "TOT-1834",
    customer: "Ishita Sen",
    initials: "IS",
    items: "1 × millet khichdi · 1 × chaas",
    total: "₹244",
    pickup: "12:25–12:35",
    status: "ready",
    plan: "Pass",
  },
];

const menuItems = [
  { name: "Paneer tikka bowl", detail: "Millet · mint yoghurt · greens", price: "₹234", available: true, tint: "#efb668", mark: "PB" },
  { name: "Andhra thali", detail: "Rice · dal · 3 seasonal sides", price: "₹289", available: true, tint: "#d96b45", mark: "AT" },
  { name: "Millet khichdi", detail: "Ghee · vegetables · crisp papad", price: "₹179", available: false, tint: "#8fa99a", mark: "MK" },
];

const statusCopy: Record<OrderStatus, string> = {
  new: "New order",
  prepping: "In prep",
  ready: "Ready",
};

const nextAction: Record<OrderStatus, string> = {
  new: "Start prepping",
  prepping: "Mark ready",
  ready: "Handed off",
};

const windowData: Record<ServiceWindow, { capacity: number; booked: number; label: string }> = {
  Breakfast: { capacity: 32, booked: 27, label: "7:30–10:30 AM" },
  Lunch: { capacity: 48, booked: 41, label: "12:00–3:00 PM" },
  Dinner: { capacity: 36, booked: 19, label: "7:00–10:00 PM" },
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full p-1 transition-colors duration-200 ${checked ? "bg-[#dd693c]" : "bg-[#cfc6bb]"}`}
    >
      <span className={`block h-5 w-5 rounded-full bg-[#fffaf2] shadow-[0_2px_5px_rgba(47,38,30,0.18)] transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SectionLabel({ children, action }: { children: ReactNode; action?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#ad8268]">{children}</p>
      {action && <span className="text-[10px] font-bold text-[#bd5c31]">{action}</span>}
    </div>
  );
}

function BottomNav({
  active,
  onSelect,
  orderCount,
}: {
  active: string;
  onSelect: (label: string) => void;
  orderCount: number;
}) {
  const items = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Orders", icon: ReceiptIndianRupee },
    { label: "Menu", icon: MenuSquare },
    { label: "Capacity", icon: Grid2X2 },
    { label: "Store", icon: Settings2 },
  ];
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[#e8d9c9] bg-[#fffaf3]/95 px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md" aria-label="Vendor navigation">
      <div className="flex items-center justify-around">
        {items.map(({ label, icon: Icon }) => {
          const selected = active === label;
          return (
            <button
              type="button"
              key={label}
              onClick={() => onSelect(label)}
              className={`relative flex min-w-[59px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all active:scale-95 ${selected ? "text-[#d25e32]" : "text-[#a89583] hover:text-[#6b5140]"}`}
            >
              <span className="relative">
                <Icon className="h-[17px] w-[17px]" strokeWidth={selected ? 2.5 : 2} />
                {label === "Orders" && orderCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d25e32] px-1 text-[9px] font-black text-[#fff9f1]">{orderCount}</span>
                )}
              </span>
              <span className="text-[9px] font-bold">{label}</span>
              {selected && <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-[#d25e32]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function VendorDashboard({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
} = {}) {
  const [storeOpen, setStoreOpen] = useState(true);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [rushPause, setRushPause] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const [menuAvailability, setMenuAvailability] = useState<Record<string, boolean>>({
    "Paneer tikka bowl": true,
    "Andhra thali": true,
    "Millet khichdi": false,
  });
  const [activeWindow, setActiveWindow] = useState<ServiceWindow>("Lunch");
  const [activeNav, setActiveNav] = useState("Overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerifier, setShowVerifier] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const liveOrders = useMemo(() => orders.filter((order) => order.status !== "ready"), [orders]);
  const lunch = windowData[activeWindow];
  const openSlots = lunch.capacity - lunch.booked;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const advanceOrder = (id: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== id) return order;
        if (order.status === "new") return { ...order, status: "prepping" };
        if (order.status === "prepping") return { ...order, status: "ready" };
        return order;
      }),
    );
    const order = orders.find((entry) => entry.id === id);
    if (order) notify(order.status === "new" ? `${order.id} moved to prep` : `${order.id} is ready for pickup`);
  };

  const selectNav = (label: string) => {
    setActiveNav(label);
    const targets: Record<string, string> = {
      Overview: "dashboard-top",
      Orders: "orders-section",
      Menu: "menu-section",
      Capacity: "capacity-section",
      Store: "store-section",
    };
    document.getElementById(targets[label])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#eadfd3] font-['DM_Sans'] text-[#302820] sm:px-5 sm:py-5">
      <style>{`
        @keyframes vendor-rise { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vendor-pulse { 0%, 100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.18); opacity: .35; } }
        .vendor-rise { animation: vendor-rise 480ms cubic-bezier(.2,.8,.2,1) both; }
        .vendor-pulse { animation: vendor-pulse 2.2s ease-in-out infinite; }
      `}</style>
      <div id="dashboard-top" className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#fbf4ea] shadow-[0_24px_80px_rgba(82,54,35,0.18)] sm:min-h-[880px] sm:rounded-[30px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_94%_2%,rgba(219,111,60,0.25),transparent_34%),radial-gradient(circle_at_10%_17%,rgba(131,165,145,0.18),transparent_33%)]" />

        <header className="relative px-5 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStoreMenu((current) => !current)}
                className="flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
                aria-expanded={showStoreMenu}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#2f3a34] text-[16px] font-black tracking-[-0.12em] text-[#f5bd72] shadow-[0_6px_14px_rgba(47,58,52,0.18)]">to</span>
                <span>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#a5856b]">Vendor control room</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[15px] font-extrabold tracking-[-0.02em] text-[#302820]">
                    Tiffin &amp; Co. <ChevronDown className={`h-4 w-4 text-[#a88c76] transition-transform ${showStoreMenu ? "rotate-180" : ""}`} />
                  </span>
                </span>
              </button>
              {showStoreMenu && (
                <div className="absolute left-0 top-14 z-20 w-64 rounded-2xl border border-[#e8d8c8] bg-[#fffaf3] p-2 shadow-[0_18px_35px_rgba(75,48,30,0.16)]">
                  <div className="flex items-center gap-3 rounded-xl bg-[#f4e8d9] px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#dd693c] text-[10px] font-black text-[#fff9f1]">TC</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold">Tiffin &amp; Co. · Indiranagar</span>
                      <span className="text-[10px] text-[#947965]">Open · Bengaluru</span>
                    </span>
                    <Check className="h-4 w-4 text-[#d25e32]" />
                  </div>
                  <button type="button" onClick={() => notify("Store switcher is ready for more locations")} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-bold text-[#826b59] hover:bg-[#f7eee4]">
                    <Plus className="h-4 w-4" /> Add another store
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              aria-label="View vendor alerts"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-[#e4d4c5] bg-[#fffaf3] text-[#604b3b] transition-colors hover:border-[#d56a3b] active:scale-95"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={2.1} />
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d25e32] ring-2 ring-[#fffaf3]" />
            </button>
            {showNotifications && (
              <div className="absolute right-5 top-[72px] z-20 w-[260px] rounded-2xl border border-[#e8d8c8] bg-[#fffaf3] p-3 shadow-[0_18px_35px_rgba(75,48,30,0.16)]">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-extrabold">Today's signals</p>
                  <button type="button" aria-label="Close vendor alerts" onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-[#a58b77]" /></button>
                </div>
                <p className="rounded-xl bg-[#fff0df] px-3 py-2 text-[11px] leading-4 text-[#92502e]">Lunch is 85% booked. Consider opening the 1:15 PM pickup slot.</p>
                <p className="mt-2 rounded-xl bg-[#eef3ec] px-3 py-2 text-[11px] leading-4 text-[#4d725d]">Your FSSAI verification is active through 08 Nov 2025.</p>
              </div>
            )}
          </div>
        </header>

        <section id="store-section" className="relative px-5 vendor-rise">
          <div className="overflow-hidden rounded-[25px] bg-[#2f3a34] p-5 text-[#fff8ef] shadow-[0_15px_30px_rgba(47,58,52,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.03em] text-[#bdd0c1]"><MapPin className="h-3.5 w-3.5 text-[#f2b76b]" /> 18th Main · Indiranagar, BLR</p>
                <h1 className="mt-2 font-['Fraunces'] text-[29px] font-semibold leading-[1.02] tracking-[-0.05em]">Keep lunch<br />in rhythm.</h1>
              </div>
              <span className="rounded-full bg-[#465349] px-2.5 py-1 text-[10px] font-bold text-[#f6c98d]">Wed, 18 Jun</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#526057] pt-4">
              <div className="flex items-center gap-2.5">
                <span className={`relative grid h-9 w-9 place-items-center rounded-full ${storeOpen ? "bg-[#f2b76b] text-[#2f3a34]" : "bg-[#59655c] text-[#d2ded2]"}`}>
                  {storeOpen ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
                  {storeOpen && <span className="vendor-pulse absolute inset-0 rounded-full border-2 border-[#f2b76b]" />}
                </span>
                <span>
                  <span className="block text-[13px] font-extrabold">{storeOpen ? "Store is open" : "Store is closed"}</span>
                  <span className="mt-0.5 block text-[10px] text-[#bfd0c2]">{storeOpen ? "Taking orders until 3:30 PM" : "Customers cannot place orders"}</span>
                </span>
              </div>
              <Toggle checked={storeOpen} onChange={() => { setStoreOpen((current) => !current); setAcceptingOrders(storeOpen); }} label="Toggle store availability" />
            </div>
          </div>
        </section>

        <section className="relative px-5 pt-4 vendor-rise" style={{ animationDelay: "70ms" }}>
          <SectionLabel action="Updated just now">Right now</SectionLabel>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-[18px] border border-[#f0d2bc] bg-[#fff0e1] px-3 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f4c294] text-[#9f4f29]"><CircleAlert className="h-4 w-4" /></span>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.09em] text-[#b35d35]">Attention</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold tracking-[-0.08em] text-[#963f1f]">{liveOrders.length}</p>
            </div>
            <div className="rounded-[18px] border border-[#d4e3d6] bg-[#eef4ec] px-3 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#cfe0cf] text-[#47735c]"><PackageCheck className="h-4 w-4" /></span>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.09em] text-[#628269]">Ready</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold tracking-[-0.08em] text-[#3d6c53]">{orders.filter((order) => order.status === "ready").length}</p>
            </div>
            <div className="rounded-[18px] border border-[#d8e1e2] bg-[#edf3f2] px-3 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#d1e2e2] text-[#4c7779]"><ReceiptIndianRupee className="h-4 w-4" /></span>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.09em] text-[#688688]">Sales</p>
              <p className="mt-0.5 font-mono text-[20px] font-bold tracking-[-0.08em] text-[#3e686c]">₹18.4k</p>
            </div>
          </div>
        </section>

        <section id="orders-section" className="relative px-5 pt-6 vendor-rise" style={{ animationDelay: "120ms" }}>
          <SectionLabel action="View all">Incoming prepaid orders</SectionLabel>
          <div className="overflow-hidden rounded-[21px] border border-[#eadbcb] bg-[#fffaf3] shadow-[0_8px_18px_rgba(75,48,30,0.06)]">
            <div className="flex items-center justify-between border-b border-[#eee1d5] bg-[#fff7ee] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ping rounded-full bg-[#d25e32]/50" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#d25e32]" /></span>
                <span className="text-[11px] font-extrabold text-[#4f3d31]">Live order queue</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#a48770]"><LockKeyhole className="h-3 w-3" /> Prepaid only</span>
            </div>
            <div className="divide-y divide-[#eee1d5]">
              {orders.map((order, index) => (
                <div key={order.id} className="p-3.5" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="flex items-start gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-black ${order.plan === "Pass" ? "bg-[#d9e6d6] text-[#4d7257]" : "bg-[#f5ddc7] text-[#a2522e]"}`}>{order.initials}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12px] font-extrabold text-[#3a3029]">{order.customer}</p>
                        <span className="shrink-0 font-mono text-[10px] font-bold text-[#927764]">{order.id}</span>
                      </div>
                      <p className="mt-1 truncate text-[10px] text-[#947d6b]">{order.items}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${order.status === "new" ? "bg-[#fff0df] text-[#b04c23]" : order.status === "prepping" ? "bg-[#eef3ec] text-[#4b755b]" : "bg-[#e8f0f0] text-[#447578]"}`}>{statusCopy[order.status]}</span>
                        <span className="flex items-center gap-1 text-[9px] font-semibold text-[#9b826d]"><Clock3 className="h-3 w-3" /> {order.pickup}</span>
                        <span className="ml-auto font-mono text-[11px] font-bold text-[#47382d]">{order.total}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => notify(`Options opened for ${order.id}`)} aria-label={`More options for ${order.id}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#a98d77] hover:bg-[#f4e8dc]"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>
                  <button type="button" disabled={order.status === "ready"} onClick={() => advanceOrder(order.id)} className={`mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-[10px] font-extrabold transition-all active:scale-[0.98] ${order.status === "ready" ? "border border-[#d7e3df] bg-[#f2f7f4] text-[#59816b]" : "bg-[#343c36] text-[#fff8ef] hover:bg-[#414b43]"}`}>
                    {order.status === "ready" ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                    {nextAction[order.status]}
                    {order.status !== "ready" && <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premises, Tables & Multi-Staff Ecosystem Module */}
        <section className="relative px-5 pt-6 vendor-rise" style={{ animationDelay: "140ms" }}>
          <SectionLabel action="Multi-Branch Active">Premises, Tables &amp; Staff</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("vendor-flow/VendorTableManagement")}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-[#eadbcb] bg-[#fffaf3] p-3.5 text-left shadow-[0_8px_18px_rgba(75,48,30,0.05)] hover:border-[#d25e32] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ecfdf5] text-[#15803d] border border-[#bbf7d0]">
                  <Armchair className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-xs font-black text-[#302820]">
                    Tables &amp; Multi-Branch
                  </span>
                  <span className="block text-[10px] text-[#9b826d]">
                    Live floorplan, seat OTPs &amp; rush calibration
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#a88c76] group-hover:text-[#d25e32] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate && onNavigate("vendor-flow/StaffManagement")}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-[#eadbcb] bg-[#fffaf3] p-3.5 text-left shadow-[0_8px_18px_rgba(75,48,30,0.05)] hover:border-[#d25e32] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                  <UsersRound className="h-5 w-5" />
                </span>
                <div>
                  <span className="block text-xs font-black text-[#302820]">
                    Staff &amp; Role-Based Access
                  </span>
                  <span className="block text-[10px] text-[#9b826d]">
                    Cooks, Waiters &amp; Dispatcher credentials
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#a88c76] group-hover:text-[#d25e32] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </section>

        <section id="menu-section" className="relative px-5 pt-6 vendor-rise" style={{ animationDelay: "170ms" }}>
          <SectionLabel action="Edit menu">Menu availability</SectionLabel>
          <div className="rounded-[21px] border border-[#eadbcb] bg-[#fffaf3] shadow-[0_8px_18px_rgba(75,48,30,0.05)]">
            <div className="flex items-center justify-between border-b border-[#eee1d5] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f5dfcb] text-[#be5c30]"><Utensils className="h-4 w-4" /></span>
                <div><p className="text-[12px] font-extrabold">Lunch menu</p><p className="text-[10px] text-[#9b826d]">3 items · service starts at noon</p></div>
              </div>
              <button type="button" onClick={() => notify("Menu editor selected")} className="text-[#bd5c31]"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="divide-y divide-[#eee1d5]">
              {menuItems.map((item) => {
                const available = menuAvailability[item.name];
                return (
                  <div key={item.name} className={`flex items-center gap-3 px-4 py-3 ${available ? "" : "bg-[#fbf3ea]"}`}>
                    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-black text-[#4e382a]" style={{ backgroundColor: item.tint }}>
                      <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-4 border-[#fffaf3]/45" />
                      {item.mark}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[12px] font-extrabold ${available ? "text-[#40342c]" : "text-[#968678]"}`}>{item.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[#9a8370]">{item.detail}</p>
                      <p className="mt-1 font-mono text-[10px] font-bold text-[#685344]">{item.price} {available ? "" : "· Sold out"}</p>
                    </div>
                    <Toggle checked={available} onChange={() => { setMenuAvailability((current) => ({ ...current, [item.name]: !current[item.name] })); notify(`${item.name} ${available ? "marked sold out" : "back on the menu"}`); }} label={`${item.name} availability`} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="capacity-section" className="relative px-5 pt-6 vendor-rise" style={{ animationDelay: "220ms" }}>
          <SectionLabel action="Manage slots">Meal &amp; table capacity</SectionLabel>
          <div className="rounded-[21px] border border-[#eadbcb] bg-[#fffaf3] p-4 shadow-[0_8px_18px_rgba(75,48,30,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-extrabold text-[#3e332b]">Today’s reservations</p>
                <p className="mt-1 text-[10px] text-[#9d836d]">Table and meal-slot inventory in one view</p>
              </div>
              <CalendarClock className="h-5 w-5 text-[#c36a3a]" />
            </div>
            <div className="mt-4 flex gap-1.5 rounded-xl bg-[#f4e9de] p-1">
              {(Object.keys(windowData) as ServiceWindow[]).map((window) => (
                <button key={window} type="button" onClick={() => setActiveWindow(window)} className={`flex-1 rounded-lg py-2 text-[10px] font-extrabold transition-colors ${activeWindow === window ? "bg-[#343c36] text-[#fff8ef] shadow-[0_3px_8px_rgba(47,58,52,0.15)]" : "text-[#987b66] hover:text-[#584638]"}`}>{window}</button>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-mono text-[30px] font-bold leading-none tracking-[-0.08em] text-[#3a4c40]">{lunch.booked}<span className="text-[16px] text-[#9c8c7c]"> / {lunch.capacity}</span></p>
                <p className="mt-1 text-[10px] font-bold text-[#7d6b5c]">{activeWindow} tables reserved · {lunch.label}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${openSlots < 10 ? "bg-[#fff0df] text-[#b14c23]" : "bg-[#e7f0e7] text-[#4c765c]"}`}>{openSlots} spots left</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8ded4]"><div className={`h-full rounded-full transition-all duration-300 ${openSlots < 10 ? "bg-[#d56b3b]" : "bg-[#719b78]"}`} style={{ width: `${(lunch.booked / lunch.capacity) * 100}%` }} /></div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#e8dbcd] bg-[#fffdf8] px-3 py-2.5">
              <div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-[#bd6a3a]" /><span className="text-[10px] font-bold text-[#695547]">Release one more slot at 1:15 PM</span></div>
              <button type="button" onClick={() => notify(`${activeWindow} capacity settings opened`)} className="text-[#bc5c31]"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="relative px-5 pt-6 vendor-rise" style={{ animationDelay: "270ms" }}>
          <SectionLabel action="Manage All" onAction={() => onNavigate && onNavigate("vendor-flow/VendorMealPlans")}>Subscription &amp; pass plans</SectionLabel>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => onNavigate ? onNavigate("vendor-flow/VendorMealPlans") : notify("Monthly Pass overview opened")} className="rounded-[20px] border border-[#d9e4d7] bg-[#edf4eb] p-3.5 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#d1e3d0] text-[#4d795b]"><Ticket className="h-4 w-4" /></span>
              <p className="mt-3 text-[12px] font-extrabold text-[#3d604b]">Monthly Pass</p>
              <p className="mt-0.5 text-[10px] text-[#66836c]">88 active subscribers</p>
              <p className="mt-3 font-mono text-[17px] font-bold tracking-[-0.05em] text-[#3f6e51]">₹2,06,800</p>
              <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#66836c]">Manage Plans <ArrowUpRight className="h-3 w-3" /></span>
            </button>
            <button type="button" onClick={() => onNavigate ? onNavigate("vendor-flow/VendorMealPlans") : notify("Weekly Pass overview opened")} className="rounded-[20px] border border-[#ecd8bf] bg-[#fff1df] p-3.5 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f5d3ac] text-[#a5542c]"><WalletCards className="h-4 w-4" /></span>
              <p className="mt-3 text-[12px] font-extrabold text-[#76442e]">Weekly Pass</p>
              <p className="mt-0.5 text-[10px] text-[#a36f50]">42 active subscribers</p>
              <p className="mt-3 font-mono text-[17px] font-bold tracking-[-0.05em] text-[#9d4d28]">₹25,116</p>
              <span className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#a36f50]">Manage Plans <ArrowUpRight className="h-3 w-3" /></span>
            </button>
          </div>
        </section>

        <section className="relative px-5 pb-5 pt-6">
          <SectionLabel>Account health</SectionLabel>
          <button type="button" onClick={() => setShowVerifier(true)} className="flex w-full items-center gap-3 rounded-[19px] border border-[#deded2] bg-[#f2f5ec] p-3.5 text-left transition-colors hover:bg-[#edf2e8]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5e4d3] text-[#4a7758]"><ShieldCheck className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[12px] font-extrabold text-[#3d604a]">Verified for customer trust</span><span className="mt-0.5 block text-[10px] text-[#71816c]">FSSAI, bank account and store details are current</span></span>
            <ChevronRight className="h-4 w-4 text-[#779178]" />
          </button>
        </section>

        <div className="border-t border-[#eadbcb] bg-[#f8eee3] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ead1bd] text-[#a6552d]"><CircleDot className="h-3.5 w-3.5" /></span>
              <div><p className="text-[11px] font-extrabold">Rush controls</p><p className="text-[10px] text-[#997e69]">{acceptingOrders && !rushPause ? "Accepting prepaid orders" : "Orders are paused"}</p></div>
            </div>
            <button type="button" onClick={() => { setRushPause((current) => !current); setAcceptingOrders((current) => !current); }} className={`rounded-full px-3 py-2 text-[10px] font-extrabold transition-colors ${rushPause ? "bg-[#343c36] text-[#fff8ef]" : "border border-[#e3cdb9] bg-[#fffaf3] text-[#b75b31]"}`}>{rushPause ? "Resume orders" : "Pause 15 min"}</button>
          </div>
        </div>

        <BottomNav active={activeNav} onSelect={selectNav} orderCount={liveOrders.length} />

        {toast && (
          <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#343c36] px-4 py-2.5 text-[10px] font-bold text-[#fff8ef] shadow-[0_12px_24px_rgba(47,58,52,0.22)] sm:absolute">
            <Check className="h-3.5 w-3.5 text-[#f2b76b]" strokeWidth={3} /> {toast}
          </div>
        )}

        {showVerifier && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#302820]/35 px-3 pb-3 backdrop-blur-[2px] sm:absolute">
            <section role="dialog" aria-modal="true" aria-labelledby="vendor-verification-title" className="vendor-rise w-full max-w-[390px] rounded-[23px] bg-[#fffaf3] p-5 shadow-[0_18px_45px_rgba(47,38,30,0.25)]">
              <div className="flex items-start justify-between">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#bd5c31]">Store verification</p><h2 id="vendor-verification-title" className="mt-1 font-['Fraunces'] text-[26px] font-semibold tracking-[-0.04em]">All clear, Maya.</h2></div>
                <button type="button" aria-label="Close verification details" onClick={() => setShowVerifier(false)} className="grid h-8 w-8 place-items-center rounded-full bg-[#f1e5d9] text-[#745e4d]"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-5 space-y-2">
                {["FSSAI registration", "Bank settlement account", "Store address & hours"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-[#f1f6ee] px-3.5 py-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#d2e4d0] text-[#4b7958]"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span><span className="flex-1 text-[11px] font-bold text-[#4d684e]">{item}</span><span className="text-[10px] font-extrabold text-[#5e8769]">Verified</span></div>)}
              </div>
              <button type="button" onClick={() => { setShowVerifier(false); notify("Verification details are up to date"); }} className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#343c36] text-[12px] font-extrabold text-[#fff8ef]">Done</button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default VendorDashboard;