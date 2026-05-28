import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { CATEGORIES, PRODUCTS, STORES, findUser } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { rupees } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Zap, Star, Plus, Cake, Package, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { OrderTimeline } from "@/components/demo/OrderTimeline";

export const Route = createFileRoute("/customer/home")({
  head: () => ({ meta: [{ title: "Customer Home — FlashBasket" }] }),
  component: HomePage,
});

function HomePage() {
  const { state, addToCart } = useDemo();
  const user = findUser(state.currentUserId);
  const active = state.orders.find(
    (o) => o.customerId === state.currentUserId && !["delivered", "rejected_by_shop", "cancelled_by_customer", "refund_initiated"].includes(o.status),
  );
  const featured = PRODUCTS.slice(0, 6);

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Delivering to <span className="font-bold text-foreground truncate">{user?.address ?? "Set your address"}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl gradient-hero p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-bold">
              <Zap className="h-3 w-3 fill-primary text-primary" /> 10-min delivery
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold leading-tight">Hi {user?.name?.split(" ")[0] ?? "there"}, what's on the menu today?</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Order groceries, snacks and fresh bakes from neighbourhood stores.</p>
            <div className="mt-4 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for cakes, snacks, milk…" className="h-12 rounded-2xl pl-10 bg-card/80 backdrop-blur border-border" />
            </div>
          </div>
        </motion.div>

        {active && (
          <div className="rounded-3xl border border-primary/40 bg-primary/5 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground font-bold">ACTIVE ORDER · #{active.id}</div>
                <div className="font-display text-lg font-bold mt-1">{active.items[0]?.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={active.status} />
                <Link to="/customer/orders/$id" params={{ id: active.id }}><Button size="sm" className="rounded-xl">Track</Button></Link>
              </div>
            </div>
            <div className="mt-4"><OrderTimeline order={active} role="customer" /></div>
          </div>
        )}

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Shop by category</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to="/customer/shop" search={{ cat: c.slug } as any} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-card transition">
                <div className="h-12 w-12 grid place-items-center rounded-2xl bg-secondary text-2xl">{c.emoji}</div>
                <span className="text-[11px] text-center font-semibold leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-xl font-bold">Order a custom cake</h2>
            <Link to="/customer/product/$id" params={{ id: "p1" }} className="text-sm text-primary font-bold">Customize cake →</Link>
          </div>
          <Link to="/customer/product/$id" params={{ id: "p1" }} className="block rounded-3xl border border-border bg-card overflow-hidden shadow-card hover:shadow-elegant transition">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-warning/40 to-primary/30 p-10 grid place-items-center text-8xl">🎂</div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <Badge className="self-start bg-foreground text-background rounded-full">BAKERY BESTSELLER</Badge>
                <h3 className="font-display text-2xl font-extrabold mt-3">Chocolate Truffle Birthday Cake</h3>
                <p className="text-sm text-muted-foreground mt-2">Pick weight, write a custom message, add candles and a knife — delivered in 30 minutes.</p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-2xl font-extrabold">₹799</span>
                  <span className="text-xs flex items-center gap-1 text-muted-foreground"><Star className="h-3.5 w-3.5 fill-warning text-warning" />4.9 · Sweet Crumbs Bakery</span>
                </div>
                <Button className="mt-4 rounded-xl self-start gradient-primary text-primary-foreground"><Cake className="h-4 w-4 mr-1" />Customize & order</Button>
              </div>
            </div>
          </Link>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Trending now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {featured.map((p) => (
              <Link key={p.id} to="/customer/product/$id" params={{ id: p.id }} className="rounded-2xl border border-border bg-card p-3 hover:shadow-card transition">
                <div className="aspect-square rounded-xl bg-secondary grid place-items-center text-5xl">{p.image}</div>
                <div className="mt-2 text-xs font-bold line-clamp-2">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.weight}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-extrabold text-sm">{rupees(p.price)}</span>
                  <Button size="icon" className="h-7 w-7 rounded-lg gradient-primary text-primary-foreground" onClick={(e) => { e.preventDefault(); addToCart({ productId: p.id, name: p.name, qty: 1, price: p.price, weight: p.weight }); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-3">Stores near you</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {STORES.map((s) => (
              <Link key={s.id} to="/customer/shop" search={{ store: s.id } as any} className="rounded-2xl border border-border bg-card p-4 hover:shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 grid place-items-center rounded-xl bg-secondary text-2xl">{s.image}</div>
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.category}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-3 text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{s.rating}</span>
                  <span>{s.etaMin}-{s.etaMax} min</span>
                  <span className="text-success font-bold">Open</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DemoShell>
  );
}
