import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { toast } from "sonner";
import { Truck } from "lucide-react";
import { DELIVERY_NAV } from "./delivery.dashboard";

export const Route = createFileRoute("/delivery/available-orders")({
  head: () => ({ meta: [{ title: "Available Orders — Delivery" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("available-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["available-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const orders = useQuery({
    queryKey: ["available-orders"],
    queryFn: async () => {
      const { data } = await supabase.rpc("partner_available_orders");
      return (data ?? []) as Array<{ id: string; order_number: string; total: number; city: string | null; area_pincode: string | null; item_count: number; shop_name: string | null }>;
    },
    refetchInterval: 5000,
  });

  const accept = async (id: string) => {
    const { error } = await supabase.rpc("partner_accept_order", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Accepted! Start delivery.");
  };

  return (
    <RoleShell role="delivery" nav={DELIVERY_NAV} requireRoles={["delivery", "admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold flex items-center gap-2"><Truck className="h-7 w-7 text-primary" />My assignments</h1>
        <p className="text-sm text-muted-foreground mt-1">Orders your shop has assigned to you. Accept to start delivery.</p>
        <div className="mt-5 space-y-3">
          {(orders.data ?? []).map(o => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="font-bold">{o.order_number} • {rupees(o.total)}</div>
                <div className="text-xs text-muted-foreground">{[o.shop_name, o.city, o.area_pincode].filter(Boolean).join(" • ")} · {o.item_count} item{o.item_count === 1 ? "" : "s"}</div>
              </div>
              <Button size="sm" onClick={() => accept(o.id)} className="rounded-xl gradient-primary text-primary-foreground">Accept</Button>
            </div>
          ))}
          {(orders.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No assignments yet. Your shopkeeper will pick you for an order.</div>}
        </div>
      </div>
    </RoleShell>
  );
}
