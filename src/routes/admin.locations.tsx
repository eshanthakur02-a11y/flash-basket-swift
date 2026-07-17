import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Locations — Admin" }] }),
  component: LocationsPage,
});

interface Row {
  id: string;
  state: string;
  city: string;
  pincode: string;
  is_active: boolean;
}

function LocationsPage() {
  const qc = useQueryClient();
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [filter, setFilter] = useState("");

  const q = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("locations")
        .select("*")
        .order("state").order("city").order("pincode");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return q.data ?? [];
    return (q.data ?? []).filter((r) =>
      [r.state, r.city, r.pincode].some((v) => v.toLowerCase().includes(f)),
    );
  }, [q.data, filter]);

  async function add() {
    const s = state.trim(), c = city.trim(), p = pincode.trim();
    if (!s || !c || !/^\d{6}$/.test(p)) {
      toast.error("Enter state, city, and a valid 6-digit PIN");
      return;
    }
    const { error } = await (supabase as any)
      .from("locations")
      .insert({ state: s, city: c, pincode: p, is_active: true });
    if (error) return toast.error(error.message);
    toast.success("Location added");
    setState(""); setCity(""); setPincode("");
    qc.invalidateQueries({ queryKey: ["admin-locations"] });
    qc.invalidateQueries({ queryKey: ["locations", "active"] });
  }

  async function toggle(r: Row) {
    const { error } = await (supabase as any)
      .from("locations")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-locations"] });
    qc.invalidateQueries({ queryKey: ["locations", "active"] });
  }

  async function remove(r: Row) {
    if (!confirm(`Delete ${r.state} / ${r.city} / ${r.pincode}?`)) return;
    const { error } = await (supabase as any).from("locations").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-locations"] });
    qc.invalidateQueries({ queryKey: ["locations", "active"] });
  }

  return (
    <RoleShell role="admin" nav={ADMIN_NAV}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-bold mb-3">Add location</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Uttar Pradesh" className="mt-1" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Noida" className="mt-1" />
            </div>
            <div>
              <Label>PIN Code</Label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="201301" maxLength={6} className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button onClick={add} className="w-full gap-2"><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-display text-lg font-bold">All locations ({q.data?.length ?? 0})</h2>
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search state, city, PIN…" className="max-w-xs" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 px-2">State</th>
                  <th className="py-2 px-2">City</th>
                  <th className="py-2 px-2">PIN</th>
                  <th className="py-2 px-2">Active</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 px-2">{r.state}</td>
                    <td className="py-2 px-2">{r.city}</td>
                    <td className="py-2 px-2 font-mono">{r.pincode}</td>
                    <td className="py-2 px-2">
                      <Switch checked={r.is_active} onCheckedChange={() => toggle(r)} />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(r)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No locations</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RoleShell>
  );
}
