import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { STORES, findUser } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

export const Route = createFileRoute("/admin/shops")({
  head: () => ({ meta: [{ title: "Shops — Admin" }] }),
  component: Page,
});
function Page() {
  const { state, toggleStoreOpen } = useDemo();
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Shops</h1>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STORES.map(s => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center text-2xl">{s.image}</div>
                <div className="flex-1"><div className="font-bold">{s.name}</div><div className="text-xs text-muted-foreground">{findUser(s.ownerId)?.name}</div></div>
                <Switch checked={state.storeOpen[s.id]} onCheckedChange={() => toggleStoreOpen(s.id)} />
              </div>
              <div className="mt-3 text-xs flex items-center gap-3 text-muted-foreground"><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{s.rating}</span><span>{s.etaMin}-{s.etaMax} min</span></div>
              <div className="text-xs text-muted-foreground mt-1">{s.address}</div>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
