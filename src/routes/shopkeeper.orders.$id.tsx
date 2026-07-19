import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, PackageCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { rupees } from "@/lib/format";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
import { OrderAuditLog } from "@/components/OrderAuditLog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    refetchInterval: 5000,
  });
  if (!q.data) return <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper","admin"]}><div className="p-6">Loading…</div></RoleShell>;
  const o = q.data;
  const accept = async () => {
    const { error } = await supabase.rpc("shop_accept_order", { _order_id: o.id });
    if (error) toast.error(error.message);
    else { toast.success("Order accepted"); q.refetch(); }
  };
  const reject = async () => {
    const reason = window.prompt("Reason for rejecting this order? (optional)") ?? null;
    const { error } = await (supabase.rpc as any)("shop_reject_order", { _order_id: o.id, _reason: reason });
    if (error) toast.error(error.message);
    else { toast.success("Order rejected — re-routing to next shop"); q.refetch(); }
  };
  const pack = async () => {
    const { error } = await supabase.rpc("shop_mark_packed", { _order_id: o.id });
    if (error) toast.error(error.message);
    else { toast.success("Marked packed"); q.refetch(); }
  };
  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper","admin"]}>
      <div className="p-6 max-w-3xl space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold">{o.order_number}</h1>
            <div className="text-sm text-muted-foreground mt-1">{o.status.replace(/_/g," ")} • {rupees(o.total)}</div>
          </div>
          <div className="flex gap-2">
            {o.status === "awaiting_shop" && (
              <>
                <Button size="sm" onClick={accept} className="rounded-xl"><Check className="h-3 w-3 mr-1" />Accept</Button>
                <Button size="sm" variant="outline" onClick={reject} className="rounded-xl"><X className="h-3 w-3 mr-1" />Reject</Button>
              </>
            )}
            {o.status === "accepted_by_shop" && (
              <Button size="sm" onClick={pack} className="rounded-xl"><PackageCheck className="h-3 w-3 mr-1" />Mark packed</Button>
            )}
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
