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

export type MealPlan = {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  tagline: string;
  type: "weekly" | "monthly" | "flexi";
  totalMeals: number;
  validityDays: number;
  dailyLimit: number; // max meals bookable per day
  mealSlots: string[]; // e.g. ["Lunch (12:00 PM – 3:00 PM)", "Dinner (7:00 PM – 10:00 PM)"]
  menuDescription: string;
  basePrice: number;
  gst: number;
  platformFee: number;
  totalPrice: number;
  savingsPercent: number;
  isActive: boolean;
  subscribersCount: number;
  tier: "Executive" | "Budget" | "Student" | "Standard";
};

export type MealBooking = {
  dateStr: string; // YYYY-MM-DD
  slot: string; // "Lunch" | "Dinner"
  time: string; // "12:45 PM"
  mealOption: string; // "Executive South Indian Thali"
  status: "reserved" | "consumed" | "no-show";
  otp: string;
  orderId?: string;
};

export type UserSubscription = {
  id: string;
  planId: string;
  planTitle: string;
  vendorId: string;
  vendorName: string;
  totalMeals: number;
  mealsRemaining: number;
  mealsReserved: number;
  mealsConsumed: number;
  startDate: string;
  endDate: string;
  dailyLimit: number;
  status: "active" | "expired" | "exhausted";
  totalPaid: number;
  paymentId: string;
  bookings: Record<string, MealBooking>; // key: YYYY-MM-DD
};

export type VerticalType = "corporate" | "institute" | "hospital" | "industry" | "hotel";

export type Branch = {
  id: string;
  vendorId: string;
  name: string;
  vertical: VerticalType;
  campusOrFacility: string;
  floorOrBay: string;
  totalTables: number;
  totalSeats: number;
  occupiedSeats: number;
  currentRush: "low" | "moderate" | "peak";
  occupancyPercent: number;
  expectedWaitMins: number;
  openHours: string;
  activeStaffCount: number;
  features: string[];
};

export type StaffRole = "owner" | "cook" | "waiter" | "dispatcher";

export type StaffMember = {
  id: string;
  vendorId: string;
  branchId: string;
  branchName: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  pin: string; // 4-digit PIN for staff quick-switch
  status: "active" | "on-break" | "inactive";
  permissions: string[];
  lastActive: string;
  shift: string;
};

export type TableStatus = "available" | "reserved" | "occupied" | "cleaning";

export type TableZone = "AC Main Hall" | "Quiet Study / Work Pods" | "Express Counter Stools" | "Outdoor Garden Terrace" | "Executive / Doctor Bay";

export type TableItem = {
  id: string;
  branchId: string;
  tableNumber: string; // e.g. "T-01", "P-04", "B-12"
  zone: TableZone;
  capacity: number; // 1, 2, 4, 6, 8
  shape: "single" | "square-2" | "booth-4" | "communal-6";
  status: TableStatus;
  currentReservation?: {
    reservationId: string;
    customerName: string;
    partySize: number;
    timeSlot: string;
    otp: string;
  };
};

