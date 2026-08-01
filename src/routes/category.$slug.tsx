import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerProducts } from "@/hooks/useCustomerProducts";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — FlashBasket` }] }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();

  const category = useQuery({
    queryKey: ["category", slug],
    queryFn: async () =>
      (await supabase.from("categories").select("id, slug, name, icon, color").eq("slug", slug).maybeSingle()).data,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });


  const products = useCustomerProducts({
    categoryId: category.data?.id ?? null,
    limit: 60,
    enabled: !!category.data,
    key: `cat:${slug}`,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
      {category.data && (
        <div
          className="mt-4 rounded-3xl p-6 md:p-8 flex items-center gap-4 shadow-card"
          style={{ backgroundColor: (category.data.color ?? "#A3E635") + "33" }}
        >
          <div className="text-6xl">{category.data.icon}</div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{category.data.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Delivery in 10 minutes</p>
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.isLoading ? (
          Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
        ) : (
          products.data?.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </div>
  );
}
