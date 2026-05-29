import { createFileRoute } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/customer/notifications")({
  head: () => ({ meta: [{ title: "Notifications" }] }),
  component: Page,
});

function Page() {
  const { state, markNotificationRead, markAllRead } = useDemo();
  const list = state.notifications.filter((n) => n.role === "customer");
  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 md:px-6 py-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold">Notifications</h1>
          <Button variant="outline" size="sm" onClick={() => markAllRead("customer")}>Mark all read</Button>
        </div>
        <div className="mt-4 divide-y border border-border rounded-2xl bg-card overflow-hidden">
          {list.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>}
          {list.map((n) => (
            <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`block w-full text-left px-4 py-3 hover:bg-secondary/40 ${!n.read ? "bg-primary/5" : ""}`}>
              <div className="font-bold text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.at).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