export type TableReservation = {
  id: string;
  branchId: string;
  branchName: string;
  facilityName: string;
  vertical: VerticalType;
  tableId: string;
  tableNumber: string;
  zone: TableZone;
  customerName: string;
  phone: string;
  partySize: number;
  dateStr: string;
  timeSlot: string; // "12:30 PM – 01:15 PM"
  rushLevelAtBooking: "low" | "moderate" | "peak";
  status: "confirmed" | "seated" | "completed" | "cancelled";
  otp: string;
  qrToken: string;
  linkedOrderOrPlan?: string;
  createdAt: string;
  notes?: string;
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

const initialMealPlans: MealPlan[] = [
  {
    id: "plan_weekly_lunch",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    title: "5-Day Weekly Corporate Lunch Pass",
    tagline: "Monday to Friday hot office lunch. Zero daily payment hassle.",
    type: "weekly",
    totalMeals: 5,
    validityDays: 7,
    dailyLimit: 1,
    mealSlots: ["Lunch (12:00 PM – 3:00 PM)"],
    menuDescription: "Chef's Special Executive Thali with daily rotating curries, dal, warm rotis & butter milk.",
    basePrice: 550,
    gst: 28,
    platformFee: 20,
    totalPrice: 598,
    savingsPercent: 25,
    isActive: true,
    subscribersCount: 42,
    tier: "Standard",
  },
  {
    id: "plan_monthly_thali",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    title: "Monthly Executive 22-Day Meal Pass",
    tagline: "Complete month of gourmet lunch or dinner. Unmatched bulk rate.",
    type: "monthly",
    totalMeals: 22,
    validityDays: 30,
    dailyLimit: 1,
    mealSlots: ["Lunch (12:00 PM – 3:00 PM)", "Dinner (7:00 PM – 10:00 PM)"],
    menuDescription: "Royal Andhra Special Thali / Mysore Delicacy Meal + Dessert & Degree Filter Coffee.",
    basePrice: 2200,
    gst: 110,
    platformFee: 40,
    totalPrice: 2350,
    savingsPercent: 35,
    isActive: true,
    subscribersCount: 88,
    tier: "Executive",
  },
  {
    id: "plan_student_flexi",
    vendorId: "vendor_little_fern",
    vendorName: "Little Fern Kitchen",
    title: "10-Meal Campus Flexi Saver",
    tagline: "Use anytime within 3 weeks for lunch or dinner. Up to 2 meals/day.",
    type: "flexi",
    totalMeals: 10,
    validityDays: 21,
    dailyLimit: 2,
    mealSlots: ["Lunch (12:00 PM – 3:00 PM)", "Dinner (7:00 PM – 10:00 PM)"],
    menuDescription: "Choice of Mini Meal, Rice Bowl, or Masala Dosa Combo with side beverage.",
    basePrice: 950,
    gst: 48,
    platformFee: 25,
    totalPrice: 1023,
    savingsPercent: 20,
    isActive: true,
    subscribersCount: 31,
    tier: "Student",
  },
  {
    id: "plan_chai_weekly",
    vendorId: "vendor_chai_point",
    vendorName: "Chai & Samosa Hub",
    title: "Weekly Chai & High-Tea Pass (7 Days)",
    tagline: "Daily morning energy kick or 4 PM snack break with team.",
    type: "weekly",
    totalMeals: 7,
    validityDays: 7,
    dailyLimit: 1,
    mealSlots: ["Breakfast (8:30 AM – 11:00 AM)", "High Tea (4:00 PM – 6:30 PM)"],
    menuDescription: "1x Special Ginger/Kullad Chai + 2x Hot Samosas or Bun Maska.",
    basePrice: 350,
    gst: 18,
    platformFee: 15,
    totalPrice: 383,
    savingsPercent: 28,
    isActive: true,
    subscribersCount: 64,
    tier: "Budget",
  },
];

const initialUserSubscription: UserSubscription = {
  id: "sub_rahul_01",
  planId: "plan_monthly_thali",
  planTitle: "Monthly Executive 22-Day Meal Pass",
  vendorId: "vendor_little_fern",
  vendorName: "Little Fern Kitchen",
  totalMeals: 22,
  mealsRemaining: 17,
  mealsReserved: 1,
  mealsConsumed: 4,
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  dailyLimit: 1,
  status: "active",
  totalPaid: 2350,
  paymentId: "pay_tot_sub_88219",
  bookings: {
    "2026-09-01": {
      dateStr: "2026-09-01",
      slot: "Lunch",
      time: "12:30 PM",
      mealOption: "Executive Andhra Thali",
      status: "consumed",
      otp: "8120",
    },
    "2026-09-02": {
      dateStr: "2026-09-02",
      slot: "Lunch",
      time: "1:00 PM",
      mealOption: "Executive South Indian Thali",
      status: "consumed",
      otp: "3319",
    },
    "2026-09-03": {
      dateStr: "2026-09-03",
      slot: "Dinner",
      time: "8:00 PM",
      mealOption: "Royal Veg Biryani & Salan",
      status: "consumed",
      otp: "9012",
    },
    "2026-09-04": {
      dateStr: "2026-09-04",
      slot: "Lunch",
      time: "12:45 PM",
      mealOption: "Executive Andhra Thali",
      status: "consumed",
      otp: "1892",
    },
    "2026-09-07": {
      dateStr: "2026-09-07",
      slot: "Lunch",
      time: "12:45 PM",
      mealOption: "Executive South Indian Thali + Payasam",
      status: "reserved",
      otp: "4921",
      orderId: "ORD-SUB-701",
    },
  },
};

const initialBranches: Branch[] = [
  {
    id: "branch_cybercity",
    vendorId: "vendor_little_fern",
    name: "Little Fern - CyberCity Tech Park",
    vertical: "corporate",
    campusOrFacility: "CyberCity SEZ Tech Hub, Building 4",
    floorOrBay: "Bay 4, Central Food Atrium",
    totalTables: 24,
    totalSeats: 88,
    occupiedSeats: 48,
    currentRush: "moderate",
    occupancyPercent: 55,
    expectedWaitMins: 4,
    openHours: "08:00 AM – 10:30 PM",
    activeStaffCount: 6,
    features: ["AC Dining Hall", "Laptop Charging Pods", "Express Pickup Cubbies", "High-Speed WiFi"],
  },
  {
    id: "branch_iit_powai",
    vendorId: "vendor_little_fern",
    name: "Little Fern - IIT Campus Mess & Cafe",
    vertical: "institute",
    campusOrFacility: "IIT Powai Campus, Student Activity Block",
    floorOrBay: "Hostel Dining Wing & North Lawn",
    totalTables: 36,
    totalSeats: 160,
    occupiedSeats: 138,
    currentRush: "peak",
    occupancyPercent: 86,
    expectedWaitMins: 14,
    openHours: "07:00 AM – 11:00 PM",
    activeStaffCount: 8,
    features: ["Subsidized Mess Counters", "Late Night Study Pods", "Unlimited Thali Bar", "Student ID Scanner"],
  },
  {
    id: "branch_apollo_health",
    vendorId: "vendor_little_fern",
    name: "Little Fern - Apollo Health City Cafeteria",
    vertical: "hospital",
    campusOrFacility: "Apollo Health City & Super-Speciality Hospital",
    floorOrBay: "Ground Floor Atrium & Doctor's Wing",
    totalTables: 18,
    totalSeats: 56,
    occupiedSeats: 14,
    currentRush: "low",
    occupancyPercent: 25,
    expectedWaitMins: 0,
    openHours: "24 Hours (Round the Clock)",
    activeStaffCount: 5,
    features: ["Low-Sodium Clinical Diet Options", "Quiet Attendant Lounge", "Doctor Priority Express Bay", "Wheelchair Accessible"],
  },
  {
    id: "branch_tata_auto",
    vendorId: "vendor_little_fern",
    name: "Little Fern - Tata Auto Plant Dining Bay",
    vertical: "industry",
    campusOrFacility: "Tata Auto Components Plant 2, Industrial Corridor",
    floorOrBay: "Shift Dining Hall C",
    totalTables: 32,
    totalSeats: 180,
    occupiedSeats: 36,
    currentRush: "low",
    occupancyPercent: 20,
    expectedWaitMins: 0,
    openHours: "06:00 AM – 09:00 PM",
    activeStaffCount: 7,
    features: ["Shift Batch Seating (300/hr)", "Heavy Thali Station", "Instant Token Tap", "Industrial Air Coolers"],
  },
  {
    id: "branch_royal_orchid",
    vendorId: "vendor_little_fern",
    name: "Little Fern - Royal Orchid All-Day Dining",
    vertical: "hotel",
    campusOrFacility: "Royal Orchid Hotel & Convention Resort",
    floorOrBay: "Poolside Verandah & Level 1 Bistro",
    totalTables: 20,
    totalSeats: 72,
    occupiedSeats: 35,
    currentRush: "moderate",
    occupancyPercent: 48,
    expectedWaitMins: 5,
    openHours: "06:30 AM – 11:30 PM",
    activeStaffCount: 6,
    features: ["Fine Table Service", "Garden Terrace Seating", "Live Dosa & Beverage Bar", "Buffet Counters"],
  },
];

const initialStaffMembers: StaffMember[] = [
  {
    id: "staff_01",
    vendorId: "vendor_little_fern",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity",
    name: "Priya Sharma",
    role: "owner",
    phone: "+91 98451 22910",
    email: "priya@littlefern.in",
    pin: "1001",
    status: "active",
    permissions: ["Full System Access", "Staff & Payroll", "Menu & Pricing", "Settlements & Banking", "Branch Expansion"],
    lastActive: "Just now",
    shift: "All-Day Admin",
  },
  {
    id: "staff_02",
    vendorId: "vendor_little_fern",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity",
    name: "Chef Murugan",
    role: "cook",
    phone: "+91 98452 44102",
    email: "murugan@littlefern.in",
    pin: "2042",
    status: "active",
    permissions: ["Kitchen Display Station (KDS)", "Ticket Bump Bar", "Prep Timer Calibration", "Stockout (86) Item Toggle"],
    lastActive: "2 mins ago",
    shift: "Morning & Lunch (07:00 AM – 03:30 PM)",
  },
  {
    id: "staff_03",
    vendorId: "vendor_little_fern",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity",
    name: "Sundar Raj",
    role: "waiter",
    phone: "+91 97411 90214",
    email: "sundar.r@littlefern.in",
    pin: "3319",
    status: "active",
    permissions: ["Table Floorplan View", "Punch Dine-in Order", "Mark Table Clean / Occupied", "Deliver Hot Meals"],
    lastActive: "1 min ago",
    shift: "Floor Service (11:00 AM – 08:00 PM)",
  },
  {
    id: "staff_04",
    vendorId: "vendor_little_fern",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity",
    name: "Kavita Nair",
    role: "dispatcher",
    phone: "+91 98201 56129",
    email: "kavita.n@littlefern.in",
    pin: "4091",
    status: "active",
    permissions: ["Express Pickup Bay", "Customer OTP Verification", "Cubby Slot Assignment", "Daily Dispatch Log"],
    lastActive: "Just now",
    shift: "Peak Counter (11:30 AM – 04:30 PM)",
  },
  {
    id: "staff_05",
    vendorId: "vendor_little_fern",
    branchId: "branch_iit_powai",
    branchName: "Little Fern - IIT Campus",
    name: "Anand Verma",
    role: "cook",
    phone: "+91 99302 78104",
    email: "anand.v@littlefern.in",
    pin: "2188",
    status: "active",
    permissions: ["Mess Kitchen Station", "Bulk Thali KDS"],
    lastActive: "10 mins ago",
    shift: "Student Mess Lunch",
  },
  {
    id: "staff_06",
    vendorId: "vendor_little_fern",
    branchId: "branch_royal_orchid",
    branchName: "Little Fern - Royal Orchid",
    name: "Deepak Joshi",
    role: "waiter",
    phone: "+91 98190 62145",
    email: "deepak.j@littlefern.in",
    pin: "3490",
    status: "on-break",
    permissions: ["Bistro Seating & Service", "Room & Table Orders"],
    lastActive: "25 mins ago",
    shift: "Evening Banquet",
  },
];

const initialTables: TableItem[] = [
  { id: "tab_01", branchId: "branch_cybercity", tableNumber: "T-01", zone: "AC Main Hall", capacity: 4, shape: "booth-4", status: "occupied" },
  { id: "tab_02", branchId: "branch_cybercity", tableNumber: "T-02", zone: "AC Main Hall", capacity: 4, shape: "booth-4", status: "available" },
  { id: "tab_03", branchId: "branch_cybercity", tableNumber: "T-03", zone: "AC Main Hall", capacity: 2, shape: "square-2", status: "available" },
  {
    id: "tab_04",
    branchId: "branch_cybercity",
    tableNumber: "T-04",
    zone: "AC Main Hall",
    capacity: 2,
    shape: "square-2",
    status: "reserved",
    currentReservation: {
      reservationId: "res_001",
      customerName: "Rahul Sharma (Pass Holder)",
      partySize: 2,
      timeSlot: "12:45 PM – 01:30 PM",
      otp: "6821",
    },
  },
  { id: "tab_05", branchId: "branch_cybercity", tableNumber: "P-01", zone: "Quiet Study / Work Pods", capacity: 1, shape: "single", status: "occupied" },
  { id: "tab_06", branchId: "branch_cybercity", tableNumber: "P-02", zone: "Quiet Study / Work Pods", capacity: 1, shape: "single", status: "available" },
  { id: "tab_07", branchId: "branch_cybercity", tableNumber: "P-03", zone: "Quiet Study / Work Pods", capacity: 2, shape: "square-2", status: "available" },
  { id: "tab_08", branchId: "branch_cybercity", tableNumber: "C-01", zone: "Express Counter Stools", capacity: 1, shape: "single", status: "available" },
  { id: "tab_09", branchId: "branch_cybercity", tableNumber: "C-02", zone: "Express Counter Stools", capacity: 1, shape: "single", status: "occupied" },
  { id: "tab_10", branchId: "branch_cybercity", tableNumber: "G-01", zone: "Outdoor Garden Terrace", capacity: 4, shape: "square-2", status: "available" },
  {
    id: "tab_11",
    branchId: "branch_cybercity",
    tableNumber: "G-02",
    zone: "Outdoor Garden Terrace",
    capacity: 6,
    shape: "communal-6",
    status: "reserved",
    currentReservation: {
      reservationId: "res_002",
      customerName: "Cloud Tech Team",
      partySize: 5,
      timeSlot: "01:15 PM – 02:00 PM",
      otp: "9140",
    },
  },
  { id: "tab_12", branchId: "branch_cybercity", tableNumber: "E-01", zone: "Executive / Doctor Bay", capacity: 4, shape: "booth-4", status: "cleaning" },
];

const initialTableReservations: TableReservation[] = [
  {
    id: "RES-7491",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity Tech Park",
    facilityName: "CyberCity SEZ Tech Hub",
    vertical: "corporate",
    tableId: "tab_04",
    tableNumber: "T-04",
    zone: "AC Main Hall",
    customerName: "Rahul Sharma",
    phone: "+91 98450 12345",
    partySize: 2,
    dateStr: "2026-09-07",
    timeSlot: "12:45 PM – 01:30 PM",
    rushLevelAtBooking: "moderate",
    status: "confirmed",
    otp: "6821",
    qrToken: "TOT-SEAT-7491-T04",
    linkedOrderOrPlan: "Monthly Executive 22-Day Meal Pass (Slot #5)",
    createdAt: "11:40 AM",
    notes: "Window side if possible. Lunch pre-scheduled via Meal Pass.",
  },
  {
    id: "RES-7485",
    branchId: "branch_cybercity",
    branchName: "Little Fern - CyberCity Tech Park",
    facilityName: "CyberCity SEZ Tech Hub",
    vertical: "corporate",
    tableId: "tab_11",
    tableNumber: "G-02",
    zone: "Outdoor Garden Terrace",
    customerName: "Cloud Tech Team",
    phone: "+91 98860 31405",
    partySize: 5,
    dateStr: "2026-09-07",
    timeSlot: "01:15 PM – 02:00 PM",
    rushLevelAtBooking: "peak",
    status: "confirmed",
    otp: "9140",
    qrToken: "TOT-SEAT-7485-G02",
    linkedOrderOrPlan: "Pre-ordered 5x Thali Bowls",
    createdAt: "11:15 AM",
    notes: "Team sprint demo lunch.",
  },
];

class TakeOnTimeStore {
  private vendors: Vendor[] = initialVendors;
  private orders: Order[] = initialOrders;
  private mealPlans: MealPlan[] = initialMealPlans;
  private userSubscription: UserSubscription | null = initialUserSubscription;
  private branches: Branch[] = initialBranches;
  private activeBranchId: string = "branch_cybercity";
  private tables: TableItem[] = initialTables;
  private tableReservations: TableReservation[] = initialTableReservations;
  private staffMembers: StaffMember[] = initialStaffMembers;
  private currentStaffRole: StaffRole = "owner";
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

  // Meal Plan & Pass Management
  getMealPlans(vendorId?: string) {
    if (!vendorId) return [...this.mealPlans];
    return this.mealPlans.filter((p) => p.vendorId === vendorId);
  }

  getMealPlanById(id: string) {
    return this.mealPlans.find((p) => p.id === id);
  }

  toggleMealPlanStatus(planId: string) {
    this.mealPlans = this.mealPlans.map((p) => {
      if (p.id !== planId) return p;
      return { ...p, isActive: !p.isActive };
    });
    this.notify();
  }

  createMealPlan(plan: Omit<MealPlan, "id" | "subscribersCount">) {
    const newId = `plan_${Math.random().toString(36).slice(2, 9)}`;
    const newPlan: MealPlan = {
      ...plan,
      id: newId,
      subscribersCount: 0,
    };
    this.mealPlans = [newPlan, ...this.mealPlans];
    this.notify();
    return newPlan;
  }

  getUserSubscription(): UserSubscription | null {
    return this.userSubscription ? { ...this.userSubscription } : null;
  }

  purchaseMealPlan(planId: string): UserSubscription {
    const plan = this.mealPlans.find((p) => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    const startDate = new Date().toISOString().split("T")[0];
    const end = new Date();
    end.setDate(end.getDate() + plan.validityDays);
    const endDate = end.toISOString().split("T")[0];

    const sub: UserSubscription = {
      id: `sub_${Math.random().toString(36).slice(2, 9)}`,
      planId: plan.id,
      planTitle: plan.title,
      vendorId: plan.vendorId,
      vendorName: plan.vendorName,
      totalMeals: plan.totalMeals,
      mealsRemaining: plan.totalMeals,
      mealsReserved: 0,
      mealsConsumed: 0,
      startDate,
      endDate,
      dailyLimit: plan.dailyLimit,
      status: "active",
      totalPaid: plan.totalPrice,
      paymentId: `pay_tot_sub_${Math.random().toString(36).slice(2, 8)}`,
      bookings: {},
    };

    // Increment subscriber count on plan
    this.mealPlans = this.mealPlans.map((p) =>
      p.id === plan.id ? { ...p, subscribersCount: p.subscribersCount + 1 } : p
    );

    this.userSubscription = sub;
    this.notify();
    return sub;
  }

  bookMealSlot(dateStr: string, slot: string, time: string, mealOption: string): boolean {
    if (!this.userSubscription) return false;
    if (this.userSubscription.mealsRemaining <= 0) return false;

    // Daily limit check
    const existing = this.userSubscription.bookings[dateStr];
    if (existing && existing.status === "reserved") return false;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `ORD-SUB-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: MealBooking = {
      dateStr,
      slot,
      time,
      mealOption,
      status: "reserved",
      otp,
      orderId,
    };

    this.userSubscription.bookings[dateStr] = newBooking;
    this.userSubscription.mealsRemaining -= 1;
    this.userSubscription.mealsReserved += 1;

    // Also add to vendor kitchen orders queue so it appears on the KDS/Orders tablet!
    const subOrder: Order = {
      id: orderId,
      vendorId: this.userSubscription.vendorId,
      vendorName: this.userSubscription.vendorName,
      customer: "Rahul Sharma (Pass Holder)",
      phone: "+91 98450 12345",
      initials: "RS",
      pickupTime: time,
      pickupRange: `${time} (Prepaid Pass)`,
      items: [
        {
          name: mealOption,
          detail: `${this.userSubscription.planTitle} · Prepaid Credit`,
          quantity: 1,
          price: "PREPAID",
          priceNum: 0,
        },
      ],
      amount: "₹0 (Pass)",
      amountNum: 0,
      status: "in-progress",
      note: "Prepaid Meal Pass slot booking. Auto-preparing T-15 mins.",
      urgent: false,
      otp,
      paymentId: this.userSubscription.paymentId,
      createdAt: "Auto-Scheduled",
      counterNumber: "Counter 2 (Express Pass Bay)",
    };

    this.orders = [subOrder, ...this.orders];
    this.notify();
    return true;
  }

  cancelMealSlot(dateStr: string): boolean {
    if (!this.userSubscription) return false;
    const booking = this.userSubscription.bookings[dateStr];
    if (!booking || booking.status !== "reserved") return false;

    delete this.userSubscription.bookings[dateStr];
    this.userSubscription.mealsRemaining += 1;
    this.userSubscription.mealsReserved = Math.max(0, this.userSubscription.mealsReserved - 1);

    if (booking.orderId) {
      this.orders = this.orders.filter((o) => o.id !== booking.orderId);
    }

    this.notify();
    return true;
  }

  consumeMealSlot(dateStr: string): boolean {
    if (!this.userSubscription) return false;
    const booking = this.userSubscription.bookings[dateStr];
    if (!booking || booking.status !== "reserved") return false;

    booking.status = "consumed";
    this.userSubscription.mealsReserved = Math.max(0, this.userSubscription.mealsReserved - 1);
    this.userSubscription.mealsConsumed += 1;

    if (booking.orderId) {
      this.updateOrderStatus(booking.orderId, "completed");
    }

    this.notify();
    return true;
  }

  // Multi-Branch Management
  getBranches() {
    return [...this.branches];
  }

  getActiveBranchId() {
    return this.activeBranchId;
  }

  getActiveBranch() {
    return this.branches.find((b) => b.id === this.activeBranchId) || this.branches[0];
  }

  setActiveBranch(branchId: string) {
    if (this.branches.some((b) => b.id === branchId)) {
      this.activeBranchId = branchId;
      this.notify();
    }
  }

  addBranch(branch: Omit<Branch, "id">) {
    const newId = `branch_${Math.random().toString(36).slice(2, 8)}`;
    const newBranch: Branch = { ...branch, id: newId };
    this.branches = [...this.branches, newBranch];
    const defaultTables: TableItem[] = [
      { id: `tab_${newId}_1`, branchId: newId, tableNumber: "T-01", zone: "AC Main Hall", capacity: 4, shape: "booth-4", status: "available" },
      { id: `tab_${newId}_2`, branchId: newId, tableNumber: "T-02", zone: "AC Main Hall", capacity: 2, shape: "square-2", status: "available" },
      { id: `tab_${newId}_3`, branchId: newId, tableNumber: "P-01", zone: "Quiet Study / Work Pods", capacity: 1, shape: "single", status: "available" },
      { id: `tab_${newId}_4`, branchId: newId, tableNumber: "C-01", zone: "Express Counter Stools", capacity: 1, shape: "single", status: "available" },
    ];
    this.tables = [...this.tables, ...defaultTables];
    this.notify();
    return newBranch;
  }

  setBranchRushLevel(branchId: string, rush: "low" | "moderate" | "peak", occupancyPercent: number, waitMins: number) {
    this.branches = this.branches.map((b) => {
      if (b.id !== branchId) return b;
      return { ...b, currentRush: rush, occupancyPercent, expectedWaitMins: waitMins };
    });
    this.notify();
  }

  // Table & Seating Management
  getTables(branchId?: string) {
    const targetBranch = branchId || this.activeBranchId;
    return this.tables.filter((t) => t.branchId === targetBranch);
  }

  updateTableStatus(tableId: string, status: TableStatus) {
    this.tables = this.tables.map((t) => {
      if (t.id !== tableId) return t;
      const currentReservation = status === "available" ? undefined : t.currentReservation;
      return { ...t, status, currentReservation };
    });
    this.notify();
  }

  // Seat / Table Reservations
  getTableReservations(branchId?: string) {
    if (!branchId) return [...this.tableReservations];
    return this.tableReservations.filter((r) => r.branchId === branchId);
  }

  getUserActiveTableReservation(phone = "+91 98450 12345") {
    return this.tableReservations.find((r) => r.phone === phone && (r.status === "confirmed" || r.status === "seated")) || null;
  }

  createSeatReservation(reservation: Omit<TableReservation, "id" | "otp" | "qrToken" | "status" | "createdAt">): TableReservation {
    const id = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const qrToken = `TOT-SEAT-${id}-${reservation.tableNumber}`;
    const createdAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newReservation: TableReservation = {
      ...reservation,
      id,
      otp,
      qrToken,
      status: "confirmed",
      createdAt,
    };

    this.tableReservations = [newReservation, ...this.tableReservations];

    // Mark the table as reserved
    this.tables = this.tables.map((t) => {
      if (t.id !== reservation.tableId) return t;
      return {
        ...t,
        status: "reserved",
        currentReservation: {
          reservationId: id,
          customerName: reservation.customerName,
          partySize: reservation.partySize,
          timeSlot: reservation.timeSlot,
          otp,
        },
      };
    });

    this.notify();
    return newReservation;
  }

  cancelSeatReservation(reservationId: string): boolean {
    const res = this.tableReservations.find((r) => r.id === reservationId);
    if (!res) return false;

    this.tableReservations = this.tableReservations.map((r) => {
      if (r.id !== reservationId) return r;
      return { ...r, status: "cancelled" };
    });

    // Free the table
    this.tables = this.tables.map((t) => {
      if (t.id !== res.tableId) return t;
      return { ...t, status: "available", currentReservation: undefined };
    });

    this.notify();
    return true;
  }

  seatReservation(reservationId: string): boolean {
    const res = this.tableReservations.find((r) => r.id === reservationId);
    if (!res) return false;

    this.tableReservations = this.tableReservations.map((r) => {
      if (r.id !== reservationId) return r;
      return { ...r, status: "seated" };
    });

    this.tables = this.tables.map((t) => {
      if (t.id !== res.tableId) return t;
      return { ...t, status: "occupied" };
    });

    this.notify();
    return true;
  }

  completeSeatReservation(reservationId: string): boolean {
    const res = this.tableReservations.find((r) => r.id === reservationId);
    if (!res) return false;

    this.tableReservations = this.tableReservations.map((r) => {
      if (r.id !== reservationId) return r;
      return { ...r, status: "completed" };
    });

    this.tables = this.tables.map((t) => {
      if (t.id !== res.tableId) return t;
      return { ...t, status: "cleaning", currentReservation: undefined };
    });

    this.notify();
    return true;
  }

  // Staff & Role Management
  getStaffMembers(branchId?: string) {
    if (!branchId) return [...this.staffMembers];
    return this.staffMembers.filter((s) => s.branchId === branchId);
  }

  addStaffMember(staff: Omit<StaffMember, "id" | "lastActive">): StaffMember {
    const newId = `staff_${Math.random().toString(36).slice(2, 8)}`;
    const newStaff: StaffMember = {
      ...staff,
      id: newId,
      lastActive: "Just now",
    };
    this.staffMembers = [...this.staffMembers, newStaff];
    this.notify();
    return newStaff;
  }

  updateStaffStatus(staffId: string, status: "active" | "on-break" | "inactive") {
    this.staffMembers = this.staffMembers.map((s) => {
      if (s.id !== staffId) return s;
      return { ...s, status, lastActive: "Just now" };
    });
    this.notify();
  }

  removeStaffMember(staffId: string) {
    this.staffMembers = this.staffMembers.filter((s) => s.id !== staffId);
    this.notify();
  }

  getCurrentStaffRole(): StaffRole {
    return this.currentStaffRole;
  }

  setCurrentStaffRole(role: StaffRole) {
    this.currentStaffRole = role;
    this.notify();
  }
}

export const takeOnTimeStore = new TakeOnTimeStore();
