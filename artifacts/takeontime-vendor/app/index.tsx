import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCancelVendorReservation,
  useCreateVendorCategory,
  useCreateVendorItem,
  useCreateVendorPassPlan,
  useGetVendorOperations,
  useUpdateVendorMealSlot,
  useUpdateVendorItem,
  useUpdateVendorOrderStatus,
  useUpdateVendorPassPlan,
  useUpdateVendorReservationStatus,
  useUpdateVendorStore,
} from '@workspace/api-client-react';
import colors from '@/constants/colors';
import { useColors } from '@/hooks/useColors';

type IconName = keyof typeof Feather.glyphMap;
type TabName = 'store' | 'orders' | 'menu' | 'stats' | 'more';
type ViewName =
  | 'main'
  | 'auth'
  | 'signup'
  | 'pending'
  | 'rejected'
  | 'notifications'
  | 'categories'
  | 'items'
  | 'item-form'
  | 'order-detail'
  | 'business'
  | 'payout'
  | 'passes'
  | 'reservations';

type Category = { id: string; name: string; count: number; accent: string };
type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  soldOut: boolean;
  prep: string;
};
type Order = {
  id: string;
  customer: string;
  item: string;
  quantity: number;
  amount: number;
  status: 'New' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed';
  time: string;
  pickup: string;
  note?: string;
};
type PassPlan = {
  id: string;
  name: string;
  cadence: 'Daily' | 'Weekly' | 'Monthly';
  price: number;
  meals: string;
  subscribers: number;
  active: boolean;
};
type ReservationSlot = {
  id: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  time: string;
  booked: number;
  capacity: number;
  tables: number;
  open: boolean;
};
type Reservation = {
  id: string;
  customer: string;
  passName: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  slotId: string;
  pickupDate: string;
  pickupTime: string;
  status: 'Reserved' | 'Preparing' | 'Ready' | 'Collected' | 'Cancelled' | 'No-show';
  cancellationReason?: string | null;
};
type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

const VENDOR_ID = 'demo-vendor-1';

const seedCategories: Category[] = [
  { id: 'cat-1', name: 'Breakfast', count: 8, accent: 'sunrise' },
  { id: 'cat-2', name: 'Main Course', count: 12, accent: 'leaf' },
  { id: 'cat-3', name: 'Beverages', count: 6, accent: 'coffee' },
  { id: 'cat-4', name: 'Desserts', count: 4, accent: 'gift' },
];

const seedItems: MenuItem[] = [
  { id: 'item-1', categoryId: 'cat-2', name: 'Paneer Tikka Bowl', description: 'Smoky paneer, roasted vegetables, mint chutney', price: 189, soldOut: false, prep: '12 min' },
  { id: 'item-2', categoryId: 'cat-2', name: 'Butter Chicken Rice', description: 'Creamy tomato gravy, basmati rice, pickled onions', price: 249, soldOut: false, prep: '15 min' },
  { id: 'item-3', categoryId: 'cat-2', name: 'Dal Makhani Combo', description: 'Slow-cooked black lentils with two rotis', price: 169, soldOut: true, prep: '10 min' },
  { id: 'item-4', categoryId: 'cat-3', name: 'Cold Brew', description: '18-hour steeped coffee with orange peel', price: 129, soldOut: false, prep: '3 min' },
  { id: 'item-5', categoryId: 'cat-1', name: 'Masala Omelette', description: 'Three eggs, onion, coriander, toasted pav', price: 139, soldOut: false, prep: '8 min' },
];

const seedOrders: Order[] = [
  { id: '#TT-4821', customer: 'Aarav Mehta', item: 'Paneer Tikka Bowl', quantity: 2, amount: 438, status: 'New', time: '2 min ago', pickup: '12:30 – 12:45 PM', note: 'Less spicy, please' },
  { id: '#TT-4818', customer: 'Meera Shah', item: 'Cold Brew + Masala Omelette', quantity: 1, amount: 268, status: 'Preparing', time: '18 min ago', pickup: '12:15 – 12:30 PM' },
  { id: '#TT-4812', customer: 'Rohan Kapoor', item: 'Dal Makhani Combo', quantity: 1, amount: 169, status: 'Ready', time: '32 min ago', pickup: '12:00 – 12:15 PM' },
  { id: '#TT-4804', customer: 'Nisha Verma', item: 'Butter Chicken Rice', quantity: 1, amount: 249, status: 'Completed', time: '1 hr ago', pickup: '11:30 – 11:45 AM' },
];

const seedPassPlans: PassPlan[] = [
  { id: 'pass-daily', name: 'Daily lunch pass', cadence: 'Daily', price: 149, meals: '1 meal · lunch', subscribers: 18, active: true },
  { id: 'pass-weekly', name: 'Weekly saver', cadence: 'Weekly', price: 799, meals: '5 meals · any lunch', subscribers: 32, active: true },
  { id: 'pass-monthly', name: 'Monthly regular', cadence: 'Monthly', price: 2499, meals: '20 meals · breakfast + lunch', subscribers: 14, active: false },
];

const seedReservationSlots: ReservationSlot[] = [
  { id: 'slot-breakfast', meal: 'Breakfast', time: '8:00 – 9:30 AM', booked: 12, capacity: 24, tables: 6, open: true },
  { id: 'slot-lunch-1', meal: 'Lunch', time: '12:00 – 1:00 PM', booked: 18, capacity: 24, tables: 6, open: true },
  { id: 'slot-lunch-2', meal: 'Lunch', time: '1:00 – 2:00 PM', booked: 7, capacity: 24, tables: 6, open: true },
  { id: 'slot-dinner', meal: 'Dinner', time: '7:00 – 9:00 PM', booked: 0, capacity: 24, tables: 6, open: false },
];

function normalizeOrderStatus(status: string): Order['status'] {
  return status === 'Accepted' || status === 'Preparing' || status === 'Ready' || status === 'Completed' ? status : 'New';
}

