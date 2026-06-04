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

  const [search, setSearch] = useState("");
  const nav = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) nav({ to: "/products", search: { q: search.trim() } as any });
    else nav({ to: "/customer/categories" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top app bar */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <Link to="/customer/home" className="flex items-center gap-1.5 font-display font-extrabold text-base">
            <span className="grid h-7 w-7 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </span>
            Flash<span className="text-primary">Basket</span>
          </Link>
          <div className="flex-1" />
          <Link to="/customer/notifications" className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
            <Bell className="h-4 w-4" />
          </Link>
          <Link to="/customer/cart" className="relative grid h-9 w-9 place-items-center rounded-full gradient-primary text-primary-foreground shadow-glow">
            <ShoppingCart className="h-4 w-4" />
            {totalQty > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 grid place-items-center rounded-full bg-foreground text-background text-[9px] font-bold">
                {totalQty}
              </span>
            )}
          </Link>
        </div>

        {/* Search bar */}
        <form onSubmit={onSearch} className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search "milk", "bread", "atta"…'
              className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
            />
          </div>
        </form>
      </header>

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
