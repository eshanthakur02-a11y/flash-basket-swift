import { createFileRoute, Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, Heart, Package, User, ShoppingCart, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { RoleHeader } from "@/components/RoleHeader";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "FlashBasket App" }] }),
  component: CustomerShell,
});

const NAV = [
  { to: "/customer/home", label: "Home", icon: Home },
  { to: "/customer/categories", label: "Categories", icon: LayoutGrid },
  { to: "/customer/wishlist", label: "Favourites", icon: Heart },
  { to: "/customer/orders", label: "Orders", icon: Package },
  { to: "/customer/profile", label: "Account", icon: User },
] as const;

function CustomerShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, roles } = useAuth() as any;
  const navigate = useNavigate();
  const { totalQty } = useCart();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    const r: string[] = roles ?? [];
    if (r.includes("shopkeeper")) navigate({ to: "/shopkeeper/dashboard", replace: true });
    else if (r.includes("delivery")) navigate({ to: "/delivery/dashboard", replace: true });
  }, [user, loading, roles, navigate]);

  if (pathname === "/customer") return <Navigate to="/customer/home" replace />;


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RoleHeader
        homeTo="/customer/home"
        accountTo="/customer/profile"
        searchTo="/products"
        trailing={
          <>
            <Link to="/customer/notifications" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary transition">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/customer/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
              <ShoppingCart className="h-5 w-5" />
              {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 grid place-items-center rounded-full bg-foreground text-background text-[9px] font-bold">
                  {totalQty}
                </span>
              )}
            </Link>
          </>
        }
      />

      {/* Page content */}
      <main className="flex-1 min-w-0 pb-24"><Outlet /></main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border">
        <div className="grid grid-cols-5">
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
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-2xl transition",
                    active ? "gradient-primary text-primary-foreground shadow-glow" : "",
                  )}
                >
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
