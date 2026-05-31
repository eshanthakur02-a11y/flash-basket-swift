import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";
import { LocationPicker } from "@/components/maps/LocationPicker";

export const Route = createFileRoute("/shopkeeper/settings")({ component: Page });

function Page() {
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("owner_id", user.id).maybeSingle().then(({ data }) => setShop(data));
  }, [user]);

  const save = async () => {
    const { error } = await supabase
      .from("shops")
      .update({
        name: shop.name,
        is_open: shop.is_open,
        phone: shop.phone,
        address: shop.address,
        city: shop.city,
        pincode: shop.pincode,
        latitude: shop.latitude,
        longitude: shop.longitude,
        service_radius_km: shop.service_radius_km,
      })
      .eq("id", shop.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-6 max-w-2xl">
        <h1 className="font-display text-2xl font-bold">Shop settings</h1>
        {!shop ? <p className="text-muted-foreground mt-2">No shop assigned.</p> : (
          <div className="mt-5 space-y-4">
            <div><label className="text-xs font-semibold">Name</label><Input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Phone</label><Input value={shop.phone ?? ""} onChange={(e) => setShop({ ...shop, phone: e.target.value })} /></div>
            <div><label className="text-xs font-semibold">Address</label><Input value={shop.address ?? ""} onChange={(e) => setShop({ ...shop, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold">City</label><Input value={shop.city ?? ""} onChange={(e) => setShop({ ...shop, city: e.target.value })} /></div>
              <div><label className="text-xs font-semibold">Pincode</label><Input value={shop.pincode ?? ""} onChange={(e) => setShop({ ...shop, pincode: e.target.value })} /></div>
            </div>
            <div>
              <label className="text-xs font-semibold">Shop location (pin on map)</label>
              <div className="mt-2">
                <LocationPicker
                  value={shop.latitude != null && shop.longitude != null ? { lat: shop.latitude, lng: shop.longitude } : null}
                  onChange={(v) => setShop({ ...shop, latitude: v.lat, longitude: v.lng })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold">Service radius (km)</label>
              <Input type="number" step="0.5" min="0.5" max="50" value={shop.service_radius_km ?? 8}
                onChange={(e) => setShop({ ...shop, service_radius_km: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3"><Switch checked={shop.is_open} onCheckedChange={(v) => setShop({ ...shop, is_open: v })} /><span>Shop open</span></div>
            <Button onClick={save} className="rounded-xl gradient-primary text-primary-foreground">Save</Button>
          </div>
        )}
      </div>
    </RoleShell>
  );
}
