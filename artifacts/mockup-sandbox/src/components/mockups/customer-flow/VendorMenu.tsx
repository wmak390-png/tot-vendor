import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Heart,
  Info,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Timer,
  Utensils,
  X,
} from "lucide-react";
import { takeOnTimeStore, type Vendor, type OrderItem } from "@/lib/takeontime-store";

type CustomerMenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  priceFormatted: string;
  prepTime: string;
  dietary: "veg" | "non-veg" | "egg";
  description: string;
  popular?: boolean;
  available: boolean;
};

const menuItemsData: CustomerMenuItem[] = [
  {
    id: 1,
    name: "Mysore Masala Dosa",
    category: "Breakfast",
    price: 110,
    priceFormatted: "₹110",
    prepTime: "8 mins",
    dietary: "veg",
    description: "Crispy fermented crepe smeared with spicy red garlic-chilli chutney and packed with potato masala.",
    popular: true,
    available: true,
  },
  {
    id: 2,
    name: "Idli Vada Combo",
    category: "Breakfast",
    price: 85,
    priceFormatted: "₹85",
    prepTime: "5 mins",
    dietary: "veg",
    description: "2 soft steamed button idlis and 1 crispy medu vada served with hot sambar and fresh coconut chutney.",
    popular: true,
    available: true,
  },
  {
    id: 3,
    name: "Filter Coffee (Degree)",
    category: "Beverages",
    price: 40,
    priceFormatted: "₹40",
    prepTime: "3 mins",
    dietary: "veg",
    description: "Traditional South Indian chicory decoction with frothy boiled whole milk. Served piping hot.",
    popular: true,
    available: true,
  },
  {
    id: 4,
    name: "Andhra Special Meal Thali",
    category: "Thalis & Meals",
    price: 210,
    priceFormatted: "₹210",
    prepTime: "10 mins",
    dietary: "veg",
    description: "Steamed sona masoori rice, gun powder, ghee, tomato pappu, sambar, rasam, curd, appalam & pickle.",
    popular: true,
    available: true,
  },
  {
    id: 5,
    name: "Paneer Tikka Rice Bowl",
    category: "Bowls & Snacks",
    price: 230,
    priceFormatted: "₹230",
    prepTime: "12 mins",
    dietary: "veg",
    description: "Smoked tandoori spiced paneer cubes on fragrant cumin jeera rice with house mint curd dip.",
    popular: false,
    available: true,
  },
  {
    id: 6,
    name: "Egg Roast Parotta Box",
    category: "Bowls & Snacks",
    price: 170,
    priceFormatted: "₹170",
    prepTime: "10 mins",
    dietary: "egg",
    description: "2 flaky layered Malabar parottas with 2 hard-boiled eggs in thick caramelised onion gravy.",
    popular: true,
    available: true,
  },
  {
    id: 7,
    name: "Ginger Lemon Cooler",
    category: "Beverages",
    price: 50,
    priceFormatted: "₹50",
    prepTime: "3 mins",
    dietary: "veg",
    description: "Chilled fresh lemonade with crushed ginger, black salt, and a sprig of fresh garden mint.",
    popular: false,
    available: true,
  },
  {
    id: 8,
    name: "Butter Milk (Chaas)",
    category: "Beverages",
    price: 35,
    priceFormatted: "₹35",
    prepTime: "2 mins",
    dietary: "veg",
    description: "Chilled spiced churned yogurt with roasted cumin, green chilli, ginger and coriander leaves.",
    popular: false,
    available: true,
  },
];

const categories = ["All Items", "Breakfast", "Thalis & Meals", "Bowls & Snacks", "Beverages"];

