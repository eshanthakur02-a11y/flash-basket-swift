import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore } from "@/lib/demo/seed";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/delivery/available-orders")({
  head: () => ({ meta: [{ title: "Available tasks" }] }),
  component: Page,
});
function Page() {
  const { state, acceptDelivery } = useDemo();
  const partnerId = state.currentUserId ?? "d1";
  const list = state.orders.filter(o => !o.partnerId && ["ready", "finding_partner"].includes(o.status));
  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-extrabold">Available tasks</h1>
        <div className="mt-4 space-y-3">
          {list.length === 0 && <div className="text-sm text-muted-foreground text-center py-10">No tasks available.</div>}
          {list.map(o => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="font-bold">{findStore(o.storeId).name}</div>
              <div className="text-xs text-muted-foreground">{o.distanceKm} km · earn {rupees(o.partnerEarning)}</div>
              <Button onClick={() => acceptDelivery(o.id, partnerId)} className="mt-2 rounded-xl gradient-primary text-primary-foreground">Accept</Button>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
