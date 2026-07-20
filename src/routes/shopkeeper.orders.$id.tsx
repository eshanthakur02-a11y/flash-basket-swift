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
  const o = q.data as any;
  const isChild = !!o.parent_order_id;
  const accept = async () => {
    const { error } = await (supabase.rpc as any)(isChild ? "shop_accept_child" : "shop_accept_order",
      isChild ? { _child_id: o.id, _prep_minutes: 15 } : { _order_id: o.id });
    if (error) toast.error(error.message);
    else { toast.success("Order accepted"); q.refetch(); }
  };
  const reject = async () => {
    const reason = window.prompt("Reason for rejecting this order? (optional)") ?? null;
    const { error } = await (supabase.rpc as any)(isChild ? "shop_reject_child" : "shop_reject_order",
      isChild ? { _child_id: o.id, _reason: reason } : { _order_id: o.id, _reason: reason });
    if (error) toast.error(error.message);
    else { toast.success("Order rejected — searching replacement shop"); q.refetch(); }
  };
  const pack = async () => {
    const { error } = await (supabase.rpc as any)(isChild ? "shop_mark_child_ready" : "shop_mark_packed",
      isChild ? { _child_id: o.id } : { _order_id: o.id });
    if (error) toast.error(error.message);
    else { toast.success("Marked ready"); q.refetch(); }
  };
  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper","admin"]}>
      <div className="p-6 max-w-3xl space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold">{o.order_number}</h1>
            <div className="text-sm text-muted-foreground mt-1">{o.status.replace(/_/g," ")} • {rupees(o.total)}</div>
            {isChild && <div className="text-xs text-primary font-semibold mt-1">Part of a multi-shop order</div>}
          </div>
          <div className="flex gap-2">
            {o.status === "awaiting_shop" && (
              <>
                <Button size="sm" onClick={accept} className="rounded-xl"><Check className="h-3 w-3 mr-1" />Accept</Button>
                <Button size="sm" variant="outline" onClick={reject} className="rounded-xl"><X className="h-3 w-3 mr-1" />Reject</Button>
              </>
            )}
            {o.status === "accepted_by_shop" && (
              <Button size="sm" onClick={pack} className="rounded-xl"><PackageCheck className="h-3 w-3 mr-1" />Mark ready</Button>
            )}
          </div>
        </div>
        {o.pickup_otp && o.status !== "awaiting_shop" && o.status !== "cancelled" && (
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="text-xs uppercase font-bold text-muted-foreground">Pickup OTP</div>
            <div className="mt-1 font-mono text-3xl font-black tracking-widest text-primary">{o.pickup_otp}</div>
            <div className="text-xs text-muted-foreground mt-1">Share this code with the delivery partner at handover.</div>
          </div>
        )}
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
