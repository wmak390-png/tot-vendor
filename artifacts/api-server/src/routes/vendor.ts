import { Router, type IRouter } from "express";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  vendorCategoriesTable,
  vendorItemsTable,
  vendorMealSlotsTable,
  vendorNotificationsTable,
  vendorOrdersTable,
  vendorPassPlansTable,
  vendorReservationsTable,
  vendorsTable,
} from "@workspace/db/schema";

const router: IRouter = Router();
const DEMO_VENDOR_ID = "demo-vendor-1";
const orderStatuses = ["New", "Accepted", "Preparing", "Ready", "Completed", "Cancelled"] as const;
const reservationStatuses = ["Reserved", "Preparing", "Ready", "Collected", "Cancelled", "No-show"] as const;
const cancellationReasons = ["Capacity interruption", "Ingredient unavailable", "Service interruption"] as const;
const legalOrderTransitions: Record<string, readonly string[]> = {
  New: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Completed"],
  Completed: [],
  Cancelled: [],
};

type OrderStatus = (typeof orderStatuses)[number];
type ReservationStatus = (typeof reservationStatuses)[number];

function vendorIdFromRequest(request: { query: Record<string, unknown>; body: Record<string, unknown> }) {
  const candidate = request.query.vendorId ?? request.body.vendorId;
  return typeof candidate === "string" && candidate.trim() ? candidate : DEMO_VENDOR_ID;
}

function asMoney(paise: number) {
  return Math.round(paise) / 100;
}

