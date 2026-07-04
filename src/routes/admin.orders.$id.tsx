import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { rupees } from "@/lib/format";
import { ADMIN_NAV } from "./admin.dashboard";
import { OrderAuditLog } from "@/components/OrderAuditLog";

export const Route = createFileRoute("/admin/orders/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const o = (await supabase.from("orders").select("*").eq("id", id).maybeSingle()).data;
      const items = (await supabase.from("order_items").select("*").eq("order_id", id)).data ?? [];
      return o ? { ...o, items } : null;
    },
  });
  if (!q.data) return <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}><div className="p-6">Loading…</div></RoleShell>;
  const o = q.data;
  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-6 max-w-3xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold">{o.order_number}</h1>
          <div className="text-sm text-muted-foreground mt-1">{o.status} • {rupees(o.total)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-sm">
          <div className="font-semibold">Shop assignment</div>
          <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
            <span>Assigned shop</span><span className="text-foreground font-mono text-xs">{o.shop_id ?? "—"}</span>
            <span>Distance</span><span className="text-foreground">{o.assignment_distance_km != null ? `${Number(o.assignment_distance_km).toFixed(2)} km` : "—"}</span>
            <span>Reason</span><span className="text-foreground">{o.assignment_reason ?? "—"}</span>
            <span>Placed at</span><span className="text-foreground">{o.placed_at ? new Date(o.placed_at).toLocaleString() : "—"}</span>
          </div>
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
