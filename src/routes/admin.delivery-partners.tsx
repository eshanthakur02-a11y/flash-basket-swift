import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { rupees } from "@/lib/format";
import { Truck, Activity, BarChart3, Circle, Plus, Trash2, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/delivery-partners")({
  head: () => ({ meta: [{ title: "Delivery — FlashBasket Admin" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<any | null>(null);

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
        .select("id, name, phone, vehicle, is_online, current_lat, current_lng, rating")
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

  const deletePartner = async (id: string) => {
    const { error } = await supabase.rpc("delete_delivery_partner", { _partner_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Partner removed");
    setConfirmDel(null);
    qc.invalidateQueries({ queryKey: ["admin-partners"] });
    qc.invalidateQueries({ queryKey: ["admin-perf"] });
  };

  const partnerById = (id: string | null) => (partners.data ?? []).find((p: any) => p.id === id);

  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" /> Delivery Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Add or remove delivery boys, reassign live orders, and monitor performance.</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-1" />Add delivery boy</Button>
            </DialogTrigger>
            <AddPartnerDialog onDone={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["admin-partners"] }); }} />
          </Dialog>
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
          <h2 className="font-bold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Partner roster &amp; performance</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2">Partner</th>
                  <th className="text-left px-3 py-2">Phone</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Today</th>
                  <th className="text-right px-3 py-2">7d</th>
                  <th className="text-right px-3 py-2">30d</th>
                  <th className="text-right px-3 py-2">Avg min</th>
                  <th className="text-right px-3 py-2">On-time</th>
                  <th className="text-right px-3 py-2">Hours</th>
                  <th className="text-right px-3 py-2">Rating</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {(perf.data ?? []).map((r: any) => {
                  const pp = partnerById(r.partner_id);
                  return (
                    <tr key={r.partner_id} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold">{r.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{pp?.phone ?? "—"}</td>
                      <td className="px-3 py-2">{r.is_online ? <span className="text-green-600 font-bold">Online</span> : <span className="text-muted-foreground">Offline</span>}</td>
                      <td className="px-3 py-2 text-right">{r.orders_today}</td>
                      <td className="px-3 py-2 text-right">{r.orders_7d}</td>
                      <td className="px-3 py-2 text-right">{r.orders_30d}</td>
                      <td className="px-3 py-2 text-right">{Number(r.avg_minutes_30d).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">{Number(r.on_time_pct_30d).toFixed(0)}%</td>
                      <td className="px-3 py-2 text-right">{Number(r.hours_today).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{Number(r.rating).toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDel(r)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {(perf.data?.length ?? 0) === 0 && <tr><td colSpan={11} className="px-3 py-6 text-center text-muted-foreground">No data yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <AlertDialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove “{confirmDel?.name}”?</AlertDialogTitle>
              <AlertDialogDescription>The partner profile and delivery role will be removed. Active orders block deletion.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDel && deletePartner(confirmDel.partner_id)}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleShell>
  );
}

function AddPartnerDialog({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) { toast.error("Name required"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("create_delivery_partner", {
      _name: name.trim(),
      _phone: phone.trim(),
      _vehicle: vehicle.trim() || null,
      _user_email: email.trim() || null,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Partner added"); onDone(); }
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add delivery boy</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div><label className="text-xs font-bold">Name *</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="text-xs font-bold">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className="text-xs font-bold">Vehicle</label><Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Bike / Scooter / EV" /></div>
        <div>
          <label className="text-xs font-bold">Account email (optional)</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="To grant login, user must already be signed up" />
          <p className="text-[11px] text-muted-foreground mt-1">If left blank, profile is created without login. Linked email gains the delivery role automatically.</p>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={busy}>{busy ? "Adding…" : "Add partner"}</Button>
      </DialogFooter>
    </DialogContent>
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
