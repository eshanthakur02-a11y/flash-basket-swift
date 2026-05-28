import { createFileRoute, useParams, notFound, useNavigate } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo, NEXT_AFTER } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { OrderTimeline } from "@/components/demo/OrderTimeline";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/shopkeeper/orders/$id")({
  head: () => ({ meta: [{ title: "Order — Shopkeeper" }] }),
  component: Page,
  notFoundComponent: () => <div className="p-10 text-center">Order not found</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
});

const LABELS: Record<string, string> = {
  shop_accepted: "Start preparing",
  preparing: "Mark ready for pickup",
  ready: "Find delivery partner",
};

function Page() {
  const { id } = useParams({ from: "/shopkeeper/orders/$id" });
  const { state, advanceOrder, acceptOrderShop, rejectOrderShop } = useDemo();
  const navigate = useNavigate();
  const o = state.orders.find(x => x.id === id);
  if (!o) throw notFound();
  const next = NEXT_AFTER[o.status];
  const cust = findUser(o.customerId);

  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <button onClick={() => navigate({ to: "/shopkeeper/orders" })} className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><ChevronLeft className="h-4 w-4" />All orders</button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">#{o.id}</div>
            <h1 className="font-display text-2xl font-extrabold">{cust?.name}</h1>
            <div className="text-sm text-muted-foreground">{cust?.phone}</div>
          </div>
          <StatusBadge status={o.status} />
        </div>

        <section className="mt-5 rounded-2xl border border-border bg-card p-5"><OrderTimeline order={o} role="shopkeeper" /></section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Items</h2>
          {o.items.map(i => (
            <div key={i.productId} className="text-sm">
              <div className="flex justify-between font-semibold"><span>{i.qty}× {i.name}</span><span>{rupees(i.price * i.qty)}</span></div>
              {i.customization?.message && <div className="text-xs text-primary mt-1">"{i.customization.message}" · {i.customization.eggless ? "Eggless" : "With egg"}{i.customization.candles ? " · Add candles" : ""}{i.customization.knife ? " · Add knife" : ""}</div>}
              {i.customization?.instructions && <div className="text-xs text-muted-foreground mt-1">Note: {i.customization.instructions}</div>}
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border flex justify-between font-extrabold"><span>Total</span><span>{rupees(o.total)}</span></div>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-2">Delivery address</h2>
          <div className="text-sm text-muted-foreground">{o.address}</div>
        </section>

        <div className="mt-4 flex gap-2 flex-wrap">
          {o.status === "waiting_shop" && (<>
            <Button onClick={() => acceptOrderShop(o.id)} className="rounded-xl gradient-primary text-primary-foreground">Accept order</Button>
            <Button onClick={() => rejectOrderShop(o.id, "Item out of stock")} variant="outline" className="rounded-xl text-destructive border-destructive/40">Reject</Button>
          </>)}
          {next && LABELS[o.status] && (
            <Button onClick={() => advanceOrder(o.id, next)} className="rounded-xl gradient-primary text-primary-foreground">{LABELS[o.status]}</Button>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
