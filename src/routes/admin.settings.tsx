import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { ADMIN_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: Page,
});

function Page() {
  const { resetScenario } = useDemo();
  return (
    <DemoShell role="admin" nav={ADMIN_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-2xl space-y-5">
        <h1 className="font-display text-3xl font-extrabold">Platform Settings</h1>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-bold">Demo data</h2>
          <p className="text-sm text-muted-foreground">Reset all orders, notifications, cart and activity back to the initial seed state.</p>
          <Button
            variant="destructive"
            onClick={() => {
              resetScenario();
              toast.success("Demo scenario reset");
            }}
          >
            Reset Demo Scenario
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-bold">Platform info</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Platform" value="FlashBasket" />
            <Stat label="Version" value="1.0.0-demo" />
            <Stat label="Commission" value="12%" />
            <Stat label="Delivery radius" value="6 km" />
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
