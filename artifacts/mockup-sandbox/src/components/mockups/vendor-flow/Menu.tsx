import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit2,
  FolderPlus,
  GripVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

export type DietaryType = "veg" | "non-veg" | "egg";

export type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
  prep: string;
  group: string;
  dietary: DietaryType;
  tint: string;
  mark: string;
};

const initialCategories = [
  "Breakfast",
  "Thalis & Meals",
  "Bowls & Snacks",
  "Beverages",
];

const initialItems: MenuItem[] = [
  {
    id: 1,
    name: "Mysore Masala Dosa",
    description: "Crispy red chutney dosa · potato bhaji · coconut chutney & sambar",
    price: "₹110",
    prep: "8 min",
    group: "Breakfast",
    dietary: "veg",
    tint: "#f8c45c",
    mark: "MD",
  },
  {
    id: 2,
    name: "Idli Vada Combo",
    description: "2 steamed button idlis · 1 medu vada · gun powder & ghee",
    price: "₹85",
    prep: "5 min",
    group: "Breakfast",
    dietary: "veg",
    tint: "#e8a96c",
    mark: "IV",
  },
  {
    id: 3,
    name: "Paneer Tikka Rice Bowl",
    description: "Smoked spiced paneer · mint curd · jeera rice & pickled onion",
    price: "₹230",
    prep: "12 min",
    group: "Bowls & Snacks",
    dietary: "veg",
    tint: "#f16d3b",
    mark: "PT",
  },
  {
    id: 4,
    name: "Andhra Special Meal Thali",
    description: "Sona masoori rice · pappu dal · 3 seasonal curries · podi · curd & appalam",
    price: "₹210",
    prep: "10 min",
    group: "Thalis & Meals",
    dietary: "veg",
    tint: "#cf5c43",
    mark: "AT",
  },
  {
    id: 5,
    name: "Egg Roast Parotta Box",
    description: "2 flaky Malabar parottas · double egg roast gravy · fresh green salad",
    price: "₹170",
    prep: "14 min",
    group: "Thalis & Meals",
    dietary: "egg",
    tint: "#d97736",
    mark: "EP",
  },
  {
    id: 6,
    name: "Filter Coffee (Degree Blend)",
    description: "Traditional South Indian chicory roast brewed with fresh milk",
    price: "₹40",
    prep: "3 min",
    group: "Beverages",
    dietary: "veg",
    tint: "#8c6239",
    mark: "FC",
  },
  {
    id: 7,
    name: "Masala Chai Flask",
    description: "Ginger cardamom brewed tea with boiled whole milk",
    price: "₹35",
    prep: "4 min",
    group: "Beverages",
    dietary: "veg",
    tint: "#9b7049",
    mark: "MC",
  },
];

function AvailabilityToggle({
  available,
  onChange,
  itemName,
}: {
  available: boolean;
  onChange: () => void;
  itemName: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={!available}
      aria-label={`${itemName}: ${available ? "mark sold out" : "mark available"}`}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={`group relative h-7 w-[3.1rem] shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f16d3b] focus-visible:ring-offset-2 ${
        available
          ? "border-[#d6c5b4] bg-[#e8dfd4]"
          : "border-[#f16d3b] bg-[#f16d3b]"
      }`}
    >
      <span
        className={`absolute top-[3px] grid h-5 w-5 place-items-center rounded-full transition-transform duration-200 ${
          available
            ? "left-[3px] bg-[#6f6257] text-transparent"
            : "left-[1.45rem] bg-[#fff8ee] text-[#f16d3b]"
        }`}
      >
        {!available && <Check size={12} strokeWidth={3} aria-hidden="true" />}
      </span>
      <span className="sr-only">
        {available ? "Available" : "Sold out"}
      </span>
    </button>
  );
}

