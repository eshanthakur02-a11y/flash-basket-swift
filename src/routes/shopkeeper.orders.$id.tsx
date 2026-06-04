import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { rupees } from "@/lib/format";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
import { OrderAuditLog } from "@/components/OrderAuditLog";

export const Route = createFileRoute("/shopkeeper/orders/$id")({
  head: () => ({ meta: [{ title: "Order — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["shop-order", id],
    queryFn: async () => {
      const o = (await supabase.from("orders").select("*").eq("id", id).maybeSingle()).data;
      const items = (await supabase.from("order_items").select("*").eq("order_id", id)).data ?? [];
      return o ? { ...o, items } : null;
    },
  });
  if (!q.data) return <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper","admin"]}><div className="p-6">Loading…</div></RoleShell>;
  const o = q.data;
  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper","admin"]}>
      <div className="p-6 max-w-3xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold">{o.order_number}</h1>
          <div className="text-sm text-muted-foreground mt-1">{o.status.replace(/_/g," ")} • {rupees(o.total)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {o.items.map((it: any) => (
            <div key={it.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{it.name} × {it.quantity}</span>
              <span className="font-bold">{rupees(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>
        <OrderAuditLog orderId={o.id} />
      </div>
    </RoleShell>
  );
}
