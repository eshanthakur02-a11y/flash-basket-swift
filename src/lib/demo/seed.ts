import type {
  Complaint,
  Coupon,
  DemoState,
  DemoUser,
  Notification,
  Order,
  Product,
  Store,
} from "./types";

export const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  waiting_shop: "Waiting for Shop Confirmation",
  shop_accepted: "Shop Accepted",
  preparing: "Preparing Order",
  ready: "Ready for Pickup",
  finding_partner: "Looking for Delivery Partner",
  partner_assigned: "Delivery Partner Assigned",
  partner_at_shop: "Partner Arrived at Shop",
  picked_up: "Picked Up",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered Successfully",
  rejected_by_shop: "Rejected by Shop",
  cancelled_by_customer: "Cancelled by Customer",
  payment_failed: "Payment Failed",
  refund_initiated: "Refund Initiated",
};

export const USERS: DemoUser[] = [
  { id: "c1", name: "Aarav Sharma", role: "customer", phone: "+91 98765 43210", email: "aarav@demo.fb", address: "House 28, Lake View Apartments, Saket, New Delhi" },
  { id: "c2", name: "Neha Gupta", role: "customer", phone: "+91 98111 23456", email: "neha@demo.fb", address: "Flat 12B, Hauz Khas, New Delhi" },
  { id: "c3", name: "Rohan Kapoor", role: "customer", phone: "+91 99887 76655", email: "rohan@demo.fb", address: "C-204, Vasant Kunj, New Delhi" },
  { id: "s1", name: "Priya Mehta", role: "shopkeeper", email: "priya@demo.fb", storeId: "store1", rating: 4.8 },
  { id: "s2", name: "Anil Bansal", role: "shopkeeper", email: "anil@demo.fb", storeId: "store2", rating: 4.6 },
  { id: "s3", name: "Meera Iyer", role: "shopkeeper", email: "meera@demo.fb", storeId: "store3", rating: 4.7 },
  { id: "d1", name: "Rahul Verma", role: "delivery", email: "rahul@demo.fb", vehicle: "Bike - DL 03 AB 4321", rating: 4.9 },
  { id: "d2", name: "Sameer Khan", role: "delivery", email: "sameer@demo.fb", vehicle: "Scooter - DL 05 XY 9876", rating: 4.7 },
  { id: "d3", name: "Kunal Singh", role: "delivery", email: "kunal@demo.fb", vehicle: "Bike - DL 07 PQ 1122", rating: 4.8 },
  { id: "a1", name: "Admin", role: "admin", email: "admin@demo.fb" },
];

export const STORES: Store[] = [
  { id: "store1", name: "Sweet Crumbs Bakery", ownerId: "s1", category: "Cakes and Bakery", rating: 4.8, etaMin: 25, etaMax: 35, address: "Shop 14, Green Park Market, New Delhi", isOpen: true, busy: false, image: "🎂" },
  { id: "store2", name: "Fresh Harvest Grocery", ownerId: "s2", category: "Fruits, vegetables and essentials", rating: 4.6, etaMin: 10, etaMax: 18, address: "Shop 6, Saket District Centre, New Delhi", isOpen: true, busy: false, image: "🥦" },
  { id: "store3", name: "Daily Dairy Hub", ownerId: "s3", category: "Dairy and breakfast", rating: 4.7, etaMin: 12, etaMax: 20, address: "Shop 2, Vasant Kunj Market, New Delhi", isOpen: true, busy: false, image: "🥛" },
];

export const CATEGORIES = [
  { slug: "cakes", name: "Cakes and Bakery", emoji: "🎂" },
  { slug: "fruits", name: "Fruits and Vegetables", emoji: "🥬" },
  { slug: "dairy", name: "Dairy and Breakfast", emoji: "🥛" },
  { slug: "snacks", name: "Snacks", emoji: "🍿" },
  { slug: "beverages", name: "Beverages", emoji: "🥤" },
  { slug: "instant", name: "Instant Food", emoji: "🍜" },
  { slug: "personal", name: "Personal Care", emoji: "🧴" },
  { slug: "household", name: "Household Essentials", emoji: "🧺" },
];

