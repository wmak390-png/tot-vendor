// TakeOnTime Shared Reactive State Store
// Synchronizes data across Vendor App, Customer App, and Admin Console

export type OrderStatus = "new" | "in-progress" | "ready" | "completed" | "cancelled";

export type OrderItem = {
  name: string;
  detail?: string;
  quantity: number;
  price: string;
  priceNum: number;
};

export type Order = {
  id: string;
  vendorId: string;
  vendorName: string;
  customer: string;
  phone: string;
  initials: string;
  pickupTime: string;
  pickupRange: string;
  items: OrderItem[];
  amount: string;
  amountNum: number;
  status: OrderStatus;
  note?: string;
  urgent?: boolean;
  otp: string;
  paymentId: string;
  createdAt: string;
  counterNumber?: string;
};

export type Vendor = {
  id: string;
  name: string;
  tagline: string;
  campus: string;
  cuisine: string;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  isOpen: boolean;
  onBreak: boolean;
  breakUntil?: string;
  isApproved: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  fssaiNumber: string;
  ownerName: string;
  phone: string;
  bankAccount: string;
  ifsc: string;
  upiId: string;
  todaySales: number;
  todayOrdersCount: number;
};

export type CustomerCartItem = OrderItem & {
  id: number;
};

export type CustomerCart = {
  vendorId: string;
  vendorName: string;
  items: CustomerCartItem[];
  pickupSlot: string;
  kitchenNote: string;
};

// Initial Seed Data
const initialVendors: Vendor[] = [
  {
    id: "vendor_little_fern",
    name: "Little Fern Kitchen",
    tagline: "Homestyle South Indian meals, dosas & degree filter coffee",
    campus: "Koramangala 4th Block, Bengaluru",
    cuisine: "South Indian · Meals · Coffee",
    rating: 4.8,
    reviewsCount: 342,
    prepTime: "8-12 min",
    isOpen: true,
    onBreak: false,
    isApproved: true,
    approvalStatus: "approved",
    fssaiNumber: "11223344556677",
    ownerName: "Priya Sharma",
    phone: "+91 98451 22910",
    bankAccount: "••••••••7291 (HDFC)",
    ifsc: "HDFC0001234",
    upiId: "littlefern@hdfcbank",
    todaySales: 4890,
    todayOrdersCount: 18,
  },
  {
    id: "vendor_chai_point",
    name: "Chai & Samosa Hub",
    tagline: "Fresh cutting chai, bun maska & hot samosas",
    campus: "Embassy TechVillage Food Court",
    cuisine: "Snacks · Beverages · Chai",
    rating: 4.6,
    reviewsCount: 512,
    prepTime: "5-7 min",
    isOpen: true,
    onBreak: false,
    isApproved: true,
    approvalStatus: "approved",
    fssaiNumber: "11521999000124",
    ownerName: "Vikram Singh",
    phone: "+91 98200 45612",
    bankAccount: "••••••••4812 (ICICI)",
    ifsc: "ICIC0000456",
    upiId: "vikram.chai@icici",
    todaySales: 3120,
    todayOrdersCount: 26,
  },
  {
    id: "vendor_dosa_corner",
    name: "Royal Andhra Thali Co.",
    tagline: "Authentic spicy Andhra meals & unlimited gun powder rice",
    campus: "Ecospace Campus Canteen",
    cuisine: "Andhra · Biryani · Thalis",
    rating: 4.7,
    reviewsCount: 198,
    prepTime: "10-15 min",
    isOpen: true,
    onBreak: false,
    isApproved: false,
    approvalStatus: "pending",
    rejectionReason: undefined,
    fssaiNumber: "11822001004821",
    ownerName: "Ramesh Reddy",
    phone: "+91 97410 88201",
    bankAccount: "••••••••3910 (SBI)",
    ifsc: "SBIN0004128",
    upiId: "ramesh.thali@sbi",
    todaySales: 0,
    todayOrdersCount: 0,
  },
];

