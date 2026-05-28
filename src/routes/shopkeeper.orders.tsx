import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/shopkeeper/orders")({
  head: () => ({ meta: [{ title: "Orders — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { state } = useDemo();
  const user = findUser(state.currentUserId);
  const orders = state.orders.filter(o => o.storeId === (user?.storeId ?? "store1"));
  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">All orders</h1>
        <div className="mt-5 space-y-3">
          {orders.map(o => (
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
      </div>
    </DemoShell>
  );
}
