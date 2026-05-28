import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/shopkeeper/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { state } = useDemo();
  const user = findUser(state.currentUserId);
  const delivered = state.orders.filter(o => o.storeId === (user?.storeId ?? "store1") && o.status === "delivered");
  const gross = delivered.reduce((a, b) => a + b.total, 0);
  const platformCut = Math.round(gross * 0.15);
  const net = gross - platformCut;
  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold">Earnings</h1>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Gross sales" value={rupees(gross)} />
          <Stat label="Platform fee" value={rupees(platformCut)} />
          <Stat label="Net payout" value={rupees(net)} highlight />
        </div>
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Recent payouts</h2>
          <ul className="text-sm divide-y divide-border">
            {delivered.slice(0, 10).map(o => (
              <li key={o.id} className="py-2 flex justify-between"><span className="text-muted-foreground">#{o.id}</span><span className="font-bold">{rupees(o.total)}</span></li>
            ))}
            {delivered.length === 0 && <div className="text-muted-foreground py-4">No completed orders yet.</div>}
          </ul>
        </section>
      </div>
    </DemoShell>
  );
}
function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${highlight ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}><div className="text-xs uppercase font-bold text-muted-foreground">{label}</div><div className="font-display text-2xl font-extrabold mt-1">{value}</div></div>;
}
