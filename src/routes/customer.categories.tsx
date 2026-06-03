import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const search = z.object({ q: z.string().optional(), cat: z.string().optional() });

export const Route = createFileRoute("/customer/categories")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Shop — FlashBasket" }] }),
  component: CategoryShop,
});

function CategoryShop() {
  const { q, cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "rating">("relevance");

  const categories = useQuery({
    queryKey: ["app-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const products = useQuery({
    queryKey: ["app-products", q, cat, sort],
    queryFn: async () => {
      let qb = supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock, rating, category_id");
      if (q) qb = qb.ilike("name", `%${q}%`);
      if (cat) {
        const catRow = (await supabase.from("categories").select("id").eq("slug", cat).maybeSingle()).data;
        if (catRow) qb = qb.eq("category_id", catRow.id);
      }
      if (sort === "price-asc") qb = qb.order("price", { ascending: true });
      else if (sort === "price-desc") qb = qb.order("price", { ascending: false });
      else if (sort === "rating") qb = qb.order("rating", { ascending: false });
      const { data } = await qb.limit(80);
      return (data ?? []) as ProductCardData[];
    },
  });

  const activeName = cat ? categories.data?.find((c) => c.slug === cat)?.name : null;

  return (
    <div className="px-4 py-4">
      {/* Category chips */}
      <div className="-mx-4 px-4 overflow-x-auto pb-2 mb-3">
        <div className="flex gap-2 w-max">
          <button
            onClick={() => navigate({ search: {} as any })}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold ${!cat ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border bg-card"}`}
          >
            All
          </button>
          {categories.data?.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ search: { cat: c.slug } as any })}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 ${cat === c.slug ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border bg-card"}`}
            >
              <span>{c.icon}</span>{c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 gap-2">
        <h1 className="font-display text-2xl font-extrabold truncate">
          {q ? `"${q}"` : activeName ?? "All products"}
        </h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {products.isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : products.data?.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl">🛒</div>
          <p className="mt-3 text-sm text-muted-foreground">No products match.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.data?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
