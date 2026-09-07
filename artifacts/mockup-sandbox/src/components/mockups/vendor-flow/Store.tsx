import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Clock3,
  Home,
  LayoutGrid,
  MapPin,
  MenuSquare,
  PackageCheck,
  Pause,
  Play,
  Plus,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Store as StoreIcon,
  UserRound,
  X,
  Zap,
} from "lucide-react";

type QuickAction = {
  id: string;
  label: string;
  detail: string;
  icon: typeof MenuSquare;
  tone: "orange" | "cream" | "ink";
};

const quickActions: QuickAction[] = [
  { id: "menu", label: "Edit Menu", detail: "7 items live · 1 sold out", icon: MenuSquare, tone: "orange" },
  { id: "orders", label: "Kitchen Queue", detail: "4 orders active", icon: ClipboardList, tone: "cream" },
  { id: "sales", label: "Today's Sales", detail: "₹4,890 · 18 pickups", icon: BarChart3, tone: "ink" },
  { id: "compliance", label: "FSSAI & Bank", detail: "Verified status", icon: Settings2, tone: "cream" },
];

export function Store({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [acceptsOrders, setAcceptsOrders] = useState(true);

  // Temporary Break state
  const [onBreak, setOnBreak] = useState(false);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Operating Hours state
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [schedule, setSchedule] = useState([
    { day: "Monday - Friday", hours: "7:30 AM – 10:30 PM", active: true },
    { day: "Saturday", hours: "8:00 AM – 11:00 PM", active: true },
    { day: "Sunday", hours: "8:00 AM – 4:00 PM", active: false },
  ]);

  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Live timer for break countdown
  useEffect(() => {
    if (!onBreak || breakSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setBreakSecondsLeft((prev) => {
        if (prev <= 1) {
          setOnBreak(false);
          setAcceptsOrders(true);
          notify("Break ended! Store is now accepting customer orders.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBreak, breakSecondsLeft]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const startBreak = (minutes: number) => {
    setOnBreak(true);
    setBreakSecondsLeft(minutes * 60);
    setAcceptsOrders(false);
    setShowBreakModal(false);
    notify(`Kitchen on temporary break for ${minutes} mins. Customers cannot order.`);
  };

  const endBreakEarly = () => {
    setOnBreak(false);
    setBreakSecondsLeft(0);
    setAcceptsOrders(true);
    notify("Break ended early. Store is now accepting orders!");
  };

  const handleStoreToggle = () => {
    setIsOpen((current) => {
      const next = !current;
      if (!next) {
        setAcceptsOrders(false);
        setOnBreak(false);
        setBreakSecondsLeft(0);
        notify("Store closed. Customers cannot place new orders.");
      } else {
        setAcceptsOrders(true);
        notify("Store opened! Taking orders for current service window.");
      }
      return next;
    });
  };

  const triggerAction = (actionId: string) => {
    if (actionId === "menu") {
      if (onNavigate) onNavigate("vendor-flow/Menu");
    } else if (actionId === "orders") {
      if (onNavigate) onNavigate("vendor-flow/Orders");
    } else if (actionId === "compliance") {
      if (onNavigate) onNavigate("vendor-flow/Verification");
    } else if (actionId === "sales") {
      notify("Today's Settlement: ₹4,890 will be credited at 11:30 PM.");
    }
  };

  // Status computation
  const statusBadge = onBreak
    ? { label: "On Break", bg: "bg-[#e54b38] text-white" }
    : !isOpen
    ? { label: "Closed", bg: "bg-[#716155] text-white" }
    : { label: "Open & Live", bg: "bg-[#2d8442] text-white" };

  return (
    <main className="min-h-[100dvh] w-full bg-[#ede3d7] px-0 text-[#30231e] sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#f7f0e7] shadow-[0_20px_80px_rgba(53,35,24,0.15)] sm:min-h-[850px] sm:rounded-[32px] border border-[#ebdcd0]">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 left-4 right-4 z-50 rounded-xl bg-[#2e3731] px-4 py-2.5 text-xs font-semibold text-[#fff9f1] shadow-xl flex items-center gap-2">
            <Check className="h-4 w-4 text-[#79c394]" />
            <span>{toast}</span>
          </div>
        )}

        <header className="relative flex items-center justify-between px-5 pb-3 pt-4">
          <button
            type="button"
            onClick={() => setShowStorePicker((c) => !c)}
            className="flex items-center gap-2.5 rounded-2xl text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#30231e] text-[15px] font-black text-[#ff9a3d] shadow-sm">
              to
            </span>
            <span className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#987b67]">TakeOnTime Partner</span>
              <span className="flex items-center gap-1 text-[14px] font-extrabold text-[#30231e]">
                Little Fern Kitchen
                <ChevronDown className={`h-3.5 w-3.5 text-[#a98871] transition-transform ${showStorePicker ? "rotate-180" : ""}`} />
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>

            <button
              type="button"
              onClick={() => setShowNotifications((c) => !c)}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-[#dfd0c1] bg-[#fdf8f2] text-[#49352c]"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e4661d] ring-2 ring-[#fdf8f2]" />
            </button>
          </div>

          {/* Store Switcher Dropdown */}
          {showStorePicker && (
            <div className="absolute left-5 right-5 top-[68px] z-30 rounded-2xl border border-[#eadbcb] bg-[#fffaf5] p-2.5 shadow-xl">
              <div className="flex items-center gap-3 rounded-xl bg-[#fff0e1] px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff9a3d] text-xs font-black text-[#30231e]">LF</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#30231e]">Little Fern Kitchen</p>
                  <p className="text-[10px] text-[#987b67]">Koramangala 4th Block · Active</p>
                </div>
                <Check className="h-4 w-4 text-[#e4661d]" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStorePicker(false);
                  notify("Partner store multi-location access coming soon");
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#8b7565] hover:bg-[#f5eadf]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add branch / canteen outlet</span>
              </button>
            </div>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-5 top-[68px] z-30 w-64 rounded-2xl border border-[#eadbcb] bg-[#fffaf5] p-3 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#eee2d6]">
                <span className="font-extrabold text-[#30231e]">Kitchen Updates</span>
                <button type="button" onClick={() => setShowNotifications(false)}>
                  <X className="h-3.5 w-3.5 text-[#a98871]" />
                </button>
              </div>
              <div className="mt-2 space-y-2 text-[#674f40]">
                <p className="rounded-lg bg-[#f8eee4] p-2 text-[11px] leading-relaxed">
                  Lunch Rush: 4 orders in queue. Estimated avg prep time: 9 mins.
                </p>
                <p className="rounded-lg bg-[#f8eee4] p-2 text-[11px] leading-relaxed">
                  Daily payout of ₹4,890 scheduled for 11:30 PM.
                </p>
              </div>
            </div>
          )}
        </header>

        {/* Store Operational Card */}
        <section className="px-5 pt-2">
          <div className="rounded-3xl bg-[#30231e] p-5 text-[#fff8ef] shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="flex items-center gap-1 text-xs text-[#d8bca5]">
                  <MapPin className="h-3.5 w-3.5 text-[#ff9a3d]" />
                  Koramangala 4th Block · Bengaluru
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">
                  Kitchen Operations
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowHoursModal(true)}
                className="flex items-center gap-1 rounded-full bg-[#4a352a] px-2.5 py-1 text-[10px] font-bold text-[#ffb16b] hover:bg-[#5b4235]"
              >
                <Clock className="h-3 w-3" />
                <span>Hours</span>
              </button>
            </div>

            {/* Store Toggle */}
            <div className="flex items-center justify-between border-t border-[#554139] pt-3.5">
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${isOpen ? "bg-[#ff9a3d] text-[#30231e]" : "bg-[#5b4940] text-[#d8bca5]"}`}>
                  {isOpen ? <Zap className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
                </span>
                <div>
                  <span className="block text-xs font-extrabold">
                    {isOpen ? "Store is Open" : "Store is Closed"}
                  </span>
                  <span className="text-[10px] text-[#c5a995]">
                    {isOpen ? "Prepaid pickup orders enabled" : "Customers cannot place orders"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isOpen}
                onClick={handleStoreToggle}
                className={`relative h-7 w-12 rounded-full p-1 transition-colors ${isOpen ? "bg-[#ff9a3d]" : "bg-[#624b3e]"}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isOpen ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Rush & Break Controls */}
        <section className="px-5 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#987b67]">
              Live Rush Controls
            </span>
            <span className="text-[10px] font-bold text-[#8b6f5c] flex items-center gap-1">
              <Clock3 className="h-3 w-3" /> Live Synced
            </span>
          </div>

          <div className="rounded-2xl border border-[#e7d9cc] bg-[#fffaf5] p-3.5 space-y-3">
            {/* Accepting Orders Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`grid h-8 w-8 place-items-center rounded-xl ${acceptsOrders && isOpen ? "bg-[#e8f3ec] text-[#2d8442]" : "bg-[#f5e8e6] text-[#c93f30]"}`}>
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3b2921]">
                    Accepting Orders
                  </p>
                  <p className="text-[10px] text-[#9a7d68]">
                    {acceptsOrders && isOpen
                      ? "Customers can pre-order from your menu"
                      : onBreak
                      ? `Paused due to Temporary Break (${formatCountdown(breakSecondsLeft)})`
                      : "Orders currently stopped"}
                  </p>
                </div>
              </div>

              <span className={`h-6 w-6 rounded-full grid place-items-center ${acceptsOrders && isOpen ? "bg-[#2d8442] text-white" : "bg-[#ded0c2] text-[#937865]"}`}>
                <Check className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="border-t border-[#eee2d7] pt-2.5">
              {onBreak ? (
                <div className="rounded-xl bg-[#fff2f0] border border-[#f5c6c0] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#c93f30] block">
                      Temporary Break Active
                    </span>
                    <p className="font-mono text-base font-black text-[#a93325]">
                      {formatCountdown(breakSecondsLeft)} <span className="text-xs font-normal">remaining</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={endBreakEarly}
                    className="rounded-lg bg-[#c93f30] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#b03224]"
                  >
                    End Break
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#fdf0e7] text-[#dd693c]">
                      <Pause className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#3b2921]">
                        Take a Temporary Break
                      </p>
                      <p className="text-[10px] text-[#9a7d68]">
                        Pause order rush for 15, 30, or 60 minutes
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isOpen}
                    onClick={() => setShowBreakModal(true)}
                    className="rounded-xl border border-[#dd693c] bg-[#fffaf5] px-3 py-1.5 text-xs font-bold text-[#dd693c] hover:bg-[#fdeee4] disabled:opacity-50"
                  >
                    Set Break
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-5 pt-4 pb-6 flex-1">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-black text-[#30231e]">Store Shortcuts</h2>
            <span className="text-[11px] font-bold text-[#d9631c]">
              Operational Links
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map(({ id, label, detail, icon: Icon, tone }) => (
              <button
                type="button"
                key={id}
                onClick={() => triggerAction(id)}
                className={`group relative min-h-[95px] overflow-hidden rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 active:scale-98 ${
                  tone === "orange"
                    ? "border-[#ef8e43] bg-[#ff9a3d] text-[#30231e]"
                    : tone === "ink"
                    ? "border-[#46342c] bg-[#46342c] text-[#fff8ef]"
                    : "border-[#e6d8ca] bg-[#fffaf5] text-[#30231e]"
                }`}
              >
                <div className={`mb-2 grid h-7 w-7 place-items-center rounded-lg ${
                  tone === "orange" ? "bg-[#ffbf80] text-[#814115]" : tone === "ink" ? "bg-[#62483a] text-[#ffb16b]" : "bg-[#f5e8dc] text-[#df6a20]"
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="block text-xs font-extrabold">{label}</span>
                <span className={`mt-0.5 block text-[10px] ${tone === "ink" ? "text-[#d2b9a7]" : tone === "orange" ? "text-[#814115]" : "text-[#9a7d68]"}`}>
                  {detail}
                </span>
                <ArrowUpRight className="absolute bottom-2.5 right-2.5 h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </section>

        {/* Temporary Break Modal */}
        {showBreakModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
                <div className="flex items-center gap-2">
                  <Pause className="h-5 w-5 text-[#dd693c]" />
                  <h3 className="font-extrabold text-sm text-[#2d2420]">Temporary Break</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="p-1 text-[#8e7e72] hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-xs text-[#7e6d61] leading-relaxed">
                Orders will be paused for customer apps. Existing accepted orders can still be completed and handed over.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { label: "15 Minutes", val: 15 },
                  { label: "30 Minutes", val: 30 },
                  { label: "45 Minutes", val: 45 },
                  { label: "60 Minutes", val: 60 },
                ].map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => startBreak(val)}
                    className="rounded-xl border border-[#decbb9] bg-[#fffaf5] py-2.5 hover:border-[#dd693c] hover:bg-[#fdf0e7] text-[#2d2420]"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowBreakModal(false)}
                className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-[#8a796e]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Operating Hours Modal */}
        {showHoursModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#dd693c]" />
                  <h3 className="font-extrabold text-sm text-[#2d2420]">Operating Schedule</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHoursModal(false)}
                  className="p-1 text-[#8e7e72] hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 divide-y divide-[#ebdcd0] text-xs">
                {schedule.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="font-bold text-[#2d2420]">{slot.day}</p>
                      <p className="text-[11px] text-[#8e7e72]">{slot.hours}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${slot.active ? "bg-[#e8f3ec] text-[#2d8442]" : "bg-[#f5e8e6] text-[#c93f30]"}`}>
                      {slot.active ? "Active" : "Closed"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  notify("Operational schedule updated");
                  setShowHoursModal(false);
                }}
                className="mt-4 w-full rounded-xl bg-[#2d2420] py-2.5 text-xs font-bold text-white"
              >
                Save Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Store;
