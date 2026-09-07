import { useEffect, useState, type ComponentType } from "react";

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

  const vendorViews = [
    { id: "vendor-flow/VendorDashboard", label: "Control Room", icon: "📊" },
    { id: "vendor-flow/Orders", label: "Kitchen Orders", icon: "🧾" },
    { id: "vendor-flow/Menu", label: "Menu & Items", icon: "🍲" },
    { id: "vendor-flow/Store", label: "Store Settings", icon: "🏪" },
    { id: "vendor-flow/MoreProfile", label: "Profile & Bank", icon: "💼" },
    { id: "vendor-flow/OnboardingAuth", label: "Auth / Onboard", icon: "🔑" },
    { id: "vendor-flow/Verification", label: "Verification", icon: "🛡️" },
  ];

  const customerViews = [
    { id: "customer-flow/Discovery", label: "Canteen Discovery", icon: "📍" },
    { id: "customer-flow/VendorMenu", label: "Food Menu", icon: "🍽️" },
    { id: "customer-flow/Checkout", label: "Pickup Bag & Pay", icon: "💳" },
    { id: "customer-flow/OrderTracking", label: "Live Tracker & OTP", icon: "⏱️" },
    { id: "customer-flow/CustomerOrders", label: "Past Orders", icon: "📜" },
  ];

  const adminViews = [
    { id: "admin-flow/AdminConsole", label: "Operations & Compliance", icon: "🛡️" },
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

  return (
    <div className="min-h-screen bg-[#eadfd3] flex flex-col font-sans">
      {/* Platform Ecosystem Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1d2420] text-[#fff8ef] shadow-lg border-b border-[#344238]">
        {/* Tier 1: Ecosystem Role Switcher */}
        <div className="border-b border-[#2d3a31] bg-[#161c19] px-4 py-2">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#ed6c2d] text-xs font-black text-white shadow-sm">
                to
              </span>
              <div>
                <span className="font-black text-sm tracking-tight text-[#f5bd72]">TakeOnTime</span>
                <span className="text-[11px] text-[#a4baa9] ml-1.5 font-medium hidden sm:inline">
                  Campus Pre-Order Ecosystem
                </span>
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

        {/* Tier 2: Sub-views Navigation for Active App */}
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold text-[#8ba391] uppercase tracking-wider hidden md:block">
            {appRole === "vendor" && "Vendor Storefront & Kitchen"}
            {appRole === "customer" && "Campus Order-Ahead & Pickup"}
            {appRole === "admin" && "Compliance & Realtime Feeds"}
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
