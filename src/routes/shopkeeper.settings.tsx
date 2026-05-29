import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { SHOPKEEPER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { findStore, findUser } from "@/lib/demo/seed";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/shopkeeper/settings")({
  head: () => ({ meta: [{ title: "Settings — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { state, toggleStoreOpen } = useDemo();
  const user = findUser(state.currentUserId);
  const store = findStore(user?.storeId);
  if (!store) return null;
  const open = state.storeOpen[store.id] ?? store.isOpen;
  return (
    <DemoShell role="shopkeeper" nav={SHOPKEEPER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-extrabold">Store Settings</h1>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-bold">Store status</Label>
              <p className="text-xs text-muted-foreground">When closed, customers can't place new orders.</p>
            </div>
            <Switch checked={open} onCheckedChange={() => toggleStoreOpen(store.id)} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-bold">Profile</h2>
          <div className="grid gap-3">
            <div><Label className="text-xs">Store name</Label><Input defaultValue={store.name} /></div>
            <div><Label className="text-xs">Owner</Label><Input defaultValue={user?.name} /></div>
            <div><Label className="text-xs">Address</Label><Input defaultValue={store.address} /></div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
