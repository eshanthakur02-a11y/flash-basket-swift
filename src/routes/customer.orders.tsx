import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { findStore } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/demo/Bits";

export const Route = createFileRoute("/customer/orders")({
  head: () => ({ meta: [{ title: "My Orders — FlashBasket" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { state } = useDemo();
  const mine = state.orders.filter(o => o.customerId === state.currentUserId);
  const active = mine.filter(o => !["delivered", "rejected_by_shop", "cancelled_by_customer", "refund_initiated"].includes(o.status));
  const past = mine.filter(o => ["delivered", "rejected_by_shop", "cancelled_by_customer", "refund_initiated"].includes(o.status));

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-extrabold">My orders</h1>

        {mine.length === 0 && <div className="mt-6"><EmptyState icon={Package} title="No orders yet" description="Place your first FlashBasket order and track it here." /></div>}

        {active.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-sm uppercase text-muted-foreground tracking-wider mb-2">Active</h2>
            <div className="space-y-3">{active.map(o => <OrderRow key={o.id} o={o} />)}</div>
          </section>
        )}
        {past.length > 0 && (
          <section className="mt-6">
            <h2 className="font-bold text-sm uppercase text-muted-foreground tracking-wider mb-2">Past orders</h2>
            <div className="space-y-3">{past.map(o => <OrderRow key={o.id} o={o} />)}</div>
          </section>
        )}
      </div>
    </DemoShell>
  );
}

function OrderRow({ o }: { o: any }) {
  const store = findStore(o.storeId);
  return (
    <Link to="/customer/orders/$id" params={{ id: o.id }} className="block rounded-2xl border border-border bg-card p-4 hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center text-2xl shrink-0">{store.image}</div>
          <div className="min-w-0">
            <div className="font-bold truncate">{o.items[0]?.name}{o.items.length > 1 && ` +${o.items.length - 1}`}</div>
            <div className="text-xs text-muted-foreground">{store.name} · #{o.id}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-extrabold">{rupees(o.total)}</div>
          <div className="mt-1"><StatusBadge status={o.status} /></div>
        </div>
      </div>
    </Link>
  );
}
