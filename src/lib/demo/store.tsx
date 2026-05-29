import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  PRIMARY_ORDER,
  STATUS_LABELS,
  USERS,
  findStore,
  findUser,
  makeInitialState,
} from "./seed";
import type {
  CartItem,
  DemoState,
  Notification,
  Order,
  OrderStatus,
  Role,
} from "./types";

const KEY = "fb_demo_state_v1";

function loadState(): DemoState {
  if (typeof window === "undefined") return makeInitialState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return makeInitialState();
    return JSON.parse(raw) as DemoState;
  } catch {
    return makeInitialState();
  }
}

function saveState(s: DemoState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

const uid = () => Math.random().toString(36).slice(2, 10);
const isoNow = () => new Date().toISOString();

// ---- Order progression rules ----
const NEXT_AFTER: Partial<Record<OrderStatus, OrderStatus>> = {
  shop_accepted: "preparing",
  preparing: "ready",
  ready: "finding_partner",
  partner_assigned: "partner_at_shop",
  partner_at_shop: "picked_up",
  picked_up: "out_for_delivery",
};

interface DemoContextValue {
  state: DemoState;
  hydrated: boolean;
  // role & user
  switchRole: (r: Role, userId?: string) => void;
  logout: () => void;
  // cart
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  // orders
  placeOrder: (input: {
    items: CartItem[];
    storeId: string;
    payment: Order["payment"];
    address: string;
    coupon?: { code: string; discount: number };
    deliveryFee?: number;
  }) => Order;
  advanceOrder: (orderId: string, to: OrderStatus, note?: string) => void;
  acceptOrderShop: (orderId: string) => void;
  rejectOrderShop: (orderId: string, reason: string) => void;
  cancelOrderCustomer: (orderId: string, reason: string) => void;
  assignPartner: (orderId: string, partnerId: string) => void;
  rejectDelivery: (orderId: string, partnerId: string, reason: string) => void;
  acceptDelivery: (orderId: string, partnerId: string) => void;
  completeDelivery: (orderId: string) => void;
  rateOrder: (orderId: string, r: { shop?: number; partner?: number; comment?: string }) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllRead: (role: Role) => void;
  // shop/partner
  toggleStoreOpen: (storeId: string) => void;
  togglePartnerOnline: (partnerId: string) => void;
  // demo
  resetScenario: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => makeInitialState());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---- helpers ----
  function notify(role: Role, title: string, body: string, orderId?: string) {
    setState((s) => ({
      ...s,
      notifications: [
        { id: uid(), role, title, body, at: isoNow(), read: false, orderId },
        ...s.notifications,
      ].slice(0, 200),
    }));
  }

  function logActivity(text: string) {
    setState((s) => ({
      ...s,
      activity: [{ id: uid(), at: isoNow(), text }, ...s.activity].slice(0, 100),
    }));
  }

  function patchOrder(orderId: string, patch: Partial<Order>, event?: { status: OrderStatus; actor: any; note?: string }) {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const merged: Order = { ...o, ...patch };
        if (event) {
          merged.timeline = [
            ...o.timeline,
            { status: event.status, at: isoNow(), label: STATUS_LABELS[event.status] ?? event.status, actor: event.actor, note: event.note },
          ];
        }
        return merged;
      }),
    }));
  }

  // ---- API ----
  const value: DemoContextValue = {
    state,
    switchRole(role, userId) {
      const fallback = USERS.find((u) => u.role === role)?.id ?? null;
      setState((s) => ({ ...s, role, currentUserId: userId ?? fallback }));
    },
    logout() {
      setState((s) => ({ ...s, role: null, currentUserId: null }));
    },
    addToCart(item) {
      setState((s) => {
        const existing = s.cart.find((c) => c.productId === item.productId);
        const cart = existing
          ? s.cart.map((c) => (c.productId === item.productId ? { ...c, qty: c.qty + item.qty, customization: item.customization ?? c.customization } : c))
          : [...s.cart, item];
        return { ...s, cart };
      });
      toast.success(`${item.name} added to cart`);
    },
    removeFromCart(productId) {
      setState((s) => ({ ...s, cart: s.cart.filter((c) => c.productId !== productId) }));
    },
    updateQty(productId, qty) {
      setState((s) => ({
        ...s,
        cart: s.cart.map((c) => (c.productId === productId ? { ...c, qty: Math.max(1, qty) } : c)).filter((c) => c.qty > 0),
      }));
    },
    clearCart() {
      setState((s) => ({ ...s, cart: [] }));
    },
    toggleWishlist(productId) {
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.includes(productId) ? s.wishlist.filter((id) => id !== productId) : [...s.wishlist, productId],
      }));
    },
    placeOrder({ items, storeId, payment, address, coupon, deliveryFee = 49 }) {
      const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
      const discount = coupon?.discount ?? 0;
      const platformFee = 9;
      const total = subtotal + deliveryFee + platformFee - discount;
      const order: Order = {
        id: `FB${10240 + Math.floor(Math.random() * 9000)}`,
        customerId: state.currentUserId ?? "c1",
        storeId,
        items,
        subtotal,
        deliveryFee,
        platformFee,
        discount,
        total,
        payment,
        paymentStatus: payment === "cod" ? "pending" : "paid",
        status: "waiting_shop",
        address,
        distanceKm: 4.2,
        partnerEarning: 62,
        etaMinutes: 35,
        timeline: [
          { status: "placed", at: isoNow(), label: "Order Placed", actor: "customer" },
          { status: "waiting_shop", at: isoNow(), label: "Waiting for Shop Confirmation", actor: "system" },
        ],
        placedAt: isoNow(),
      };
      setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [] }));
      const cust = findUser(state.currentUserId)?.name ?? "Customer";
      const store = findStore(storeId).name;
      notify("customer", "Order placed", `Your order #${order.id} has been placed.`, order.id);
      notify("shopkeeper", "New order received", `${cust} placed an order at ${store}.`, order.id);
      notify("admin", "New order", `Order #${order.id} is awaiting shop confirmation.`, order.id);
      logActivity(`${cust} placed order #${order.id}`);
      toast.success("Order placed successfully");
      return order;
    },
    advanceOrder(orderId, to, note) {
      patchOrder(orderId, { status: to }, { status: to, actor: "system", note });
    },
    acceptOrderShop(orderId) {
      patchOrder(orderId, { status: "shop_accepted" }, { status: "shop_accepted", actor: "shopkeeper" });
      const o = state.orders.find((x) => x.id === orderId);
      const store = o ? findStore(o.storeId).name : "Shop";
      notify("customer", "Order accepted", `${store} accepted your order #${orderId}.`, orderId);
      notify("admin", "Shop accepted", `${store} accepted order #${orderId}.`, orderId);
      logActivity(`${store} accepted order #${orderId}`);
      toast.success(`Order accepted by ${store}`);
    },
    rejectOrderShop(orderId, reason) {
      patchOrder(orderId, { status: "rejected_by_shop", rejectedReason: reason, paymentStatus: "refunded" }, { status: "rejected_by_shop", actor: "shopkeeper", note: reason });
      notify("customer", "Order rejected", `Sorry, your order #${orderId} was rejected. Refund initiated.`, orderId);
      notify("admin", "Order rejected by shop", `Reason: ${reason}`, orderId);
      logActivity(`Order #${orderId} rejected by shop (${reason})`);
      toast.error("Order rejected");
    },
    cancelOrderCustomer(orderId, reason) {
      const o = state.orders.find((x) => x.id === orderId);
      const refunded = o?.paymentStatus === "paid";
      patchOrder(orderId, { status: refunded ? "refund_initiated" : "cancelled_by_customer", cancelledReason: reason, paymentStatus: refunded ? "refunded" : o?.paymentStatus ?? "pending" }, { status: "cancelled_by_customer", actor: "customer", note: reason });
      notify("shopkeeper", "Order cancelled", `Customer cancelled order #${orderId}.`, orderId);
      notify("admin", "Order cancelled by customer", reason, orderId);
      logActivity(`Order #${orderId} cancelled by customer`);
      toast.success("Cancellation request submitted");
    },
    assignPartner(orderId, partnerId) {
      patchOrder(orderId, { partnerId, status: "partner_assigned" }, { status: "partner_assigned", actor: "admin" });
      const p = USERS.find((u) => u.id === partnerId);
      notify("delivery", "New delivery assigned", `Order #${orderId} assigned to you.`, orderId);
      notify("customer", "Delivery partner assigned", `${p?.name} will deliver your order.`, orderId);
      logActivity(`Partner ${p?.name} assigned to #${orderId}`);
    },
    rejectDelivery(orderId, partnerId, reason) {
      patchOrder(orderId, { status: "finding_partner" }, { status: "finding_partner", actor: "delivery", note: `Rejected by ${partnerId}: ${reason}` });
      notify("admin", "Delivery rejected", `Partner rejected #${orderId}: ${reason}`, orderId);
      notify("customer", "Finding another partner", `Hang tight, we're assigning another delivery partner.`, orderId);
      logActivity(`Delivery partner rejected #${orderId}`);
      toast("Delivery skipped");
    },
    acceptDelivery(orderId, partnerId) {
      patchOrder(orderId, { partnerId, status: "partner_assigned" }, { status: "partner_assigned", actor: "delivery" });
      const p = USERS.find((u) => u.id === partnerId);
      notify("customer", "Delivery partner assigned", `${p?.name} (${p?.vehicle}) will deliver your order.`, orderId);
      notify("shopkeeper", "Pickup confirmed", `${p?.name} accepted pickup for #${orderId}.`, orderId);
      notify("admin", "Delivery accepted", `${p?.name} accepted #${orderId}.`, orderId);
      logActivity(`${p?.name} accepted delivery #${orderId}`);
      toast.success("Delivery request accepted");
    },
    completeDelivery(orderId) {
      const o = state.orders.find((x) => x.id === orderId);
      patchOrder(orderId, { status: "delivered", paymentStatus: o?.paymentStatus === "pending" ? "paid" : o?.paymentStatus ?? "paid" }, { status: "delivered", actor: "delivery" });
      notify("customer", "Order delivered", `Your order #${orderId} was delivered.`, orderId);
      notify("shopkeeper", "Order delivered", `#${orderId} was delivered successfully.`, orderId);
      notify("delivery", "Earnings credited", `Rs ${o?.partnerEarning ?? 62} added to your earnings.`, orderId);
      notify("admin", "Order completed", `#${orderId} completed successfully.`, orderId);
      logActivity(`Order #${orderId} delivered`);
      toast.success("Order marked as delivered");
    },
    rateOrder(orderId, rating) {
      patchOrder(orderId, { rating });
      toast.success("Thanks for rating!");
    },
    markNotificationRead(id) {
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
    },
    markAllRead(role) {
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.role === role ? { ...n, read: true } : n)) }));
    },
    toggleStoreOpen(storeId) {
      setState((s) => ({ ...s, storeOpen: { ...s.storeOpen, [storeId]: !s.storeOpen[storeId] } }));
    },
    togglePartnerOnline(partnerId) {
      setState((s) => ({ ...s, partnerOnline: { ...s.partnerOnline, [partnerId]: !s.partnerOnline[partnerId] } }));
    },
    resetScenario() {
      const fresh = makeInitialState();
      // keep role/user so admin can stay logged in
      fresh.role = state.role;
      fresh.currentUserId = state.currentUserId;
      setState(fresh);
      toast.success("Demo scenario reset");
    },
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

// expose for cart totals etc
export { NEXT_AFTER };
