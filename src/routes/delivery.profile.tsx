import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { DELIVERY_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findUser } from "@/lib/demo/seed";
import { Star, Bike, Mail } from "lucide-react";

export const Route = createFileRoute("/delivery/profile")({
  head: () => ({ meta: [{ title: "Profile — Delivery" }] }),
  component: Page,
});

function Page() {
  const { state, togglePartnerOnline } = useDemo();
  const user = findUser(state.currentUserId);
  if (!user) return null;
  const online = state.partnerOnline[user.id] ?? false;
  return (
    <DemoShell role="delivery" nav={DELIVERY_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-2xl space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-foreground text-background grid place-items-center font-extrabold text-xl">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold">{user.name}</h1>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" /> {user.rating} rating
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
          <Row icon={<Bike className="h-4 w-4" />} label="Vehicle" value={user.vehicle ?? ""} />
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm font-bold">Status</div>
            <button
              onClick={() => togglePartnerOnline(user.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${online ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >
              {online ? "● Online" : "○ Offline"}
            </button>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-xs text-muted-foreground w-20">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
