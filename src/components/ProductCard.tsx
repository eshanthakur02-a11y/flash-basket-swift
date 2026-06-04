import { Link } from "@tanstack/react-router";
import { Plus, Minus, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/useCart";
import { rupees, pct } from "@/lib/format";

const FAV_KEY = "fb_favourites_v1";

function readFavIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); } catch { return []; }
}

function writeFavIds(ids: string[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  image_url: string | null;
  delivery_minutes: number;
  stock: number;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const { items, add, setQty } = useCart();
  const line = items.find((l) => l.product_id === product.id);
  const discount = pct(product.price, product.mrp);
  const outOfStock = product.stock <= 0;

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(readFavIds().includes(product.id));
  }, [product.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = readFavIds();
    const next = ids.includes(product.id)
      ? ids.filter((id) => id !== product.id)
      : [...ids, product.id];
    writeFavIds(next);
    setIsFav(next.includes(product.id));
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-3 shadow-card hover:shadow-glow transition-shadow"
    >
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 rounded-md gradient-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {discount}% OFF
        </div>
      )}
      <button
        onClick={toggleFav}
        className="absolute top-2 right-2 z-10 h-8 w-8 grid place-items-center rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm"
        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart
          className={isFav ? "text-primary" : "text-muted-foreground"}
          fill={isFav ? "currentColor" : "none"}
          size={16}
        />
      </button>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary/40">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-4xl">🛒</div>
          )}
        </div>
      </Link>
      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
        <Clock className="h-2.5 w-2.5" /> {product.delivery_minutes} MINS
      </div>
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="mt-1 line-clamp-2 text-sm font-medium leading-tight"
      >
        {product.name}
      </Link>
      <div className="text-xs text-muted-foreground">{product.unit}</div>
      <div className="mt-auto pt-2 flex items-end justify-between gap-2">
        <div className="leading-tight">
          <div className="font-bold">{rupees(product.price)}</div>
          {product.mrp > product.price && (
            <div className="text-xs text-muted-foreground line-through">{rupees(product.mrp)}</div>
          )}
        </div>
        {outOfStock ? (
          <Button size="sm" variant="outline" disabled className="rounded-lg">Out</Button>
        ) : line ? (
          <div className="flex items-center gap-0.5 rounded-lg gradient-primary text-primary-foreground">
            <button
              onClick={() => setQty(line.id, line.quantity - 1)}
              className="h-8 w-8 grid place-items-center"
              aria-label="Decrease"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
            <button
              onClick={() => setQty(line.id, line.quantity + 1)}
              className="h-8 w-8 grid place-items-center"
              aria-label="Increase"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => add(product.id, 1)}
            className="rounded-lg border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold"
          >
            ADD
          </Button>
        )}
      </div>
    </motion.div>
  );
}
