import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { rupees } from "@/lib/format";
import { Truck, Activity, BarChart3, Circle, UserPlus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/shopkeeper/delivery")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle()
      .then(({ data }) => setShopId(data?.id ?? null));
  }, [user]);

  const orders = useQuery({
    queryKey: ["shop-delivery-orders", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, status, address, partner_id, placed_at, updated_at")
        .eq("shop_id", shopId)
        .in("status", ["packed", "out_for_delivery"])
        .order("placed_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
    refetchInterval: 8000,
  });

  const partners = useQuery({
    queryKey: ["online-partners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("delivery_partners")
        .select("id, name, phone, is_online, current_lat, current_lng, rating")
        .order("is_online", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 10000,
  });

  const perf = useQuery({
    queryKey: ["shop-perf", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase.rpc("shop_partner_performance", { _shop_id: shopId });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!shopId,
    refetchInterval: 15000,
  });

  const assign = async (orderId: string, partnerId: string) => {
    const { error } = await supabase.rpc("shop_assign_partner", { _order_id: orderId, _partner_id: partnerId });
    if (error) toast.error(error.message);
    else { toast.success("Partner assigned"); qc.invalidateQueries({ queryKey: ["shop-delivery-orders", shopId] }); }
  };

  const partnerById = (id: string | null) => (partners.data ?? []).find((p: any) => p.id === id);

  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);

  const deletePartner = async (id: string) => {
    const { error } = await supabase.rpc("delete_delivery_partner", { _partner_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Partner removed");
    setConfirmDel(null);
    qc.invalidateQueries({ queryKey: ["online-partners"] });
    qc.invalidateQueries({ queryKey: ["shop-perf", shopId] });
  };

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" />
              Delivery Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Add or remove delivery boys, assign live orders, and track performance.</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-1" />Add delivery boy</Button>
            </DialogTrigger>
            <AddPartnerDialog onDone={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["online-partners"] }); qc.invalidateQueries({ queryKey: ["shop-perf", shopId] }); }} />
          </Dialog>
        </header>

        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Active orders</h2>
          <div className="space-y-3">
            {(orders.data ?? []).map((o: any) => {
              const p = partnerById(o.partner_id);
              return (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0">
                    <div className="font-bold">{o.order_number} <span className="text-muted-foreground font-normal">• {rupees(o.total)}</span></div>
                    <div className="text-xs text-muted-foreground">{o.status.replace(/_/g, " ")} · {(o.address as any)?.line1}, {(o.address as any)?.city}</div>
                    <div className="text-xs mt-1">
                      {p ? (
                        <span className="inline-flex items-center gap-1">
                          <Circle className={`h-2 w-2 ${p.is_online ? "fill-green-500 text-green-500" : "fill-muted text-muted"}`} />
                          <span className="font-semibold">{p.name}</span> · {p.phone ?? "—"}
                        </span>
                      ) : <span className="text-yellow-600 font-semibold">Unassigned</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(v) => assign(o.id, v)}>
                      <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder={p ? "Re-assign" : "Assign partner"} /></SelectTrigger>
                      <SelectContent>
                        {(partners.data ?? []).filter((pp: any) => pp.is_online).map((pp: any) => (
                          <SelectItem key={pp.id} value={pp.id}>{pp.name} {pp.is_online ? "🟢" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
            {(orders.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No active deliveries.</div>}
          </div>
        </section>

        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Partner performance</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Partner</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Today</th>
                  <th className="text-right px-3 py-2">7d</th>
                  <th className="text-right px-3 py-2">Avg min</th>
                  <th className="text-right px-3 py-2">On-time %</th>
                  <th className="text-right px-3 py-2">Hours today</th>
                </tr>
              </thead>
              <tbody>
                {(perf.data ?? []).map((r: any) => (
                  <tr key={r.partner_id} className="border-t border-border">
                    <td className="px-3 py-2 font-semibold">{r.name}</td>
                    <td className="px-3 py-2">{r.is_online ? <span className="text-green-600 font-bold">Online</span> : <span className="text-muted-foreground">Offline</span>}</td>
                    <td className="px-3 py-2 text-right">{r.orders_today}</td>
                    <td className="px-3 py-2 text-right">{r.orders_7d}</td>
                    <td className="px-3 py-2 text-right">{Number(r.avg_minutes_today).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">{Number(r.on_time_pct).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right">{Number(r.hours_today).toFixed(2)}</td>
                  </tr>
                ))}
                {(perf.data?.length ?? 0) === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RoleShell>
  );
}