const initialOrders: Order[] = [
  {
    id: "TOT-4821",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    customer: "Maya Rodriguez",
    phone: "+91 98451 22910",
    initials: "MR",
    pickupTime: "12:35 PM",
    pickupRange: "12:35–12:45 PM",
    items: [
      { name: "Mysore Masala Dosa", detail: "Crispy · extra coconut chutney", quantity: 2, price: "₹220", priceNum: 220 },
      { name: "Filter Coffee (Degree)", detail: "Strong · less sugar", quantity: 1, price: "₹40", priceNum: 40 },
    ],
    amount: "₹260",
    amountNum: 260,
    status: "new",
    note: "Please pack chutney in separate container",
    urgent: true,
    otp: "7419",
    paymentId: "pay_tot_98124a",
    createdAt: "12:20 PM",
    counterNumber: "Counter 2",
  },
  {
    id: "TOT-4818",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    customer: "Lewis Turner",
    phone: "+91 98860 31405",
    initials: "LT",
    pickupTime: "12:25 PM",
    pickupRange: "12:25–12:35 PM",
    items: [
      { name: "Andhra Special Meal Thali", detail: "Extra pappu dal & appalam", quantity: 1, price: "₹210", priceNum: 210 },
      { name: "Butter Milk (Chaas)", detail: "Chilled with ginger tadka", quantity: 1, price: "₹35", priceNum: 35 },
    ],
    amount: "₹245",
    amountNum: 245,
    status: "in-progress",
    otp: "3892",
    paymentId: "pay_tot_81923b",
    createdAt: "12:12 PM",
    counterNumber: "Counter 2",
  },
  {
    id: "TOT-4814",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    customer: "Nia Bennett",
    phone: "+91 97410 88201",
    initials: "NB",
    pickupTime: "12:15 PM",
    pickupRange: "12:15–12:25 PM",
    items: [
      { name: "Paneer Tikka Rice Bowl", detail: "Medium spicy with curd dip", quantity: 1, price: "₹230", priceNum: 230 },
      { name: "Ginger Lemon Cooler", detail: "Fresh mint splash", quantity: 1, price: "₹50", priceNum: 50 },
    ],
    amount: "₹280",
    amountNum: 280,
    status: "ready",
    note: "Customer is waiting at pickup counter",
    otp: "5124",
    paymentId: "pay_tot_73911c",
    createdAt: "11:58 AM",
    counterNumber: "Counter 2",
  },
  {
    id: "TOT-4809",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    customer: "Theo Martin",
    phone: "+91 99001 54721",
    initials: "TM",
    pickupTime: "12:50 PM",
    pickupRange: "12:50–1:00 PM",
    items: [
      { name: "Idli Vada Combo", detail: "Ghee dip · sambar dip", quantity: 2, price: "₹170", priceNum: 170 },
      { name: "Masala Chai Flask", detail: "Ginger cardamom", quantity: 1, price: "₹35", priceNum: 35 },
    ],
    amount: "₹205",
    amountNum: 205,
    status: "new",
    otp: "9042",
    paymentId: "pay_tot_62831d",
    createdAt: "12:28 PM",
    counterNumber: "Counter 2",
  },
  {
    id: "TOT-4798",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    customer: "Ananya Rao",
    phone: "+91 98450 11923",
    initials: "AR",
    pickupTime: "11:45 AM",
    pickupRange: "11:45–11:55 AM",
    items: [
      { name: "Egg Roast Parotta Box", detail: "Double gravy", quantity: 1, price: "₹170", priceNum: 170 },
    ],
    amount: "₹170",
    amountNum: 170,
    status: "completed",
    otp: "1892",
    paymentId: "pay_tot_51928e",
    createdAt: "11:30 AM",
    counterNumber: "Counter 2",
  },
];

class TakeOnTimeStore {
  private vendors: Vendor[] = initialVendors;
  private orders: Order[] = initialOrders;
  private cart: CustomerCart = {
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    items: [
      {
        id: 1,
        name: "Mysore Masala Dosa",
        detail: "Crispy with coconut chutney",
        quantity: 1,
        price: "₹110",
        priceNum: 110,
      },
      {
        id: 4,
        name: "Filter Coffee (Degree)",
        detail: "Strong & piping hot",
        quantity: 1,
        price: "₹40",
        priceNum: 40,
      },
    ],
    pickupSlot: "Ready in 15 mins (12:45 PM)",
    kitchenNote: "Less spicy potato masala please",
  };

  private activeCustomerOrderId: string = "TOT-4814";
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  getVendors() {
    return [...this.vendors];
  }

  getApprovedVendors() {
    return this.vendors.filter((v) => v.isApproved);
  }

  getVendorById(id: string) {
    return this.vendors.find((v) => v.id === id);
  }

  getOrders(vendorId?: string) {
    if (!vendorId) return [...this.orders];
    return this.orders.filter((o) => o.vendorId === vendorId);
  }

  getOrderById(id: string) {
    return this.orders.find((o) => o.id === id);
  }

  getCart() {
    return { ...this.cart, items: [...this.cart.items] };
  }

  getActiveCustomerOrderId() {
    return this.activeCustomerOrderId;
  }

