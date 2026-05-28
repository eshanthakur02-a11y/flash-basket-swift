import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser, findStore } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { rupees } from "@/lib/format";
import { Check, X, ListOrdered, TrendingUp, Star, Package } from "lucide-react";

export const Route = createFileRoute("/shopkeeper/dashboard")({
  head: () => ({ meta: [{ title: "Shopkeeper — FlashBasket" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { state, acceptOrderShop, rejectOrderShop, toggleStoreOpen } = useDemo();
  const user = findUser(state.currentUserId);
  const storeId = user?.storeId ?? "store1";
  const store = findStore(storeId);
  const orders = state.orders.filter(o => o.storeId === storeId);
  const incoming = orders.filter(o => o.status === "waiting_shop");
  const active = orders.filter(o => ["shop_accepted", "preparing", "ready", "finding_partner", "partner_assigned", "partner_at_shop", "picked_up", "out_for_delivery"].includes(o.status));
  const today = orders.filter(o => o.status === "delivered").length;
  const revenue = orders.filter(o => o.status === "delivered").reduce((a, b) => a + b.total, 0);

  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-6xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold">{store.name}</h1>
            <div className="text-sm text-muted-foreground">{store.address}</div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2">
            <span className="text-sm font-bold">{state.storeOpen[storeId] ? "Open" : "Closed"}</span>
            <Switch checked={state.storeOpen[storeId]} onCheckedChange={() => toggleStoreOpen(storeId)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<ListOrdered />} label="Incoming" value={incoming.length.toString()} />
          <Stat icon={<Package />} label="Active" value={active.length.toString()} />
          <Stat icon={<Check />} label="Delivered" value={today.toString()} />
          <Stat icon={<TrendingUp />} label="Revenue" value={rupees(revenue)} />
        </div>

        <section>
          <h2 className="font-bold mb-3">Incoming orders</h2>
          {incoming.length === 0 ? <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">No new orders. You're all caught up.</div> :
            <div className="space-y-3">{incoming.map(o => (
              <div key={o.id} className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs font-bold text-muted-foreground">#{o.id} · {findUser(o.customerId)?.name}</div>
                    <div className="font-display text-lg font-bold mt-1">{o.items[0]?.name}{o.items.length > 1 && ` +${o.items.length - 1}`}</div>
                    {o.items[0]?.customization?.message && <div className="text-xs text-primary">"{o.items[0].customization.message}" · {o.items[0].customization.eggless ? "Eggless" : "With egg"}</div>}
                    <div className="text-sm font-extrabold mt-1">{rupees(o.total)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => rejectOrderShop(o.id, "Item unavailable")} variant="outline" className="rounded-xl text-destructive border-destructive/40"><X className="h-4 w-4 mr-1" />Reject</Button>
                    <Button onClick={() => acceptOrderShop(o.id)} className="rounded-xl gradient-primary text-primary-foreground"><Check className="h-4 w-4 mr-1" />Accept</Button>
                  </div>
                </div>
              </div>
            ))}</div>}
        </section>

        <section>
          <h2 className="font-bold mb-3">Active orders</h2>
          <div className="space-y-3">
            {active.length === 0 && <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">No active orders right now.</div>}
            {active.map(o => (
              <Link key={o.id} to="/shopkeeper/orders/$id" params={{ id: o.id }} className="block rounded-2xl border border-border bg-card p-4 hover:shadow-card">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-xs text-muted-foreground">#{o.id} · {findUser(o.customerId)?.name}</div>
                    <div className="font-bold">{o.items[0]?.name}</div>
                  </div>
                  <div className="flex items-center gap-3"><span className="font-extrabold">{rupees(o.total)}</span><StatusBadge status={o.status} /></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DemoShell>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase"><span>{label}</span><span className="text-primary">{icon}</span></div>
      <div className="font-display text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
