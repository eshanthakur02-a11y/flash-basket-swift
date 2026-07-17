import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, MapPin, Clock, Star, Zap, TrendingDown, Check, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useDeliveryContext } from "@/hooks/useDeliveryContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { rupees } from "@/lib/format";
import { toast } from "sonner";

type CartShop = {
  shop_id: string;
  shop_name: string;
  shop_address: string | null;
  latitude: number | null;
  longitude: number | null;
  pincode: string | null;
  distance_km: number | null;
  delivery_minutes: number;
  price: number;
  mrp: number;
  stock: number;
};

export function CartShopSelector({ deliveryLat, deliveryLng }: { deliveryLat?: number | null; deliveryLng?: number | null } = {}) {
  const { user } = useAuth();
  const { currentShop, currentShopId, changeShop, items } = useCart();
  const { pincode } = useDeliveryContext();
  const [open, setOpen] = useState(false);

  const shopsQuery = useQuery({
    queryKey: ["eligible-shops-cart", user?.id, pincode, deliveryLat ?? null, deliveryLng ?? null, items.length],
    enabled: !!user && open,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("list_eligible_shops_for_cart", {
        _pincode: pincode ?? null,
        _lat: deliveryLat ?? null,
        _lng: deliveryLng ?? null,
      });
      if (error) throw error;
      return (data ?? []) as CartShop[];
    },
  });

  const shops = shopsQuery.data ?? [];
  const cheapestId = shops.length ? shops.reduce((a, b) => (a.price <= b.price ? a : b)).shop_id : null;
  const fastestId = shops.length ? shops.reduce((a, b) => (a.delivery_minutes <= b.delivery_minutes ? a : b)).shop_id : null;

  const select = async (s: CartShop) => {
    await changeShop(s.shop_id);
    setOpen(false);
    toast.success(`Now ordering from ${s.shop_name}`);
  };

  if (!currentShop) return null;

  return (
    <>
      <div className="mb-3 rounded-2xl border border-border bg-card p-3 shadow-card">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Delivering from</span>
              {!currentShopId ? null : (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full bg-primary/15 text-primary px-1.5 py-0.5">
                  <Sparkles className="h-2.5 w-2.5" /> Auto selected
                </span>
              )}
            </div>
            <div className="font-bold text-sm truncate">{currentShop.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              {currentShop.address && (
                <span className="inline-flex items-center gap-0.5 truncate">
                  <MapPin className="h-3 w-3" /> {currentShop.address}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-current text-warning" /> 4.8
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> 15 min
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-lg shrink-0">
            Change shop <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a shop</DialogTitle>
            <DialogDescription>
              Shops in your area that stock every item in your cart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {shopsQuery.isLoading ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </>
            ) : shops.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No other shops in your pincode can fulfill this cart right now.
              </p>
            ) : (
              shops.map((s) => {
                const active = s.shop_id === currentShopId;
                return (
                  <div
                    key={s.shop_id}
                    className={`rounded-2xl border-2 p-3 transition ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{s.shop_name}</span>
                          {s.shop_id === cheapestId && shops.length > 1 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase rounded-full bg-success/20 text-success-foreground px-1.5 py-0.5">
                              <TrendingDown className="h-3 w-3" /> Lowest
                            </span>
                          )}
                          {s.shop_id === fastestId && shops.length > 1 && s.shop_id !== cheapestId && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/15 text-primary px-1.5 py-0.5">
                              <Zap className="h-3 w-3" /> Fastest
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-current text-warning" />4.8</span>
                          {s.distance_km != null && (
                            <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{s.distance_km} km</span>
                          )}
                          <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" />{s.delivery_minutes} min</span>
                        </div>
                        {s.shop_address && (
                          <div className="mt-1 text-[11px] text-muted-foreground truncate">{s.shop_address}</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-primary">{rupees(s.price)}</div>
                        {s.mrp > s.price && (
                          <div className="text-[11px] text-muted-foreground line-through">{rupees(s.mrp)}</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant={active ? "secondary" : "default"}
                        onClick={() => select(s)}
                        className="rounded-lg h-8"
                        disabled={active}
                      >
                        {active ? (<><Check className="h-3 w-3 mr-1" />Selected</>) : "Select"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