function asPaise(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

function mealDescription(plan: { totalMeals: number; dailyLimit: number; mealDescription: string }) {
  return plan.mealDescription || `${plan.totalMeals} meals · ${plan.dailyLimit} per day`;
}

function parseReservationStart(pickupDate: string, pickupTime: string) {
  const date = pickupDate.toLowerCase() === "today" ? new Date() : new Date(pickupDate);
  if (Number.isNaN(date.getTime())) return null;
  const match = pickupTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function assertDemoVendor(vendorId: string, res: { status: (status: number) => { json: (body: unknown) => unknown } }) {
  if (vendorId === DEMO_VENDOR_ID) return true;
  res.status(403).json({ error: { code: "VENDOR_ACCESS_DENIED", message: "This vendor workspace is not available to the current session.", status: 403 } });
  return false;
}

async function ensureDemoVendor() {
  const existing = await db.select({ id: vendorsTable.id }).from(vendorsTable).where(eq(vendorsTable.id, DEMO_VENDOR_ID)).limit(1);
  if (existing.length) return;

  await db.insert(vendorsTable).values({
    id: DEMO_VENDOR_ID,
    ownerId: "demo-owner-1",
    businessName: "The Midnight Bistro",
    businessType: "Multi-cuisine",
    merchantId: "#882910",
    acceptingOrders: true,
    isApproved: true,
    address: "North Zone",
  });

  await db.insert(vendorCategoriesTable).values([
    { id: "cat-1", vendorId: DEMO_VENDOR_ID, name: "Breakfast", accent: "sunrise", sortOrder: 0 },
    { id: "cat-2", vendorId: DEMO_VENDOR_ID, name: "Main Course", accent: "leaf", sortOrder: 1 },
    { id: "cat-3", vendorId: DEMO_VENDOR_ID, name: "Beverages", accent: "coffee", sortOrder: 2 },
    { id: "cat-4", vendorId: DEMO_VENDOR_ID, name: "Desserts", accent: "gift", sortOrder: 3 },
  ]);
  await db.insert(vendorItemsTable).values([
    { id: "item-1", vendorId: DEMO_VENDOR_ID, categoryId: "cat-2", name: "Paneer Tikka Bowl", description: "Smoky paneer, roasted vegetables, mint chutney", pricePaise: 18900, prepMinutes: 12, isAvailable: true },
    { id: "item-2", vendorId: DEMO_VENDOR_ID, categoryId: "cat-2", name: "Butter Chicken Rice", description: "Creamy tomato gravy, basmati rice, pickled onions", pricePaise: 24900, prepMinutes: 15, isAvailable: true },
    { id: "item-3", vendorId: DEMO_VENDOR_ID, categoryId: "cat-2", name: "Dal Makhani Combo", description: "Slow-cooked black lentils with two rotis", pricePaise: 16900, prepMinutes: 10, isAvailable: false },
    { id: "item-4", vendorId: DEMO_VENDOR_ID, categoryId: "cat-3", name: "Cold Brew", description: "18-hour steeped coffee with orange peel", pricePaise: 12900, prepMinutes: 3, isAvailable: true },
    { id: "item-5", vendorId: DEMO_VENDOR_ID, categoryId: "cat-1", name: "Masala Omelette", description: "Three eggs, onion, coriander, toasted pav", pricePaise: 13900, prepMinutes: 8, isAvailable: true },
  ]);
  await db.insert(vendorOrdersTable).values([
    { id: "TT-4821", vendorId: DEMO_VENDOR_ID, customer: "Aarav Mehta", item: "Paneer Tikka Bowl", quantity: 2, amountPaise: 43800, status: "New", time: "2 min ago", pickup: "12:30 – 12:45 PM", note: "Less spicy, please" },
    { id: "TT-4818", vendorId: DEMO_VENDOR_ID, customer: "Meera Shah", item: "Cold Brew + Masala Omelette", quantity: 1, amountPaise: 26800, status: "Preparing", time: "18 min ago", pickup: "12:15 – 12:30 PM" },
    { id: "TT-4812", vendorId: DEMO_VENDOR_ID, customer: "Rohan Kapoor", item: "Dal Makhani Combo", quantity: 1, amountPaise: 16900, status: "Ready", time: "32 min ago", pickup: "12:00 – 12:15 PM" },
    { id: "TT-4804", vendorId: DEMO_VENDOR_ID, customer: "Nisha Verma", item: "Butter Chicken Rice", quantity: 1, amountPaise: 24900, status: "Completed", time: "1 hr ago", pickup: "11:30 – 11:45 AM" },
  ]);
  await db.insert(vendorPassPlansTable).values([
    { id: "pass-daily", vendorId: DEMO_VENDOR_ID, name: "Daily lunch pass", cadence: "Daily", pricePaise: 14900, totalMeals: 1, validityDays: 1, dailyLimit: 1, mealDescription: "1 meal · lunch", subscribers: 18, active: true, mealSlots: ["Lunch"] },
    { id: "pass-weekly", vendorId: DEMO_VENDOR_ID, name: "Weekly saver", cadence: "Weekly", pricePaise: 79900, totalMeals: 5, validityDays: 7, dailyLimit: 1, mealDescription: "5 meals · any lunch", subscribers: 32, active: true, mealSlots: ["Lunch"] },
    { id: "pass-monthly", vendorId: DEMO_VENDOR_ID, name: "Monthly regular", cadence: "Monthly", pricePaise: 249900, totalMeals: 20, validityDays: 30, dailyLimit: 1, mealDescription: "20 meals · breakfast + lunch", subscribers: 14, active: false, mealSlots: ["Breakfast", "Lunch"] },
  ]);
  await db.insert(vendorMealSlotsTable).values([
    { id: "slot-breakfast", vendorId: DEMO_VENDOR_ID, meal: "Breakfast", time: "8:00 – 9:30 AM", booked: 12, capacity: 24, tables: 6, open: true },
    { id: "slot-lunch-1", vendorId: DEMO_VENDOR_ID, meal: "Lunch", time: "12:00 – 1:00 PM", booked: 18, capacity: 24, tables: 6, open: true },
    { id: "slot-lunch-2", vendorId: DEMO_VENDOR_ID, meal: "Lunch", time: "1:00 – 2:00 PM", booked: 7, capacity: 24, tables: 6, open: true },
    { id: "slot-dinner", vendorId: DEMO_VENDOR_ID, meal: "Dinner", time: "7:00 – 9:00 PM", booked: 0, capacity: 24, tables: 6, open: false },
  ]);
  await db.insert(vendorReservationsTable).values([
    { id: "reservation-1001", vendorId: DEMO_VENDOR_ID, customer: "Ishita Rao", passName: "Weekly saver", meal: "Lunch", slotId: "slot-lunch-1", pickupDate: "Today", pickupTime: "12:30 PM", status: "Reserved" },
    { id: "reservation-1002", vendorId: DEMO_VENDOR_ID, customer: "Kabir Singh", passName: "Monthly regular", meal: "Breakfast", slotId: "slot-breakfast", pickupDate: "Today", pickupTime: "8:45 AM", status: "Ready" },
    { id: "reservation-1003", vendorId: DEMO_VENDOR_ID, customer: "Ananya Iyer", passName: "Daily lunch pass", meal: "Lunch", slotId: "slot-lunch-2", pickupDate: "Today", pickupTime: "1:15 PM", status: "Reserved" },
  ]);
  await db.insert(vendorNotificationsTable).values([
    { id: "notice-1", vendorId: DEMO_VENDOR_ID, title: "New order received", body: "Order #TT-4821 from Aarav Mehta", isRead: false },
    { id: "notice-2", vendorId: DEMO_VENDOR_ID, title: "Reservation cancelled", body: "A lunch booking was cancelled and one seat reopened.", isRead: false },
    { id: "notice-3", vendorId: DEMO_VENDOR_ID, title: "Store is open", body: "Your store is now accepting orders", isRead: true },
  ]);
}

async function getSnapshot(vendorId: string) {
  await ensureDemoVendor();
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, vendorId)).limit(1);
  if (!vendor) return null;
  const [categories, items, orders, passPlans, slots, reservations, notifications] = await Promise.all([
    db.select().from(vendorCategoriesTable).where(eq(vendorCategoriesTable.vendorId, vendorId)).orderBy(asc(vendorCategoriesTable.sortOrder)),
    db.select().from(vendorItemsTable).where(eq(vendorItemsTable.vendorId, vendorId)),
    db.select().from(vendorOrdersTable).where(eq(vendorOrdersTable.vendorId, vendorId)).orderBy(desc(vendorOrdersTable.updatedAt)),
    db.select().from(vendorPassPlansTable).where(eq(vendorPassPlansTable.vendorId, vendorId)).orderBy(asc(vendorPassPlansTable.name)),
    db.select().from(vendorMealSlotsTable).where(eq(vendorMealSlotsTable.vendorId, vendorId)).orderBy(asc(vendorMealSlotsTable.meal)),
    db.select().from(vendorReservationsTable).where(eq(vendorReservationsTable.vendorId, vendorId)).orderBy(desc(vendorReservationsTable.createdAt)),
    db.select().from(vendorNotificationsTable).where(eq(vendorNotificationsTable.vendorId, vendorId)).orderBy(desc(vendorNotificationsTable.createdAt)),
  ]);
  return {
    vendor: {
      id: vendor.id,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      merchantId: vendor.merchantId,
      address: vendor.address,
      acceptingOrders: vendor.acceptingOrders,
      breakUntil: vendor.breakUntil?.toISOString() ?? null,
      isApproved: vendor.isApproved,
      approvalNote: vendor.approvalNote,
    },
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: items.filter((item) => item.categoryId === category.id).length,
      accent: category.accent,
    })),
    items: items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: asMoney(item.pricePaise),
      soldOut: !item.isAvailable,
      prep: `${item.prepMinutes} min`,
    })),
    orders: orders.map((order) => ({ ...order, amount: asMoney(order.amountPaise), id: `#${order.id}` })),
    passPlans: passPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      cadence: plan.cadence,
      price: asMoney(plan.pricePaise),
      meals: mealDescription(plan),
      subscribers: plan.subscribers,
      active: plan.active,
      totalMeals: plan.totalMeals,
      validityDays: plan.validityDays,
      dailyLimit: plan.dailyLimit,
      mealSlots: plan.mealSlots,
    })),
    reservationSlots: slots,
    reservations,
    notifications,
  };
}

