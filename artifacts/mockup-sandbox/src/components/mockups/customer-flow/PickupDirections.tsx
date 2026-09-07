import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Footprints,
  Info,
  MapPin,
  Navigation,
  QrCode,
  ShieldCheck,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { takeOnTimeStore } from "@/lib/takeontime-store";

export function PickupDirections({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) {
  const [selectedTower, setSelectedTower] = useState<"towerA" | "towerB" | "towerC">("towerA");
  const activeOrder = takeOnTimeStore.getOrderById("TOT-4814");

  const towerETAs = {
    towerA: { name: "Tower 2A (Tech Hub)", walkingTime: "2-3 mins", path: "Take the 2nd Floor Skybridge directly into Central Food Court" },
    towerB: { name: "Tower 1B (West Wing)", walkingTime: "4-5 mins", path: "Exit via North Lobby, cross the landscaped courtyard to Food Court Level 1" },
    towerC: { name: "Tower 3C (R&D Block)", walkingTime: "5-6 mins", path: "Take elevator to Ground, follow covered pedestrian canopy to Main Canteen" },
  };

  return (
    <main className="min-h-screen w-full bg-[#f8faf8] text-[#1c241e] font-sans pb-20">
      {/* Header */}
      <header className="bg-[#1c281e] text-white px-4 py-6 sm:px-8 border-b border-[#2d4231]">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#f09562]">
                TakeOnTime
              </span>
              <span className="text-xs text-[#8a9e8f]">· Campus Pickup Guide</span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("customer-flow/OrderTracking")}
                className="text-xs font-bold text-[#8bf2a9] hover:underline"
              >
                Back to Live Order
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#ed6c2d] flex items-center justify-center text-white shadow-md">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Food Court Navigation & Pickup Counter</h1>
              <p className="text-xs text-[#a2b8a7]">Embassy TechVillage · Central Canteen Floor 1</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-4">
        {/* Destination Card */}
        <section aria-label="Target Counter Bay" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-bold text-[#15803d] border border-[#a7f3d0] mb-2">
                <Store className="h-3 w-3" /> DESIGNATED PICKUP POINT
              </span>
              <h2 className="text-lg font-black text-[#1a221c]">Little Fern Kitchen · Counter Bay 02</h2>
              <p className="text-xs text-[#617466] mt-0.5">
                Central Food Court, Level 1 · Near North Staircase & Filter Coffee kiosk
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#617466]">Active Order</div>
              <div className="text-sm font-black text-[#ed6c2d] font-mono">#{activeOrder?.id || "TOT-4814"}</div>
              <div className="text-[11px] font-bold text-[#15803d]">OTP: {activeOrder?.otp || "5124"}</div>
            </div>
          </div>
        </section>

        {/* 2D Interactive Food Court Map Scheme */}
        <section aria-label="Interactive Food Court Layout" className="rounded-2xl bg-[#172019] p-5 text-white shadow-md border border-[#2b3a2e]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#ed6c2d]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a0b6a5]">
                Level 1 Food Court Floorplan
              </h3>
            </div>
            <span className="text-[10px] text-[#4ed976] bg-[#162e1c] px-2 py-0.5 rounded border border-[#2d5236]">
              Express Pickup Lane Open
            </span>
          </div>

          {/* Graphical Floorplan */}
          <div className="grid grid-cols-4 gap-2.5 my-2">
            <div className="p-3 rounded-xl bg-[#222c24] border border-[#304033] text-center opacity-60">
              <div className="text-[10px] text-[#8a9e8f] font-mono">BAY 01</div>
              <div className="text-xs font-bold text-white mt-1">Chai Hub</div>
              <div className="text-[9px] text-[#718576]">Beverages</div>
            </div>

            {/* Target Counter */}
            <div className="p-3 rounded-xl bg-[#ed6c2d] text-white text-center shadow-lg relative border-2 border-white scale-102">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#121914] text-[#8bf2a9] text-[9px] font-black px-1.5 py-0.2 rounded border border-[#2c4031]">
                YOUR PICKUP
              </span>
              <div className="text-[10px] text-white/80 font-mono font-bold">BAY 02</div>
              <div className="text-xs font-black mt-1">Little Fern</div>
              <div className="text-[9px] text-white/90">South Indian</div>
            </div>

            <div className="p-3 rounded-xl bg-[#222c24] border border-[#304033] text-center opacity-60">
              <div className="text-[10px] text-[#8a9e8f] font-mono">BAY 03</div>
              <div className="text-xs font-bold text-white mt-1">Andhra Thali</div>
              <div className="text-[9px] text-[#718576]">Biryani / Meals</div>
            </div>

            <div className="p-3 rounded-xl bg-[#222c24] border border-[#304033] text-center opacity-60">
              <div className="text-[10px] text-[#8a9e8f] font-mono">BAY 04</div>
              <div className="text-xs font-bold text-white mt-1">Rolls & Bowls</div>
              <div className="text-[9px] text-[#718576]">Quick Bites</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26372a] flex items-center justify-between text-xs text-[#8a9e8f]">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#3b82f6]" /> Live Counter Crowd:{" "}
              <strong className="text-white">Low (0 wait in Express lane)</strong>
            </span>
            <span className="text-[#4ed976] font-bold">Express Dedicated Window</span>
          </div>
        </section>

        {/* Walk-Time Calculator */}
        <section aria-label="Walking Route Selector" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3 flex items-center gap-1.5">
            <Footprints className="h-4 w-4 text-[#ed6c2d]" /> Estimated Walk Time from your Office
          </h3>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {(["towerA", "towerB", "towerC"] as const).map((towerKey) => (
              <button
                key={towerKey}
                type="button"
                onClick={() => setSelectedTower(towerKey)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedTower === towerKey
                    ? "bg-[#ed6c2d] text-white border-[#ed6c2d] shadow-sm"
                    : "bg-[#f8faf8] text-[#1c241e] border-[#e2e8e2] hover:bg-[#f1f5f1]"
                }`}
              >
                <div className="text-xs font-bold">{towerETAs[towerKey].name.split(" ")[0]} {towerETAs[towerKey].name.split(" ")[1]}</div>
                <div className={`text-[11px] font-semibold mt-0.5 ${selectedTower === towerKey ? "text-white/90" : "text-[#15803d]"}`}>
                  {towerETAs[towerKey].walkingTime}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-xl text-xs text-[#166534] flex items-start gap-2">
            <Navigation className="h-4 w-4 text-[#15803d] shrink-0 mt-0.5" />
            <div>
              <strong>Best Route from {towerETAs[selectedTower].name}:</strong>
              <p className="text-[11px] text-[#14532d] mt-0.5">{towerETAs[selectedTower].path}</p>
            </div>
          </div>
        </section>

        {/* 3 Steps to Pickup */}
        <section aria-label="Step-by-step Pickup Checklist" className="rounded-2xl bg-white p-4 shadow-sm border border-[#e2e8e2]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#617466] mb-3">
            How to Collect at Counter Bay 02
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ffedd5] text-[#c2410c] text-xs font-black flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c241e]">Skip the general order & billing line!</h4>
                <p className="text-[11px] text-[#617466]">
                  Walk directly to the orange <strong>"TakeOnTime Pre-Order Window"</strong> on the right side of Counter Bay 02.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ffedd5] text-[#c2410c] text-xs font-black flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c241e]">Show your 4-Digit Pickup OTP</h4>
                <p className="text-[11px] text-[#617466]">
                  Mention Order ID <strong className="font-mono text-[#ed6c2d]">#{activeOrder?.id || "TOT-4814"}</strong> and read out OTP <strong className="font-mono text-[#15803d]">{activeOrder?.otp || "5124"}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-[#ffedd5] text-[#c2410c] text-xs font-black flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c241e]">Instant Handover & Enjoy</h4>
                <p className="text-[11px] text-[#617466]">
                  Your food was packed fresh moments ago. No token waiting, no cold meals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("customer-flow/OrderTracking")}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#ed6c2d] hover:bg-[#d95d20] text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Open Live Token Screen <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
}

export default PickupDirections;
