import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { CATEGORIES, PRODUCTS, STORES } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rupees } from "@/lib/format";
import { Plus, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

interface SearchParams { cat?: string; store?: string; q?: string }

export const Route = createFileRoute("/customer/shop")({
  head: () => ({ meta: [{ title: "Shop — FlashBasket" }] }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    cat: typeof s.cat === "string" ? s.cat : undefined,
    store: typeof s.store === "string" ? s.store : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: ShopPage,
});

function ShopPage() {
  const sp = useSearch({ from: "/customer/shop" });
  const { addToCart } = useDemo();
  const [q, setQ] = useState(sp.q ?? "");
  const [cat, setCat] = useState(sp.cat ?? "all");
  const [store, setStore] = useState(sp.store ?? "all");

  const products = useMemo(() => PRODUCTS.filter(p => (cat === "all" || p.category === cat) && (store === "all" || p.storeId === store) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))), [q, cat, store]);

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-extrabold">Shop everything</h1>
        <div className="mt-4 grid md:grid-cols-[1fr_180px_180px] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="h-11 pl-10 rounded-xl" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 rounded-xl border border-border bg-card px-3 text-sm font-semibold">
            <option value="all">All categories</option>
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
          </select>
          <select value={store} onChange={(e) => setStore(e.target.value)} className="h-11 rounded-xl border border-border bg-card px-3 text-sm font-semibold">
            <option value="all">All stores</option>
            {STORES.map(s => <option key={s.id} value={s.id}>{s.image} {s.name}</option>)}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map(p => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-3 hover:shadow-card transition">
              <Link to="/customer/product/$id" params={{ id: p.id }}>
                <div className="aspect-square rounded-xl bg-secondary grid place-items-center text-6xl">{p.image}</div>
              </Link>
              <div className="mt-2 text-sm font-bold line-clamp-2">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.weight}</div>
              <div className="flex items-center gap-1 text-xs mt-1 text-muted-foreground"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-extrabold">{rupees(p.price)}</span>
                <Button size="sm" className="h-8 rounded-lg gradient-primary text-primary-foreground" onClick={() => addToCart({ productId: p.id, name: p.name, qty: 1, price: p.price, weight: p.weight })}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Add
                </Button>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && <div className="text-center text-muted-foreground py-16">No products match your filters.</div>}
      </div>
    </DemoShell>
  );
}