router.get("/vendor/operations", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: {} });
    if (!assertDemoVendor(vendorId, res)) return;
    const snapshot = await getSnapshot(vendorId);
    if (!snapshot) return res.status(404).json({ error: { code: "VENDOR_NOT_FOUND", message: "Vendor could not be found.", status: 404 } });
    return res.json(snapshot);
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/store", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const acceptingOrders = typeof req.body?.acceptingOrders === "boolean" ? req.body.acceptingOrders : undefined;
    const breakUntil = req.body?.breakUntil === null ? null : typeof req.body?.breakUntil === "string" ? new Date(req.body.breakUntil) : undefined;
    if (breakUntil && Number.isNaN(breakUntil.getTime())) return res.status(400).json({ error: { code: "INVALID_BREAK_UNTIL", message: "Break time must be a valid timestamp.", status: 400 } });
    await db.update(vendorsTable).set({ ...(acceptingOrders === undefined ? {} : { acceptingOrders }), ...(breakUntil === undefined ? {} : { breakUntil }), updatedAt: new Date() }).where(eq(vendorsTable.id, vendorId));
    return res.json((await getSnapshot(vendorId))?.vendor);
  } catch (error) {
    return next(error);
  }
});

router.post("/vendor/operations/plans", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const cadence = body.cadence === "Daily" || body.cadence === "Weekly" || body.cadence === "Monthly" ? body.cadence : null;
    const pricePaise = asPaise(body.price);
    if (!name || !cadence || pricePaise === null) return res.status(400).json({ error: { code: "INVALID_PLAN", message: "Plan name, cadence, and a valid price are required.", status: 400 } });
    const planId = `pass-${Date.now()}`;
    await db.insert(vendorPassPlansTable).values({
      id: planId,
      vendorId,
      name,
      cadence,
      pricePaise,
      totalMeals: cadence === "Daily" ? 1 : cadence === "Weekly" ? 5 : 20,
      validityDays: cadence === "Daily" ? 1 : cadence === "Weekly" ? 7 : 30,
      dailyLimit: 1,
      mealDescription: cadence === "Daily" ? "1 meal · choose a slot" : cadence === "Weekly" ? "5 meals · any slot" : "20 meals · breakfast + lunch",
      subscribers: 0,
      active: true,
      mealSlots: cadence === "Monthly" ? ["Breakfast", "Lunch"] : ["Lunch"],
    });
    return res.status(201).json((await getSnapshot(vendorId))?.passPlans.find((plan) => plan.id === planId));
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/plans/:planId", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    if (typeof req.body?.active !== "boolean") return res.status(400).json({ error: { code: "INVALID_PLAN_STATE", message: "Active must be a boolean.", status: 400 } });
    await db.update(vendorPassPlansTable).set({ active: req.body.active, updatedAt: new Date() }).where(and(eq(vendorPassPlansTable.id, req.params.planId), eq(vendorPassPlansTable.vendorId, vendorId)));
    return res.json((await getSnapshot(vendorId))?.passPlans.find((plan) => plan.id === req.params.planId));
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/slots/:slotId", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    await ensureDemoVendor();
    const updates: { open?: boolean; capacity?: number; tables?: number; updatedAt: Date } = { updatedAt: new Date() };
    if (typeof req.body?.open === "boolean") updates.open = req.body.open;
    if (typeof req.body?.capacity === "number" && req.body.capacity > 0) updates.capacity = Math.round(req.body.capacity);
    if (typeof req.body?.tables === "number" && req.body.tables > 0) updates.tables = Math.round(req.body.tables);
    await db.update(vendorMealSlotsTable).set(updates).where(and(eq(vendorMealSlotsTable.id, req.params.slotId), eq(vendorMealSlotsTable.vendorId, vendorId)));
    return res.json((await getSnapshot(vendorId))?.reservationSlots.find((slot) => slot.id === req.params.slotId));
  } catch (error) {
    return next(error);
  }
});

