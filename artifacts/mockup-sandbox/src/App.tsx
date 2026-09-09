import { useEffect, useState, useMemo, type ComponentType } from "react";
import { takeOnTimeStore, getVendorFeatures, type Vendor, type VendorBusinessType } from "@/lib/takeontime-store";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
  onNavigate,
  onComplete,
  onLogout,
}: {
  componentPath: string;
  modules: ModuleMap;
  onNavigate?: (tab: string) => void;
  onComplete?: () => void;
  onLogout?: () => void;
}) {
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp as ComponentType<Record<string, unknown>>);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return (
    <Component
      onNavigate={onNavigate}
      onComplete={onComplete}
      onLogout={onLogout}
    />
  );
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}

function TakeOnTimeEcosystemShell({
  modules,
}: {
  modules: ModuleMap;
}) {
  type AppRole = "vendor" | "customer" | "admin";
  const [appRole, setAppRole] = useState<AppRole>("vendor");
  const [activeTab, setActiveTab] = useState<string>("vendor-flow/VendorDashboard");
  const [currentVendor, setCurrentVendor] = useState<Vendor>(() => takeOnTimeStore.getCurrentVendor());
  const [vendors, setVendors] = useState<Vendor[]>(() => takeOnTimeStore.getVendors());

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setCurrentVendor(takeOnTimeStore.getCurrentVendor());
      setVendors(takeOnTimeStore.getVendors());
    });
    return unsub;
  }, []);

  const vendorFeatures = useMemo(() => {
    return getVendorFeatures(currentVendor?.businessType || "all");
  }, [currentVendor?.businessType]);

  // Vendor views dynamically filtered based on businessType:
  // - If hotel: only table reservations, available meals/menu, KDS, orders, staff RBAC, profile & sub-staff (no meal plans)
  // - If mess: table/seat reservations (for passes or single regular), meal pass/plans, tiffin pickup, KDS, staff RBAC, profile & sub-staff
  // - If all: all features
  const vendorViews = useMemo(() => {
    const views = [
      { id: "vendor-flow/VendorDashboard", label: "Control Room", icon: "📊" },
      { id: "vendor-flow/Orders", label: "Kitchen Orders", icon: "🧾" },
      {
        id: "vendor-flow/VendorTableManagement",
        label: currentVendor.businessType === "hotel"
          ? "Table Reservations"
          : currentVendor.businessType === "mess"
          ? "Mess Seats & Tables"
          : "Tables & Branches",
        icon: "🪑",
      },
      { id: "vendor-flow/StaffManagement", label: "Staff & RBAC", icon: "👥" },
    ];

    if (vendorFeatures.hasMealPasses) {
      views.push({
        id: "vendor-flow/VendorMealPlans",
        label: currentVendor.businessType === "mess" ? "Mess Passes & Thalis" : "Meal Plans / Pass",
        icon: "🎫",
      });
    }

    views.push(
      { id: "vendor-flow/KitchenDisplaySystem", label: "KDS Station", icon: "🍳" },
      {
        id: "vendor-flow/Menu",
        label: currentVendor.businessType === "hotel"
          ? "Available Meals & Menu"
          : currentVendor.businessType === "mess"
          ? "Daily Thalis & Tiffin"
          : "Menu & Items",
        icon: "🍲",
      },
      { id: "vendor-flow/VendorSettlements", label: "Daily Payouts", icon: "💰" },
      { id: "vendor-flow/Store", label: "Store Settings", icon: "🏪" },
      { id: "vendor-flow/Notifications", label: "Kitchen Alerts", icon: "🔔" },
      { id: "vendor-flow/MoreProfile", label: "Profile & Sub-Staff", icon: "💼" },
      { id: "vendor-flow/OnboardingAuth", label: "Auth / Onboard", icon: "🔑" },
      { id: "vendor-flow/PendingApprovalPage", label: "Pending Review", icon: "⏳" },
      { id: "vendor-flow/AccountIssuePage", label: "Account Action", icon: "⚠️" },
      { id: "vendor-flow/Verification", label: "Verification", icon: "🛡️" },
    );

    return views;
  }, [currentVendor.businessType, vendorFeatures.hasMealPasses]);

  const customerViews = [
    { id: "customer-flow/CustomerAuth", label: "Sign In / Pass", icon: "🔑" },
    { id: "customer-flow/Discovery", label: "Canteen Discovery", icon: "📍" },
    { id: "customer-flow/SeatReservation", label: "Table Reservations", icon: "🪑" },
    { id: "customer-flow/MealPasses", label: "Meal Plans & Pass", icon: "🎫" },
    { id: "customer-flow/VendorMenu", label: "Food Menu", icon: "🍽️" },
    { id: "customer-flow/Checkout", label: "Pickup Bag & Pay", icon: "💳" },
    { id: "customer-flow/OrderTracking", label: "Live Tracker & OTP", icon: "⏱️" },
    { id: "customer-flow/PickupDirections", label: "Pickup Directions", icon: "🗺️" },
    { id: "customer-flow/OrderFeedback", label: "Food Review & Help", icon: "⭐" },
    { id: "customer-flow/CustomerNotifications", label: "Order Alerts", icon: "🔔" },
    { id: "customer-flow/CustomerOrders", label: "Past Orders", icon: "📜" },
    { id: "customer-flow/CustomerProfile", label: "Profile & Campus Pass", icon: "👤" },
  ];

  const adminViews = [
    { id: "admin-flow/AdminConsole", label: "Operations HQ", icon: "🛡️" },
    { id: "admin-flow/AdminVendorApprovals", label: "Vendor KYC Audit", icon: "📋" },
    { id: "admin-flow/AdminCampusManagement", label: "Campuses & Bays", icon: "🏢" },
    { id: "admin-flow/AdminSettlementAudit", label: "11:30 PM Batch Audit", icon: "💸" },
    { id: "admin-flow/AdminPlatformSettings", label: "Platform Config", icon: "⚙️" },
  ];

  const handleNavigate = (path: string) => {
    if (path.startsWith("vendor-flow/")) {
      setAppRole("vendor");
    } else if (path.startsWith("customer-flow/")) {
      setAppRole("customer");
    } else if (path.startsWith("admin-flow/")) {
      setAppRole("admin");
    }
    setActiveTab(path);
  };

  const currentViews =
    appRole === "vendor"
      ? vendorViews
      : appRole === "customer"
      ? customerViews
      : adminViews;

  const handleBusinessTypeChange = (type: VendorBusinessType) => {
    takeOnTimeStore.setVendorBusinessType(currentVendor.id, type);
  };

  return (
    <div className="min-h-screen bg-[#eadfd3] flex flex-col font-sans">
      {/* Platform Ecosystem Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1d2420] text-[#fff8ef] shadow-lg border-b border-[#344238]">
        {/* Tier 1: Ecosystem Role Switcher */}
        <div className="border-b border-[#2d3a31] bg-[#161c19] px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ed6c2d] text-xs font-black text-white shadow-sm">
                to
              </span>
              <div>
                <span className="font-black text-sm tracking-tight text-[#f5bd72]">TakeOnTime</span>
                <span className="text-[11px] text-[#a4baa9] ml-1.5 font-medium hidden sm:inline">
                  Campus &amp; Hotel Pre-Order Ecosystem
                </span>
              </div>
            </div>

            {/* Vendor Business Type Switcher & Active Vendor Selector */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Vendor Switcher dropdown */}
              <div className="flex items-center gap-1.5 bg-[#222b25] px-2.5 py-1 rounded-lg border border-[#334237]">
                <span className="text-[11px] text-[#9cb2a3] font-medium hidden lg:inline">Active Vendor:</span>
                <select
                  value={currentVendor.id}
                  onChange={(e) => takeOnTimeStore.setCurrentVendorId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#fce8cc] outline-none cursor-pointer"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1e2521] text-white">
                      {v.name} ({v.businessType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Type Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#151c17] p-1 rounded-xl border border-[#2c3a30]">
                <span className="text-[10px] uppercase font-bold text-[#a0b5a6] px-1.5 hidden md:inline">
                  Mode:
                </span>
                {(["hotel", "mess", "all"] as VendorBusinessType[]).map((type) => {
                  const isCurrent = currentVendor.businessType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleBusinessTypeChange(type)}
                      title={
                        type === "hotel"
                          ? "Hotel: Table reservations & available meals only"
                          : type === "mess"
                          ? "Mess: Table/seat reservations (for passes or regular), meal pass & tiffin pickup"
                          : "All: Full features suite"
                      }
                      className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isCurrent
                          ? type === "hotel"
                            ? "bg-[#7c3aed] text-white shadow-sm ring-1 ring-[#9353fa]"
                            : type === "mess"
                            ? "bg-[#16a34a] text-white shadow-sm ring-1 ring-[#22c55e]"
                            : "bg-[#ed6c2d] text-white shadow-sm ring-1 ring-[#f97316]"
                          : "text-[#8ba391] hover:text-white hover:bg-[#202923]"
                      }`}
                    >
                      {type === "hotel" && <span>🏨 Hotel</span>}
                      {type === "mess" && <span>🍱 Mess</span>}
                      {type === "all" && <span>⭐ All</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* App Switcher Tabs */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[#232d27] p-1 border border-[#313f35]">
              <button
                type="button"
                onClick={() => {
                  setAppRole("vendor");
                  setActiveTab("vendor-flow/VendorDashboard");
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                  appRole === "vendor"
                    ? "bg-[#ed6c2d] text-white shadow-sm"
                    : "text-[#a4baa9] hover:text-white"
                }`}
              >
                <span>👨‍🍳</span>
                <span>Vendor App</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAppRole("customer");
                  setActiveTab("customer-flow/Discovery");
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                  appRole === "customer"
                    ? "bg-[#2d7a46] text-white shadow-sm"
                    : "text-[#a4baa9] hover:text-white"
                }`}
              >
                <span>📱</span>
                <span>Customer App</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAppRole("admin");
                  setActiveTab("admin-flow/AdminConsole");
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                  appRole === "admin"
                    ? "bg-[#355375] text-white shadow-sm"
                    : "text-[#a4baa9] hover:text-white"
                }`}
              >
                <span>🛡️</span>
                <span>Admin HQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Condition Info Banner (Contextual) */}
        <div className="bg-[#121714] border-b border-[#242f27] px-4 py-1.5 text-[11px] text-[#9cb2a3]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {currentVendor.businessType === "hotel" && "🏨 Hotel Mode:"}
                {currentVendor.businessType === "mess" && "🍱 Mess Mode:"}
                {currentVendor.businessType === "all" && "⭐ All Features Mode:"}
              </span>
              <span className="text-[#cbd8cd]">
                {currentVendor.businessType === "hotel" &&
                  "Table reservations & available meals only. Meal passes and tiffin pickups are disabled."}
                {currentVendor.businessType === "mess" &&
                  "Table/seat reservations (for passes or single regular), weekly/monthly meal pass & tiffin pickup enabled."}
                {currentVendor.businessType === "all" &&
                  "All capabilities enabled: table reservations, daily meals, meal passes, and tiffin pickup."}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#f5bd72] shrink-0 hidden sm:inline">
              Features synced across Vendor, Customer &amp; Admin
            </span>
          </div>
        </div>

        {/* Tier 2: Sub-views Navigation for Active App */}
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold text-[#8ba391] uppercase tracking-wider hidden md:block shrink-0">
            {appRole === "vendor" && `${currentVendor.name} · ${currentVendor.businessType.toUpperCase()}`}
            {appRole === "customer" && "Customer App · Campus & Hotel Dining"}
            {appRole === "admin" && "Operations HQ · Audit & Compliance"}
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none w-full md:w-auto" aria-label="Module Views">
            {currentViews.map((view) => {
              const isActive = activeTab === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveTab(view.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? appRole === "customer"
                        ? "bg-[#2d7a46] text-[#fffaf3] shadow-sm"
                        : appRole === "admin"
                        ? "bg-[#355375] text-[#fffaf3] shadow-sm"
                        : "bg-[#ed6c2d] text-[#fffaf3] shadow-sm"
                      : "text-[#cbd8cd] hover:bg-[#2e3b33] hover:text-[#fff8ef]"
                  }`}
                >
                  <span>{view.icon}</span>
                  <span>{view.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 flex flex-col justify-center items-center">
        <PreviewRenderer
          key={activeTab}
          componentPath={activeTab}
          modules={modules}
          onNavigate={handleNavigate}
          onComplete={() => setActiveTab("vendor-flow/VendorDashboard")}
          onLogout={() => setActiveTab("vendor-flow/OnboardingAuth")}
        />
      </main>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <TakeOnTimeEcosystemShell modules={discoveredModules} />;
}

export default App;
