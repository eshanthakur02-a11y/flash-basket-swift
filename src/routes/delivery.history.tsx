import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";

export const Route = createFileRoute("/delivery/history")({
  head: () => ({ meta: [{ title: "History" }] }),
  component: Page,
});
function Page() {
  const { state } = useDemo();
  const partnerId = state.currentUserId ?? "d1";
  const list = state.orders.filter(o => o.partnerId === partnerId);
  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-extrabold">Delivery history</h1>
        <div className="mt-4 space-y-3">
          {list.map(o => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-3 flex items-center justify-between">
              <div><div className="text-xs text-muted-foreground">#{o.id}</div><div className="font-bold text-sm">{findStore(o.storeId).name} → {findUser(o.customerId)?.name}</div></div>
              <StatusBadge status={o.status} />
            </div>
          ))}
          {list.length === 0 && <div className="text-center text-muted-foreground py-10 text-sm">Nothing yet.</div>}
        </div>
      </div>
    </DemoShell>
  );
}
