import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { STORES, findStore } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: Page,
});
function Page() {
  const { state } = useDemo();
  const delivered = state.orders.filter(o => o.status === "delivered");
  const revenue = delivered.reduce((a, b) => a + b.total, 0);
  const byStore = STORES.map(s => {
    const so = delivered.filter(o => o.storeId === s.id);
    return { store: s, orders: so.length, total: so.reduce((a, b) => a + b.total, 0) };
  });

  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Reports</h1>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Total orders" value={state.orders.length.toString()} />
          <Stat label="Completed" value={delivered.length.toString()} />
          <Stat label="Gross revenue" value={rupees(revenue)} />
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Revenue by shop</h2>
          <div className="space-y-3">
            {byStore.map(({ store, orders, total }) => (
              <div key={store.id}>
                <div className="flex justify-between text-sm font-bold"><span>{store.image} {store.name}</span><span>{rupees(total)}</span></div>
                <div className="mt-1 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full gradient-primary" style={{ width: `${revenue > 0 ? (total / revenue) * 100 : 0}%` }} /></div>
                <div className="text-[11px] text-muted-foreground mt-1">{orders} orders</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DemoShell>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="text-xs uppercase font-bold text-muted-foreground">{label}</div><div className="font-display text-2xl font-extrabold mt-1">{value}</div></div>;
}
