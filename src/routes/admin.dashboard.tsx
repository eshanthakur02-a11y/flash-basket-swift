import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { USERS, STORES, findUser, findStore } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { Users, ShoppingBag, TrendingUp, Bike, RotateCcw, Store } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { state, resetScenario } = useDemo();
  const customers = USERS.filter(u => u.role === "customer").length;
  const partners = USERS.filter(u => u.role === "delivery").length;
  const revenue = state.orders.filter(o => o.status === "delivered").reduce((a, b) => a + b.total, 0);
  const active = state.orders.filter(o => !["delivered", "rejected_by_shop", "cancelled_by_customer", "refund_initiated"].includes(o.status));

  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="font-display text-3xl font-extrabold">Platform overview</h1><div className="text-sm text-muted-foreground">Realtime metrics across the FlashBasket network</div></div>
          <Button variant="outline" onClick={resetScenario} className="rounded-xl"><RotateCcw className="h-4 w-4 mr-1" />Reset demo scenario</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<TrendingUp />} label="Revenue" value={rupees(revenue)} />
          <Stat icon={<ShoppingBag />} label="Orders" value={state.orders.length.toString()} />
          <Stat icon={<Users />} label="Customers" value={customers.toString()} />
          <Stat icon={<Bike />} label="Partners" value={partners.toString()} />
        </div>

        <section>
          <h2 className="font-bold mb-3">Live orders ({active.length})</h2>
          <div className="rounded-2xl border border-border bg-card overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left"><tr><th className="px-3 py-2">Order</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Shop</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
              <tbody>
                {active.map(o => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-3 py-2 font-bold">#{o.id}</td>
                    <td className="px-3 py-2">{findUser(o.customerId)?.name}</td>
                    <td className="px-3 py-2">{findStore(o.storeId).name}</td>
                    <td className="px-3 py-2">{rupees(o.total)}</td>
                    <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-2"><Link to="/admin/orders/$id" params={{ id: o.id }}><Button size="sm" variant="ghost">View</Button></Link></td>
                  </tr>
                ))}
                {active.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No live orders.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-bold mb-3">Activity feed</h2>
          <ul className="rounded-2xl border border-border bg-card divide-y divide-border max-h-72 overflow-auto">
            {state.activity.map(a => <li key={a.id} className="px-4 py-2 text-sm flex justify-between"><span>{a.text}</span><span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleTimeString()}</span></li>)}
          </ul>
        </section>
      </div>
    </DemoShell>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><div className="flex justify-between items-center text-xs uppercase font-bold text-muted-foreground"><span>{label}</span><span className="text-primary">{icon}</span></div><div className="font-display text-2xl font-extrabold mt-1">{value}</div></div>;
}
