import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Zap, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — FlashBasket" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const { items, subtotal, savings, setQty, loading, currentShop, clear } = useCart();
  const navigate = useNavigate();


  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground" />
        <h2 className="font-display text-2xl font-bold mt-4">Sign in to view your cart</h2>
        <Link to="/auth" className="mt-6 inline-block rounded-xl gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow">
          Login / Sign up
        </Link>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-7xl">🛒</div>
        <h2 className="font-display text-2xl font-bold mt-4">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">Add some fresh groceries to get started.</p>
        <Link to="/products" className="mt-6 inline-block rounded-xl gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow">
          Shop now
        </Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const handling = 5;
  const total = subtotal + deliveryFee + handling;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid md:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold mb-4">Your cart ({items.length})</h1>
        {currentShop && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Selected shop</div>
                <div className="font-bold truncate">{currentShop.name}</div>
                {currentShop.pincode && (
                  <div className="text-xs text-muted-foreground truncate">PIN {currentShop.pincode}</div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Clear cart to shop at a different store?")) clear();
              }}
            >
              Change shop
            </Button>
          </div>
        )}
        <div className="space-y-3">

          <AnimatePresence>
            {items.map((l) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card"
              >
                <Link to="/product/$slug" params={{ slug: l.product.slug }} className="shrink-0">
                  {(l.variant?.images?.[0] ?? l.product.image_url) ? (
                    <img src={l.variant?.images?.[0] ?? l.product.image_url!} alt={l.product.name} className="h-20 w-20 rounded-xl object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-secondary grid place-items-center text-3xl">🛒</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="font-medium line-clamp-1">{l.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.variant ? `${l.variant.size}${l.variant.unit ? " " + l.variant.unit : ""}` : l.product.unit}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-bold">{rupees(l.variant?.selling_price ?? l.product.price)}</span>
                    {(l.variant?.mrp ?? l.product.mrp) > (l.variant?.selling_price ?? l.product.price) && (
                      <span className="text-xs text-muted-foreground line-through">{rupees(l.variant?.mrp ?? l.product.mrp)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-xl gradient-primary text-primary-foreground">
                  <button onClick={() => setQty(l.id, l.quantity - 1)} className="h-9 w-9 grid place-items-center">
                    {l.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-7 text-center text-sm font-bold">{l.quantity}</span>
                  <button onClick={() => setQty(l.id, l.quantity + 1)} className="h-9 w-9 grid place-items-center">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <aside className="md:sticky md:top-24 self-start">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-bold mb-3">Bill details</h3>
          <Row label="Item total" value={rupees(subtotal)} />
          {savings > 0 && <Row label="You save" value={`- ${rupees(savings)}`} className="text-success" />}
          <Row label="Delivery fee" value={deliveryFee === 0 ? "FREE" : rupees(deliveryFee)} />
          <Row label="Handling charge" value={rupees(handling)} />
          <div className="my-3 h-px bg-border" />
          <Row label="To pay" value={rupees(total)} bold />

          <Button
            onClick={() => navigate({ to: "/checkout" })}
            className="mt-5 w-full h-12 rounded-xl gradient-primary text-primary-foreground font-bold shadow-glow"
          >
            <Zap className="h-4 w-4 mr-2 fill-current" /> Proceed to checkout
          </Button>
          <div className="mt-3 text-xs text-center text-muted-foreground">
            {deliveryFee === 0 ? "🎉 Free delivery applied!" : `Add ${rupees(199 - subtotal)} more for FREE delivery`}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "font-bold text-base" : ""} ${className ?? ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