router.post("/vendor/operations/categories", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) return res.status(400).json({ error: { code: "INVALID_CATEGORY", message: "Category name is required.", status: 400 } });
    const categoryId = `cat-${Date.now()}`;
    await db.insert(vendorCategoriesTable).values({ id: categoryId, vendorId, name, accent: "sparkles", sortOrder: 99, isActive: true });
    return res.status(201).json((await getSnapshot(vendorId))?.categories.find((category) => category.id === categoryId));
  } catch (error) {
    return next(error);
  }
});

router.post("/vendor/operations/items", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const pricePaise = asPaise(body.price);
    if (!name || !categoryId || pricePaise === null) return res.status(400).json({ error: { code: "INVALID_ITEM", message: "Item name, category, and a valid price are required.", status: 400 } });
    const [category] = await db.select({ id: vendorCategoriesTable.id }).from(vendorCategoriesTable).where(and(eq(vendorCategoriesTable.id, categoryId), eq(vendorCategoriesTable.vendorId, vendorId))).limit(1);
    if (!category) return res.status(400).json({ error: { code: "CATEGORY_NOT_FOUND", message: "Choose a category from this vendor workspace.", status: 400 } });
    const itemId = `item-${Date.now()}`;
    await db.insert(vendorItemsTable).values({ id: itemId, vendorId, categoryId, name, description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : "Freshly prepared in our kitchen", pricePaise, prepMinutes: typeof body.prepMinutes === "number" && body.prepMinutes > 0 ? Math.round(body.prepMinutes) : 10, isAvailable: body.isAvailable !== false });
    return res.status(201).json((await getSnapshot(vendorId))?.items.find((item) => item.id === itemId));
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/items/:itemId", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const updates: { name?: string; description?: string; pricePaise?: number; prepMinutes?: number; isAvailable?: boolean } = {};
    if (typeof req.body?.name === "string" && req.body.name.trim()) updates.name = req.body.name.trim();
    if (typeof req.body?.description === "string") updates.description = req.body.description.trim();
    if (typeof req.body?.price === "number" && req.body.price >= 0) updates.pricePaise = Math.round(req.body.price * 100);
    if (typeof req.body?.prepMinutes === "number" && req.body.prepMinutes > 0) updates.prepMinutes = Math.round(req.body.prepMinutes);
    if (typeof req.body?.isAvailable === "boolean") updates.isAvailable = req.body.isAvailable;
    if (!Object.keys(updates).length) return res.status(400).json({ error: { code: "INVALID_ITEM_UPDATE", message: "Provide at least one item field to update.", status: 400 } });
    await db.update(vendorItemsTable).set(updates).where(and(eq(vendorItemsTable.id, req.params.itemId), eq(vendorItemsTable.vendorId, vendorId)));
    return res.json((await getSnapshot(vendorId))?.items.find((item) => item.id === req.params.itemId));
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/orders/:orderId/status", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const nextStatus = req.body?.status as OrderStatus;
    if (!orderStatuses.includes(nextStatus)) return res.status(400).json({ error: { code: "INVALID_ORDER_STATUS", message: "That order status is not supported.", status: 400 } });
    const orderId = req.params.orderId.replace(/^#/, "");
    const [currentOrder] = await db.select({ status: vendorOrdersTable.status }).from(vendorOrdersTable).where(and(eq(vendorOrdersTable.id, orderId), eq(vendorOrdersTable.vendorId, vendorId))).limit(1);
    if (!currentOrder) return res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order could not be found.", status: 404 } });
    if (currentOrder.status !== nextStatus && !legalOrderTransitions[currentOrder.status]?.includes(nextStatus)) {
      return res.status(409).json({ error: { code: "ILLEGAL_ORDER_TRANSITION", message: `An order cannot move from ${currentOrder.status} to ${nextStatus}.`, status: 409 } });
    }
    await db.update(vendorOrdersTable).set({ status: nextStatus, updatedAt: new Date() }).where(and(eq(vendorOrdersTable.id, orderId), eq(vendorOrdersTable.vendorId, vendorId)));
    return res.json((await getSnapshot(vendorId))?.orders.find((order) => order.id === `#${req.params.orderId.replace(/^#/, "")}`));
  } catch (error) {
    return next(error);
  }
});

