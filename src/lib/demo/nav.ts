import { Home, Store, ShoppingCart, Package, User, LayoutDashboard, ListOrdered, Boxes, Wallet, Bike, Clock, History, ShieldCheck, Users, Truck, MessageSquareWarning, BarChart3 } from "lucide-react";

export const CUSTOMER_NAV = [
  { to: "/customer/home", label: "Home", icon: Home },
  { to: "/customer/shop", label: "Shop", icon: Store },
  { to: "/customer/cart", label: "Cart", icon: ShoppingCart },
  { to: "/customer/orders", label: "Orders", icon: Package },
  { to: "/customer/profile", label: "Profile", icon: User },
];

export const SHOPKEEPER_NAV = [
  { to: "/shopkeeper/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shopkeeper/orders", label: "Orders", icon: ListOrdered },
  { to: "/shopkeeper/products", label: "Products", icon: Boxes },
  { to: "/shopkeeper/earnings", label: "Earnings", icon: Wallet },
];

export const DELIVERY_NAV = [
  { to: "/delivery/dashboard", label: "Home", icon: Bike },
  { to: "/delivery/available-orders", label: "Tasks", icon: Clock },
  { to: "/delivery/history", label: "History", icon: History },
  { to: "/delivery/earnings", label: "Earnings", icon: Wallet },
];

export const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/shops", label: "Shops", icon: Store },
  { to: "/admin/delivery-partners", label: "Delivery", icon: Truck },
  { to: "/admin/complaints", label: "Support", icon: MessageSquareWarning },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];
