import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const vendorsTable = pgTable("vendors", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  merchantId: text("merchant_id").notNull(),
  acceptingOrders: boolean("accepting_orders").notNull().default(false),
  breakUntil: timestamp("break_until", { withTimezone: true }),
  isApproved: boolean("is_approved").notNull().default(true),
  approvalNote: text("approval_note"),
  address: text("address").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorCategoriesTable = pgTable("vendor_categories", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  name: text("name").notNull(),
  accent: text("accent").notNull().default("layers"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const vendorItemsTable = pgTable("vendor_items", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricePaise: integer("price_paise").notNull(),
  prepMinutes: integer("prep_minutes").notNull().default(10),
  isAvailable: boolean("is_available").notNull().default(true),
  imageUrl: text("image_url"),
});

export const vendorOrdersTable = pgTable("vendor_orders", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  customer: text("customer").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  status: text("status").notNull(),
  time: text("time").notNull(),
  pickup: text("pickup").notNull(),
  note: text("note"),
  orderType: text("order_type").notNull().default("regular"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorPassPlansTable = pgTable("vendor_pass_plans", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  name: text("name").notNull(),
  cadence: text("cadence").notNull(),
  pricePaise: integer("price_paise").notNull(),
  totalMeals: integer("total_meals").notNull(),
  validityDays: integer("validity_days").notNull(),
  dailyLimit: integer("daily_limit").notNull(),
  mealDescription: text("meal_description").notNull(),
  subscribers: integer("subscribers").notNull().default(0),
  active: boolean("active").notNull().default(true),
  mealSlots: jsonb("meal_slots").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorMealSlotsTable = pgTable("vendor_meal_slots", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  meal: text("meal").notNull(),
  time: text("time").notNull(),
  booked: integer("booked").notNull().default(0),
  capacity: integer("capacity").notNull(),
  tables: integer("tables").notNull(),
  open: boolean("open").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorReservationsTable = pgTable("vendor_reservations", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  customer: text("customer").notNull(),
  passName: text("pass_name").notNull(),
  meal: text("meal").notNull(),
  slotId: text("slot_id").notNull(),
  pickupDate: text("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  status: text("status").notNull().default("Reserved"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vendorNotificationsTable = pgTable("vendor_notifications", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const vendorBankDetailsTable = pgTable("vendor_bank_details", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull(),
  bankName: text("bank_name").notNull(),
  accountLast4: text("account_last4").notNull(),
  status: text("status").notNull().default("Verified"),
  isPrimary: boolean("is_primary").notNull().default(true),
});