function normalizeReservationStatus(status: string): Reservation['status'] {
  return status === 'Preparing' || status === 'Ready' || status === 'Collected' || status === 'Cancelled' || status === 'No-show' ? status : 'Reserved';
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  return minutes < 1 ? 'Just now' : minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} hr ago`;
}

function Icon({ name, size = 20, color, strokeWidth = 2 }: { name: IconName; size?: number; color: string; strokeWidth?: number }) {
  return <Feather name={name} size={size} color={color} strokeWidth={strokeWidth} />;
}

function Button({
  label,
  onPress,
  colors: palette,
  variant = 'primary',
  icon,
  compact = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  colors: typeof colors.light;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  compact?: boolean;
  disabled?: boolean;
}) {
  const buttonStyle = variant === 'primary'
    ? { backgroundColor: palette.primary }
    : variant === 'danger'
      ? { backgroundColor: palette.destructive }
      : variant === 'secondary'
        ? { backgroundColor: palette.secondary, borderColor: palette.primary, borderWidth: 1 }
        : { backgroundColor: 'transparent' };
  const textColor = variant === 'primary' || variant === 'danger' ? palette.primaryForeground : palette.primary;
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        buttonStyle,
        disabled && { opacity: 0.45 },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon ? <Icon name={icon} size={compact ? 16 : 18} color={textColor} /> : null}
      <Text style={[styles.buttonText, { color: textColor }, compact && styles.buttonTextCompact]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ title, action, onPress, colors: palette }: { title: string; action?: string; onPress?: () => void; colors: typeof colors.light }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: palette.foreground }]}>{title}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress} hitSlop={12}>
          <Text style={[styles.sectionAction, { color: palette.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StatusPill({ label, colors: palette, tone = 'success' }: { label: string; colors: typeof colors.light; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const toneMap = {
    success: { backgroundColor: '#e9f9ef', color: '#16a34a' },
    warning: { backgroundColor: '#fff7e7', color: '#b7791f' },
    danger: { backgroundColor: '#fff0f0', color: palette.destructive },
    neutral: { backgroundColor: palette.muted, color: palette.mutedForeground },
  };
  const toneStyle = toneMap[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneStyle.backgroundColor }]}>
      <View style={[styles.pillDot, { backgroundColor: toneStyle.color }]} />
      <Text style={[styles.pillText, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

function Header({ title, subtitle, onBell, onBack, colors: palette, right }: { title: string; subtitle?: string; onBell?: () => void; onBack?: () => void; colors: typeof colors.light; right?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: palette.border }]}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconButton} hitSlop={8}>
          <Icon name="arrow-left" size={22} color={palette.foreground} />
        </Pressable>
      ) : (
        <View style={styles.headerBrand}>
          <View style={[styles.brandMark, { backgroundColor: palette.primary }]}>
            <Icon name="zap" size={15} color={palette.primaryForeground} />
          </View>
          <Text style={[styles.brandText, { color: palette.foreground }]}>TakeOnTime</Text>
        </View>
      )}
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: palette.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: palette.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
      {right ?? (
        onBell ? (
          <Pressable onPress={onBell} style={styles.iconButton} hitSlop={8}>
            <Icon name="bell" size={21} color={palette.foreground} />
            <View style={[styles.notificationDot, { backgroundColor: palette.primary }]} />
          </Pressable>
        ) : <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

function BottomNav({ active, onChange, colors: palette }: { active: TabName; onChange: (tab: TabName) => void; colors: typeof colors.light }) {
  const insets = useSafeAreaInsets();
  const items: { key: TabName; label: string; icon: IconName }[] = [
    { key: 'store', label: 'Store', icon: 'home' },
    { key: 'orders', label: 'Orders', icon: 'shopping-bag' },
    { key: 'menu', label: 'Menu', icon: 'grid' },
    { key: 'stats', label: 'Stats', icon: 'bar-chart-2' },
    { key: 'more', label: 'More', icon: 'menu' },
  ];
  return (
    <View style={[styles.bottomNav, { backgroundColor: palette.card, borderTopColor: palette.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={styles.navItem} testID={`tab-${item.key}`}>
            <View style={[styles.navIcon, selected && { backgroundColor: palette.secondary }]}>
              <Icon name={item.icon} size={19} color={selected ? palette.primary : palette.mutedForeground} />
            </View>
            <Text style={[styles.navLabel, { color: selected ? palette.primary : palette.mutedForeground }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Card({ children, colors: palette, style }: { children: React.ReactNode; colors: typeof colors.light; style?: object }) {
  return <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }, style]}>{children}</View>;
}

function EmptyState({ title, subtitle, action, onPress, colors: palette }: { title: string; subtitle: string; action?: string; onPress?: () => void; colors: typeof colors.light }) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.secondary }]}>
        <Icon name="inbox" size={25} color={palette.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.foreground }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: palette.mutedForeground }]}>{subtitle}</Text>
      {action && onPress ? <Button label={action} onPress={onPress} colors={palette} compact icon="plus" /> : null}
    </View>
  );
}

export default function VendorApp() {
  const palette = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const vendorQuery = useGetVendorOperations({ vendorId: VENDOR_ID });
  const storeMutation = useUpdateVendorStore();
  const createPassMutation = useCreateVendorPassPlan();
  const passMutation = useUpdateVendorPassPlan();
  const slotMutation = useUpdateVendorMealSlot();
  const categoryMutation = useCreateVendorCategory();
  const createItemMutation = useCreateVendorItem();
  const itemMutation = useUpdateVendorItem();
  const orderMutation = useUpdateVendorOrderStatus();
  const reservationStatusMutation = useUpdateVendorReservationStatus();
  const cancelReservationMutation = useCancelVendorReservation();
  const [activeTab, setActiveTab] = useState<TabName>('store');
  const [view, setView] = useState<ViewName>('main');
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [items, setItems] = useState<MenuItem[]>(seedItems);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [passPlans, setPassPlans] = useState<PassPlan[]>(seedPassPlans);
  const [reservationSlots, setReservationSlots] = useState<ReservationSlot[]>(seedReservationSlots);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [onBreak, setOnBreak] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [breakModal, setBreakModal] = useState(false);
  const [breakDuration, setBreakDuration] = useState('60 minutes');
  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [itemQuery, setItemQuery] = useState('');
  const [itemFilter, setItemFilter] = useState<'All' | 'Active' | 'Sold Out'>('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(seedCategories[1]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'All' | 'New' | 'Active' | 'Ready' | 'Completed'>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [passName, setPassName] = useState('');
  const [passPrice, setPassPrice] = useState('');
  const [passCadence, setPassCadence] = useState<PassPlan['cadence']>('Monthly');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [cancellationReason, setCancellationReason] = useState<'Capacity interruption' | 'Ingredient unavailable' | 'Service interruption' | null>(null);
  const [cancellationModal, setCancellationModal] = useState(false);
  const [localHydrated, setLocalHydrated] = useState(false);
  const [serverHydrated, setServerHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('takeontime-vendor-state').then((stored) => {
      try {
        if (stored) {
          const state = JSON.parse(stored) as Partial<{ acceptingOrders: boolean; onBreak: boolean; autoAccept: boolean; categories: Category[]; items: MenuItem[]; passPlans: PassPlan[]; reservationSlots: ReservationSlot[]; reservations: Reservation[]; notifications: Notification[] }>;
          if (typeof state.acceptingOrders === 'boolean') setAcceptingOrders(state.acceptingOrders);
          if (typeof state.onBreak === 'boolean') setOnBreak(state.onBreak);
          if (typeof state.autoAccept === 'boolean') setAutoAccept(state.autoAccept);
          if (state.categories?.length) setCategories(state.categories);
          if (state.items?.length) setItems(state.items);
          if (state.passPlans?.length) setPassPlans(state.passPlans);
          if (state.reservationSlots?.length) setReservationSlots(state.reservationSlots);
          if (state.reservations?.length) setReservations(state.reservations);
          if (state.notifications?.length) setNotifications(state.notifications);
        }
      } catch {
        // Keep the seeded workspace when the offline cache is malformed.
      }
      setLocalHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!localHydrated || (!serverHydrated && !vendorQuery.isError)) return;
    AsyncStorage.setItem('takeontime-vendor-state', JSON.stringify({ acceptingOrders, onBreak, autoAccept, categories, items, passPlans, reservationSlots, reservations, notifications }));
  }, [acceptingOrders, onBreak, autoAccept, categories, items, passPlans, reservationSlots, reservations, notifications, localHydrated, serverHydrated, vendorQuery.isError]);

  useEffect(() => {
    const data = vendorQuery.data;
    if (!data) return;
    setAcceptingOrders(data.vendor.acceptingOrders);
    setOnBreak(Boolean(data.vendor.breakUntil && new Date(data.vendor.breakUntil).getTime() > Date.now()));
    setCategories(data.categories);
    setItems(data.items);
    setOrders(data.orders.map((order) => ({ ...order, note: order.note ?? undefined, status: normalizeOrderStatus(order.status) })));
    setPassPlans(data.passPlans.map((plan) => ({ ...plan, cadence: plan.cadence as PassPlan['cadence'] })));
    setReservationSlots(data.reservationSlots.map((slot) => ({ ...slot, meal: slot.meal as ReservationSlot['meal'] })));
    setReservations(data.reservations.map((reservation) => ({ ...reservation, meal: reservation.meal as Reservation['meal'], status: normalizeReservationStatus(reservation.status) })));
    setNotifications(data.notifications);
    setServerHydrated(true);
  }, [vendorQuery.data]);

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesCategory = item.categoryId === selectedCategory.id;
    const matchesQuery = item.name.toLowerCase().includes(itemQuery.toLowerCase());
    const matchesFilter = itemFilter === 'All' || (itemFilter === 'Sold Out' ? item.soldOut : !item.soldOut);
    return matchesCategory && matchesQuery && matchesFilter;
  }), [items, selectedCategory.id, itemQuery, itemFilter]);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const search = orderSearch.trim().toLowerCase();
    const matchesSearch = !search || order.id.toLowerCase().includes(search) || order.customer.toLowerCase().includes(search) || order.item.toLowerCase().includes(search);
    const matchesFilter = orderFilter === 'All'
      || order.status === orderFilter
      || (orderFilter === 'Active' && ['Accepted', 'Preparing'].includes(order.status));
    return matchesSearch && matchesFilter;
  }), [orders, orderFilter, orderSearch]);

  const goMain = (tab: TabName) => {
    setActiveTab(tab);
    setView('main');
  };

  const refreshVendor = async () => {
    await queryClient.invalidateQueries({ queryKey: vendorQuery.queryKey });
  };

  const refreshWorkspace = () => {
    setRefreshing(true);
    void vendorQuery.refetch().finally(() => setRefreshing(false));
  };

  const updateStoreState = async (patch: { acceptingOrders?: boolean; breakUntil?: string | null }) => {
    try {
      const vendor = await storeMutation.mutateAsync({ data: { vendorId: VENDOR_ID, ...patch } });
      setAcceptingOrders(vendor.acceptingOrders);
      setOnBreak(Boolean(vendor.breakUntil && new Date(vendor.breakUntil).getTime() > Date.now()));
      await refreshVendor();
    } catch {
      Alert.alert('Could not update store', 'The server did not accept that change. Your current store status is unchanged.');
    }
  };

  const startItemForm = (item?: MenuItem) => {
    setEditingItem(item ?? null);
    setItemName(item?.name ?? '');
    setItemDescription(item?.description ?? '');
    setItemPrice(item ? String(item.price) : '');
    setView('item-form');
  };

  const saveItem = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Add the essentials', 'Enter an item name and price before saving.');
      return;
    }
    const details = {
      vendorId: VENDOR_ID,
      categoryId: selectedCategory.id,
      name: itemName.trim(),
      description: itemDescription.trim() || 'Freshly prepared in our kitchen',
      price: Number(itemPrice) || 0,
      prepMinutes: Number.parseInt(editingItem?.prep ?? '10', 10) || 10,
      isAvailable: !(editingItem?.soldOut ?? false),
    };
    const saveRequest = editingItem
      ? itemMutation.mutateAsync({ itemId: editingItem.id, data: details })
      : createItemMutation.mutateAsync({ data: details });
    void saveRequest.then((saved) => {
      setItems((current) => editingItem ? current.map((item) => item.id === editingItem.id ? saved : item) : [...current, saved]);
      setView('items');
      void refreshVendor();
    }).catch(() => Alert.alert('Could not save item', 'Check the item details and try again.'));
  };

  const toggleItem = (item: MenuItem) => {
    void itemMutation.mutateAsync({ itemId: item.id, data: { vendorId: VENDOR_ID, isAvailable: item.soldOut } }).then((updated) => {
      setItems((current) => current.map((candidate) => candidate.id === item.id ? updated : candidate));
      void refreshVendor();
    }).catch(() => Alert.alert('Could not update item', 'The live menu availability was not changed.'));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    void categoryMutation.mutateAsync({ data: { vendorId: VENDOR_ID, name: newCategory.trim() } }).then((category) => {
      setCategories((current) => [...current, category]);
      setNewCategory('');
      setCategoryModal(false);
      void refreshVendor();
    }).catch(() => Alert.alert('Could not add category', 'The live menu was not changed.'));
  };

  const updateOrder = (status: Order['status']) => {
    if (!selectedOrder) return;
    void orderMutation.mutateAsync({ orderId: selectedOrder.id, data: { vendorId: VENDOR_ID, status } }).then((updated) => {
      const nextOrder = { ...updated, note: updated.note ?? undefined, status: normalizeOrderStatus(updated.status) };
      setOrders((current) => current.map((order) => order.id === selectedOrder.id ? nextOrder : order));
      setSelectedOrder(nextOrder);
      void refreshVendor();
    }).catch(() => Alert.alert('Could not update order', 'The live kitchen queue rejected that status change.'));
  };

  const addPassPlan = () => {
    if (!passName.trim() || !passPrice.trim()) {
      Alert.alert('Add the essentials', 'Enter a pass name and price before saving.');
      return;
    }
    void createPassMutation.mutateAsync({ data: { vendorId: VENDOR_ID, name: passName.trim(), price: Number(passPrice) || 0, cadence: passCadence } }).then((plan) => {
      setPassPlans((current) => [...current, { ...plan, cadence: plan.cadence as PassPlan['cadence'] }]);
      setPassName('');
      setPassPrice('');
      setPassCadence('Monthly');
      setPassModal(false);
      void refreshVendor();
    }).catch(() => Alert.alert('Could not publish plan', 'Check the plan name and price, then try again.'));
  };

  const togglePass = (id: string) => {
    const plan = passPlans.find((candidate) => candidate.id === id);
    if (!plan) return;
    void passMutation.mutateAsync({ planId: id, data: { vendorId: VENDOR_ID, active: !plan.active } }).then((updated) => {
      setPassPlans((current) => current.map((candidate) => candidate.id === id ? { ...candidate, active: updated.active } : candidate));
      void refreshVendor();
    }).catch(() => Alert.alert('Could not update plan', 'The live pass plan was not changed.'));
  };

  const toggleReservationSlot = (id: string) => {
    const slot = reservationSlots.find((candidate) => candidate.id === id);
    if (!slot) return;
    void slotMutation.mutateAsync({ slotId: id, data: { vendorId: VENDOR_ID, open: !slot.open } }).then((updated) => {
      setReservationSlots((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...updated, meal: updated.meal as ReservationSlot['meal'] } : candidate));
      void refreshVendor();
    }).catch(() => Alert.alert('Could not update meal slot', 'The live capacity setting was not changed.'));
  };

  const cancelReservation = () => {
    if (!selectedReservation || !cancellationReason) return;
    void cancelReservationMutation.mutateAsync({ reservationId: selectedReservation.id, data: { vendorId: VENDOR_ID, reason: cancellationReason } }).then((updated) => {
      setReservations((current) => current.map((reservation) => reservation.id === updated.id ? { ...reservation, status: 'Cancelled', cancellationReason: updated.cancellationReason } : reservation));
      setCancellationModal(false);
      setSelectedReservation(null);
      setCancellationReason(null);
      void refreshVendor();
      Alert.alert('Reservation cancelled', 'The customer will see the cancellation reason in their reservation history.');
    }).catch((error) => {
      const message = error instanceof Error ? error.message : 'This reservation could not be cancelled.';
      Alert.alert('Could not cancel reservation', message);
    });
  };

  const updateReservationStatus = (reservation: Reservation, status: Reservation['status']) => {
    void reservationStatusMutation.mutateAsync({ reservationId: reservation.id, data: { vendorId: VENDOR_ID, status } }).then((updated) => {
      setReservations((current) => current.map((candidate) => candidate.id === reservation.id ? { ...candidate, status: normalizeReservationStatus(updated.status) } : candidate));
      void refreshVendor();
    }).catch((error) => {
      const message = error instanceof Error ? error.message : 'That reservation could not be updated.';
      Alert.alert('Could not update reservation', message);
    });
  };

  const totalReservationBooked = reservationSlots.reduce((total, slot) => total + slot.booked, 0);
  const totalReservationCapacity = reservationSlots.reduce((total, slot) => total + slot.capacity, 0);

  const currentTitle = activeTab === 'store' ? 'Store' : activeTab === 'orders' ? 'Orders' : activeTab === 'menu' ? 'Menu' : activeTab === 'stats' ? 'Stats' : 'More';

  const renderStore = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshWorkspace} tintColor={palette.primary} />}
    >
      <Card colors={palette} style={styles.businessCard}>
        <View style={[styles.businessAvatar, { backgroundColor: palette.primary }]}>
          <Text style={styles.businessAvatarText}>TM</Text>
        </View>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: palette.foreground }]}>The Midnight Bistro</Text>
          <Text style={[styles.businessMeta, { color: palette.mutedForeground }]}>Multi-cuisine  ·  North Zone</Text>
          <Text style={[styles.businessId, { color: palette.mutedForeground }]}>Merchant ID  #882910</Text>
        </View>
        <Pressable onPress={() => setView('business')} style={[styles.editCircle, { backgroundColor: palette.secondary }]} hitSlop={8}>
          <Icon name="edit-2" size={17} color={palette.primary} />
        </Pressable>
      </Card>

      <View style={styles.statusHeading}>
        <Text style={[styles.pageHeading, { color: palette.foreground }]}>Store status</Text>
        <StatusPill label={onBreak ? 'ON BREAK' : acceptingOrders ? 'OPEN' : 'CLOSED'} colors={palette} tone={onBreak ? 'danger' : acceptingOrders ? 'success' : 'neutral'} />
      </View>

      <Card colors={palette} style={styles.statusCard}>
        <View style={[styles.statusTile, { borderColor: acceptingOrders && !onBreak ? '#55c997' : palette.border }]}>
          <View style={[styles.actionIcon, { backgroundColor: palette.primary }]}>
            <Icon name="shopping-bag" size={21} color={palette.primaryForeground} />
          </View>
          <View style={styles.statusTileText}>
            <Text style={[styles.statusTileTitle, { color: palette.foreground }]}>Accepting orders</Text>
            <Text style={[styles.statusTileSubtitle, { color: palette.mutedForeground }]}>Customers can place new orders</Text>
          </View>
          <Switch value={acceptingOrders} onValueChange={(next) => void updateStoreState({ acceptingOrders: next })} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={acceptingOrders ? palette.primary : '#ffffff'} />
        </View>
        <View style={styles.statusTile}>
          <View style={[styles.actionIcon, { backgroundColor: palette.primary }]}>
            <Icon name="pause-circle" size={21} color={palette.primaryForeground} />
          </View>
          <View style={styles.statusTileText}>
            <Text style={[styles.statusTileTitle, { color: palette.foreground }]}>Temporary break</Text>
            <Text style={[styles.statusTileSubtitle, { color: palette.mutedForeground }]}>{onBreak ? `Orders paused · ${breakDuration}` : 'Pause incoming orders temporarily'}</Text>
          </View>
          <Switch value={onBreak} onValueChange={(next) => next ? setBreakModal(true) : void updateStoreState({ breakUntil: null })} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={onBreak ? palette.primary : '#ffffff'} />
        </View>
        {onBreak ? (
          <View style={[styles.breakBanner, { backgroundColor: palette.foreground }]}>
            <View>
              <Text style={[styles.breakEyebrow, { color: palette.primary }]}>ON BREAK FOR</Text>
              <Text style={styles.breakTitle}>{breakDuration}</Text>
              <Text style={styles.breakSubtitle}>Orders resume automatically</Text>
            </View>
            <Button label="End break" icon="play" onPress={() => void updateStoreState({ breakUntil: null })} colors={palette} compact />
          </View>
        ) : null}
      </Card>

      <Card colors={palette} style={[styles.priorityCard, { borderColor: orders.some((order) => order.status === 'New') ? '#ffd3bd' : palette.border }]}>
        <View style={styles.priorityHeader}>
          <View style={[styles.priorityIcon, { backgroundColor: palette.secondary }]}><Icon name="flag" size={17} color={palette.primary} /></View>
          <View style={styles.priorityHeaderText}>
            <Text style={[styles.priorityTitle, { color: palette.foreground }]}>Today’s priorities</Text>
            <Text style={[styles.prioritySubtitle, { color: palette.mutedForeground }]}>Keep the kitchen ready for the next rush.</Text>
          </View>
        </View>
        <Pressable onPress={() => goMain('orders')} style={[styles.priorityRow, { borderTopColor: palette.border }]}>
          <View style={[styles.priorityDot, { backgroundColor: orders.some((order) => order.status === 'New') ? '#f97316' : '#22c55e' }]} />
          <Text style={[styles.priorityRowText, { color: palette.foreground }]}>{orders.filter((order) => order.status === 'New').length ? `${orders.filter((order) => order.status === 'New').length} new order${orders.filter((order) => order.status === 'New').length === 1 ? '' : 's'} need attention` : 'No new orders waiting'}</Text>
          <Icon name="chevron-right" size={16} color={palette.mutedForeground} />
        </Pressable>
        <Pressable onPress={() => goMain('menu')} style={[styles.priorityRow, { borderTopColor: palette.border }]}>
          <View style={[styles.priorityDot, { backgroundColor: items.some((item) => item.soldOut) ? '#f97316' : '#22c55e' }]} />
          <Text style={[styles.priorityRowText, { color: palette.foreground }]}>{items.filter((item) => item.soldOut).length ? `${items.filter((item) => item.soldOut).length} menu item${items.filter((item) => item.soldOut).length === 1 ? '' : 's'} marked sold out` : 'Menu availability looks good'}</Text>
          <Icon name="chevron-right" size={16} color={palette.mutedForeground} />
        </Pressable>
        <Pressable onPress={() => setView('reservations')} style={[styles.priorityRow, { borderTopColor: palette.border }]}>
          <View style={[styles.priorityDot, { backgroundColor: '#22c55e' }]} />
          <Text style={[styles.priorityRowText, { color: palette.foreground }]}>{reservations.filter((reservation) => !['Cancelled', 'Collected', 'No-show'].includes(reservation.status)).length} reservations still in service</Text>
          <Icon name="chevron-right" size={16} color={palette.mutedForeground} />
        </Pressable>
      </Card>

      <SectionTitle title="Quick actions" colors={palette} />
      <View style={styles.quickGrid}>
        {[
          { label: "Today's orders", sub: 'View active orders', icon: 'clipboard', onPress: () => goMain('orders') },
          { label: 'Low stock', sub: 'Manage inventory', icon: 'archive', onPress: () => Alert.alert('Low stock', 'Inventory tracking is ready to connect. Sold-out toggles are available from Menu.') },
          { label: 'Categories', sub: 'Organise your menu', icon: 'layers', onPress: () => setView('categories') },
          { label: 'Pass plans', sub: `${passPlans.filter((plan) => plan.active).length} plans live`, icon: 'repeat', onPress: () => setView('passes') },
          { label: 'Reservations', sub: `${totalReservationBooked}/${totalReservationCapacity} seats booked`, icon: 'calendar', onPress: () => setView('reservations') },
          { label: 'Notifications', sub: '3 unread updates', icon: 'bell', onPress: () => setView('notifications') },
        ].map((action) => (
          <Pressable key={action.label} onPress={action.onPress} style={({ pressed }) => [styles.quickCard, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
            <View style={[styles.quickIcon, { backgroundColor: palette.secondary }]}>
              <Icon name={action.icon as IconName} size={21} color={palette.primary} />
            </View>
            <Text style={[styles.quickLabel, { color: palette.foreground }]}>{action.label}</Text>
            <Text style={[styles.quickSub, { color: palette.mutedForeground }]}>{action.sub}</Text>
            <Icon name="arrow-up-right" size={17} color={palette.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <Card colors={palette} style={styles.tipCard}>
        <View style={[styles.tipIcon, { backgroundColor: palette.secondary }]}><Icon name="sun" size={19} color={palette.primary} /></View>
        <View style={styles.tipText}>
          <Text style={[styles.tipTitle, { color: palette.foreground }]}>Your lunch rush is coming</Text>
          <Text style={[styles.tipSub, { color: palette.mutedForeground }]}>Most orders arrive between 12:00 and 1:30 PM.</Text>
        </View>
        <Icon name="chevron-right" size={18} color={palette.mutedForeground} />
      </Card>
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshWorkspace} tintColor={palette.primary} />}>
      <View style={styles.ordersHero}>
        <View>
          <Text style={[styles.eyebrow, { color: palette.primary }]}>LIVE KITCHEN QUEUE</Text>
          <Text style={[styles.pageHeading, { color: palette.foreground }]}>Keep the line moving.</Text>
          <Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Orders are sorted by pickup time.</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: '#e9f9ef' }]}><View style={[styles.liveDot, { backgroundColor: '#16a34a' }]} /><Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 11 }}>LIVE</Text></View>
      </View>
      <View style={styles.orderSummaryRow}>
        {[
          { label: 'New', value: orders.filter((order) => order.status === 'New').length, tone: 'warning' as const },
          { label: 'In progress', value: orders.filter((order) => ['Accepted', 'Preparing'].includes(order.status)).length, tone: 'success' as const },
          { label: 'Ready', value: orders.filter((order) => order.status === 'Ready').length, tone: 'danger' as const },
        ].map((summary) => (
          <Card key={summary.label} colors={palette} style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: palette.foreground }]}>{summary.value}</Text>
            <Text style={[styles.summaryLabel, { color: palette.mutedForeground }]}>{summary.label}</Text>
          </Card>
        ))}
      </View>
      <View style={[styles.orderSearchWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Icon name="search" size={17} color={palette.mutedForeground} />
        <TextInput value={orderSearch} onChangeText={setOrderSearch} placeholder="Search order, customer, or item" placeholderTextColor={palette.mutedForeground} style={[styles.orderSearchInput, { color: palette.foreground }]} />
        {orderSearch ? <Pressable onPress={() => setOrderSearch('')} hitSlop={8}><Icon name="x" size={16} color={palette.mutedForeground} /></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(['All', 'New', 'Active', 'Ready', 'Completed'] as const).map((filter) => (
          <Pressable key={filter} onPress={() => setOrderFilter(filter)} style={[styles.filterChip, { borderColor: orderFilter === filter ? palette.primary : palette.border, backgroundColor: orderFilter === filter ? palette.secondary : palette.card }]}>
            <Text style={[styles.filterChipText, { color: orderFilter === filter ? palette.primary : palette.mutedForeground }]}>{filter}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <SectionTitle title="Today's orders" action={`${filteredOrders.length} shown`} colors={palette} />
      {filteredOrders.map((order) => (
        <Pressable key={order.id} onPress={() => { setSelectedOrder(order); setView('order-detail'); }} style={({ pressed }) => [styles.orderCard, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
          <View style={styles.orderCardTop}>
            <View style={[styles.orderBadge, { backgroundColor: order.status === 'New' ? palette.secondary : palette.muted }]}>
              <Icon name={order.status === 'Ready' ? 'check-circle' : order.status === 'Completed' ? 'check' : 'clock'} size={16} color={order.status === 'New' ? palette.primary : palette.mutedForeground} />
            </View>
            <View style={styles.orderIdentity}>
              <Text style={[styles.orderId, { color: palette.foreground }]}>{order.id}  ·  {order.time}</Text>
              <Text style={[styles.orderCustomer, { color: palette.foreground }]}>{order.customer}</Text>
            </View>
            <StatusPill label={order.status} colors={palette} tone={order.status === 'New' ? 'warning' : order.status === 'Ready' ? 'danger' : order.status === 'Completed' ? 'neutral' : 'success'} />
          </View>
          <View style={[styles.orderDivider, { backgroundColor: palette.border }]} />
          <View style={styles.orderDetailsRow}>
            <View style={styles.orderItemInfo}>
              <Text style={[styles.orderItem, { color: palette.foreground }]}>{order.quantity} × {order.item}</Text>
              <Text style={[styles.orderPickup, { color: palette.mutedForeground }]}>Pickup  {order.pickup}</Text>
            </View>
            <Text style={[styles.orderAmount, { color: palette.foreground }]}>₹{order.amount}</Text>
            <Icon name="chevron-right" size={18} color={palette.mutedForeground} />
          </View>
        </Pressable>
      ))}
      {!filteredOrders.length ? <EmptyState title="No matching orders" subtitle="Try a different search or status filter." colors={palette} /> : null}
    </ScrollView>
  );

  const renderCategories = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={[styles.pageHeading, { color: palette.foreground }]}>Menu categories</Text>
        <Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Keep your menu easy to browse during the rush.</Text>
      </View>
      <Button label="Add category" icon="plus" onPress={() => setCategoryModal(true)} colors={palette} />
      <View style={styles.categoryList}>
        {categories.map((category, index) => (
          <Pressable key={category.id} onPress={() => { setSelectedCategory(category); setView('items'); }} style={({ pressed }) => [styles.categoryRow, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
            <View style={[styles.categoryIcon, { backgroundColor: index % 2 ? palette.foreground : palette.primary }]}>
              <Icon name={category.accent === 'coffee' ? 'coffee' : category.accent === 'gift' ? 'gift' : category.accent === 'leaf' ? 'feather' : 'sun'} size={19} color={palette.primaryForeground} />
            </View>
            <View style={styles.categoryText}>
              <Text style={[styles.categoryName, { color: palette.foreground }]}>{category.name}</Text>
              <Text style={[styles.categoryCount, { color: palette.mutedForeground }]}>{category.count || items.filter((item) => item.categoryId === category.id).length} items</Text>
            </View>
            <Icon name="chevron-right" size={19} color={palette.mutedForeground} />
          </Pressable>
        ))}
      </View>
      <Card colors={palette} style={styles.infoCallout}>
        <Icon name="info" size={19} color={palette.primary} />
        <Text style={[styles.infoCalloutText, { color: palette.mutedForeground }]}>Categories help customers find their next meal faster. Tap any category to manage items.</Text>
      </Card>
    </ScrollView>
  );

  const renderItems = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.subHeaderRow}>
        <View>
          <Text style={[styles.eyebrow, { color: palette.primary }]}>CATEGORY</Text>
          <Text style={[styles.pageHeading, { color: palette.foreground }]}>{selectedCategory.name}</Text>
        </View>
        <Pressable onPress={() => setView('categories')} style={styles.smallLink}><Icon name="layers" size={15} color={palette.primary} /><Text style={[styles.smallLinkText, { color: palette.primary }]}>All categories</Text></Pressable>
      </View>
      <View style={[styles.searchBox, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Icon name="search" size={18} color={palette.mutedForeground} />
        <TextInput value={itemQuery} onChangeText={setItemQuery} placeholder="Search items" placeholderTextColor={palette.mutedForeground} style={[styles.searchInput, { color: palette.foreground }]} />
        <Icon name="sliders" size={18} color={palette.mutedForeground} />
      </View>
      <View style={styles.filterRow}>
        {(['All', 'Active', 'Sold Out'] as const).map((filter) => (
          <Pressable key={filter} onPress={() => setItemFilter(filter)} style={[styles.filterChip, { borderColor: itemFilter === filter ? palette.primary : palette.border, backgroundColor: itemFilter === filter ? palette.secondary : palette.card }]}>
            <Text style={[styles.filterText, { color: itemFilter === filter ? palette.primary : palette.mutedForeground }]}>{filter}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => startItemForm()} style={[styles.addIconButton, { backgroundColor: palette.primary }]}><Icon name="plus" size={19} color={palette.primaryForeground} /></Pressable>
      </View>
      {filteredItems.length ? filteredItems.map((item) => (
        <Pressable key={item.id} onPress={() => startItemForm(item)} style={({ pressed }) => [styles.menuItemCard, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}>
          <View style={[styles.foodThumb, { backgroundColor: palette.secondary }]}><Icon name="coffee" size={21} color={palette.primary} /></View>
          <View style={styles.menuItemText}>
            <View style={styles.menuItemTitleRow}><Text style={[styles.menuItemName, { color: palette.foreground }]}>{item.name}</Text><StatusPill label={item.soldOut ? 'Sold out' : 'Active'} colors={palette} tone={item.soldOut ? 'danger' : 'success'} /></View>
            <Text numberOfLines={1} style={[styles.menuItemDescription, { color: palette.mutedForeground }]}>{item.description}</Text>
            <View style={styles.menuItemMeta}><Text style={[styles.menuItemPrice, { color: palette.foreground }]}>₹{item.price}</Text><Text style={[styles.menuItemPrep, { color: palette.mutedForeground }]}>{item.prep} prep</Text></View>
          </View>
          <Switch value={!item.soldOut} onValueChange={() => toggleItem(item)} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={!item.soldOut ? palette.primary : '#ffffff'} />
        </Pressable>
      )) : <EmptyState title="No matching items" subtitle="Try another search or add your first item to this category." action="Add item" onPress={() => startItemForm()} colors={palette} />}
    </ScrollView>
  );

  const renderItemForm = () => (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formHero}>
          <View style={[styles.uploadBox, { backgroundColor: palette.secondary, borderColor: palette.primary }]}><Icon name="camera" size={26} color={palette.primary} /><Text style={[styles.uploadText, { color: palette.primary }]}>Add photo</Text></View>
          <View style={styles.formHeroText}><Text style={[styles.pageHeading, { color: palette.foreground }]}>{editingItem ? 'Edit item' : 'Create an item'}</Text><Text style={[styles.bodyText, { color: palette.mutedForeground }]}>A clear photo and simple name help customers order faster.</Text></View>
        </View>
        <Text style={[styles.inputLabel, { color: palette.foreground }]}>Item name</Text>
        <TextInput value={itemName} onChangeText={setItemName} placeholder="e.g. Paneer Tikka Bowl" placeholderTextColor={palette.mutedForeground} style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} />
        <Text style={[styles.inputLabel, { color: palette.foreground }]}>Description</Text>
        <TextInput value={itemDescription} onChangeText={setItemDescription} placeholder="Tell customers what makes it special" placeholderTextColor={palette.mutedForeground} multiline style={[styles.textInput, styles.multilineInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} />
        <View style={styles.formTwoCol}>
          <View style={styles.formCol}><Text style={[styles.inputLabel, { color: palette.foreground }]}>Price (₹)</Text><TextInput value={itemPrice} onChangeText={setItemPrice} placeholder="0" keyboardType="decimal-pad" placeholderTextColor={palette.mutedForeground} style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} /></View>
          <View style={styles.formCol}><Text style={[styles.inputLabel, { color: palette.foreground }]}>Category</Text><View style={[styles.selectInput, { backgroundColor: palette.card, borderColor: palette.input }]}><Text style={[styles.selectText, { color: palette.foreground }]}>{selectedCategory.name}</Text><Icon name="chevron-down" size={18} color={palette.mutedForeground} /></View></View>
        </View>
        <Card colors={palette} style={styles.formToggleCard}>
          <View style={[styles.actionIcon, { backgroundColor: palette.foreground }]}><Icon name="eye-off" size={19} color={palette.card} /></View>
          <View style={styles.statusTileText}><Text style={[styles.statusTileTitle, { color: palette.foreground }]}>Sold out</Text><Text style={[styles.statusTileSubtitle, { color: palette.mutedForeground }]}>Hide this item from customers for now</Text></View>
          <Switch value={editingItem?.soldOut ?? false} onValueChange={(next) => setEditingItem((current) => current ? { ...current, soldOut: next } : { id: '', categoryId: selectedCategory.id, name: '', description: '', price: 0, soldOut: next, prep: '10 min' })} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={editingItem?.soldOut ? palette.primary : '#ffffff'} />
        </Card>
        <Button label={editingItem ? 'Save changes' : 'Add item'} icon="check" onPress={saveItem} colors={palette} />
        <Pressable onPress={() => setView('items')} style={styles.cancelLink}><Text style={[styles.cancelText, { color: palette.mutedForeground }]}>Cancel</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;
    const nextStatus: Partial<Record<Order['status'], Order['status']>> = { New: 'Accepted', Accepted: 'Preparing', Preparing: 'Ready', Ready: 'Completed' };
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.orderDetailHero}>
          <View><Text style={[styles.eyebrow, { color: palette.primary }]}>ORDER {selectedOrder.id}</Text><Text style={[styles.pageHeading, { color: palette.foreground }]}>{selectedOrder.customer}</Text><Text style={[styles.bodyText, { color: palette.mutedForeground }]}>{selectedOrder.time}  ·  Pickup {selectedOrder.pickup}</Text></View>
          <StatusPill label={selectedOrder.status} colors={palette} tone={selectedOrder.status === 'New' ? 'warning' : selectedOrder.status === 'Ready' ? 'danger' : selectedOrder.status === 'Completed' ? 'neutral' : 'success'} />
        </View>
        <Card colors={palette} style={styles.detailCard}>
          <SectionTitle title="Order summary" colors={palette} />
          <View style={styles.detailLine}><Text style={[styles.detailLabel, { color: palette.foreground }]}>{selectedOrder.quantity} × {selectedOrder.item}</Text><Text style={[styles.detailValue, { color: palette.foreground }]}>₹{selectedOrder.amount}</Text></View>
          <View style={styles.detailLine}><Text style={[styles.detailLabel, { color: palette.mutedForeground }]}>Platform fee</Text><Text style={[styles.detailValue, { color: palette.mutedForeground }]}>Included</Text></View>
          <View style={[styles.orderDivider, { backgroundColor: palette.border }]} />
          <View style={styles.detailLine}><Text style={[styles.detailTotalLabel, { color: palette.foreground }]}>Total paid</Text><Text style={[styles.detailTotal, { color: palette.primary }]}>₹{selectedOrder.amount}</Text></View>
        </Card>
        {selectedOrder.note ? <Card colors={palette} style={styles.noteCard}><Icon name="message-circle" size={18} color={palette.primary} /><View style={styles.noteText}><Text style={[styles.noteLabel, { color: palette.mutedForeground }]}>CUSTOMER NOTE</Text><Text style={[styles.noteValue, { color: palette.foreground }]}>{selectedOrder.note}</Text></View></Card> : null}
        <SectionTitle title="Order progress" colors={palette} />
        <Card colors={palette} style={styles.timelineCard}>
          {(['New', 'Accepted', 'Preparing', 'Ready', 'Completed'] as Order['status'][]).map((status, index) => {
            const statusIndex = ['New', 'Accepted', 'Preparing', 'Ready', 'Completed'].indexOf(selectedOrder.status);
            const done = index <= statusIndex;
            return <View key={status} style={styles.timelineRow}><View style={[styles.timelineDot, { backgroundColor: done ? palette.primary : palette.muted }]}>{done ? <Icon name="check" size={11} color={palette.primaryForeground} /> : null}</View>{index < 4 ? <View style={[styles.timelineLine, { backgroundColor: index < statusIndex ? palette.primary : palette.border }]} /> : null}<Text style={[styles.timelineLabel, { color: done ? palette.foreground : palette.mutedForeground }]}>{status}</Text></View>;
          })}
        </Card>
        {selectedOrder.status !== 'Completed' ? <Button label={`Mark as ${nextStatus[selectedOrder.status]}`} icon="arrow-right" onPress={() => updateOrder(nextStatus[selectedOrder.status] ?? selectedOrder.status)} colors={palette} /> : <Button label="Order complete" icon="check-circle" onPress={() => Alert.alert('Already complete', 'This order has been collected and settled.')} colors={palette} variant="secondary" />}
        {selectedOrder.status === 'New' ? <Pressable onPress={() => Alert.alert('Reject order?', 'This will notify the customer that the kitchen cannot fulfil this order.')} style={styles.rejectLink}><Text style={[styles.rejectText, { color: palette.destructive }]}>Reject this order</Text></Pressable> : null}
      </ScrollView>
    );
  };

  const renderStats = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}><Text style={[styles.pageHeading, { color: palette.foreground }]}>A clear view of your day.</Text><Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Monday, 18 September  ·  Updated just now</Text></View>
      <View style={styles.statGrid}>
        {[
          { label: "Today's sales", value: '₹12,480', change: '+18.4%', icon: 'trending-up' as IconName },
          { label: 'Orders', value: '64', change: '+12 today', icon: 'shopping-bag' as IconName },
          { label: 'Avg. order value', value: '₹195', change: '+₹14 vs last week', icon: 'activity' as IconName },
          { label: 'Completion rate', value: '96%', change: 'Great work', icon: 'check-circle' as IconName },
        ].map((stat) => <Card key={stat.label} colors={palette} style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: palette.secondary }]}><Icon name={stat.icon} size={18} color={palette.primary} /></View><Text style={[styles.statLabel, { color: palette.mutedForeground }]}>{stat.label}</Text><Text style={[styles.statValue, { color: palette.foreground }]}>{stat.value}</Text><Text style={[styles.statChange, { color: '#16a34a' }]}>{stat.change}</Text></Card>)}
      </View>
      <Card colors={palette} style={styles.chartCard}>
        <SectionTitle title="Sales this week" action="View report" onPress={() => Alert.alert('Coming next', 'Downloadable reports are planned for the vendor analytics module.')} colors={palette} />
        <View style={styles.chart}>
          {[42, 56, 40, 72, 64, 88, 76].map((height, index) => <View key={index} style={styles.chartBarWrap}><View style={[styles.chartBar, { height, backgroundColor: index === 5 ? palette.primary : '#ffd7bb' }]} /><Text style={[styles.chartLabel, { color: palette.mutedForeground }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text></View>)}
        </View>
      </Card>
      <SectionTitle title="Top performing items" colors={palette} />
      {[
        ['Paneer Tikka Bowl', '126 sold', '₹23,814'],
        ['Cold Brew', '94 sold', '₹12,126'],
        ['Butter Chicken Rice', '88 sold', '₹21,912'],
      ].map((item, index) => <Card key={item[0]} colors={palette} style={styles.performerRow}><Text style={[styles.performerRank, { color: palette.primary }]}>0{index + 1}</Text><View style={styles.performerText}><Text style={[styles.performerName, { color: palette.foreground }]}>{item[0]}</Text><Text style={[styles.performerMeta, { color: palette.mutedForeground }]}>{item[1]}</Text></View><Text style={[styles.performerRevenue, { color: palette.foreground }]}>{item[2]}</Text></Card>)}
    </ScrollView>
  );

  const renderMore = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Card colors={palette} style={styles.profileCard}>
        <View style={[styles.profileAvatar, { backgroundColor: palette.primary }]}><Text style={styles.profileAvatarText}>TM</Text></View>
        <View style={styles.profileIdentity}><Text style={[styles.businessName, { color: palette.foreground }]}>The Midnight Bistro</Text><Text style={[styles.businessMeta, { color: palette.mutedForeground }]}>Merchant ID  #882910</Text></View>
        <Pressable onPress={() => setView('business')} style={[styles.editCircle, { backgroundColor: palette.secondary }]}><Icon name="edit-2" size={17} color={palette.primary} /></Pressable>
      </Card>
      <Text style={[styles.groupLabel, { color: palette.mutedForeground }]}>ACCOUNT SETTINGS</Text>
      {[
        { label: 'Business profile', sub: 'Restaurant name, address, contact details', icon: 'briefcase' as IconName, onPress: () => setView('business') },
        { label: 'Payout settings', sub: 'Bank account and settlement cycles', icon: 'credit-card' as IconName, onPress: () => setView('payout') },
        { label: 'Notification preferences', sub: 'Alerts for new orders and reports', icon: 'bell' as IconName, onPress: () => Alert.alert('Notifications', 'Choose which events should reach your team.') },
      ].map((setting) => <Pressable key={setting.label} onPress={setting.onPress} style={({ pressed }) => [styles.settingRow, { backgroundColor: palette.card, borderColor: palette.border }, pressed && styles.pressed]}><View style={[styles.settingIcon, { backgroundColor: palette.secondary }]}><Icon name={setting.icon} size={18} color={palette.primary} /></View><View style={styles.settingText}><Text style={[styles.settingLabel, { color: palette.foreground }]}>{setting.label}</Text><Text style={[styles.settingSub, { color: palette.mutedForeground }]}>{setting.sub}</Text></View><Icon name="chevron-right" size={18} color={palette.mutedForeground} /></Pressable>)}
      <Text style={[styles.groupLabel, { color: palette.mutedForeground }]}>OPERATIONS</Text>
      <Card colors={palette} style={styles.operationsCard}>
        <View style={styles.operationRow}><Icon name="shopping-bag" size={19} color={palette.foreground} /><Text style={[styles.operationLabel, { color: palette.foreground }]}>Store status</Text><Text style={[styles.operationValue, { color: palette.mutedForeground }]}>{onBreak ? 'On break' : acceptingOrders ? 'Accepting orders' : 'Closed'}</Text><Switch value={acceptingOrders} onValueChange={(next) => void updateStoreState({ acceptingOrders: next })} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={acceptingOrders ? palette.primary : '#ffffff'} /></View>
        <View style={[styles.operationDivider, { backgroundColor: palette.border }]} />
        <View style={styles.operationRow}><Icon name="zap" size={19} color={palette.foreground} /><Text style={[styles.operationLabel, { color: palette.foreground }]}>Auto-accept orders</Text><Switch value={autoAccept} onValueChange={setAutoAccept} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={autoAccept ? palette.primary : '#ffffff'} /></View>
      </Card>
      <Text style={[styles.groupLabel, { color: palette.mutedForeground }]}>ACCOUNT & HELP</Text>
      <Pressable onPress={() => setView('notifications')} style={[styles.simpleRow, { backgroundColor: palette.card, borderColor: palette.border }]}><Icon name="bell" size={19} color={palette.foreground} /><Text style={[styles.simpleRowText, { color: palette.foreground }]}>Notifications</Text><View style={styles.rowEnd}><View style={[styles.unreadBadge, { backgroundColor: palette.primary }]}><Text style={styles.unreadText}>3</Text></View><Icon name="chevron-right" size={18} color={palette.mutedForeground} /></View></Pressable>
      <Pressable onPress={() => setShowAdvanced((current) => !current)} style={[styles.simpleRow, { backgroundColor: palette.card, borderColor: palette.border }]}><Icon name="shield" size={19} color={palette.foreground} /><Text style={[styles.simpleRowText, { color: palette.foreground }]}>Verification status</Text><Icon name="chevron-right" size={18} color={palette.mutedForeground} /></Pressable>
      {showAdvanced ? <View style={styles.advancedLinks}><Button label="Preview pending approval" onPress={() => setView('pending')} colors={palette} variant="secondary" compact /><Button label="Preview rejected account" onPress={() => setView('rejected')} colors={palette} variant="secondary" compact /><Button label="Preview login & signup" onPress={() => setView('auth')} colors={palette} variant="secondary" compact /></View> : null}
      <Pressable onPress={() => { setAuthMode('login'); setView('auth'); }} style={styles.logoutRow}><Icon name="log-out" size={18} color={palette.destructive} /><Text style={[styles.logoutText, { color: palette.destructive }]}>Log out</Text></Pressable>
      <Text style={[styles.versionText, { color: palette.mutedForeground }]}>TakeOnTime Vendor  ·  v1.0.0</Text>
    </ScrollView>
  );

  const renderMain = () => {
    const content = activeTab === 'store' ? renderStore() : activeTab === 'orders' ? renderOrders() : activeTab === 'menu' ? renderCategories() : activeTab === 'stats' ? renderStats() : renderMore();
    const syncBanner = vendorQuery.isLoading
      ? <View style={[styles.syncBanner, { backgroundColor: palette.secondary }]}><ActivityIndicator size="small" color={palette.primary} /><Text style={[styles.syncBannerText, { color: palette.foreground }]}>Loading live vendor workspace…</Text></View>
      : vendorQuery.isError
        ? <Pressable onPress={refreshWorkspace} style={[styles.syncBanner, { backgroundColor: '#fff1ed' }]}><Icon name="refresh-cw" size={15} color={palette.destructive} /><Text style={[styles.syncBannerText, { color: palette.destructive }]}>Live data is unavailable. Tap to retry.</Text></Pressable>
        : null;
    return <View style={styles.flex}><Header title={currentTitle} subtitle={activeTab === 'store' ? 'The Midnight Bistro' : undefined} onBell={() => setView('notifications')} colors={palette} />{syncBanner}{content}<BottomNav active={activeTab} onChange={goMain} colors={palette} /></View>;
  };

  const renderAuth = (signup = false) => (
    <View style={styles.flex}>
      <LinearGradient colors={['#fff4ea', palette.background]} style={[styles.authTop, { paddingTop: insets.top + 22 }]}>
        <View style={[styles.authLogo, { backgroundColor: palette.primary }]}><Icon name="zap" size={31} color={palette.primaryForeground} /></View>
        <Text style={[styles.authTitle, { color: palette.foreground }]}>{signup ? 'Partner with us' : 'Welcome back'}</Text>
        <Text style={[styles.authSubtitle, { color: palette.mutedForeground }]}>{signup ? 'Empower your kitchen with TakeOnTime' : 'Run your kitchen with more calm and control'}</Text>
      </LinearGradient>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <Card colors={palette} style={styles.authCard}>
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Email</Text>
            <View style={[styles.authInputWrap, { borderColor: palette.input }]}><Icon name="mail" size={18} color={palette.foreground} /><TextInput placeholder="restaurant@gmail.com" placeholderTextColor={palette.mutedForeground} style={[styles.authInput, { color: palette.foreground }]} keyboardType="email-address" /></View>
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Password</Text>
            <View style={[styles.authInputWrap, { borderColor: palette.input }]}><Icon name="lock" size={18} color={palette.foreground} /><TextInput placeholder="Enter your password" placeholderTextColor={palette.mutedForeground} style={[styles.authInput, { color: palette.foreground }]} secureTextEntry /></View>
            {signup ? <><Text style={[styles.inputLabel, { color: palette.foreground }]}>Confirm password</Text><View style={[styles.authInputWrap, { borderColor: palette.input }]}><Icon name="lock" size={18} color={palette.foreground} /><TextInput placeholder="Re-enter your password" placeholderTextColor={palette.mutedForeground} style={[styles.authInput, { color: palette.foreground }]} secureTextEntry /></View><View style={styles.termsRow}><View style={[styles.checkbox, { borderColor: palette.input }]} /><Text style={[styles.termsText, { color: palette.mutedForeground }]}>I agree to the Terms of Service</Text></View></> : <Pressable><Text style={[styles.forgotText, { color: palette.primary }]}>Forgot password?</Text></Pressable>}
            <Button label={signup ? 'Create vendor account' : 'Log in'} onPress={() => signup ? setView('pending') : setView('main')} colors={palette} />
          </Card>
          <View style={styles.orRow}><View style={[styles.orLine, { backgroundColor: palette.border }]} /><Text style={[styles.orText, { color: palette.mutedForeground }]}>OR JOIN VIA</Text><View style={[styles.orLine, { backgroundColor: palette.border }]} /></View>
          <View style={styles.socialRow}><Button label="Google" icon="globe" onPress={() => setView('main')} colors={palette} variant="secondary" compact /><Button label="Apple" icon="smartphone" onPress={() => setView('main')} colors={palette} variant="secondary" compact /></View>
          <Pressable onPress={() => { setAuthMode(signup ? 'login' : 'signup'); setView(signup ? 'auth' : 'signup'); }} style={styles.switchAuthRow}><Text style={[styles.authSwitchText, { color: palette.mutedForeground }]}>{signup ? 'Already have a partner account?' : 'New to TakeOnTime?'}</Text><Text style={[styles.authSwitchLink, { color: palette.primary }]}>{signup ? 'Log in' : 'Create account'}</Text></Pressable>
          <Pressable onPress={() => setView('main')} style={styles.previewLink}><Text style={[styles.previewText, { color: palette.mutedForeground }]}>Continue to app preview</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );

  const renderStatusPage = (rejected = false) => (
    <View style={styles.flex}>
      <Header title={rejected ? 'Verification status' : 'Application received'} onBack={() => setView('main')} colors={palette} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusBanner, { backgroundColor: rejected ? '#ff2028' : palette.foreground }]}>
          <View style={styles.statusBannerIcon}><Icon name={rejected ? 'x' : 'clock'} size={25} color={rejected ? '#ff2028' : palette.primary} /></View>
          <View style={styles.statusBannerText}><Text style={styles.statusBannerTitle}>{rejected ? 'Account rejected' : 'Under review'}</Text><Text style={styles.statusBannerSub}>{rejected ? 'Your vendor application needs an update.' : 'Our onboarding team is reviewing your details.'}</Text></View>
        </View>
        <Text style={[styles.sectionTitle, { color: palette.foreground }]}>{rejected ? 'Rejection reason' : 'What happens next'}</Text>
        <Card colors={palette} style={styles.issueCard}><Icon name={rejected ? 'alert-circle' : 'file-text'} size={21} color={rejected ? palette.destructive : palette.primary} /><View style={styles.issueText}><Text style={[styles.issueTitle, { color: palette.foreground }]}>{rejected ? 'Invalid business documentation' : 'Verification in progress'}</Text><Text style={[styles.issueBody, { color: palette.mutedForeground }]}>{rejected ? 'The FSSAI license uploaded appears to be expired or the business name does not match the GST registration details provided in Step 2.' : 'We will check your business profile, documents, and bank details. This usually takes less than 24 hours.'}</Text></View></Card>
        <Text style={[styles.sectionTitle, { color: palette.foreground }]}>{rejected ? 'Next steps' : 'Keep an eye on your inbox'}</Text>
        {rejected ? <><Pressable onPress={() => setView('signup')} style={[styles.actionListRow, { backgroundColor: palette.card, borderColor: palette.border }]}><View style={[styles.actionListIcon, { backgroundColor: palette.foreground }]}><Icon name="upload-cloud" size={19} color={palette.primary} /></View><View style={styles.actionListText}><Text style={[styles.actionListTitle, { color: palette.foreground }]}>Update documents</Text><Text style={[styles.actionListSub, { color: palette.mutedForeground }]}>Re-upload valid GST and FSSAI files</Text></View><Icon name="chevron-right" size={18} color={palette.mutedForeground} /></Pressable><Pressable onPress={() => Alert.alert('Appeal submitted', 'Our onboarding team will review your case manually.')} style={[styles.actionListRow, { backgroundColor: palette.card, borderColor: palette.border }]}><View style={[styles.actionListIcon, { backgroundColor: palette.foreground }]}><Icon name="help-circle" size={19} color={palette.primary} /></View><View style={styles.actionListText}><Text style={[styles.actionListTitle, { color: palette.foreground }]}>Appeal decision</Text><Text style={[styles.actionListSub, { color: palette.mutedForeground }]}>Request a manual review of your case</Text></View><Icon name="chevron-right" size={18} color={palette.mutedForeground} /></Pressable></> : <View style={styles.stepsList}>{['Profile submitted', 'Documents being checked', 'Your store goes live'].map((step, index) => <View key={step} style={styles.stepRow}><View style={[styles.stepNumber, { backgroundColor: index === 0 ? palette.primary : palette.secondary }]}>{index === 0 ? <Icon name="check" size={14} color={palette.primaryForeground} /> : <Text style={[styles.stepNumberText, { color: palette.primary }]}>{index + 1}</Text>}</View><View><Text style={[styles.stepTitle, { color: palette.foreground }]}>{step}</Text><Text style={[styles.stepSub, { color: palette.mutedForeground }]}>{index === 0 ? 'Completed just now' : index === 1 ? 'Typically within 24 hours' : 'You will receive a notification'}</Text></View></View>)}</View>}
        <Pressable onPress={() => Alert.alert('Support', 'The TakeOnTime onboarding team will be in touch shortly.')} style={[styles.supportBanner, { backgroundColor: palette.primary }]}><View><Text style={[styles.supportTitle, { color: palette.foreground }]}>Chat with onboarding team</Text><Text style={[styles.supportSub, { color: palette.foreground }]}>We are here to help</Text></View><View style={[styles.supportIcon, { backgroundColor: palette.card }]}><Icon name="message-square" size={20} color={palette.foreground} /></View></Pressable>
        <Button label="Go back to app preview" icon="arrow-left" onPress={() => setView('main')} colors={palette} variant="secondary" />
      </ScrollView>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.flex}>
      <Header title="Notifications" onBack={() => setView('main')} colors={palette} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Stay close to what is happening in your kitchen.</Text>
        <SectionTitle title="Today" colors={palette} />
        {notifications.length ? notifications.map((notice) => (
          <Pressable key={notice.id} onPress={() => notice.title.toLowerCase().includes('order') ? goMain('orders') : undefined} style={[styles.noticeRow, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.noticeIcon, { backgroundColor: palette.secondary }]}><Icon name={notice.title.toLowerCase().includes('order') ? 'shopping-bag' : notice.title.toLowerCase().includes('reservation') ? 'calendar' : 'bell'} size={18} color={palette.primary} /></View>
            <View style={styles.noticeText}><Text style={[styles.noticeTitle, { color: palette.foreground }]}>{notice.title}</Text><Text style={[styles.noticeSub, { color: palette.mutedForeground }]}>{notice.body}</Text><Text style={[styles.noticeTime, { color: palette.mutedForeground }]}>{formatNotificationTime(notice.createdAt)}</Text></View>
            {!notice.isRead ? <View style={[styles.unreadDot, { backgroundColor: palette.primary }]} /> : null}
          </Pressable>
        )) : <EmptyState title="You are all caught up" subtitle="New approvals, order updates, and reservation changes will show here." colors={palette} />}
      </ScrollView>
    </View>
  );

  const renderBusiness = () => (
    <View style={styles.flex}><Header title="Business profile" onBack={() => setView('main')} colors={palette} /><ScrollView contentContainerStyle={styles.formContent}><View style={[styles.profileHero, { backgroundColor: palette.secondary }]}><View style={[styles.profileLargeAvatar, { backgroundColor: palette.primary }]}><Text style={styles.profileAvatarText}>TM</Text></View><Pressable style={[styles.cameraButton, { backgroundColor: palette.card }]}><Icon name="camera" size={17} color={palette.primary} /></Pressable></View>{[['Business name', 'The Midnight Bistro'], ['Venue type', 'Restaurant'], ['Address', 'North Zone, Bengaluru'], ['Phone number', '+91 98765 43210']].map(([label, value]) => <View key={label}><Text style={[styles.inputLabel, { color: palette.foreground }]}>{label}</Text><View style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input }]}><Text style={[styles.staticInputText, { color: palette.foreground }]}>{value}</Text><Icon name="edit-2" size={16} color={palette.mutedForeground} /></View></View>)}<Button label="Save profile" icon="check" onPress={() => { Alert.alert('Profile saved', 'Your business details have been updated.'); setView('main'); }} colors={palette} /></ScrollView></View>
  );

  const renderPayout = () => (
    <View style={styles.flex}><Header title="Payout settings" onBack={() => setView('main')} colors={palette} /><ScrollView contentContainerStyle={styles.scrollContent}><Card colors={palette} style={styles.bankCard}><View style={[styles.bankLogo, { backgroundColor: palette.foreground }]}><Icon name="briefcase" size={22} color={palette.card} /></View><View style={styles.bankText}><Text style={[styles.bankName, { color: palette.foreground }]}>HDFC Bank</Text><Text style={[styles.bankMeta, { color: palette.mutedForeground }]}>•••• 1234  ·  Verified</Text></View><StatusPill label="Primary" colors={palette} tone="success" /></Card><SectionTitle title="This month" colors={palette} /><View style={styles.statGrid}><Card colors={palette} style={styles.statCard}><Text style={[styles.statLabel, { color: palette.mutedForeground }]}>Available payout</Text><Text style={[styles.statValue, { color: palette.foreground }]}>₹28,640</Text><Text style={[styles.statChange, { color: '#16a34a' }]}>Next payout Friday</Text></Card><Card colors={palette} style={styles.statCard}><Text style={[styles.statLabel, { color: palette.mutedForeground }]}>Settled</Text><Text style={[styles.statValue, { color: palette.foreground }]}>₹1,42,280</Text><Text style={[styles.statChange, { color: palette.mutedForeground }]}>Since joining</Text></Card></View><Button label="Update bank details" icon="edit-2" onPress={() => Alert.alert('Bank details', 'Bank changes are verified for your safety.')} colors={palette} variant="secondary" /><Text style={[styles.helperText, { color: palette.mutedForeground }]}>Payouts are sent to your verified account every Friday. Bank changes may take up to 24 hours to verify.</Text></ScrollView></View>
  );

  const renderPasses = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={[styles.eyebrow, { color: palette.primary }]}>SUBSCRIPTION OPERATIONS</Text>
        <Text style={[styles.pageHeading, { color: palette.foreground }]}>Passes that keep regulars coming back.</Text>
        <Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Offer prepaid meal access without losing control of each service slot.</Text>
      </View>
      <Card colors={palette} style={styles.passSummaryCard}>
        <View style={[styles.passSummaryIcon, { backgroundColor: palette.secondary }]}><Icon name="repeat" size={20} color={palette.primary} /></View>
        <View style={styles.passSummaryText}>
          <Text style={[styles.passSummaryValue, { color: palette.foreground }]}>{passPlans.reduce((total, plan) => total + plan.subscribers, 0)}</Text>
          <Text style={[styles.passSummaryLabel, { color: palette.mutedForeground }]}>active subscribers</Text>
        </View>
        <View style={styles.passSummaryDivider} />
        <View style={styles.passSummaryText}>
          <Text style={[styles.passSummaryValue, { color: palette.foreground }]}>₹4,680</Text>
          <Text style={[styles.passSummaryLabel, { color: palette.mutedForeground }]}>this month</Text>
        </View>
      </Card>
      <SectionTitle title="Your plans" action="Add plan" onPress={() => setPassModal(true)} colors={palette} />
      {passPlans.map((plan) => (
        <Card key={plan.id} colors={palette} style={styles.passPlanCard}>
          <View style={[styles.passPlanIcon, { backgroundColor: plan.active ? palette.primary : palette.muted }]}>
            <Icon name={plan.cadence === 'Daily' ? 'sun' : plan.cadence === 'Weekly' ? 'repeat' : 'calendar'} size={18} color={plan.active ? palette.primaryForeground : palette.mutedForeground} />
          </View>
          <View style={styles.passPlanText}>
            <View style={styles.passPlanTitleRow}>
              <Text style={[styles.passPlanName, { color: palette.foreground }]}>{plan.name}</Text>
              <StatusPill label={plan.active ? 'Live' : 'Paused'} colors={palette} tone={plan.active ? 'success' : 'neutral'} />
            </View>
            <Text style={[styles.passPlanMeta, { color: palette.mutedForeground }]}>{plan.meals}  ·  {plan.subscribers} subscribers</Text>
            <Text style={[styles.passPlanPrice, { color: palette.foreground }]}>₹{plan.price.toLocaleString('en-IN')} <Text style={[styles.passPlanCadence, { color: palette.mutedForeground }]}>/ {plan.cadence.toLowerCase()}</Text></Text>
          </View>
          <Switch value={plan.active} onValueChange={() => togglePass(plan.id)} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={plan.active ? palette.primary : '#ffffff'} />
        </Card>
      ))}
      <Card colors={palette} style={styles.infoCallout}>
        <Icon name="info" size={19} color={palette.primary} />
        <Text style={[styles.infoCalloutText, { color: palette.mutedForeground }]}>Customers can only redeem a pass against an open meal slot. Capacity stays visible in Reservations.</Text>
      </Card>
    </ScrollView>
  );

  const renderReservations = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageIntro}>
        <Text style={[styles.eyebrow, { color: palette.primary }]}>MESS RESERVATIONS</Text>
        <Text style={[styles.pageHeading, { color: palette.foreground }]}>Make every seat count.</Text>
        <Text style={[styles.bodyText, { color: palette.mutedForeground }]}>Control breakfast, lunch, and dinner capacity before the next rush.</Text>
      </View>
      <View style={styles.reservationSummaryRow}>
        <Card colors={palette} style={styles.reservationSummaryCard}><Text style={[styles.summaryValue, { color: palette.foreground }]}>{totalReservationBooked}</Text><Text style={[styles.summaryLabel, { color: palette.mutedForeground }]}>booked today</Text></Card>
        <Card colors={palette} style={styles.reservationSummaryCard}><Text style={[styles.summaryValue, { color: palette.foreground }]}>{totalReservationCapacity - totalReservationBooked}</Text><Text style={[styles.summaryLabel, { color: palette.mutedForeground }]}>seats left</Text></Card>
        <Card colors={palette} style={styles.reservationSummaryCard}><Text style={[styles.summaryValue, { color: palette.foreground }]}>{reservationSlots.filter((slot) => slot.open).length}</Text><Text style={[styles.summaryLabel, { color: palette.mutedForeground }]}>open slots</Text></Card>
      </View>
      <SectionTitle title="Today's service slots" action="Capacity rules" onPress={() => Alert.alert('Capacity rules', 'Each slot currently holds 24 guests across 6 tables. You can connect table-level rules when the reservation backend is enabled.')} colors={palette} />
      {reservationSlots.map((slot) => {
        const fill = slot.capacity ? slot.booked / slot.capacity : 0;
        const isFull = slot.booked >= slot.capacity;
        return (
          <Card key={slot.id} colors={palette} style={styles.reservationCard}>
            <View style={styles.reservationTopRow}>
              <View style={[styles.reservationMealIcon, { backgroundColor: slot.open ? palette.secondary : palette.muted }]}>
                <Icon name={slot.meal === 'Breakfast' ? 'sun' : slot.meal === 'Lunch' ? 'coffee' : 'moon'} size={19} color={slot.open ? palette.primary : palette.mutedForeground} />
              </View>
              <View style={styles.reservationIdentity}>
                <Text style={[styles.reservationMeal, { color: palette.foreground }]}>{slot.meal}</Text>
                <Text style={[styles.reservationTime, { color: palette.mutedForeground }]}>{slot.time}  ·  {slot.tables} tables</Text>
              </View>
              <Switch value={slot.open} onValueChange={() => toggleReservationSlot(slot.id)} trackColor={{ false: palette.muted, true: '#ffb980' }} thumbColor={slot.open ? palette.primary : '#ffffff'} />
            </View>
            <View style={styles.capacityMeta}>
              <Text style={[styles.capacityText, { color: palette.foreground }]}>{slot.booked}/{slot.capacity} seats reserved</Text>
              <StatusPill label={!slot.open ? 'Closed' : isFull ? 'Full' : 'Open'} colors={palette} tone={!slot.open ? 'neutral' : isFull ? 'warning' : 'success'} />
            </View>
            <View style={[styles.capacityTrack, { backgroundColor: palette.muted }]}>
              <View style={[styles.capacityFill, { width: `${Math.min(fill * 100, 100)}%`, backgroundColor: isFull ? palette.destructive : palette.primary }]} />
            </View>
            <Text style={[styles.capacityFootnote, { color: palette.mutedForeground }]}>{slot.open ? `${slot.capacity - slot.booked} seats available for pass holders and walk-ins` : 'New reservations are paused for this slot'}</Text>
          </Card>
        );
      })}
      <SectionTitle title="Individual bookings" action={reservations.length ? `${reservations.length} records` : undefined} colors={palette} />
      {reservations.length ? reservations.map((reservation) => (
        <Card key={reservation.id} colors={palette} style={styles.reservationCard}>
          <View style={styles.reservationTopRow}>
            <View style={[styles.reservationMealIcon, { backgroundColor: reservation.status === 'Cancelled' ? palette.muted : palette.secondary }]}>
              <Icon name="user" size={18} color={reservation.status === 'Cancelled' ? palette.mutedForeground : palette.primary} />
            </View>
            <View style={styles.reservationIdentity}>
              <Text style={[styles.reservationMeal, { color: palette.foreground }]}>{reservation.customer}</Text>
              <Text style={[styles.reservationTime, { color: palette.mutedForeground }]}>{reservation.meal} · {reservation.pickupDate}, {reservation.pickupTime}</Text>
              <Text style={[styles.reservationTime, { color: palette.mutedForeground }]}>{reservation.passName}</Text>
            </View>
            <StatusPill label={reservation.status} colors={palette} tone={reservation.status === 'Cancelled' ? 'neutral' : reservation.status === 'Ready' ? 'success' : 'warning'} />
          </View>
          {reservation.cancellationReason ? <Text style={[styles.capacityFootnote, { color: palette.destructive }]}>Reason: {reservation.cancellationReason}</Text> : null}
          {reservation.status === 'Reserved' ? <Pressable onPress={() => updateReservationStatus(reservation, 'Preparing')} style={[styles.inlineAction, { borderColor: palette.border }]}><Icon name="play" size={15} color={palette.primary} /><Text style={[styles.inlineActionText, { color: palette.primary }]}>Start preparation</Text></Pressable> : null}
          {reservation.status === 'Preparing' ? <Pressable onPress={() => updateReservationStatus(reservation, 'Ready')} style={[styles.inlineAction, { borderColor: palette.border }]}><Icon name="check-circle" size={15} color={palette.primary} /><Text style={[styles.inlineActionText, { color: palette.primary }]}>Mark ready</Text></Pressable> : null}
          {reservation.status === 'Ready' ? <Pressable onPress={() => updateReservationStatus(reservation, 'Collected')} style={[styles.inlineAction, { borderColor: palette.border }]}><Icon name="package" size={15} color={palette.primary} /><Text style={[styles.inlineActionText, { color: palette.primary }]}>Mark collected</Text></Pressable> : null}
          {!['Cancelled', 'Collected', 'No-show'].includes(reservation.status) ? <Pressable onPress={() => { setSelectedReservation(reservation); setCancellationReason(null); setCancellationModal(true); }} style={[styles.inlineAction, { borderColor: palette.border }]}><Icon name="x-circle" size={15} color={palette.destructive} /><Text style={[styles.inlineActionText, { color: palette.destructive }]}>Review cancellation</Text></Pressable> : null}
        </Card>
      )) : <EmptyState title="No reservations today" subtitle="Bookings will appear here as customers reserve meal slots." colors={palette} />}
      <Card colors={palette} style={styles.cancellationCard}>
        <View style={[styles.cancellationIcon, { backgroundColor: '#fff1ed' }]}><Icon name="x-circle" size={19} color={palette.destructive} /></View>
        <View style={styles.cancellationText}>
          <Text style={[styles.cancellationTitle, { color: palette.foreground }]}>Cancellation handling</Text>
          <Text style={[styles.cancellationBody, { color: palette.mutedForeground }]}>Vendor cancellation is available only after confirmation, acceptance, or preparation, and every cancellation must include a defined reason.</Text>
          <View style={styles.cancellationRule}><Icon name="check" size={13} color={palette.primary} /><Text style={[styles.cancellationRuleText, { color: palette.foreground }]}>Use for capacity, ingredient, or service interruptions</Text></View>
          <View style={styles.cancellationRule}><Icon name="check" size={13} color={palette.primary} /><Text style={[styles.cancellationRuleText, { color: palette.foreground }]}>Keep the reason visible in the reservation history</Text></View>
        </View>
      </Card>
      <Card colors={palette} style={styles.infoCallout}>
        <Icon name="shield" size={19} color={palette.primary} />
        <Text style={[styles.infoCalloutText, { color: palette.mutedForeground }]}>Reservation status is designed to stay authoritative on the server once live data is connected.</Text>
      </Card>
    </ScrollView>
  );

  let body: React.ReactNode;
  if (view === 'auth') body = renderAuth(false);
  else if (view === 'signup') body = renderAuth(true);
  else if (view === 'pending') body = renderStatusPage(false);
  else if (view === 'rejected') body = renderStatusPage(true);
  else if (view === 'notifications') body = renderNotifications();
  else if (view === 'categories') body = <View style={styles.flex}><Header title="Categories" onBack={() => setView('main')} colors={palette} />{renderCategories()}</View>;
  else if (view === 'items') body = <View style={styles.flex}><Header title="Items" onBack={() => setView('categories')} colors={palette} />{renderItems()}</View>;
  else if (view === 'item-form') body = <View style={styles.flex}><Header title={editingItem ? 'Edit item' : 'New item'} onBack={() => setView('items')} colors={palette} />{renderItemForm()}</View>;
  else if (view === 'order-detail') body = <View style={styles.flex}><Header title="Order detail" onBack={() => setView('main')} colors={palette} />{renderOrderDetail()}</View>;
  else if (view === 'business') body = renderBusiness();
  else if (view === 'payout') body = renderPayout();
  else if (view === 'passes') body = <View style={styles.flex}><Header title="Pass plans" onBack={() => setView('main')} colors={palette} />{renderPasses()}</View>;
  else if (view === 'reservations') body = <View style={styles.flex}><Header title="Reservations" onBack={() => setView('main')} colors={palette} />{renderReservations()}</View>;
  else body = renderMain();

  return (
    <View style={[styles.app, { backgroundColor: palette.background }]}>
      <StatusBar style="dark" />
      {body}
      <Modal visible={breakModal} transparent animationType="slide" onRequestClose={() => setBreakModal(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: palette.card, paddingBottom: insets.bottom + 20 }]}><View style={[styles.modalHandle, { backgroundColor: palette.border }]} /><Text style={[styles.modalTitle, { color: palette.foreground }]}>How long is the break?</Text><Text style={[styles.modalSubtitle, { color: palette.mutedForeground }]}>Your store will pause new orders, then reopen automatically.</Text>{['30 minutes', '60 minutes', '120 minutes'].map((duration) => <Pressable key={duration} onPress={() => setBreakDuration(duration)} style={[styles.durationRow, { borderColor: breakDuration === duration ? palette.primary : palette.border, backgroundColor: breakDuration === duration ? palette.secondary : palette.card }]}><Text style={[styles.durationText, { color: palette.foreground }]}>{duration}</Text>{breakDuration === duration ? <Icon name="check-circle" size={19} color={palette.primary} /> : <View style={[styles.radio, { borderColor: palette.border }]} />}</Pressable>)}<Button label="Start break" icon="pause" onPress={() => { const minutes = Number.parseInt(breakDuration, 10); void updateStoreState({ breakUntil: new Date(Date.now() + minutes * 60_000).toISOString() }); setBreakModal(false); }} colors={palette} /><Pressable onPress={() => setBreakModal(false)} style={styles.cancelLink}><Text style={[styles.cancelText, { color: palette.mutedForeground }]}>Cancel</Text></Pressable></View></View>
      </Modal>
      <Modal visible={categoryModal} transparent animationType="fade" onRequestClose={() => setCategoryModal(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.dialogCard, { backgroundColor: palette.card }]}><Text style={[styles.modalTitle, { color: palette.foreground }]}>New category</Text><Text style={[styles.modalSubtitle, { color: palette.mutedForeground }]}>Give customers a clear way to browse your menu.</Text><TextInput autoFocus value={newCategory} onChangeText={setNewCategory} placeholder="e.g. Chef specials" placeholderTextColor={palette.mutedForeground} style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} /><Button label="Add category" icon="plus" onPress={addCategory} colors={palette} /><Pressable onPress={() => setCategoryModal(false)} style={styles.cancelLink}><Text style={[styles.cancelText, { color: palette.mutedForeground }]}>Cancel</Text></Pressable></View></View>
      </Modal>
      <Modal visible={passModal} transparent animationType="slide" onRequestClose={() => setPassModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.modalTitle, { color: palette.foreground }]}>Create a pass plan</Text>
            <Text style={[styles.modalSubtitle, { color: palette.mutedForeground }]}>Set a simple prepaid option customers can redeem against your open meal slots.</Text>
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Plan name</Text>
            <TextInput autoFocus value={passName} onChangeText={setPassName} placeholder="e.g. Student lunch pass" placeholderTextColor={palette.mutedForeground} style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} />
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Price (₹)</Text>
            <TextInput value={passPrice} onChangeText={setPassPrice} placeholder="e.g. 999" keyboardType="decimal-pad" placeholderTextColor={palette.mutedForeground} style={[styles.textInput, { backgroundColor: palette.card, borderColor: palette.input, color: palette.foreground }]} />
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Billing cadence</Text>
            <View style={styles.cadenceRow}>
              {(['Daily', 'Weekly', 'Monthly'] as const).map((cadence) => (
                <Pressable key={cadence} onPress={() => setPassCadence(cadence)} style={[styles.cadenceChip, { borderColor: passCadence === cadence ? palette.primary : palette.border, backgroundColor: passCadence === cadence ? palette.secondary : palette.card }]}>
                  <Text style={[styles.cadenceText, { color: passCadence === cadence ? palette.primary : palette.mutedForeground }]}>{cadence}</Text>
                </Pressable>
              ))}
            </View>
            <Button label="Publish pass" icon="check" onPress={addPassPlan} colors={palette} />
            <Pressable onPress={() => setPassModal(false)} style={styles.cancelLink}><Text style={[styles.cancelText, { color: palette.mutedForeground }]}>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={cancellationModal} transparent animationType="slide" onRequestClose={() => setCancellationModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: palette.card, paddingBottom: insets.bottom + 20 }]}>
            <Text style={[styles.modalTitle, { color: palette.foreground }]}>Review cancellation</Text>
            <Text style={[styles.modalSubtitle, { color: palette.mutedForeground }]}>{selectedReservation ? `${selectedReservation.customer} · ${selectedReservation.meal} · ${selectedReservation.pickupTime}` : 'Choose a reservation to review.'}</Text>
            <Text style={[styles.inputLabel, { color: palette.foreground }]}>Why does this reservation need to be cancelled?</Text>
            {(['Capacity interruption', 'Ingredient unavailable', 'Service interruption'] as const).map((reason) => (
              <Pressable key={reason} onPress={() => setCancellationReason(reason)} style={[styles.durationRow, { borderColor: cancellationReason === reason ? palette.destructive : palette.border, backgroundColor: cancellationReason === reason ? '#fff1ed' : palette.card }]}>
                <Text style={[styles.durationText, { color: palette.foreground }]}>{reason}</Text>
                {cancellationReason === reason ? <Icon name="check-circle" size={19} color={palette.destructive} /> : <View style={[styles.radio, { borderColor: palette.border }]} />}
              </Pressable>
            ))}
            <Button label={cancelReservationMutation.isPending ? 'Cancelling…' : 'Cancel reservation'} icon="x-circle" onPress={cancelReservation} colors={palette} />
            <Pressable onPress={() => setCancellationModal(false)} style={styles.cancelLink}><Text style={[styles.cancelText, { color: palette.mutedForeground }]}>Keep reservation</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  header: { minHeight: 86, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, backgroundColor: colors.light.background },
  headerBrand: { flexDirection: 'row', alignItems: 'center', width: 114, gap: 8 },
  brandMark: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 12, fontWeight: '700', letterSpacing: -0.3 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  syncBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 9 },
  syncBannerText: { fontSize: 12, fontWeight: '700' },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  headerSpacer: { width: 38 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 99, borderWidth: 1, borderColor: colors.light.card },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 14 },
  formContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 14 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  businessCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  businessAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  businessAvatarText: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: -0.6 },
  businessInfo: { flex: 1, marginLeft: 13 },
  businessName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.4 },
  businessMeta: { fontSize: 12, marginTop: 4 },
  businessId: { fontSize: 10, marginTop: 4, letterSpacing: 0.2 },
  editCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statusHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 },
  pageHeading: { fontSize: 24, fontWeight: '800', letterSpacing: -0.7 },
  sectionTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.25, marginTop: 7 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 },
  sectionAction: { fontSize: 13, fontWeight: '700' },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, gap: 5 },
  pillDot: { width: 5, height: 5, borderRadius: 99 },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  statusCard: { padding: 10, gap: 7 },
  statusTile: { minHeight: 80, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11 },
  actionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  statusTileText: { flex: 1, marginLeft: 11 },
  statusTileTitle: { fontSize: 16, fontWeight: '700' },
  statusTileSubtitle: { fontSize: 12, marginTop: 4 },
  breakBanner: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breakEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  breakTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginTop: 2 },
  breakSubtitle: { color: '#d3d6da', fontSize: 11, marginTop: 2 },
  button: { minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 17 },
  buttonCompact: { minHeight: 38, borderRadius: 12, paddingHorizontal: 13 },
  buttonText: { fontSize: 15, fontWeight: '800' },
  buttonTextCompact: { fontSize: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '48.4%', minHeight: 152, borderRadius: 18, borderWidth: 1, padding: 14 },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  quickLabel: { fontSize: 14, fontWeight: '800' },
  quickSub: { fontSize: 11, marginTop: 4, flex: 1, lineHeight: 15 },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: 13, marginTop: 2 },
  tipIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, marginLeft: 10 },
  tipTitle: { fontSize: 13, fontWeight: '800' },
  tipSub: { fontSize: 11, marginTop: 3 },
  priorityCard: { padding: 0, overflow: 'hidden' },
  priorityHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  priorityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  priorityHeaderText: { flex: 1 },
  priorityTitle: { fontSize: 15, fontWeight: '800' },
  prioritySubtitle: { fontSize: 11, marginTop: 3 },
  priorityRow: { minHeight: 43, borderTopWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  priorityDot: { width: 7, height: 7, borderRadius: 99 },
  priorityRowText: { flex: 1, fontSize: 12, fontWeight: '700' },
  passSummaryCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  passSummaryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  passSummaryText: { flex: 1, marginLeft: 11 },
  passSummaryValue: { fontSize: 20, fontWeight: '800' },
  passSummaryLabel: { fontSize: 10, marginTop: 3 },
  passSummaryDivider: { width: 1, height: 34, backgroundColor: colors.light.border, marginHorizontal: 14 },
  passPlanCard: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  passPlanIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  passPlanText: { flex: 1, marginLeft: 11, marginRight: 8 },
  passPlanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  passPlanName: { fontSize: 14, fontWeight: '800', flex: 1 },
  passPlanMeta: { fontSize: 11, marginTop: 5 },
  passPlanPrice: { fontSize: 15, fontWeight: '800', marginTop: 6 },
  passPlanCadence: { fontSize: 11, fontWeight: '500' },
  reservationSummaryRow: { flexDirection: 'row', gap: 9 },
  reservationSummaryCard: { flex: 1, padding: 12, alignItems: 'center' },
  reservationCard: { padding: 14, gap: 11 },
  inlineAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderRadius: 12, paddingVertical: 10, marginTop: 2 },
  inlineActionText: { fontSize: 13, fontWeight: '700' },
  reservationTopRow: { flexDirection: 'row', alignItems: 'center' },
  reservationMealIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reservationIdentity: { flex: 1, marginLeft: 11 },
  reservationMeal: { fontSize: 15, fontWeight: '800' },
  reservationTime: { fontSize: 11, marginTop: 4 },
  capacityMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  capacityText: { fontSize: 13, fontWeight: '700' },
  capacityTrack: { height: 8, borderRadius: 99, overflow: 'hidden' },
  capacityFill: { height: '100%', borderRadius: 99 },
  capacityFootnote: { fontSize: 11, lineHeight: 16 },
  cancellationCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  cancellationIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cancellationText: { flex: 1, marginLeft: 11 },
  cancellationTitle: { fontSize: 14, fontWeight: '800' },
  cancellationBody: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  cancellationRule: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  cancellationRuleText: { flex: 1, fontSize: 11, lineHeight: 15, fontWeight: '600' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 75, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 7 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { width: 34, height: 28, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 10, fontWeight: '600' },
  ordersHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
  bodyText: { fontSize: 13, lineHeight: 19 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 99 },
  orderSummaryRow: { flexDirection: 'row', gap: 9 },
  summaryCard: { flex: 1, padding: 12, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 10, marginTop: 3 },
  orderCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 11 },
  orderCardTop: { flexDirection: 'row', alignItems: 'center' },
  orderBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderIdentity: { flex: 1, marginLeft: 10 },
  orderId: { fontSize: 10, fontWeight: '600' },
  orderCustomer: { fontSize: 14, fontWeight: '800', marginTop: 3 },
  orderDivider: { height: 1 },
  orderDetailsRow: { flexDirection: 'row', alignItems: 'center' },
  orderItemInfo: { flex: 1 },
  orderItem: { fontSize: 13, fontWeight: '700' },
  orderPickup: { fontSize: 11, marginTop: 4 },
  orderAmount: { fontSize: 14, fontWeight: '800', marginRight: 7 },
  orderSearchWrap: { minHeight: 46, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  orderSearchInput: { flex: 1, fontSize: 13, minHeight: 44 },
  orderFilterRow: { gap: 8, paddingBottom: 13 },
  orderFilterChip: { borderWidth: 1, borderRadius: 99, minHeight: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  orderFilterChipText: { fontSize: 12, fontWeight: '800' },
  pageIntro: { gap: 5, marginBottom: 2 },
  categoryList: { gap: 9 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 17, borderWidth: 1, padding: 12 },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryText: { flex: 1, marginLeft: 12 },
  categoryName: { fontSize: 15, fontWeight: '800' },
  categoryCount: { fontSize: 12, marginTop: 4 },
  infoCallout: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fff7ed', borderColor: '#ffd7bb' },
  infoCalloutText: { flex: 1, fontSize: 12, lineHeight: 18 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  smallLink: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingBottom: 3 },
  smallLinkText: { fontSize: 11, fontWeight: '700' },
  searchBox: { height: 48, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  searchInput: { flex: 1, fontSize: 14, marginHorizontal: 9 },
  filterRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  filterChip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 7 },
  filterText: { fontSize: 11, fontWeight: '700' },
  addIconButton: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  menuItemCard: { borderWidth: 1, borderRadius: 17, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  foodThumb: { width: 58, height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { flex: 1 },
  menuItemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuItemName: { fontSize: 14, fontWeight: '800', flex: 1 },
  menuItemDescription: { fontSize: 11, marginTop: 4 },
  menuItemMeta: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 7 },
  menuItemPrice: { fontSize: 13, fontWeight: '800' },
  menuItemPrep: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 34, gap: 9 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 5 },
  formHero: { flexDirection: 'row', gap: 13, alignItems: 'center', marginBottom: 8 },
  uploadBox: { width: 82, height: 82, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 5 },
  uploadText: { fontSize: 10, fontWeight: '700' },
  formHeroText: { flex: 1, gap: 4 },
  inputLabel: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  textInput: { minHeight: 49, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  multilineInput: { minHeight: 86, paddingTop: 13, textAlignVertical: 'top' },
  formTwoCol: { flexDirection: 'row', gap: 10 },
  formCol: { flex: 1, gap: 5 },
  selectInput: { minHeight: 49, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { fontSize: 14 },
  formToggleCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 4 },
  cancelLink: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { fontSize: 13, fontWeight: '700' },
  orderDetailHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 4 },
  detailCard: { gap: 13 },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '700' },
  detailTotalLabel: { fontSize: 15, fontWeight: '800' },
  detailTotal: { fontSize: 19, fontWeight: '800' },
  noteCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#fff7ed', borderColor: '#ffd7bb' },
  noteText: { flex: 1, gap: 5 },
  noteLabel: { fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  noteValue: { fontSize: 13, fontWeight: '600' },
  timelineCard: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20 },
  timelineRow: { alignItems: 'center', flex: 1, position: 'relative' },
  timelineDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineLine: { position: 'absolute', height: 2, top: 10, left: '50%', right: '-50%' },
  timelineLabel: { fontSize: 9, marginTop: 8, textAlign: 'center' },
  rejectLink: { alignItems: 'center', paddingVertical: 7 },
  rejectText: { fontSize: 13, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48.3%', minHeight: 132, padding: 13 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 19, fontWeight: '800', marginTop: 3 },
  statChange: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  chartCard: { paddingBottom: 12 },
  chart: { height: 135, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 20 },
  chartBarWrap: { alignItems: 'center', justifyContent: 'flex-end', height: 115, gap: 7 },
  chartBar: { width: 22, borderRadius: 8 },
  chartLabel: { fontSize: 10 },
  performerRow: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  performerRank: { fontSize: 13, fontWeight: '800', width: 28 },
  performerText: { flex: 1 },
  performerName: { fontSize: 13, fontWeight: '800' },
  performerMeta: { fontSize: 11, marginTop: 3 },
  performerRevenue: { fontSize: 13, fontWeight: '800' },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  profileAvatar: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  profileLargeAvatar: { width: 78, height: 78, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#ffffff', fontSize: 23, fontWeight: '800' },
  profileIdentity: { flex: 1, marginLeft: 13 },
  groupLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginTop: 10, marginLeft: 3 },
  settingRow: { minHeight: 70, borderWidth: 1, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1, marginLeft: 11 },
  settingLabel: { fontSize: 14, fontWeight: '800' },
  settingSub: { fontSize: 11, marginTop: 4 },
  operationsCard: { paddingVertical: 5 },
  operationRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11 },
  operationLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  operationValue: { fontSize: 11 },
  operationDivider: { height: 1 },
  simpleRow: { minHeight: 55, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  simpleRowText: { flex: 1, fontSize: 14, fontWeight: '600' },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },
  advancedLinks: { gap: 8, paddingTop: 4 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11 },
  logoutText: { fontSize: 13, fontWeight: '800' },
  versionText: { textAlign: 'center', fontSize: 10, marginTop: 8 },
  authTop: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  authLogo: { width: 70, height: 70, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  authTitle: { fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  authSubtitle: { fontSize: 13, marginTop: 7 },
  authContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 38 },
  authCard: { padding: 19, gap: 7 },
  authInputWrap: { height: 49, borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 },
  authInput: { flex: 1, fontSize: 14 },
  forgotText: { fontSize: 12, fontWeight: '700', alignSelf: 'flex-end', marginVertical: 5 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginVertical: 9 },
  checkbox: { width: 19, height: 19, borderRadius: 6, borderWidth: 1.5 },
  termsText: { fontSize: 12 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  orLine: { height: 1, flex: 1 },
  orText: { fontSize: 10, fontWeight: '800' },
  socialRow: { flexDirection: 'row', gap: 10 },
  switchAuthRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 24 },
  authSwitchText: { fontSize: 13 },
  authSwitchLink: { fontSize: 13, fontWeight: '800' },
  previewLink: { alignItems: 'center', marginTop: 22 },
  previewText: { fontSize: 12, textDecorationLine: 'underline' },
  statusBanner: { minHeight: 130, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusBannerIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  statusBannerText: { flex: 1 },
  statusBannerTitle: { color: '#ffffff', fontSize: 19, fontWeight: '800' },
  statusBannerSub: { color: '#ffffff', opacity: 0.82, fontSize: 12, lineHeight: 17, marginTop: 5 },
  issueCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  issueText: { flex: 1, gap: 7 },
  issueTitle: { fontSize: 15, fontWeight: '800' },
  issueBody: { fontSize: 13, lineHeight: 19 },
  actionListRow: { minHeight: 76, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  actionListIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionListText: { flex: 1 },
  actionListTitle: { fontSize: 14, fontWeight: '800' },
  actionListSub: { fontSize: 11, marginTop: 4 },
  supportBanner: { minHeight: 86, borderRadius: 18, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  supportTitle: { fontSize: 15, fontWeight: '800' },
  supportSub: { fontSize: 11, marginTop: 4, opacity: 0.75 },
  supportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepsList: { gap: 18, paddingVertical: 7 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: '800' },
  stepTitle: { fontSize: 14, fontWeight: '800' },
  stepSub: { fontSize: 11, marginTop: 3 },
  noticeRow: { minHeight: 78, borderRadius: 16, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  noticeIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  noticeText: { flex: 1 },
  noticeTitle: { fontSize: 13, fontWeight: '800' },
  noticeSub: { fontSize: 11, marginTop: 3 },
  noticeTime: { fontSize: 10, marginTop: 4 },
  unreadDot: { width: 7, height: 7, borderRadius: 99 },
  profileHero: { height: 145, borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 7 },
  cameraButton: { position: 'absolute', bottom: 14, right: 14, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  staticInputText: { flex: 1, fontSize: 14 },
  bankCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankLogo: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bankText: { flex: 1 },
  bankName: { fontSize: 15, fontWeight: '800' },
  bankMeta: { fontSize: 11, marginTop: 4 },
  helperText: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(31,41,55,0.42)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 13, gap: 12 },
  dialogCard: { marginHorizontal: 20, borderRadius: 22, padding: 20, gap: 12, alignSelf: 'center', width: '90%', marginTop: 'auto', marginBottom: 'auto' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { fontSize: 13, lineHeight: 19, marginBottom: 3 },
  durationRow: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationText: { fontSize: 14, fontWeight: '700' },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5 },
  cadenceRow: { flexDirection: 'row', gap: 7 },
  cadenceChip: { flex: 1, minHeight: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cadenceText: { fontSize: 12, fontWeight: '700' },
});