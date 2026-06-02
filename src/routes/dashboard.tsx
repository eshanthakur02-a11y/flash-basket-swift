import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package, MapPin, Clock, Heart, Bell, Wallet, ShoppingBag, ArrowRight,
  Truck, CheckCircle2, ChevronRight, Sparkles, Settings, Headphones, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { rupees } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FlashBasket" }] }),
  component: DashboardPage,
});

const ACTIVE_STATUSES = ["placed", "payment_confirmed", "packing", "out_for_delivery"] as const;

function DashboardPage() {
  const { user, loading, isAdmin, roles } = useAuth();
  const navigate = useNavigate();

  if (!loading && !user) {
    navigate({ to: "/auth" });
    return null;
  }

  // Only customers and admins see this dashboard.
  // Shopkeepers and delivery partners go to their role dashboards.
  if (!loading && !!user) {
    if (roles.includes("shopkeeper" as any)) {
      navigate({ to: "/shopkeeper/dashboard", replace: true });
      return null;
    }
    if (roles.includes("delivery" as any)) {
      navigate({ to: "/delivery/dashboard", replace: true });
      return null;
    }
  }


  const profile = useQuery({
    queryKey: ["dashboard-profile", user?.id],
    queryFn: async () =>
      user ? (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data : null,
    enabled: !!user,
  });

  const activeOrder = useQuery({
    queryKey: ["dashboard-active", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("orders")
        .select("id, status, total, placed_at, payment_method")
        .eq("user_id", user.id)
        .in("status", [...ACTIVE_STATUSES])
        .order("placed_at", { ascending: false })
        .limit(1);
      return data?.[0] ?? null;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const recentOrders = useQuery({
    queryKey: ["dashboard-recent", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, status, total, placed_at")
        .eq("user_id", user.id)
        .order("placed_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const addresses = useQuery({
    queryKey: ["dashboard-addr", user?.id],
    queryFn: async () =>
      user ? (await supabase.from("addresses").select("*").eq("user_id", user.id)).data ?? [] : [],
    enabled: !!user,
  });

  const notifs = useQuery({
    queryKey: ["dashboard-notifs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const name = profile.data?.full_name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-8 border border-border shadow-card"
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground/90 text-background px-3 py-1 text-xs font-bold">
              <Sparkles className="h-3 w-3 fill-primary text-primary" /> Your dashboard
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold leading-tight">
              Hey {name}, ready to <span className="text-primary">restock?</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Track orders, manage addresses, browse offers — everything you need, in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/products"
              className="rounded-xl gradient-primary px-5 py-3 font-bold text-primary-foreground shadow-glow inline-flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Shop now
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-xl border-2 border-foreground px-5 py-3 font-bold inline-flex items-center gap-2"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      </motion.div>

      {/* Stat strip */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<Package className="h-5 w-5" />} label="Total orders" value={String(recentOrders.data?.length ?? 0)} />
        <Stat icon={<MapPin className="h-5 w-5" />} label="Saved addresses" value={String(addresses.data?.length ?? 0)} />
        <Stat icon={<Heart className="h-5 w-5" />} label="Wishlist" value="0" />
        <Stat icon={<Wallet className="h-5 w-5" />} label="Coupons" value="3" />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Active order */}
          <Card title="Active order" icon={<Truck className="h-5 w-5 text-primary" />}>
            {activeOrder.isLoading ? (
              <Skeleton className="h-28 rounded-2xl" />
            ) : activeOrder.data ? (
              <ActiveOrder order={activeOrder.data} />
            ) : (
              <Empty
                icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
                title="No active orders"
                desc="Place an order and we'll show its live status here."
                cta="Browse products"
                to="/products"
              />
            )}
          </Card>

          {/* Recent orders */}
          <Card title="Recent orders" icon={<Package className="h-5 w-5 text-primary" />} action={{ label: "See all", to: "/orders" }}>
            {recentOrders.isLoading ? (
              <Skeleton className="h-24 rounded-2xl" />
            ) : (recentOrders.data?.length ?? 0) === 0 ? (
              <div className="text-sm text-muted-foreground py-4">No orders yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.data!.map((o, i) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to="/orders/$id"
                      params={{ id: o.id }}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-secondary/40 rounded-xl px-2 -mx-2 transition"
                    >
                      <div>
                        <div className="font-semibold text-sm">#{o.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(o.placed_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill status={o.status} />
                        <div className="font-bold">{rupees(o.total)}</div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card title="Quick actions" icon={<Sparkles className="h-5 w-5 text-primary" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Quick to="/products" icon={<ShoppingBag />} label="Reorder" />
              <Quick to="/orders" icon={<Truck />} label="Track order" />
              <Quick to="/account" icon={<Settings />} label="Profile" />
              <Quick to="/" icon={<Headphones />} label="Support" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Addresses */}
          <Card title="Delivery addresses" icon={<MapPin className="h-5 w-5 text-primary" />} action={{ label: "Manage", to: "/account" }}>
            {(addresses.data?.length ?? 0) === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                No addresses saved yet — add one at checkout.
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.data!.slice(0, 3).map((a) => (
                  <div key={a.id} className="rounded-2xl border border-border p-3">
                    <div className="text-sm font-semibold">
                      {a.name}
                      <span className="ml-2 text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5 uppercase">{a.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.line1}, {a.city} - {a.pincode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notifications */}
          <Card title="Notifications" icon={<Bell className="h-5 w-5 text-primary" />}>
            {(notifs.data?.length ?? 0) === 0 ? (
              <div className="text-sm text-muted-foreground py-2">You're all caught up. ✨</div>
            ) : (
              <div className="space-y-2">
                {notifs.data!.map((n) => (
                  <div key={n.id} className="rounded-2xl bg-secondary/40 border border-border p-3">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.body}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Offer card */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl gradient-primary p-5 text-primary-foreground shadow-glow"
          >
            <div className="text-xs font-bold opacity-90">FLASH OFFER</div>
            <div className="font-display text-2xl font-extrabold mt-1">₹50 OFF</div>
            <div className="text-sm opacity-90">on your next order above ₹299</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-bold">
              Code: FLASH50
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title, icon, children, action,
}: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: { label: string; to: string } }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">{icon} {title}</h2>
        {action && (
          <Link to={action.to as any} className="text-xs font-bold text-primary inline-flex items-center gap-1 hover:underline">
            {action.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
        <span className="text-primary">{icon}</span>{label}
      </div>
      <div className="mt-1 font-display text-2xl font-extrabold">{value}</div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    placed: { label: "Placed", cls: "bg-secondary text-foreground" },
    payment_confirmed: { label: "Confirmed", cls: "bg-primary/15 text-primary" },
    packing: { label: "Packing", cls: "bg-warning/20 text-warning-foreground" },
    out_for_delivery: { label: "Out for delivery", cls: "bg-primary text-primary-foreground" },
    delivered: { label: "Delivered", cls: "bg-primary/10 text-primary" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
  };
  const s = map[status] ?? { label: status, cls: "bg-secondary" };
  return <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 ${s.cls}`}>{s.label}</span>;
}

function ActiveOrder({ order }: { order: any }) {
  const steps = ["placed", "payment_confirmed", "packing", "out_for_delivery"];
  const idx = Math.max(0, steps.indexOf(order.status));
  return (
    <Link to="/orders/$id" params={{ id: order.id }} className="block">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">Order</div>
          <div className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="font-bold">{rupees(order.total)}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`h-2 rounded-full origin-left ${i <= idx ? "bg-primary" : "bg-secondary"}`}
            />
            <div className={`mt-1.5 text-[10px] font-bold uppercase ${i <= idx ? "text-foreground" : "text-muted-foreground"}`}>
              {s.replace(/_/g, " ")}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary">
        <Clock className="h-3 w-3" /> View live tracking <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function Empty({ icon, title, desc, cta, to }: { icon: React.ReactNode; title: string; desc: string; cta: string; to: string }) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-primary/10">{icon}</div>
      <div className="mt-3 font-bold">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
      <Link to={to as any} className="mt-4 inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground">
        {cta} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function Quick({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to as any}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 hover:shadow-glow hover:-translate-y-1 transition-all"
    >
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/15 text-primary">{icon}</div>
      <div className="text-xs font-bold text-center">{label}</div>
    </Link>
  );
}
