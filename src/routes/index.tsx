import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Clock, Truck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlashBasket — Groceries in 10 minutes" },
      { name: "description", content: "Order groceries, snacks, fruits and household essentials delivered in 10 minutes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("display_order");
      return data ?? [];
    },
  });

  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock")
        .eq("is_featured", true)
        .limit(12);
      return (data ?? []) as ProductCardData[];
    },
  });

  const bestsellers = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, unit, price, mrp, image_url, delivery_minutes, stock")
        .eq("is_bestseller", true)
        .limit(12);
      return (data ?? []) as ProductCardData[];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-aurora pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-3 py-1 text-xs font-semibold">
              <Zap className="h-3 w-3 fill-primary text-primary" />
              Delivery promise: 10 minutes
            </div>
            <h1 className="mt-4 font-display text-5xl md:text-7xl font-extrabold leading-[0.95] text-balance">
              Groceries at <span className="text-primary">lightning</span> speed.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Fresh fruits, daily essentials, snacks and more — at your door before you finish your coffee.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-xl gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                Shop now
              </Link>
              <Link
                to="/products"
                className="rounded-xl border-2 border-foreground px-6 py-3 font-bold hover:bg-foreground hover:text-background transition"
              >
                Browse categories
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              <Feature icon={<Clock className="h-5 w-5" />} label="10-min delivery" />
              <Feature icon={<Truck className="h-5 w-5" />} label="Free above ₹199" />
              <Feature icon={<ShieldCheck className="h-5 w-5" />} label="100% authentic" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative aspect-square"
          >
            <FloatingBasket />
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Shop by category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {categories.isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            : categories.data?.map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all"
                >
                  <div
                    className="grid h-14 w-14 place-items-center rounded-xl text-3xl"
                    style={{ backgroundColor: (c.color ?? "#A3E635") + "55" }}
                  >
                    {c.icon}
                  </div>
                  <div className="text-xs text-center font-medium leading-tight">{c.name}</div>
                </Link>
              ))}
        </div>
      </section>

      {/* FEATURED */}
      <ProductSection title="✨ Featured today" query={featured} />
      <ProductSection title="🔥 Bestsellers" query={bestsellers} />
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-card border border-border p-3 text-center shadow-card">
      <div className="text-primary">{icon}</div>
      <div className="text-[11px] font-semibold leading-tight">{label}</div>
    </div>
  );
}

function ProductSection({
  title,
  query,
}: {
  title: string;
  query: ReturnType<typeof useQuery<ProductCardData[]>>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
        <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {query.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))
          : query.data?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function FloatingBasket() {
  return (
    <div className="relative h-full w-full">
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 grid place-items-center"
      >
        <div className="relative h-64 w-64 md:h-80 md:w-80">
          <div className="absolute inset-0 rounded-full gradient-primary blur-3xl opacity-40" />
          <div className="absolute inset-4 rounded-[3rem] bg-card border-4 border-foreground shadow-glow rotate-3 grid grid-cols-3 grid-rows-3 gap-2 p-4 text-5xl place-items-center">
            <span>🍎</span><span>🥕</span><span>🍞</span>
            <span>🥛</span><span>🥬</span><span>🍌</span>
            <span>🧃</span><span>🥚</span><span>🧀</span>
          </div>
        </div>
      </motion.div>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-4 right-4 h-20 w-20 rounded-full border-2 border-dashed border-primary/40"
      />
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-6 left-6 rounded-2xl bg-foreground text-background px-4 py-2 font-bold shadow-glow"
      >
        <Zap className="inline h-4 w-4 fill-primary text-primary mr-1" /> 10 min
      </motion.div>
    </div>
  );
}
