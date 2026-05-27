export type Role = "customer" | "shopkeeper" | "delivery" | "admin";

export type OrderStatus =
  | "placed"
  | "waiting_shop"
  | "shop_accepted"
  | "preparing"
  | "ready"
  | "finding_partner"
  | "partner_assigned"
  | "partner_at_shop"
  | "picked_up"
  | "out_for_delivery"
  | "delivered"
  | "rejected_by_shop"
  | "cancelled_by_customer"
  | "payment_failed"
  | "refund_initiated";

export interface TimelineEvent {
  status: OrderStatus;
  at: string; // ISO
  label: string;
  actor: Role | "system";
  note?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  email: string;
  avatar?: string;
  address?: string;
  storeId?: string;
  vehicle?: string;
  rating?: number;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  category: string;
  rating: number;
  etaMin: number;
  etaMax: number;
  address: string;
  isOpen: boolean;
  busy: boolean;
  image: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  discount?: number;
  weight: string;
  rating: number;
  stock: number;
  image: string; // emoji or url
  customizable?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  weight?: string;
  customization?: {
    eggless?: boolean;
    message?: string;
    candles?: boolean;
    knife?: boolean;
    instructions?: string;
  };
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  partnerId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  payment: "upi" | "card" | "wallet" | "cod";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  status: OrderStatus;
  address: string;
  distanceKm: number;
  partnerEarning: number;
  etaMinutes: number;
  timeline: TimelineEvent[];
  placedAt: string;
  scheduled?: string;
  rejectedReason?: string;
  cancelledReason?: string;
  rating?: { shop?: number; partner?: number; comment?: string };
}

export interface Notification {
  id: string;
  role: Role;
  title: string;
  body: string;
  at: string;
  read: boolean;
  orderId?: string;
}

export interface Coupon {
  code: string;
  desc: string;
  type: "flat" | "percent" | "freedel";
  value: number;
  minOrder?: number;
}

export interface Complaint {
  id: string;
  orderId: string;
  customer: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  at: string;
}

export interface CartItem extends OrderItem {}

export interface DemoState {
  role: Role | null;
  currentUserId: string | null;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  notifications: Notification[];
  storeOpen: Record<string, boolean>;
  partnerOnline: Record<string, boolean>;
  complaints: Complaint[];
  activity: { id: string; at: string; text: string }[];
}
