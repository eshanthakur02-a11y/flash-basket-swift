import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { toast } from "sonner";
import { LayoutDashboard, ListOrdered, Package, Wallet, Bell, Star, Settings, Check, X, PackageCheck } from "lucide-react";

const NAV = [
  { to: "/shopkeeper/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/shopkeeper/orders", label: "Orders", icon: ListOrdered },
  { to: "/shopkeeper/products", label: "Products", icon: Package },
  { to: "/shopkeeper/earnings", label: "Earnings", icon: Wallet },
  { to: "/shopkeeper/notifications", label: "Alerts", icon: Bell },
  { to: "/shopkeeper/reviews", label: "Reviews", icon: Star },
  { to: "/shopkeeper/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/shopkeeper/dashboard")({
  head: () => ({ meta: [{ title: "Shopkeeper Dashboard — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);

  // Load my shop
  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => {
      setShopId(data?.id ?? null);
    });
  }, [user]);

  // Realtime: refetch on any orders change for my shop
  useEffect(() => {
    if (!shopId) return;
    const ch = supabase
      .channel("shop-orders-" + shopId)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `shop_id=eq.${shopId}` }, () => {
        qc.invalidateQueries({ queryKey: ["shop-orders", shopId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [shopId, qc]);

  const orders = useQuery({
    queryKey: ["shop-orders", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, placed_at, assignment_expires_at, address")
        .eq("shop_id", shopId)
        .order("placed_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
    enabled: !!shopId,
    refetchInterval: 10000,
  });

  const accept = async (id: string) => {
    const { error } = await supabase.rpc("shop_accept_order", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Order accepted");
  };
  const reject = async (id: string) => {
    const { error } = await supabase.rpc("shop_reject_order", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Order rejected — re-routing");
  };
  const pack = async (id: string) => {
    const { error } = await supabase.rpc("shop_mark_packed", { _order_id: id });
    if (error) toast.error(error.message); else toast.success("Marked packed");
  };

  return (
    <RoleShell role="shopkeeper" nav={NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold">Shop dashboard</h1>
        {!shopId ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">You don't own a shop yet. Ask an admin to assign one.</p>
          </div>
        ) : (
          <>
            <section className="mt-5 grid md:grid-cols-3 gap-3">
              <Stat label="Awaiting" value={String(orders.data?.filter(o => o.status === "awaiting_shop").length ?? 0)} />
              <Stat label="In progress" value={String(orders.data?.filter(o => ["accepted_by_shop", "packed"].includes(o.status)).length ?? 0)} />
              <Stat label="Delivered today" value={String(orders.data?.filter(o => o.status === "delivered").length ?? 0)} />
            </section>

            <section className="mt-6">
              <h2 className="font-bold mb-3">Live orders</h2>
              <div className="space-y-3">
                {(orders.data ?? []).map(o => (
                  <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="font-bold">{o.order_number}</div>
                      <div className="text-xs text-muted-foreground">{rupees(o.total)} • {o.status.replace(/_/g, " ")}</div>
                      <div className="text-xs text-muted-foreground">{(o.address as any)?.name} — {(o.address as any)?.line1}</div>
                    </div>
                    <div className="flex gap-2">
                      {o.status === "awaiting_shop" && (
                        <>
                          <Button size="sm" onClick={() => accept(o.id)} className="rounded-xl"><Check className="h-3 w-3 mr-1" />Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => reject(o.id)} className="rounded-xl"><X className="h-3 w-3 mr-1" />Reject</Button>
                        </>
                      )}
                      {o.status === "accepted_by_shop" && (
                        <Button size="sm" onClick={() => pack(o.id)} className="rounded-xl"><PackageCheck className="h-3 w-3 mr-1" />Mark packed</Button>
                      )}
                    </div>
                  </div>
                ))}
                {(orders.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
              </div>
            </section>
          </>
        )}
      </div>
    </RoleShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground font-semibold">{label}</div>
      <div className="font-display text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export { NAV as SHOPKEEPER_NAV };
