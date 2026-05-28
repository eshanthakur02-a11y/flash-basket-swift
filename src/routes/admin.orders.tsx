import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser } from "@/lib/demo/seed";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: Page,
});
function Page() {
  const { state } = useDemo();
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">All orders</h1>
        <div className="mt-4 rounded-2xl border border-border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Customer</th><th className="px-3 py-2">Shop</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead>
            <tbody>
              {state.orders.map(o => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-3 py-2 font-bold">{o.id}</td>
                  <td className="px-3 py-2">{findUser(o.customerId)?.name}</td>
                  <td className="px-3 py-2">{findStore(o.storeId).name}</td>
                  <td className="px-3 py-2">{rupees(o.total)}</td>
                  <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2"><Link to="/admin/orders/$id" params={{ id: o.id }}><Button size="sm" variant="ghost">View</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}