  // Vendor actions
  toggleVendorOpen(vendorId: string) {
    this.vendors = this.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      return { ...v, isOpen: !v.isOpen };
    });
    this.notify();
  }

  setVendorBreak(vendorId: string, minutes: number | null) {
    this.vendors = this.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      if (minutes === null) {
        return { ...v, onBreak: false, breakUntil: undefined };
      }
      const until = new Date(Date.now() + minutes * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return { ...v, onBreak: true, breakUntil: until };
    });
    this.notify();
  }

  // Order status transitions
  updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    this.orders = this.orders.map((o) => {
      if (o.id !== orderId) return o;
      return { ...o, status: nextStatus };
    });
    this.notify();
  }

  acceptOrder(orderId: string) {
    this.updateOrderStatus(orderId, "in-progress");
  }

  markOrderReady(orderId: string) {
    this.updateOrderStatus(orderId, "ready");
  }

  completeOrder(orderId: string) {
    this.updateOrderStatus(orderId, "completed");
  }

  cancelOrder(orderId: string) {
    this.updateOrderStatus(orderId, "cancelled");
  }

  // Customer Cart & Checkout
  addToCart(item: OrderItem & { id: number }, vendorId = "vendor_little_fern", vendorName = "Little Fern Kitchen") {
    if (this.cart.vendorId !== vendorId) {
      // Clear cart for single-vendor rule
      this.cart = {
        vendorId,
        vendorName,
        items: [{ ...item }],
        pickupSlot: "Ready in 15 mins",
        kitchenNote: "",
      };
    } else {
      const existing = this.cart.items.find((i) => i.name === item.name);
      if (existing) {
        existing.quantity += item.quantity;
        existing.priceNum += item.priceNum;
        existing.price = `₹${existing.priceNum}`;
      } else {
        this.cart.items.push({ ...item });
      }
    }
    this.notify();
  }

  updateCartItemQty(index: number, delta: number) {
    const item = this.cart.items[index];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart.items.splice(index, 1);
    } else {
      const unitPrice = item.priceNum / (item.quantity - delta);
      item.priceNum = unitPrice * item.quantity;
      item.price = `₹${item.priceNum}`;
    }
    this.notify();
  }

  setCartPickupSlot(slot: string) {
    this.cart.pickupSlot = slot;
    this.notify();
  }

  setCartKitchenNote(note: string) {
    this.cart.kitchenNote = note;
    this.notify();
  }

  clearCart() {
    this.cart.items = [];
    this.notify();
  }

  // Place order from Customer checkout
  placeCustomerOrder(customerName: string, phone: string): Order {
    const newId = `TOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const totalNum = this.cart.items.reduce((sum, item) => sum + item.priceNum, 0);

    const newOrder: Order = {
      id: newId,
      vendorId: this.cart.vendorId,
      vendorName: this.cart.vendorName,
      customer: customerName,
      phone: phone,
      initials: customerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "CU",
      pickupTime: "In 15 mins",
      pickupRange: "12:50–1:00 PM",
      items: [...this.cart.items],
      amount: `₹${totalNum}`,
      amountNum: totalNum,
      status: "new",
      note: this.cart.kitchenNote,
      urgent: true,
      otp,
      paymentId: `pay_tot_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      counterNumber: "Counter 2",
    };

    this.orders = [newOrder, ...this.orders];
    this.activeCustomerOrderId = newId;
    this.clearCart();
    this.notify();
    return newOrder;
  }

  setActiveCustomerOrder(orderId: string) {
    this.activeCustomerOrderId = orderId;
    this.notify();
  }

  // Admin actions
  approveVendor(vendorId: string) {
    this.vendors = this.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      return { ...v, isApproved: true, approvalStatus: "approved" };
    });
    this.notify();
  }

  rejectVendor(vendorId: string, reason: string) {
    this.vendors = this.vendors.map((v) => {
      if (v.id !== vendorId) return v;
      return { ...v, isApproved: false, approvalStatus: "rejected", rejectionReason: reason };
    });
    this.notify();
  }

  registerNewVendor(vendor: Omit<Vendor, "id" | "todaySales" | "todayOrdersCount" | "isApproved" | "approvalStatus">) {
    const newId = `vendor_${Math.random().toString(36).slice(2, 8)}`;
    const fullVendor: Vendor = {
      ...vendor,
      id: newId,
      isApproved: false,
      approvalStatus: "pending",
      todaySales: 0,
      todayOrdersCount: 0,
    };
    this.vendors = [fullVendor, ...this.vendors];
    this.notify();
    return fullVendor;
  }
}

export const takeOnTimeStore = new TakeOnTimeStore();
