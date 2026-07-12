import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Star, ShieldCheck, Truck, Minus, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { rupees, pct } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — FlashBasket` }] }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { items, add, setQty } = useCart();

  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await supabase.from("products").select("*").eq("slug", slug).maybeSingle()).data,
  });

  if (product.isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-96" /></div>;
  if (!product.data) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Product not found.</div>;

  const p = product.data;
  const line = items.find((l) => l.product_id === p.id);
  const discount = pct(p.price, p.mrp);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to="/products" className="text-sm text-muted-foreground hover:underline">← All products</Link>

      <div className="mt-4 grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ProductGallery
            name={p.name}
            images={buildImageList(p)}
          />
        </motion.div>

        <div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3 w-3" /> Delivery in {p.delivery_minutes} mins
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold">{p.name}</h1>
          {p.brand && <div className="text-muted-foreground mt-1">{p.brand}</div>}
          <div className="text-sm text-muted-foreground">{p.unit}</div>

          <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-success/20 text-success-foreground px-2 py-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-current" /> {p.rating}
          </div>

          <div className="mt-4 flex items-end gap-3">
            <div className="text-3xl font-bold">{rupees(p.price)}</div>
            {p.mrp > p.price && (
              <>
                <div className="text-lg text-muted-foreground line-through">{rupees(p.mrp)}</div>
                <div className="rounded-md gradient-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {discount}% OFF
                </div>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">(Inclusive of all taxes)</div>

          <div className="mt-6 flex gap-3">
            {p.stock <= 0 ? (
              <Button disabled size="lg" className="rounded-xl">Out of stock</Button>
            ) : line ? (
              <div className="flex items-center gap-1 rounded-xl gradient-primary text-primary-foreground">
                <button onClick={() => setQty(line.id, line.quantity - 1)} className="h-12 w-12 grid place-items-center"><Minus /></button>
                <span className="w-12 text-center font-bold">{line.quantity}</span>
                <button onClick={() => setQty(line.id, line.quantity + 1)} className="h-12 w-12 grid place-items-center"><Plus /></button>
              </div>
            ) : (
              <Button size="lg" onClick={() => add(p.id)} className="rounded-xl gradient-primary text-primary-foreground font-bold h-12 px-8 shadow-glow">
                Add to cart
              </Button>
            )}
            <Link to="/cart" className="inline-flex items-center rounded-xl border-2 border-foreground px-6 font-bold hover:bg-foreground hover:text-background transition">
              Go to cart
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            <Perk icon={<Clock className="h-4 w-4" />} title="Super fast" sub="10 min delivery" />
            <Perk icon={<Truck className="h-4 w-4" />} title="Free shipping" sub="Above ₹199" />
            <Perk icon={<ShieldCheck className="h-4 w-4" />} title="100% authentic" sub="Quality assured" />
          </div>

          {p.description && (
            <div className="mt-8">
              <h3 className="font-display text-xl font-bold">Product details</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Perk({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-card">
      <div className="grid place-items-center text-primary">{icon}</div>
      <div className="text-xs font-bold mt-1">{title}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
