import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoleShell } from "@/components/RoleShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { toast } from "sonner";
import { SHOPKEEPER_NAV } from "./shopkeeper.dashboard";

export const Route = createFileRoute("/shopkeeper/products")({
  head: () => ({ meta: [{ title: "Products — Shopkeeper" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => setShopId(data?.id ?? null));
  }, [user]);

  const items = useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data } = await supabase
        .from("shop_products")
        .select("id, price, stock, is_available, products(id, name, unit, image_url)")
        .eq("shop_id", shopId)
        .limit(200);
      return data ?? [];
    },
    enabled: !!shopId,
  });

  const updateStock = async (id: string, stock: number) => {
    const { error } = await supabase.from("shop_products").update({ stock }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["shop-products", shopId] });
  };

  return (
    <RoleShell role="shopkeeper" nav={SHOPKEEPER_NAV} requireRoles={["shopkeeper", "admin"]}>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl font-extrabold">Inventory</h1>
        {!shopId ? (
          <p className="mt-6 text-sm text-muted-foreground">No shop assigned.</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(items.data ?? []).map((sp: any) => (
              <div key={sp.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                {sp.products?.image_url ? <img src={sp.products.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-secondary grid place-items-center">🛒</div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{sp.products?.name}</div>
                  <div className="text-xs text-muted-foreground">{sp.products?.unit} • {rupees(sp.price)}</div>
                </div>
                <Input type="number" defaultValue={sp.stock} className="h-9 w-20" onBlur={(e) => updateStock(sp.id, Number(e.target.value))} />
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleShell>
  );
}