export const PRODUCTS: Product[] = [
  { id: "p1", storeId: "store1", name: "Chocolate Truffle Birthday Cake", category: "cakes", price: 799, weight: "1 kg", rating: 4.9, stock: 12, image: "🎂", customizable: true },
  { id: "p2", storeId: "store1", name: "Red Velvet Cake", category: "cakes", price: 749, weight: "1 kg", rating: 4.8, stock: 8, image: "🍰", customizable: true },
  { id: "p3", storeId: "store1", name: "Butterscotch Celebration Cake", category: "cakes", price: 699, weight: "1 kg", rating: 4.7, stock: 10, image: "🧁", customizable: true },
  { id: "p4", storeId: "store1", name: "Blueberry Cheesecake", category: "cakes", price: 849, weight: "500 g", rating: 4.8, stock: 6, image: "🫐", customizable: true },
  { id: "p5", storeId: "store1", name: "Chocolate Brownies", category: "cakes", price: 249, weight: "200 g", rating: 4.6, stock: 25, image: "🍫" },
  { id: "p6", storeId: "store1", name: "Whole Wheat Bread", category: "cakes", price: 55, discount: 5, weight: "400 g", rating: 4.5, stock: 30, image: "🍞" },
  { id: "p7", storeId: "store2", name: "Fresh Bananas", category: "fruits", price: 49, weight: "1 dozen", rating: 4.4, stock: 50, image: "🍌" },
  { id: "p8", storeId: "store2", name: "Red Apples", category: "fruits", price: 159, weight: "1 kg", rating: 4.6, stock: 40, image: "🍎" },
  { id: "p9", storeId: "store2", name: "Tomatoes", category: "fruits", price: 39, weight: "500 g", rating: 4.3, stock: 60, image: "🍅" },
  { id: "p10", storeId: "store2", name: "Potatoes", category: "fruits", price: 35, weight: "1 kg", rating: 4.2, stock: 80, image: "🥔" },
  { id: "p11", storeId: "store2", name: "Onions", category: "fruits", price: 45, weight: "1 kg", rating: 4.1, stock: 70, image: "🧅" },
  { id: "p12", storeId: "store2", name: "Carrots", category: "fruits", price: 39, weight: "500 g", rating: 4.4, stock: 45, image: "🥕" },
  { id: "p13", storeId: "store3", name: "Amul Milk", category: "dairy", price: 32, weight: "500 ml", rating: 4.7, stock: 100, image: "🥛" },
  { id: "p14", storeId: "store3", name: "Paneer", category: "dairy", price: 95, weight: "200 g", rating: 4.6, stock: 20, image: "🧀" },
  { id: "p15", storeId: "store3", name: "Butter", category: "dairy", price: 58, weight: "100 g", rating: 4.6, stock: 25, image: "🧈" },
  { id: "p16", storeId: "store3", name: "Curd", category: "dairy", price: 45, weight: "400 g", rating: 4.5, stock: 35, image: "🥣" },
  { id: "p17", storeId: "store3", name: "Eggs", category: "dairy", price: 75, weight: "6 pcs", rating: 4.4, stock: 50, image: "🥚" },
  { id: "p18", storeId: "store3", name: "Cornflakes", category: "dairy", price: 195, weight: "475 g", rating: 4.5, stock: 18, image: "🥣" },
  { id: "p19", storeId: "store2", name: "Potato Chips", category: "snacks", price: 30, weight: "52 g", rating: 4.3, stock: 80, image: "🍟" },
  { id: "p20", storeId: "store2", name: "Choco Cookies", category: "snacks", price: 60, weight: "150 g", rating: 4.4, stock: 60, image: "🍪" },
  { id: "p21", storeId: "store2", name: "Mixed Namkeen", category: "snacks", price: 75, weight: "200 g", rating: 4.5, stock: 40, image: "🥜" },
  { id: "p22", storeId: "store2", name: "Orange Juice", category: "beverages", price: 110, weight: "1 L", rating: 4.5, stock: 30, image: "🧃" },
  { id: "p23", storeId: "store2", name: "Cola 750ml", category: "beverages", price: 40, weight: "750 ml", rating: 4.3, stock: 100, image: "🥤" },
  { id: "p24", storeId: "store2", name: "Green Tea", category: "beverages", price: 220, weight: "25 bags", rating: 4.6, stock: 25, image: "🍵" },
  { id: "p25", storeId: "store2", name: "Instant Noodles", category: "instant", price: 55, weight: "4x70 g", rating: 4.5, stock: 90, image: "🍜" },
  { id: "p26", storeId: "store2", name: "Basmati Rice", category: "instant", price: 240, weight: "1 kg", rating: 4.7, stock: 30, image: "🍚" },
  { id: "p27", storeId: "store2", name: "Atta Flour", category: "instant", price: 290, weight: "5 kg", rating: 4.6, stock: 22, image: "🌾" },
  { id: "p28", storeId: "store2", name: "Cooking Oil", category: "instant", price: 175, weight: "1 L", rating: 4.5, stock: 35, image: "🫒" },
  { id: "p29", storeId: "store2", name: "Hand Wash", category: "personal", price: 99, weight: "200 ml", rating: 4.4, stock: 40, image: "🧴" },
  { id: "p30", storeId: "store2", name: "Cleaning Liquid", category: "household", price: 165, weight: "1 L", rating: 4.4, stock: 28, image: "🧼" },
];