router.patch("/vendor/operations/reservations/:reservationId/status", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const nextStatus = req.body?.status as ReservationStatus;
    if (!reservationStatuses.includes(nextStatus)) return res.status(400).json({ error: { code: "INVALID_RESERVATION_STATUS", message: "That reservation status is not supported.", status: 400 } });
    const [reservation] = await db.select().from(vendorReservationsTable).where(and(eq(vendorReservationsTable.id, req.params.reservationId), eq(vendorReservationsTable.vendorId, vendorId))).limit(1);
    if (!reservation) return res.status(404).json({ error: { code: "RESERVATION_NOT_FOUND", message: "Reservation could not be found.", status: 404 } });
    const allowed: Record<string, readonly string[]> = {
      Reserved: ["Preparing", "Cancelled"],
      Preparing: ["Ready", "Cancelled"],
      Ready: ["Collected", "Cancelled"],
      Collected: [],
      Cancelled: [],
      "No-show": [],
    };
    if (reservation.status !== nextStatus && !allowed[reservation.status]?.includes(nextStatus)) {
      return res.status(409).json({ error: { code: "ILLEGAL_RESERVATION_TRANSITION", message: `A reservation cannot move from ${reservation.status} to ${nextStatus}.`, status: 409 } });
    }
    if (nextStatus === "No-show") {
      const start = parseReservationStart(reservation.pickupDate, reservation.pickupTime);
      if (!start || Date.now() < start.getTime() + 15 * 60 * 1000) return res.status(409).json({ error: { code: "NO_SHOW_WINDOW_CLOSED", message: "A reservation can be marked no-show only after the slot ends and the grace period passes.", status: 409 } });
    }
    if (nextStatus === "Collected" && reservation.status !== "Ready") return res.status(409).json({ error: { code: "RESERVATION_NOT_READY", message: "Only ready reservations can be collected.", status: 409 } });
    await db.transaction(async (tx) => {
      await tx.update(vendorReservationsTable).set({ status: nextStatus, updatedAt: new Date() }).where(eq(vendorReservationsTable.id, reservation.id));
      if (nextStatus === "Collected" || nextStatus === "No-show") {
        await tx.insert(vendorNotificationsTable).values({ id: `notice-${Date.now()}`, vendorId, title: nextStatus === "Collected" ? "Reservation collected" : "Reservation marked no-show", body: `${reservation.customer}'s ${reservation.meal.toLowerCase()} reservation was resolved.`, isRead: false });
      }
    });
    return res.json((await getSnapshot(vendorId))?.reservations.find((item) => item.id === reservation.id));
  } catch (error) {
    return next(error);
  }
});

