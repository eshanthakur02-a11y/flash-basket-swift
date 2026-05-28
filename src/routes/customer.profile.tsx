import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { LogOut, MapPin, Package, Star } from "lucide-react";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({ meta: [{ title: "Profile — FlashBasket" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { state, logout } = useDemo();
  const navigate = useNavigate();
  const user = findUser(state.currentUserId);
  const orders = state.orders.filter(o => o.customerId === state.currentUserId);
  const spent = orders.filter(o => o.status === "delivered").reduce((a, b) => a + b.total, 0);

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-3xl mx-auto space-y-5">
        <div className="rounded-3xl gradient-hero p-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-card border-2 border-primary grid place-items-center font-display text-2xl font-extrabold">{user?.name?.slice(0, 2)}</div>
            <div>
              <h1 className="font-display text-2xl font-extrabold">{user?.name}</h1>
              <div className="text-sm text-muted-foreground">{user?.email} · {user?.phone}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<Package className="h-5 w-5" />} label="Orders" value={orders.length.toString()} />
          <Stat icon={<Star className="h-5 w-5" />} label="Spent" value={rupees(spent)} />
          <Stat icon={<MapPin className="h-5 w-5" />} label="Saved" value="2" />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-2">Saved address</h2>
          <div className="text-sm text-muted-foreground">{user?.address}</div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold mb-3">Settings</h2>
          <div className="text-sm space-y-2 text-muted-foreground">
            <div className="flex justify-between"><span>Notifications</span><span>On</span></div>
            <div className="flex justify-between"><span>Language</span><span>English</span></div>
            <div className="flex justify-between"><span>App version</span><span>2.4.1</span></div>
          </div>
        </section>

        <Button variant="outline" className="w-full rounded-xl text-destructive" onClick={() => { logout(); navigate({ to: "/login" }); }}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
      </div>
    </DemoShell>
  );
}

function Stat({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-primary">{icon}</div>
      <div className="text-xs text-muted-foreground font-semibold uppercase mt-2">{label}</div>
      <div className="font-display text-xl font-extrabold">{value}</div>
    </div>
  );
}
