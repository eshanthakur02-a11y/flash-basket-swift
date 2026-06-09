import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Clock, Truck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { SupportFab } from "@/components/SupportFab";


export const Route = createFileRoute("/customer/home")({
  head: () => ({ meta: [{ title: "Home — FlashBasket" }] }),
  component: CustomerHome,
});

function CustomerHome() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ["mini-profile", user?.id],
    queryFn: async () =>
      user ? (await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()).data : null,
    enabled: !!user,
  });

  const categories = useQuery({
    queryKey: ["app-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  const featured = useQuery({
    queryKey: ["app-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock")
        .eq("is_featured", true)
        .limit(10);
      return (data ?? []) as ProductCardData[];
    },
  });

  const bestsellers = useQuery({
    queryKey: ["app-best"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock")
        .eq("is_bestseller", true)
        .limit(10);
      return (data ?? []) as ProductCardData[];
    },
  });

  const name = profile.data?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-hero p-5 border border-border shadow-card"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold">
          <Zap className="h-3 w-3 fill-primary text-primary" /> 10-min delivery
        </div>
        <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight">
          Hi {name}, <span className="text-primary">stock up</span> in a flash.
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">Fresh groceries delivered to your door.</p>
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
      </motion.section>

      {/* Promise strip */}
      <div className="grid grid-cols-3 gap-2">
        <Promise icon={<Clock className="h-4 w-4" />} label="10-min" />
        <Promise icon={<Truck className="h-4 w-4" />} label="Free ₹199+" />
        <Promise icon={<ShieldCheck className="h-4 w-4" />} label="Authentic" />
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Shop by category</h2>
          <Link to="/customer/categories" className="text-xs font-bold text-primary">See all →</Link>
        </div>
        <div className="-mx-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="grid grid-rows-2 grid-flow-col auto-cols-[28%] gap-3 snap-x">
            {categories.isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
              : categories.data?.map((c) => (
                  <Link
                    key={c.id}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-card snap-start"
                  >
                    <div
                      className="grid h-14 w-14 place-items-center rounded-xl text-2xl"
                      style={{ backgroundColor: (c.color ?? "#A3E635") + "55" }}
                    >
                      {c.icon}
                    </div>
                    <div className="text-[10px] font-semibold text-center leading-tight line-clamp-2">{c.name}</div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <ProductRow title="✨ Featured today" query={featured} />
      <ProductRow title="🔥 Bestsellers" query={bestsellers} />
      <SupportFab />
    </div>
  );
}


function Promise({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-card border border-border p-2 shadow-card">
      <span className="text-primary">{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </div>
  );
}

function ProductRow({ title, query }: { title: string; query: ReturnType<typeof useQuery<ProductCardData[]>> }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <Link to="/products" className="text-xs font-bold text-primary">See all →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {query.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-40 shrink-0 aspect-[3/4] rounded-2xl" />
            ))
          : query.data?.map((p) => (
              <div key={p.id} className="w-40 shrink-0 snap-start">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  );
}
