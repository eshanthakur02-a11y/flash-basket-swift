import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { rupees } from "@/lib/format";
import { Truck, Activity, BarChart3, Circle, Users, Star } from "lucide-react";

export const Route = createFileRoute("/shopkeeper/delivery")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket" }] }),
  component: Page,
});

type Partner = {
  id: string;
  name: string;
  phone: string | null;
  is_online: boolean;
  rating: number | null;
  availability_status: string | null;
  active_order_count: number | null;
  shop_id: string;
};

function statusBadge(p: Partner) {
  if (!p.is_online) return { label: "Offline", cls: "bg-muted text-muted-foreground" };
  if ((p.active_order_count ?? 0) > 0 || p.availability_status === "busy") return { label: "Busy", cls: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" };
  return { label: "Online", cls: "bg-green-500/15 text-green-700 dark:text-green-400" };
}

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<any | null>(null);

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
        .select("id, order_number, total, status, address, partner_id, placed_at")
        .eq("shop_id", shopId)
        .in("status", ["packed", "out_for_delivery"])
        .order("placed_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!shopId,
    refetchInterval: 8000,
  });

  const partners = useQuery({
    queryKey: ["shop-partners", shopId],
    queryFn: async () => {
      if (!shopId) return [] as Partner[];
      const { data } = await supabase
        .from("delivery_partners")
        .select("id, name, phone, is_online, rating, availability_status, active_order_count, shop_id")
        .eq("shop_id", shopId)
        .order("is_online", { ascending: false });
      return (data ?? []) as Partner[];
    },
    enabled: !!shopId,
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

  const perfByPartner = useMemo(() => {
    const m: Record<string, any> = {};
    (perf.data ?? []).forEach((r: any) => { m[r.partner_id] = r; });
    return m;
  }, [perf.data]);

  const assign = async (orderId: string, partnerId: string) => {
    const { error } = await supabase.rpc("shop_assign_partner", { _order_id: orderId, _partner_id: partnerId });
    if (error) { toast.error(error.message); return; }
    toast.success("Delivery partner assigned");
    setAssignFor(null);
    qc.invalidateQueries({ queryKey: ["shop-delivery-orders", shopId] });
    qc.invalidateQueries({ queryKey: ["shop-partners", shopId] });
  };

  const partnerById = (id: string | null) => (partners.data ?? []).find((p) => p.id === id);

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <Truck className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
              Delivery Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View partners assigned to your shop by admin, assign live orders, and track performance.
            </p>
          </div>
          <Button className="w-full sm:w-auto shrink-0 whitespace-nowrap" onClick={() => setManageOpen(true)}>
            <Users className="h-4 w-4 mr-1" />Manage assigned delivery partners
          </Button>
        </header>

        {/* Active orders */}
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
                  <Button size="sm" onClick={() => setAssignFor(o)}>
                    {p ? "Re-assign" : "Assign delivery partner"}
                  </Button>
                </div>
              );
            })}
            {(orders.data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">No active deliveries.</div>}
          </div>
        </section>

        {/* Partner dashboard */}
        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Partner performance</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Partner</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Active</th>
                  <th className="text-right px-3 py-2">Completed (7d)</th>
                  <th className="text-right px-3 py-2">Rating</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {(partners.data ?? []).map((p) => {
                  const b = statusBadge(p);
                  const r = perfByPartner[p.id];
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.phone ?? "—"}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold ${b.cls}`}>{b.label}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-bold">{p.active_order_count ?? 0}</td>
                      <td className="px-3 py-2 text-right">{r?.orders_7d ?? 0}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {p.rating != null ? Number(p.rating).toFixed(1) : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" variant="secondary" disabled={(orders.data ?? []).length === 0} onClick={() => {
                          const unassigned = (orders.data ?? []).find((o: any) => !o.partner_id) ?? (orders.data ?? [])[0];
                          if (unassigned) setAssignFor(unassigned);
                        }}>Assign order</Button>
                      </td>
                    </tr>
                  );
                })}
                {(partners.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No delivery partners assigned to your shop yet. Ask admin to assign partners.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Manage assigned partners dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Available delivery partners</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {(partners.data ?? []).map((p) => {
              const b = statusBadge(p);
              return (
                <div key={p.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.phone ?? "No phone"} · Active: {p.active_order_count ?? 0}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold ${b.cls}`}>{b.label}</span>
                </div>
              );
            })}
            {(partners.data?.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground p-2">
                No partners assigned. Admin manages delivery-partner assignment from the Admin Dashboard.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setManageOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign order dialog */}
      <Dialog open={!!assignFor} onOpenChange={(v) => !v && setAssignFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign delivery partner {assignFor ? `· ${assignFor.order_number}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {(partners.data ?? []).map((p) => {
              const b = statusBadge(p);
              const disabled = !p.is_online;
              return (
                <button
                  key={p.id}
                  disabled={disabled}
                  onClick={() => assignFor && assign(assignFor.id, p.id)}
                  className={`w-full text-left rounded-xl border border-border p-3 flex items-center justify-between gap-3 transition ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}`}
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Active orders: {p.active_order_count ?? 0}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase font-bold ${b.cls}`}>{b.label}</span>
                </button>
              );
            })}
            {(partners.data?.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground p-2">No partners available. Ask admin to assign delivery partners to your shop.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </RoleShell>
  );
}
