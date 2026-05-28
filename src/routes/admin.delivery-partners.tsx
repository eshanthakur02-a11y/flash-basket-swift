import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { USERS } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/admin/delivery-partners")({
  head: () => ({ meta: [{ title: "Delivery — Admin" }] }),
  component: Page,
});
function Page() {
  const { state, togglePartnerOnline } = useDemo();
  const partners = USERS.filter(u => u.role === "delivery");
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Delivery partners</h1>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {partners.map(p => {
            const earnings = state.orders.filter(o => o.partnerId === p.id && o.status === "delivered").reduce((a, b) => a + b.partnerEarning, 0);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 grid place-items-center font-bold text-sm">{p.name.slice(0,2)}</div>
                  <div className="flex-1"><div className="font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.vehicle}</div></div>
                  <Switch checked={state.partnerOnline[p.id]} onCheckedChange={() => togglePartnerOnline(p.id)} />
                </div>
                <div className="mt-3 text-xs flex justify-between text-muted-foreground"><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating}</span><span>Earnings: <b className="text-foreground">{rupees(earnings)}</b></span></div>
              </div>
            );
          })}
        </div>
      </div>
    </DemoShell>
  );
}
