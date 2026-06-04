import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { rupees } from "@/lib/format";
import { Truck, Activity, BarChart3, Circle } from "lucide-react";

export const Route = createFileRoute("/admin/delivery-partners")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket Admin" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: ["admin-active-deliveries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, status, address, partner_id, shop_id, placed_at, updated_at")
        .in("status", ["packed", "out_for_delivery"])
        .order("placed_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
    refetchInterval: 8000,
  });

  const partners = useQuery({
    queryKey: ["admin-partners"],
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
    queryKey: ["admin-perf"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_partner_performance");
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  const reassign = async (orderId: string, partnerId: string) => {
    const { error } = await supabase.rpc("admin_reassign_partner", { _order_id: orderId, _partner_id: partnerId });
    if (error) toast.error(error.message);
    else { toast.success("Reassigned"); qc.invalidateQueries({ queryKey: ["admin-active-deliveries"] }); }
  };

  const partnerById = (id: string | null) => (partners.data ?? []).find((p: any) => p.id === id);

  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary" />
            Delivery Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track all live deliveries, reassign partners, and monitor performance.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-3">
          <Stat label="Online partners" value={String((partners.data ?? []).filter((p: any) => p.is_online).length)} />
          <Stat label="Active deliveries" value={String((orders.data ?? []).filter((o: any) => o.status === "out_for_delivery").length)} />
          <Stat label="Awaiting pickup" value={String((orders.data ?? []).filter((o: any) => o.status === "packed").length)} />
        </section>

        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Live orders</h2>
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
                  <Select onValueChange={(v) => reassign(o.id, v)}>
                    <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder={p ? "Reassign" : "Assign partner"} /></SelectTrigger>
                    <SelectContent>
                      {(partners.data ?? []).map((pp: any) => (
                        <SelectItem key={pp.id} value={pp.id}>{pp.name} {pp.is_online ? "🟢" : "⚫"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <th className="text-right px-3 py-2">30d</th>
                  <th className="text-right px-3 py-2">Avg min (30d)</th>
                  <th className="text-right px-3 py-2">On-time %</th>
                  <th className="text-right px-3 py-2">Hours today</th>
                  <th className="text-right px-3 py-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {(perf.data ?? []).map((r: any) => (
                  <tr key={r.partner_id} className="border-t border-border">
                    <td className="px-3 py-2 font-semibold">{r.name}</td>
                    <td className="px-3 py-2">{r.is_online ? <span className="text-green-600 font-bold">Online</span> : <span className="text-muted-foreground">Offline</span>}</td>
                    <td className="px-3 py-2 text-right">{r.orders_today}</td>
                    <td className="px-3 py-2 text-right">{r.orders_7d}</td>
                    <td className="px-3 py-2 text-right">{r.orders_30d}</td>
                    <td className="px-3 py-2 text-right">{Number(r.avg_minutes_30d).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">{Number(r.on_time_pct_30d).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-right">{Number(r.hours_today).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{Number(r.rating).toFixed(1)}</td>
                  </tr>
                ))}
                {(perf.data?.length ?? 0) === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
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
