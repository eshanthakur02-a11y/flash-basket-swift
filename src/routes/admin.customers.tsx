import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { USERS } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: Page,
});
function Page() {
  const { state } = useDemo();
  const customers = USERS.filter(u => u.role === "customer");
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Customers</h1>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {customers.map(c => {
            const orders = state.orders.filter(o => o.customerId === c.id);
            const spent = orders.filter(o => o.status === "delivered").reduce((a, b) => a + b.total, 0);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email} · {c.phone}</div>
                <div className="mt-2 text-xs flex gap-4"><span>Orders <b className="text-foreground">{orders.length}</b></span><span>Spent <b className="text-foreground">{rupees(spent)}</b></span></div>
              </div>
            );
          })}
        </div>
      </div>
    </DemoShell>
  );
}
