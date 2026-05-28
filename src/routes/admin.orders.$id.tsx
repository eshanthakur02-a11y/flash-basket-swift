import { createFileRoute, useParams, notFound, useNavigate } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser, USERS, STATUS_LABELS } from "@/lib/demo/seed";
import { OrderTimeline } from "@/components/demo/OrderTimeline";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/admin/orders/$id")({
  head: () => ({ meta: [{ title: "Order — Admin" }] }),
  component: Page,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
});

function Page() {
  const { id } = useParams({ from: "/admin/orders/$id" });
  const { state, assignPartner } = useDemo();
  const navigate = useNavigate();
  const o = state.orders.find(x => x.id === id);
  if (!o) throw notFound();
  const partners = USERS.filter(u => u.role === "delivery");

  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <button onClick={() => navigate({ to: "/admin/orders" })} className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><ChevronLeft className="h-4 w-4" />All orders</button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><div className="text-xs text-muted-foreground">#{o.id}</div><h1 className="font-display text-2xl font-extrabold">{findStore(o.storeId).name} → {findUser(o.customerId)?.name}</h1></div>
          <StatusBadge status={o.status} />
        </div>
        <section className="mt-4 rounded-2xl border border-border bg-card p-5"><OrderTimeline order={o} role="admin" /></section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Manual assign partner</h2>
          <div className="flex flex-wrap gap-2">
            {partners.map(p => (
              <Button key={p.id} variant={o.partnerId === p.id ? "default" : "outline"} className="rounded-xl text-xs" onClick={() => assignPartner(o.id, p.id)} disabled={!["ready", "finding_partner"].includes(o.status)}>{p.name}</Button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Full timeline</h2>
          <ol className="text-sm space-y-2">
            {o.timeline.map((t, i) => <li key={i} className="flex justify-between gap-3"><span>{STATUS_LABELS[t.status] ?? t.label} <span className="text-xs text-muted-foreground">· {t.actor}</span></span><span className="text-xs text-muted-foreground">{new Date(t.at).toLocaleTimeString()}</span></li>)}
          </ol>
          <div className="text-sm mt-3 pt-3 border-t border-border flex justify-between font-bold"><span>Total</span><span>{rupees(o.total)}</span></div>
        </section>
      </div>
    </DemoShell>
  );
}