function DietaryBadge({ type }: { type: DietaryType }) {
  if (type === "veg") {
    return (
      <span className="inline-grid h-3.5 w-3.5 place-items-center rounded border border-[#2d8442] bg-white p-[1px]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#2d8442]" />
      </span>
    );
  }
  if (type === "egg") {
    return (
      <span className="inline-grid h-3.5 w-3.5 place-items-center rounded border border-[#d97706] bg-white p-[1px]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]" />
      </span>
    );
  }
  return (
    <span className="inline-grid h-3.5 w-3.5 place-items-center rounded border border-[#b91c1c] bg-white p-[1px]">
      <span className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-[#b91c1c]" />
    </span>
  );
}

function ItemRow({
  item,
  available,
  onToggle,
  onOpen,
}: {
  item: MenuItem;
  available: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className={`group flex w-full items-center gap-3 border-b border-[#eee3d7] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#fffaf3] ${
        !available ? "bg-[#faf3eb]" : "bg-[#fffdf9]"
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
        aria-label={`Open details for ${item.name}`}
      >
        <span
          className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[0.95rem] text-[11px] font-bold tracking-[0.08em] text-[#3d2a23]"
          style={{ backgroundColor: item.tint }}
          aria-hidden="true"
        >
          <span className="absolute -right-3 -top-3 h-8 w-8 rounded-full border-[5px] border-[#fff8ee]/45" />
          <span className="absolute -bottom-3 -left-2 h-7 w-7 rounded-full bg-[#fff8ee]/25" />
          <span className="relative">{item.mark}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <DietaryBadge type={item.dietary} />
            <span
              className={`block truncate text-[14px] font-bold leading-5 tracking-[-0.01em] ${
                available ? "text-[#2d2724]" : "text-[#897d73]"
              }`}
            >
              {item.name}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-4 text-[#9a8b7d]">
            {item.description}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.02em] text-[#9a8b7d]">
            <span className="font-bold text-[#352720]">{item.price}</span>
            <span className="h-1 w-1 rounded-full bg-[#d5c4b4]" />
            <Clock3 size={11} strokeWidth={2.2} aria-hidden="true" />
            {item.prep}
            <span className="h-1 w-1 rounded-full bg-[#d5c4b4]" />
            <span className="text-[#847467]">{item.group}</span>
            {!available && (
              <span className="ml-0.5 rounded-full bg-[#fbe0d3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#bb4f2d]">
                Sold out
              </span>
            )}
          </span>
        </span>
      </button>

      <span className="flex shrink-0 items-center gap-2.5">
        <AvailabilityToggle
          available={available}
          onChange={onToggle}
          itemName={item.name}
        />
        <button
          type="button"
          onClick={onOpen}
          className="p-1 text-[#b9a89a] transition-transform duration-200 hover:text-[#52443a] focus-visible:outline-none"
          aria-label={`Open details for ${item.name}`}
        >
          <ChevronRight
            size={16}
            strokeWidth={2.2}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </span>
    </div>
  );
}

export function Menu() {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [items, setItems] = useState(initialItems);
  const [availability, setAvailability] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Sold out">("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Add / Edit Form State
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    prep: "10 min",
    group: "Breakfast",
    dietary: "veg" as DietaryType,
  });

  // Category Manager Modal
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Delete Confirm Modal
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => item.group === selectedCategory);
  }, [items, selectedCategory]);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categoryFilteredItems.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized);
      const isAvailable = availability[item.id] ?? true;
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Active" && isAvailable) ||
        (activeFilter === "Sold out" && !isAvailable);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, availability, categoryFilteredItems, query]);

  const activeCount = categoryFilteredItems.filter((item) => availability[item.id] ?? true).length;
  const soldOutCount = categoryFilteredItems.length - activeCount;

  const toggleAvailability = (id: number) => {
    setAvailability((current) => {
      const next = !current[id];
      const item = items.find((i) => i.id === id);
      notify(`${item?.name || "Item"} is now ${next ? "Available" : "Marked Sold Out"}`);
      return { ...current, [id]: next };
    });
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "₹",
      prep: "10 min",
      group: selectedCategory === "All" ? (categories[0] || "Breakfast") : selectedCategory,
      dietary: "veg",
    });
    setFormMode("add");
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      prep: item.prep,
      group: item.group,
      dietary: item.dietary,
    });
    setSelectedId(null);
    setFormMode("edit");
  };

  const saveItem = () => {
    const name = formData.name.trim();
    if (!name) return;
    const cleanPrice = formData.price.startsWith("₹")
      ? formData.price
      : `₹${formData.price.replace(/[^\d]/g, "")}`;

    if (formMode === "add") {
      const newId = Math.max(...items.map((i) => i.id), 0) + 1;
      const newItem: MenuItem = {
        id: newId,
        name,
        description: formData.description.trim() || "Freshly made kitchen order item",
        price: cleanPrice || "₹100",
        prep: formData.prep || "10 min",
        group: formData.group,
        dietary: formData.dietary,
        tint: formData.dietary === "veg" ? "#8fa99a" : formData.dietary === "egg" ? "#efb668" : "#d96b45",
        mark: name.slice(0, 2).toUpperCase(),
      };
      setItems((current) => [...current, newItem]);
      setAvailability((current) => ({ ...current, [newId]: true }));
      notify(`Added "${name}" to ${formData.group}!`);
    } else if (formMode === "edit" && editingItem) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name,
                description: formData.description,
                price: cleanPrice,
                prep: formData.prep,
                group: formData.group,
                dietary: formData.dietary,
                mark: name.slice(0, 2).toUpperCase(),
              }
            : item
        )
      );
      notify(`Updated "${name}" successfully!`);
    }
    setFormMode(null);
  };

  const confirmDeleteItem = () => {
    if (!deletingItem) return;
    setItems((current) => current.filter((i) => i.id !== deletingItem.id));
    notify(`Removed "${deletingItem.name}" from catalog.`);
    setDeletingItem(null);
    setSelectedId(null);
  };

  const addCategory = () => {
    const cat = newCatName.trim();
    if (!cat || categories.includes(cat)) return;
    setCategories((current) => [...current, cat]);
    setNewCatName("");
    notify(`Created new menu category "${cat}"`);
  };

  const selectedItem = selectedId ? items.find((item) => item.id === selectedId) : undefined;

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#f6f0e8] font-['DM_Sans'] text-[#2d2724]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#2e3731] px-4 py-2.5 text-xs font-semibold text-[#fff9f1] shadow-xl flex items-center gap-2">
          <Check className="h-4 w-4 text-[#79c394]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#292421] px-5 pb-5 pt-4 text-[#fff8ee]">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f16d3b] text-xs font-black text-white">
              T
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5b56e]">
              Menu & Catalog Management
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCategoryManager(true)}
            aria-label="Manage Categories"
            className="flex items-center gap-1.5 rounded-full border border-[#fff8ee]/15 bg-[#fff8ee]/[0.08] px-3 py-1.5 text-xs font-semibold text-[#fff8ee] transition-colors hover:bg-[#fff8ee]/[0.18]"
          >
            <FolderPlus size={14} />
            <span>Categories</span>
          </button>
        </div>

        <div className="relative z-10 mt-5">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f5b56e]">
            Live Store Catalog
          </p>
          <h1 className="font-['Fraunces'] text-[28px] font-semibold leading-tight tracking-[-0.03em]">
            TakeOnTime Kitchen Menu
          </h1>
          <p className="mt-1 text-[12px] text-[#d7c9bd]">
            Manage prices, prep times, and toggle sold-out items instantly.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="relative z-20 -mt-2 rounded-t-[1.6rem] bg-[#f6f0e8] px-4 pt-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
              selectedCategory === "All"
                ? "bg-[#2d2724] text-[#fff8ee] shadow-sm"
                : "bg-[#fffaf4] text-[#6b5d52] border border-[#e2d5c8] hover:bg-[#ece2d7]"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#2d2724] text-[#fff8ee] shadow-sm"
                  : "bg-[#fffaf4] text-[#6b5d52] border border-[#e2d5c8] hover:bg-[#ece2d7]"
              }`}
            >
              {cat} ({items.filter((i) => i.group === cat).length})
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-[#2d2724]">
              {selectedCategory === "All" ? "All Kitchen Items" : selectedCategory}
            </span>
            <span className="block text-[11px] text-[#9a8b7d]">
              {categoryFilteredItems.length} items · {activeCount} active in orders
            </span>
          </div>
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-1.5 rounded-full bg-[#f16d3b] px-3.5 py-2 text-xs font-extrabold text-[#fff8ee] shadow-[0_4px_12px_rgba(241,109,59,0.25)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={14} strokeWidth={2.7} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search */}
        <label className="mt-3.5 flex h-11 items-center gap-2.5 rounded-xl border border-[#e0d3c5] bg-[#fffaf4] px-3.5 shadow-sm focus-within:border-[#f16d3b] focus-within:ring-2 focus-within:ring-[#f16d3b]/15">
          <Search size={16} className="shrink-0 text-[#a69383]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${selectedCategory.toLowerCase()} items...`}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#2d2724] outline-none placeholder:text-[#aa9a8b]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid h-6 w-6 place-items-center rounded-full text-[#9a8b7d] hover:bg-[#eee3d7]"
            >
              <X size={14} />
            </button>
          )}
        </label>

        {/* Sub-Filters: All, Active, Sold Out */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {(["All", "Active", "Sold out"] as const).map((filter) => {
            const count =
              filter === "All"
                ? categoryFilteredItems.length
                : filter === "Active"
                ? activeCount
                : soldOutCount;
            const isActive = activeFilter === filter;
            return (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all ${
                  isActive
                    ? "border-[#f16d3b] bg-[#f16d3b] text-[#fff8ee] shadow-sm"
                    : "border-[#e0d3c5] bg-[#fffaf4] text-[#796c61] hover:border-[#d1b9a7]"
                }`}
              >
                {filter}
                <span className={`ml-1.5 ${isActive ? "text-[#ffe0c2]" : "text-[#ad9b8a]"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Item List Table / Cards */}
        <div className="mt-3 overflow-hidden rounded-[1.1rem] border border-[#e9ddcf] bg-[#fffdf9] shadow-[0_7px_20px_rgba(93,61,39,0.05)]">
          <div className="flex items-center justify-between border-b border-[#eee3d7] bg-[#fffaf4] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ad9b8a]">
            <span>Item & Price</span>
            <span>Availability / Edit</span>
          </div>

          {visibleItems.length > 0 ? (
            visibleItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                available={availability[item.id] ?? true}
                onToggle={() => toggleAvailability(item.id)}
                onOpen={() => setSelectedId(item.id)}
              />
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#f8e5d8] text-[#d45e35]">
                <Search size={18} />
              </div>
              <p className="mt-3 text-[13px] font-bold text-[#4a3d35]">No items found</p>
              <p className="mt-1 text-[11px] text-[#9a8b7d]">
                No items match this search or category filter.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#2d2724] px-3 py-1.5 text-xs font-bold text-white"
              >
                <Plus size={13} /> Add an item
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center pb-8">
          <p className="text-[11px] text-[#9a8b7d]">
            Availability changes take effect immediately across all customer apps.
          </p>
        </div>
      </section>

      {/* Item Quick Overview Sheet */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[#2d2724]/40 px-3 pb-3 backdrop-blur-[2px]"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#ebdcd0]">
              <div className="flex items-center gap-2">
                <DietaryBadge type={selectedItem.dietary} />
                <h2 className="font-extrabold text-base text-[#2d2724]">
                  {selectedItem.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-full p-1 text-[#8e7e72] hover:bg-[#ebdcd0]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-xs text-[#7e6d61] leading-relaxed">
              {selectedItem.description}
            </p>

            <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-[#f7f0e7] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#918073]">Price</span>
                <p className="text-sm font-black text-[#2d2724] mt-0.5">{selectedItem.price}</p>
              </div>
              <div className="rounded-xl bg-[#f7f0e7] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#918073]">Prep Time</span>
                <p className="text-sm font-black text-[#2d2724] mt-0.5">{selectedItem.prep}</p>
              </div>
              <div className="rounded-xl bg-[#f7f0e7] p-2.5">
                <span className="text-[10px] uppercase font-bold text-[#918073]">Category</span>
                <p className="text-xs font-bold text-[#2d2724] mt-1 truncate">{selectedItem.group}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-[#ebdcd0] bg-[#fffaf5] p-3 text-xs">
              <div>
                <p className="font-bold text-[#352a24]">Customer Status</p>
                <p className="text-[11px] text-[#7e6d61]">
                  {availability[selectedItem.id] ? "Accepting orders" : "Sold out / Paused"}
                </p>
              </div>
              <AvailabilityToggle
                available={availability[selectedItem.id] ?? true}
                onChange={() => toggleAvailability(selectedItem.id)}
                itemName={selectedItem.name}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(selectedItem)}
                className="flex items-center justify-center gap-1 rounded-xl border border-[#e47665] px-3 py-2.5 text-xs font-bold text-[#c93f30] hover:bg-[#fff5f4]"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => openEditForm(selectedItem)}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#2d2724] py-2.5 text-xs font-bold text-[#fff8ee] hover:bg-[#3d3632]"
              >
                <Edit2 size={14} />
                <span>Edit Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {formMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setFormMode(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#e8dccf] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
              <h3 className="text-base font-extrabold text-[#29221d]">
                {formMode === "add" ? "Add New Menu Item" : "Edit Menu Item"}
              </h3>
              <button
                type="button"
                onClick={() => setFormMode(null)}
                className="p-1 text-[#8e7e72] hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveItem();
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-[#56483e] mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#56483e] mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients or description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#56483e] mb-1">Price (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="₹120"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#56483e] mb-1">Prep Time</label>
                  <select
                    value={formData.prep}
                    onChange={(e) => setFormData({ ...formData, prep: e.target.value })}
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  >
                    <option>5 min</option>
                    <option>8 min</option>
                    <option>10 min</option>
                    <option>15 min</option>
                    <option>20 min</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#56483e] mb-1">Menu Category</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#56483e] mb-1">Dietary Tag</label>
                  <select
                    value={formData.dietary}
                    onChange={(e) => setFormData({ ...formData, dietary: e.target.value as DietaryType })}
                    className="w-full rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                  >
                    <option value="veg">🟢 Veg</option>
                    <option value="egg">🟡 Contains Egg</option>
                    <option value="non-veg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="flex-1 rounded-xl border border-[#decbb9] py-2.5 font-bold text-[#726256] hover:bg-[#f5eae0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#dd693c] py-2.5 font-bold text-white shadow-md hover:bg-[#c95b30]"
                >
                  {formMode === "add" ? "Create Item" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fde8e7] text-[#c93f30] mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="text-sm font-extrabold text-[#29221d]">Delete Menu Item?</h3>
            <p className="mt-1 text-xs text-[#7e6d61]">
              Are you sure you want to remove &quot;{deletingItem.name}&quot;? Customers will no longer be able to order this item.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 rounded-xl border border-[#decbb9] py-2 text-xs font-bold text-[#6a5b4f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="flex-1 rounded-xl bg-[#c93f30] py-2 text-xs font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setShowCategoryManager(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#fffdf9] p-5 shadow-2xl border border-[#ebdcd0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#ebdcd0]">
              <h3 className="font-extrabold text-sm text-[#2d2420]">Manage Menu Categories</h3>
              <button
                type="button"
                onClick={() => setShowCategoryManager(false)}
                className="p-1 text-[#8e7e72] hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="block text-xs font-bold text-[#56483e]">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Desserts, Combos"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-xl border border-[#decbb9] bg-[#fffaf5] px-3 py-2 text-xs font-semibold text-[#29221d] focus:border-[#dd693c] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="rounded-xl bg-[#2d2724] px-3 py-2 text-xs font-bold text-white hover:bg-[#3f3732]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#918073]">
                Existing Categories ({categories.length})
              </span>
              <ul className="mt-2 divide-y divide-[#ebdcd0] rounded-xl border border-[#ebdcd0] bg-white overflow-hidden text-xs">
                {categories.map((cat) => (
                  <li key={cat} className="flex items-center justify-between p-2.5">
                    <span className="font-semibold text-[#2d2420]">{cat}</span>
                    <span className="text-[10px] text-[#8e7e72]">
                      {items.filter((i) => i.group === cat).length} items
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryManager(false)}
              className="mt-4 w-full rounded-xl bg-[#dd693c] py-2.5 text-xs font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Menu;
