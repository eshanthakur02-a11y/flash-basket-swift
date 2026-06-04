import { createFileRoute, Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ClipboardList, Store, Users, Bell, Zap, Menu, Wallet,
  Package, Tag, Layers, AlertTriangle, BarChart, Truck, MessageSquareWarning, Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FlashBasket" }] }),
  component: AdminShell,
});

const BOTTOM_NAV = [
  { to: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/shops", label: "Shops", icon: Store },
  { to: "/admin/customers", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
] as const;

const DRAWER_NAV = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/products?filter=low-stock", label: "Stock Alerts", icon: AlertTriangle },
  { to: "/admin/reports", label: "Reports", icon: BarChart },
  { to: "/admin/delivery-partners", label: "Partners", icon: Truck },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, isAdmin } = useAuth() as any;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", replace: true }); return; }
    if (!isAdmin) navigate({ to: "/customer/home", replace: true });
  }, [user, loading, isAdmin, navigate]);

  if (pathname === "/admin") return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary hover:bg-secondary/80 transition">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2 font-display font-extrabold">
                  <span className="grid h-7 w-7 place-items-center rounded-full gradient-primary text-primary-foreground">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                  </span>
                  Admin Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="p-2">
                {DRAWER_NAV.map((n) => {
                  const Icon = n.icon;
                  const active = pathname.startsWith(n.to.split("?")[0]);
                  return (
                    <Link
                      key={n.to}
                      to={n.to as any}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                        active ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/admin/dashboard" className="flex items-center gap-2 font-display font-extrabold text-lg">
            <span className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            Flash<span className="text-primary">Basket</span>
            <span className="ml-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-secondary px-2 py-0.5">Admin</span>
          </Link>
          <div className="flex-1" />
          <Link to="/admin/notifications" className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 min-w-0 pb-24"><Outlet /></main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border">
        <div className="grid grid-cols-5">
          {BOTTOM_NAV.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className={cn("grid h-9 w-9 place-items-center rounded-2xl transition", active ? "gradient-primary text-primary-foreground shadow-glow" : "")}>
                  <Icon className="h-5 w-5" />
                </span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
