import { createFileRoute, Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, ClipboardList, Package, Wallet, User, Bell, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { RoleHeader } from "@/components/RoleHeader";

export const Route = createFileRoute("/shopkeeper")({
  head: () => ({ meta: [{ title: "Shopkeeper — FlashBasket" }] }),
  component: ShopkeeperShell,
});

const NAV = [
  { to: "/shopkeeper/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/shopkeeper/orders", label: "Orders", icon: ClipboardList },
  { to: "/shopkeeper/products", label: "Products", icon: Package },
  { to: "/shopkeeper/offers", label: "Offers", icon: Megaphone },
  { to: "/shopkeeper/earnings", label: "Earnings", icon: Wallet },
  { to: "/shopkeeper/settings", label: "Account", icon: User },
] as const;

function ShopkeeperShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, roles } = useAuth() as any;
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login", replace: true }); return; }
    const r: string[] = roles ?? [];
    if (!r.includes("shopkeeper") && !r.includes("admin")) {
      if (r.includes("delivery")) navigate({ to: "/delivery/dashboard", replace: true });
      else navigate({ to: "/customer/home", replace: true });
    }
  }, [user, loading, roles, navigate]);

  if (pathname === "/shopkeeper") return <Navigate to="/shopkeeper/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RoleHeader
        homeTo="/shopkeeper/dashboard"
        accountTo="/shopkeeper/settings"
        searchTo="/shopkeeper/products"
        trailing={
          <Link to="/shopkeeper/notifications" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary transition">
            <Bell className="h-5 w-5" />
          </Link>
        }
      />

      <main className="flex-1 min-w-0 pb-24"><Outlet /></main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border">
        <div className="grid grid-cols-6">
          {NAV.map((n) => {
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