router.post("/vendor/operations/reservations/:reservationId/cancel", async (req, res, next) => {
  try {
    const vendorId = vendorIdFromRequest({ query: req.query, body: req.body ?? {} });
    if (!assertDemoVendor(vendorId, res)) return;
    await ensureDemoVendor();
    const reason = req.body?.reason;
    if (!cancellationReasons.includes(reason)) return res.status(400).json({ error: { code: "CANCELLATION_REASON_REQUIRED", message: "Choose a defined cancellation reason before cancelling.", status: 400 } });
    const [reservation] = await db.select().from(vendorReservationsTable).where(and(eq(vendorReservationsTable.id, req.params.reservationId), eq(vendorReservationsTable.vendorId, vendorId))).limit(1);
    if (!reservation) return res.status(404).json({ error: { code: "RESERVATION_NOT_FOUND", message: "Reservation could not be found.", status: 404 } });
    if (reservation.status === "Collected" || reservation.status === "Cancelled" || reservation.status === "No-show") return res.status(409).json({ error: { code: "RESERVATION_NOT_CANCELLABLE", message: "This reservation can no longer be cancelled.", status: 409 } });
    if (reservation.status === "Preparing") return res.status(409).json({ error: { code: "RESERVATION_IN_PREPARATION", message: "This reservation is already being prepared and cannot be cancelled.", status: 409 } });
    const reservationStart = parseReservationStart(reservation.pickupDate, reservation.pickupTime);
    if (reservationStart && Date.now() > reservationStart.getTime() - 60 * 60 * 1000) {
      return res.status(409).json({ error: { code: "CANCELLATION_WINDOW_CLOSED", message: "Reservations can only be cancelled at least one hour before the meal slot starts.", status: 409 } });
    }
    await db.transaction(async (tx) => {
      await tx.update(vendorReservationsTable).set({ status: "Cancelled", cancellationReason: reason, updatedAt: new Date() }).where(eq(vendorReservationsTable.id, reservation.id));
      const [slot] = await tx.select({ booked: vendorMealSlotsTable.booked }).from(vendorMealSlotsTable).where(eq(vendorMealSlotsTable.id, reservation.slotId)).limit(1);
      await tx.update(vendorMealSlotsTable).set({ booked: Math.max(0, (slot?.booked ?? 0) - 1), updatedAt: new Date() }).where(eq(vendorMealSlotsTable.id, reservation.slotId));
      await tx.insert(vendorNotificationsTable).values({ id: `notice-${Date.now()}`, vendorId, title: "Reservation cancelled", body: `${reservation.customer}'s ${reservation.meal.toLowerCase()} booking was cancelled.`, isRead: false });
    });
    return res.json((await getSnapshot(vendorId))?.reservations.find((item) => item.id === reservation.id));
  } catch (error) {
    return next(error);
  }
});

export default router;