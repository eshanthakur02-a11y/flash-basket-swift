import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { LeafletMap } from "@/components/maps/LeafletMap";
import { LocationPicker, type LatLng } from "@/components/maps/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Store, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shops")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const q = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_shops");
      if (error) throw error;
      return data ?? [];
    },
  });

  const shops = q.data ?? [];
  const valid = shops.filter((s: any) => s.latitude != null && s.longitude != null);
  const center: [number, number] = valid.length > 0
    ? [
        valid.reduce((a: number, s: any) => a + s.latitude, 0) / valid.length,
        valid.reduce((a: number, s: any) => a + s.longitude, 0) / valid.length,
      ]
    : [12.9716, 77.5946];

  return (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <div className="p-4 md:p-6 space-y-5">
        <header className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <Store className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" /> Shops
            </h1>
            <p className="text-sm text-muted-foreground mt-1">All shops on the platform. Add a new shopkeeper to onboard a shop.</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto shrink-0 whitespace-nowrap"><UserPlus className="h-4 w-4 mr-1" />Add shopkeeper</Button>
            </DialogTrigger>
            <AddShopkeeperDialog onDone={() => { setAddOpen(false); qc.invalidateQueries({ queryKey: ["admin-shops"] }); }} />
          </Dialog>
        </header>

        {valid.length > 0 && (
          <div className="relative z-0 isolate">
          <LeafletMap center={center} zoom={11} className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-border">
            {(RL) => {
              const { Marker, Popup, Circle } = RL;
              return (
                <>
                  {valid.map((s: any) => (
                    <div key={s.id}>
                      <Marker position={[s.latitude, s.longitude]}>
                        <Popup>
                          <div className="font-bold">{s.name}</div>
                          <div className="text-xs">{s.address}, {s.city}</div>
                          <div className="text-xs">Radius {s.service_radius_km} km • {s.is_open ? "Open" : "Closed"}</div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={[s.latitude, s.longitude]}
                        radius={(s.service_radius_km ?? 8) * 1000}
                        pathOptions={{ color: "hsl(var(--primary))", weight: 1, fillOpacity: 0.05 }}
                      />
                    </div>
                  ))}
                </>
              );
            }}
          </LeafletMap>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {shops.map((s: any) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.address}, {s.city} · {s.pincode}</div>
              <div className="text-xs mt-1">Owner: <span className={s.owner_email ? "font-medium" : "text-muted-foreground"}>{s.owner_email || "Unassigned"}</span> • {s.is_open ? <span className="text-green-600 font-bold">Open</span> : <span className="text-muted-foreground">Closed</span>}</div>
              <div className="text-xs text-muted-foreground">{s.phone || "No phone"} · radius {s.service_radius_km} km</div>
              <AssignOwnerInline shopId={s.id} hasOwner={Boolean(s.owner_id)} onDone={() => qc.invalidateQueries({ queryKey: ["admin-shops"] })} />
            </div>
          ))}
          {shops.length === 0 && <div className="text-sm text-muted-foreground">No shops yet.</div>}
        </div>
      </div>
    </RoleShell>
  );
}

function AddShopkeeperDialog({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [radius, setRadius] = useState("8");
  const [loc, setLoc] = useState<LatLng | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !shopName.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      toast.error("Fill all required fields"); return;
    }
    if (!loc) { toast.error("Pick the shop location on the map"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_create_shopkeeper", {
      _user_email: email.trim(),
      _shop_name: shopName.trim(),
      _address: address.trim(),
      _city: city.trim(),
      _pincode: pincode.trim(),
      _lat: loc.lat,
      _lng: loc.lng,
      _phone: phone.trim() || undefined,
      _radius: Number(radius) || 8,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Shopkeeper added"); onDone(); }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Add shopkeeper</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold">Owner email *</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" />
          <p className="text-[11px] text-muted-foreground mt-1">User must already have an account. They'll be granted the shopkeeper role.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold">Shop name *</label><Input value={shopName} onChange={(e) => setShopName(e.target.value)} /></div>
          <div><label className="text-xs font-bold">Shop phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div><label className="text-xs font-bold">Address *</label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className="text-xs font-bold">City *</label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          <div><label className="text-xs font-bold">Pincode *</label><Input value={pincode} onChange={(e) => setPincode(e.target.value)} /></div>
        </div>
        <div><label className="text-xs font-bold">Service radius (km)</label><Input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} /></div>
        <div>
          <label className="text-xs font-bold">Location *</label>
          <LocationPicker value={loc} onChange={setLoc} height="h-56" />
          {loc && <p className="text-[11px] text-muted-foreground mt-1">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={busy}>{busy ? "Adding…" : "Add shopkeeper"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function AssignOwnerInline({ shopId, hasOwner, onDone }: { shopId: string; hasOwner: boolean; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(false);
  const submit = async () => {
    if (!email.trim()) { toast.error("Enter the shopkeeper's email"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_assign_shop_owner", { _shop_id: shopId, _user_email: email.trim() });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Owner assigned"); setEmail(""); onDone(); }
  };
  const remove = async () => {
    setRemoving(true);
    const { error } = await supabase.rpc("admin_unassign_shop_owner", { _shop_id: shopId });
    setRemoving(false);
    if (error) toast.error(error.message);
    else { toast.success("Owner removed"); setEmail(""); onDone(); }
  };
  return (
    <div className="mt-3 flex gap-2">
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Assign owner by email" className="h-9 text-xs" />
      <Button size="sm" onClick={submit} disabled={busy}>{busy ? "…" : "Assign"}</Button>
      {hasOwner && (
        <Button size="sm" variant="outline" onClick={remove} disabled={removing} aria-label="Remove shop owner">
          {removing ? "…" : <UserMinus className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