export function VendorMenu({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [vendor, setVendor] = useState<Vendor | undefined>(takeOnTimeStore.getVendorById("vendor_little_fern"));
  const [cart, setCart] = useState(takeOnTimeStore.getCart());
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [customizingItem, setCustomizingItem] = useState<CustomerMenuItem | null>(null);
  const [itemNote, setItemNote] = useState("");
  const [portionCount, setPortionCount] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = takeOnTimeStore.subscribe(() => {
      setVendor(takeOnTimeStore.getVendorById("vendor_little_fern"));
      setCart(takeOnTimeStore.getCart());
    });
    return unsub;
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredItems = useMemo(() => {
    return menuItemsData.filter((it) => {
      if (selectedCategory !== "All Items" && it.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!it.name.toLowerCase().includes(q) && !it.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [selectedCategory, search]);

  const cartTotalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.items.reduce((sum, item) => sum + item.priceNum, 0);

  const handleAddItem = (it: CustomerMenuItem) => {
    takeOnTimeStore.addToCart(
      {
        id: it.id,
        name: it.name,
        detail: it.prepTime ? `Prep: ${it.prepTime}` : undefined,
        quantity: 1,
        price: it.priceFormatted,
        priceNum: it.price,
      },
      vendor?.id,
      vendor?.name
    );
    notify(`Added ${it.name} to pickup bag`);
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    takeOnTimeStore.addToCart(
      {
        id: customizingItem.id,
        name: customizingItem.name,
        detail: itemNote ? itemNote : `Prep: ${customizingItem.prepTime}`,
        quantity: portionCount,
        price: `₹${customizingItem.price * portionCount}`,
        priceNum: customizingItem.price * portionCount,
      },
      vendor?.id,
      vendor?.name
    );
    notify(`Added ${portionCount} × ${customizingItem.name} to cart`);
    setCustomizingItem(null);
    setItemNote("");
    setPortionCount(1);
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#f4ede4] px-0 text-[#252822] font-sans sm:px-4 sm:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#faf6ef] shadow-[0_20px_80px_rgba(40,30,20,0.12)] sm:min-h-[850px] sm:rounded-[32px] border border-[#e8dccf]">
        
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#202522] px-4 py-2.5 text-xs font-semibold text-[#fff8ee] shadow-2xl flex items-center gap-2 border border-[#3b433e]">
            <Check className="h-4 w-4 text-[#78c792]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[#242b26] px-4 py-3 text-white">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/Discovery")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#323c34] text-[#f5ebd9] hover:bg-[#434f47]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-[#e5a67f]">Counter Menu</h1>
            <p className="text-sm font-bold text-white">{vendor?.name || "Little Fern Kitchen"}</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("customer-flow/Checkout")}
            className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#323c34] text-[#f5ebd9]"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-[#ed6c2d] text-[9px] font-black text-white">
                {cartTotalItems}
              </span>
            )}
          </button>
        </header>

        {/* Vendor Banner Info */}
        <section className="bg-white p-4 border-b border-[#e9ddd1]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black text-[#27201c]">{vendor?.name}</h2>
                <span className="rounded-md bg-[#e8f4ec] px-1.5 py-0.5 text-[9px] font-extrabold text-[#2d7a46]">
                  Counter 2
                </span>
              </div>
              <p className="text-xs text-[#7d695b] mt-0.5">{vendor?.tagline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6e5d51]">
                <span className="flex items-center gap-1 font-bold text-[#27201c]">
                  <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" />
                  {vendor?.rating} ({vendor?.reviewsCount})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Timer className="h-3.5 w-3.5 text-[#ed6c2d]" />
                  Ready in {vendor?.prepTime}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#2d7a46]">
                  <ShieldCheck className="h-3.5 w-3.5" /> FSSAI Verified
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-[#fdf5ed] p-2.5 text-xs text-[#7e563e] flex items-center justify-between border border-[#f7e4d3]">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#ed6c2d]" />
              <span className="text-[11px] font-semibold">Pre-order for Lunch Slot (12:45–1:15 PM)</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase text-[#ed6c2d]">Open</span>
          </div>
        </section>

        {/* Search & Category Tabs */}
        <div className="sticky top-[53px] z-20 bg-[#faf6ef] border-b border-[#ebdcd0] px-4 pt-2.5 pb-2">
          {/* Category Scroller */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#242b26] text-white shadow-sm"
                      : "bg-white text-[#6b5a4d] border border-[#e4d6c7] hover:bg-[#f5ece2]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items List */}
        <section className="flex-1 px-4 py-3 space-y-3 pb-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#8b7565]">
              {selectedCategory} ({filteredItems.length})
            </span>
          </div>

          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#ecdccf] bg-white p-3.5 shadow-sm transition-all hover:border-[#dfc4b0]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Dietary Icon */}
                    <span
                      className={`grid h-3.5 w-3.5 place-items-center rounded-sm border ${
                        item.dietary === "veg"
                          ? "border-[#2d7a46]"
                          : item.dietary === "non-veg"
                          ? "border-[#c93f30]"
                          : "border-[#d68b1a]"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.dietary === "veg"
                            ? "bg-[#2d7a46]"
                            : item.dietary === "non-veg"
                            ? "bg-[#c93f30]"
                            : "bg-[#d68b1a]"
                        }`}
                      />
                    </span>

                    <h3 className="font-extrabold text-sm text-[#27201c]">{item.name}</h3>
                    {item.popular && (
                      <span className="rounded bg-[#fff0e1] px-1.5 py-0.5 text-[9px] font-black text-[#d65e1d]">
                        ★ Popular
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[#716155] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="text-sm font-black text-[#27201c]">{item.priceFormatted}</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8b7565]">
                      <Timer className="h-3 w-3 text-[#ed6c2d]" /> {item.prepTime}
                    </span>
                  </div>
                </div>

                {/* Add / Customize Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddItem(item)}
                    className="flex items-center gap-1 rounded-xl bg-[#ed6c2d] px-3.5 py-1.5 text-xs font-black text-white shadow-sm hover:bg-[#d65e1d] active:scale-95 transition-transform"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomizingItem(item);
                      setItemNote("");
                      setPortionCount(1);
                    }}
                    className="text-[10px] font-bold text-[#8b7565] hover:text-[#ed6c2d]"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Customization Modal */}
        {customizingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-[#fffdfa] p-5 shadow-2xl border border-[#ebdcd0]">
              <div className="flex items-start justify-between pb-3 border-b border-[#ebdcd0]">
                <div>
                  <h3 className="font-black text-base text-[#27201c]">{customizingItem.name}</h3>
                  <p className="text-xs text-[#ed6c2d] font-bold">{customizingItem.priceFormatted} each</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomizingItem(null)}
                  className="p-1 text-[#8b7565] hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#faf5ee] p-3">
                <span className="text-xs font-bold text-[#5c4a3e]">Portions / Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPortionCount((c) => Math.max(1, c - 1))}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white border border-[#decbb9] text-[#5c4a3e]"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono text-sm font-black">{portionCount}</span>
                  <button
                    type="button"
                    onClick={() => setPortionCount((c) => c + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white border border-[#decbb9] text-[#5c4a3e]"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Cooking / Special Note */}
              <div className="mt-3">
                <label className="block text-[11px] font-bold text-[#5c4a3e] mb-1">
                  Kitchen Instruction (Optional)
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="e.g. Less spicy, extra coconut chutney, no onion"
                  className="w-full rounded-xl border border-[#decbb9] bg-white p-2.5 text-xs font-medium text-[#27201c] focus:border-[#ed6c2d] focus:outline-none"
                />
              </div>

              {/* Add CTA */}
              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#ed6c2d] p-3 text-xs font-extrabold text-white shadow-md hover:bg-[#d65e1d]"
              >
                <span>Add to Bag</span>
                <span>₹{customizingItem.price * portionCount}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Cart Bar */}
        {cartTotalItems > 0 && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] z-40">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("customer-flow/Checkout")}
              className="flex w-full items-center justify-between rounded-2xl bg-[#ed6c2d] px-4 py-3 text-white shadow-xl hover:bg-[#db5e20] active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-black/20 text-xs font-extrabold">
                  {cartTotalItems}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">View Bag & Slot</p>
                  <p className="text-[10px] text-white/80">{vendor?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black">₹{cartTotalPrice}</span>
                <span className="flex items-center gap-1 rounded-xl bg-white/20 px-2.5 py-1 text-xs font-extrabold">
                  <span>Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default VendorMenu;
