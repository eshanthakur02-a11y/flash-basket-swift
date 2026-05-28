import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/delivery/earnings")({
  head: () => ({ meta: [{ title: "Earnings" }] }),
  component: Page,
});
function Page() {
  const { state } = useDemo();
  const partnerId = state.currentUserId ?? "d1";
  const done = state.orders.filter(o => o.partnerId === partnerId && o.status === "delivered");
  const total = done.reduce((a, b) => a + b.partnerEarning, 0);
  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-extrabold">Earnings</h1>
        <div className="mt-4 rounded-3xl gradient-hero p-6 text-center">
          <div className="text-xs uppercase font-bold text-muted-foreground">Lifetime earnings</div>
          <div className="font-display text-4xl font-extrabold mt-1">{rupees(total)}</div>
          <div className="text-xs text-muted-foreground mt-1">{done.length} deliveries completed</div>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
          {done.map(o => <li key={o.id} className="p-3 flex justify-between text-sm"><span className="text-muted-foreground">#{o.id}</span><span className="font-bold">{rupees(o.partnerEarning)}</span></li>)}
          {done.length === 0 && <li className="p-6 text-center text-muted-foreground text-sm">No deliveries yet.</li>}
        </ul>
      </div>
    </DemoShell>
  );
}