export const COUPONS: Coupon[] = [
  { code: "FIRST50", desc: "Rs 50 off your first order", type: "flat", value: 50, minOrder: 199 },
  { code: "CAKE10", desc: "10% off bakery orders", type: "percent", value: 10, minOrder: 299 },
  { code: "FREEDEL", desc: "Free delivery on all orders", type: "freedel", value: 49 },
  { code: "SAVE100", desc: "Rs 100 off above Rs 599", type: "flat", value: 100, minOrder: 599 },
];

const now = () => new Date().toISOString();

export const PRIMARY_ORDER: Order = {
  id: "FB10234",
  customerId: "c1",
  storeId: "store1",
  items: [
    {
      productId: "p1",
      name: "Chocolate Truffle Birthday Cake",
      qty: 1,
      price: 799,
      weight: "1 kg",
      customization: {
        eggless: true,
        message: "Happy Birthday Riya",
        candles: true,
        knife: true,
        instructions: "Please pack carefully and include candles.",
      },
    },
  ],
  subtotal: 799,
  deliveryFee: 49,
  platformFee: 9,
  discount: 10,
  total: 847,
  payment: "upi",
  paymentStatus: "paid",
  status: "waiting_shop",
  address: "House 28, Lake View Apartments, Saket, New Delhi",
  distanceKm: 4.2,
  partnerEarning: 62,
  etaMinutes: 35,
  timeline: [
    { status: "placed", at: now(), label: "Order Placed", actor: "customer" },
    { status: "waiting_shop", at: now(), label: "Waiting for Shop Confirmation", actor: "system" },
  ],
  placedAt: now(),
};

const oldOrder = (id: string, customerId: string, storeId: string, name: string, total: number, days: number, status: "delivered" | "cancelled_by_customer" = "delivered"): Order => ({
  id,
  customerId,
  storeId,
  partnerId: "d1",
  items: [{ productId: "p1", name, qty: 1, price: total - 58, weight: "1 kg" }],
  subtotal: total - 58,
  deliveryFee: 49,
  platformFee: 9,
  discount: 0,
  total,
  payment: "upi",
  paymentStatus: status === "delivered" ? "paid" : "refunded",
  status,
  address: "House 28, Saket, New Delhi",
  distanceKm: 3.5,
  partnerEarning: 55,
  etaMinutes: 30,
  timeline: [],
  placedAt: new Date(Date.now() - days * 86400000).toISOString(),
});

