import { createFileRoute, Link, useParams, notFound, useNavigate } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { OrderTimeline } from "@/components/demo/OrderTimeline";
import { findStore, findUser } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MapPin, Star, X } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/demo/Bits";

export const Route = createFileRoute("/customer/orders/$id")({
  head: () => ({ meta: [{ title: "Order — FlashBasket" }] }),
  component: OrderDetail,
  notFoundComponent: () => <div className="p-10 text-center">Order not found</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
});

function OrderDetail() {
  const { id } = useParams({ from: "/customer/orders/$id" });
  const { state, cancelOrderCustomer, rateOrder } = useDemo();
  const navigate = useNavigate();
  const o = state.orders.find(x => x.id === id);
  const [confirm, setConfirm] = useState(false);
  const [rating, setRating] = useState(5);
  if (!o) { throw notFound(); }
  const store = findStore(o.storeId);
  const partner = o.partnerId ? findUser(o.partnerId) : null;
  const canCancel = ["waiting_shop", "shop_accepted"].includes(o.status);
  const canRate = o.status === "delivered" && !o.rating;

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-3xl mx-auto">
        <button onClick={() => navigate({ to: "/customer/orders" })} className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><ChevronLeft className="h-4 w-4" />All orders</button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Order #{o.id}</div>
            <h1 className="font-display text-2xl font-extrabold mt-1">{store.name}</h1>
          </div>
          <StatusBadge status={o.status} />
        </div>

        <section className="mt-5 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-4">Live tracking</h2>
          <OrderTimeline order={o} role="customer" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-secondary p-3"><div className="text-muted-foreground">ETA</div><div className="font-bold">{o.etaMinutes} min</div></div>
            <div className="rounded-xl bg-secondary p-3"><div className="text-muted-foreground">Distance</div><div className="font-bold">{o.distanceKm} km</div></div>
            <div className="rounded-xl bg-secondary p-3"><div className="text-muted-foreground">Payment</div><div className="font-bold uppercase">{o.payment}</div></div>
          </div>
        </section>

        {partner && (
          <section className="mt-4 rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 grid place-items-center font-bold">{partner.name.slice(0, 2)}</div>
            <div className="flex-1">
              <div className="font-bold">{partner.name}</div>
              <div className="text-xs text-muted-foreground">{partner.vehicle}</div>
            </div>
            <div className="text-xs flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{partner.rating}</div>
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Items</h2>
          <div className="space-y-2 text-sm">
            {o.items.map(i => (
              <div key={i.productId} className="flex justify-between">
                <div>
                  <div className="font-semibold">{i.qty}× {i.name}</div>
                  {i.customization?.message && <div className="text-xs text-muted-foreground">"{i.customization.message}" · {i.customization.eggless ? "Eggless" : "With egg"}{i.customization.candles ? " · Candles" : ""}{i.customization.knife ? " · Knife" : ""}</div>}
                </div>
                <div>{rupees(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <hr className="my-3 border-border" />
          <div className="text-sm space-y-1.5">
            <Row label="Subtotal" value={rupees(o.subtotal)} />
            <Row label="Delivery" value={rupees(o.deliveryFee)} />
            <Row label="Platform fee" value={rupees(o.platformFee)} />
            {o.discount > 0 && <Row label="Discount" value={`- ${rupees(o.discount)}`} />}
            <Row label="Total" value={rupees(o.total)} bold />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm"><div className="font-bold">Delivering to</div><div className="text-muted-foreground">{o.address}</div></div>
        </section>

        {canCancel && (
          <Button variant="outline" onClick={() => setConfirm(true)} className="mt-4 rounded-xl text-destructive border-destructive/40"><X className="h-4 w-4 mr-1" />Cancel order</Button>
        )}

        {canRate && (
          <section className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <h2 className="font-bold">How was your order?</h2>
            <div className="flex gap-1 mt-2">{[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setRating(n)}><Star className={`h-7 w-7 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} /></button>)}</div>
            <Button onClick={() => rateOrder(o.id, { shop: rating, partner: rating })} className="mt-3 rounded-xl gradient-primary text-primary-foreground">Submit rating</Button>
          </section>
        )}

        <ConfirmModal open={confirm} onOpenChange={setConfirm} title="Cancel this order?" description="Refund will be processed if already paid." destructive confirmLabel="Yes, cancel"
          onConfirm={() => cancelOrderCustomer(o.id, "Changed my mind")} />
      </div>
    </DemoShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-extrabold text-base" : "text-muted-foreground"}`}><span>{label}</span><span className={bold ? "text-foreground" : ""}>{value}</span></div>;
}
