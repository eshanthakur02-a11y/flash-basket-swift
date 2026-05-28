import { createFileRoute, useNavigate, useParams, notFound } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser } from "@/lib/demo/seed";
import { OrderTimeline } from "@/components/demo/OrderTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rupees } from "@/lib/format";
import { ChevronLeft, MapPin, Phone, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/delivery/task/$id")({
  head: () => ({ meta: [{ title: "Delivery task" }] }),
  component: Page,
  notFoundComponent: () => <div className="p-10 text-center">Task not found</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
});

const DEMO_OTP = "4821";

function Page() {
  const { id } = useParams({ from: "/delivery/task/$id" });
  const { state, advanceOrder, completeDelivery } = useDemo();
  const navigate = useNavigate();
  const o = state.orders.find(x => x.id === id);
  if (!o) throw notFound();
  const store = findStore(o.storeId);
  const cust = findUser(o.customerId);
  const [otp, setOtp] = useState("");

  function verifyOtp() {
    if (otp === DEMO_OTP) { completeDelivery(o!.id); navigate({ to: "/delivery/dashboard" }); }
    else toast.error("Wrong OTP. Hint: 4821");
  }

  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <button onClick={() => navigate({ to: "/delivery/dashboard" })} className="flex items-center gap-1 text-sm text-muted-foreground mb-3"><ChevronLeft className="h-4 w-4" />Back</button>
        <div className="text-xs text-muted-foreground">Task #{o.id}</div>
        <h1 className="font-display text-2xl font-extrabold">{store.name} → {cust?.name}</h1>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4"><OrderTimeline order={o} role="delivery" /></section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3"><Store className="h-4 w-4 text-primary mt-0.5" /><div className="text-sm"><div className="font-bold">Pickup</div><div className="text-muted-foreground">{store.address}</div></div></div>
          <div className="flex items-start gap-3 mt-3"><MapPin className="h-4 w-4 text-primary mt-0.5" /><div className="text-sm"><div className="font-bold">Drop</div><div className="text-muted-foreground">{o.address}</div></div></div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{cust?.phone}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-secondary p-2"><div className="text-muted-foreground">Distance</div><div className="font-bold">{o.distanceKm} km</div></div>
            <div className="rounded-xl bg-secondary p-2"><div className="text-muted-foreground">Earning</div><div className="font-bold">{rupees(o.partnerEarning)}</div></div>
            <div className="rounded-xl bg-secondary p-2"><div className="text-muted-foreground">Payment</div><div className="font-bold uppercase">{o.payment}</div></div>
          </div>
        </section>

        <div className="mt-4 space-y-2">
          {o.status === "partner_assigned" && <Button onClick={() => advanceOrder(o.id, "partner_at_shop")} className="w-full rounded-xl gradient-primary text-primary-foreground h-11">Arrived at store</Button>}
          {o.status === "partner_at_shop" && <Button onClick={() => advanceOrder(o.id, "picked_up")} className="w-full rounded-xl gradient-primary text-primary-foreground h-11">Picked up order</Button>}
          {o.status === "picked_up" && <Button onClick={() => advanceOrder(o.id, "out_for_delivery")} className="w-full rounded-xl gradient-primary text-primary-foreground h-11">Start delivery</Button>}
          {o.status === "out_for_delivery" && (
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
              <div className="font-bold mb-2">Enter delivery OTP from customer</div>
              <div className="text-xs text-muted-foreground mb-2">Demo OTP: <span className="font-bold text-foreground">4821</span></div>
              <div className="flex gap-2">
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="••••" maxLength={4} className="h-11 rounded-xl text-center text-xl tracking-[0.5em] font-bold" />
                <Button onClick={verifyOtp} className="rounded-xl gradient-primary text-primary-foreground">Verify & complete</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
