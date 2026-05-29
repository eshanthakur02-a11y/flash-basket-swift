import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { PRODUCTS } from "@/lib/demo/seed";
import { rupees } from "@/lib/format";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/customer/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist" }] }),
  component: Page,
});

function Page() {
  const { state, toggleWishlist, addToCart } = useDemo();
  const items = PRODUCTS.filter((p) => state.wishlist.includes(p.id));
  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 md:px-6 py-5">
        <h1 className="font-display text-3xl font-extrabold">Wishlist</h1>
        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
            <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No favourites yet. Tap the heart on any product to save it here.</p>
            <Link to="/customer/shop"><Button className="mt-4">Browse products</Button></Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="text-5xl text-center py-3">{p.image}</div>
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.weight}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-extrabold">{rupees(p.price)}</div>
                  <button onClick={() => toggleWishlist(p.id)} className="text-destructive">
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <Button size="sm" className="w-full mt-2" onClick={() => addToCart({ productId: p.id, name: p.name, qty: 1, price: p.price, weight: p.weight })}>Add to cart</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DemoShell>
  );
}
