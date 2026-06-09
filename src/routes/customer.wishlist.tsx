import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/hooks/useWishlist";

export const Route = createFileRoute("/customer/wishlist")({
  head: () => ({ meta: [{ title: "Favourites — FlashBasket" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids, loading: wlLoading } = useWishlist();

  const products = useQuery({
    queryKey: ["fav-products", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock")
        .in("id", ids);
      return (data ?? []) as ProductCardData[];
    },
  });

  return (
    <div className="px-4 py-4">
      <h1 className="font-display text-2xl font-extrabold mb-4 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary fill-primary" /> Favourites
      </h1>

      {wlLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : ids.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 grid place-items-center rounded-3xl bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-3 font-bold">No favourites yet</p>
          <p className="text-sm text-muted-foreground mt-1">Tap the heart on any product to save it here.</p>
          <Link
            to="/customer/categories"
            className="mt-5 inline-block rounded-2xl gradient-primary px-5 py-2.5 font-bold text-primary-foreground shadow-glow text-sm"
          >
            Browse products →
          </Link>
        </div>
      ) : products.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
