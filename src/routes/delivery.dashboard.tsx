import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser } from "@/lib/demo/seed";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/demo/StatusBadge";
import { rupees } from "@/lib/format";
import { Bike, MapPin, Wallet } from "lucide-react";

export const Route = createFileRoute("/delivery/dashboard")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { state, togglePartnerOnline } = useDemo();
  const user = findUser(state.currentUserId);
  const partnerId = user?.id ?? "d1";
  const online = state.partnerOnline[partnerId];
  const myTasks = state.orders.filter(o => o.partnerId === partnerId && ["partner_assigned", "partner_at_shop", "picked_up", "out_for_delivery"].includes(o.status));
  const available = state.orders.filter(o => !o.partnerId && ["ready", "finding_partner"].includes(o.status));
  const earnings = state.orders.filter(o => o.partnerId === partnerId && o.status === "delivered").reduce((a, b) => a + b.partnerEarning, 0);

  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 py-5 max-w-3xl mx-auto space-y-5">
        <div className="rounded-3xl gradient-hero p-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Hey {user?.name?.split(" ")[0]}</h1>
            <div className="text-sm text-muted-foreground">{user?.vehicle}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Switch checked={online} onCheckedChange={() => togglePartnerOnline(partnerId)} />
            <span className="text-[11px] font-bold">{online ? "Online" : "Offline"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<Bike />} label="Active" value={myTasks.length.toString()} />
          <Stat icon={<MapPin />} label="Available" value={available.length.toString()} />
          <Stat icon={<Wallet />} label="Today" value={rupees(earnings)} />
        </div>

        <section>
          <h2 className="font-bold mb-3">Active tasks</h2>
          {myTasks.length === 0 ? <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">No active deliveries.</div> :
            myTasks.map(o => (
              <Link key={o.id} to="/delivery/task/$id" params={{ id: o.id }} className="block rounded-2xl border border-primary/40 bg-primary/5 p-4 mb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div><div className="text-xs text-muted-foreground">#{o.id}</div><div className="font-bold">{findStore(o.storeId).name} → {findUser(o.customerId)?.name}</div></div>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))
          }
        </section>

        <section>
          <h2 className="font-bold mb-3">Available orders</h2>
          {available.length === 0 ? <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">Nothing nearby right now.</div> :
            available.map(o => (
              <AvailableCard key={o.id} o={o} partnerId={partnerId} />
            ))
          }
        </section>
      </div>
    </DemoShell>
  );
}

function AvailableCard({ o, partnerId }: { o: any; partnerId: string }) {
  const { acceptDelivery, rejectDelivery } = useDemo();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-muted-foreground">#{o.id} · {o.distanceKm} km · earn {rupees(o.partnerEarning)}</div>
          <div className="font-bold">{findStore(o.storeId).name}</div>
          <div className="text-xs text-muted-foreground">→ {o.address}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => rejectDelivery(o.id, partnerId, "Too far")} variant="outline" className="rounded-xl">Skip</Button>
          <Button onClick={() => acceptDelivery(o.id, partnerId)} className="rounded-xl gradient-primary text-primary-foreground">Accept</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-card p-3"><div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground"><span>{label}</span><span className="text-primary">{icon}</span></div><div className="font-display text-xl font-extrabold mt-1">{value}</div></div>;
}