export const PAST_ORDERS: Order[] = [
  oldOrder("FB10210", "c1", "store2", "Fresh Harvest Combo", 412, 2),
  oldOrder("FB10215", "c1", "store3", "Dairy Essentials Pack", 268, 5),
  oldOrder("FB10221", "c2", "store1", "Red Velvet Cake", 808, 1),
  oldOrder("FB10222", "c3", "store2", "Weekly Veggies", 530, 1),
  oldOrder("FB10224", "c1", "store2", "Snacks Pack", 215, 3, "cancelled_by_customer"),
  oldOrder("FB10227", "c2", "store3", "Breakfast Bundle", 340, 7),
  oldOrder("FB10228", "c3", "store1", "Brownie Box", 305, 8),
  oldOrder("FB10229", "c1", "store2", "Fruit Basket", 478, 10),
  oldOrder("FB10231", "c2", "store1", "Cheesecake", 905, 12),
  oldOrder("FB10232", "c3", "store3", "Milk & Curd", 188, 14),
  oldOrder("FB10233", "c1", "store1", "Butterscotch Cake", 757, 18),
];

export const COMPLAINTS: Complaint[] = [
  { id: "T101", orderId: "FB10224", customer: "Aarav Sharma", subject: "Refund Request", status: "in_progress", at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "T102", orderId: "FB10222", customer: "Rohan Kapoor", subject: "Late Delivery", status: "resolved", at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "T103", orderId: "FB10231", customer: "Neha Gupta", subject: "Damaged Cake", status: "open", at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "T104", orderId: "FB10227", customer: "Neha Gupta", subject: "Incorrect Item", status: "resolved", at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: "T105", orderId: "FB10210", customer: "Aarav Sharma", subject: "Shop Rejection", status: "resolved", at: new Date(Date.now() - 9 * 86400000).toISOString() },
];

export function seedNotifications(): Notification[] {
  const t = Date.now();
  const mk = (role: any, title: string, body: string, mins: number, orderId?: string): Notification => ({
    id: `n_${role}_${mins}_${Math.random().toString(36).slice(2, 7)}`,
    role,
    title,
    body,
    at: new Date(t - mins * 60000).toISOString(),
    read: false,
    orderId,
  });
  return [
    mk("customer", "Welcome to FlashBasket!", "Get groceries in 10 minutes. Try a flash deal today.", 240),
    mk("customer", "Coupon CAKE10 unlocked", "10% off your next bakery order.", 180),
    mk("customer", "Order delivered", "Your order #FB10210 was delivered.", 60 * 24 * 2, "FB10210"),
    mk("shopkeeper", "Daily summary", "You completed 14 orders yesterday.", 60 * 12),
    mk("shopkeeper", "New 5-star review", "Aarav rated Sweet Crumbs 5 stars.", 60 * 6),
    mk("delivery", "Bonus unlocked", "Complete 3 more deliveries to earn Rs 150.", 120),
    mk("delivery", "Weekly payout", "Rs 3,420 credited to your account.", 60 * 18),
    mk("admin", "5 new shops onboarding", "3 stores awaiting verification.", 90),
    mk("admin", "Daily revenue updated", "Rs 1,28,400 gross revenue today.", 30),
  ];
}

export function makeInitialState(): DemoState {
  return {
    role: null,
    currentUserId: null,
    cart: [],
    wishlist: [],
    orders: [PRIMARY_ORDER, ...PAST_ORDERS],
    notifications: seedNotifications(),
    storeOpen: { store1: true, store2: true, store3: true },
    partnerOnline: { d1: true, d2: true, d3: false },
    complaints: COMPLAINTS,
    activity: [
      { id: "a1", at: PRIMARY_ORDER.placedAt, text: "Aarav placed order #FB10234" },
    ],
  };
}

export function findUser(id: string | null) {
  return USERS.find((u) => u.id === id) ?? null;
}
export function findStore(id: string) {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}
export function findProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}
