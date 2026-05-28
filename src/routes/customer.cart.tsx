import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { rupees } from "@/lib/format";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/demo/Bits";
import { findProduct } from "@/lib/demo/seed";

export const Route = createFileRoute("/customer/cart")({
  head: () => ({ meta: [{ title: "Cart — FlashBasket" }] }),
  component: CartPage,
});

function CartPage() {
  const { state, updateQty, removeFromCart } = useDemo();
  const subtotal = state.cart.reduce((a, b) => a + b.price * b.qty, 0);
  const deliveryFee = subtotal > 0 ? 49 : 0;
  const platformFee = subtotal > 0 ? 9 : 0;
  const total = subtotal + deliveryFee + platformFee;

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>
        {state.cart.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Add some groceries or a custom cake and they'll appear here."
              action={<Link to="/customer/shop"><Button className="rounded-xl gradient-primary text-primary-foreground">Start shopping</Button></Link>} />
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-3">
              {state.cart.map(item => {
                const p = findProduct(item.productId);
                return (
                  <div key={item.productId} className="rounded-2xl border border-border bg-card p-4 flex gap-4">
                    <div className="h-16 w-16 rounded-xl bg-secondary grid place-items-center text-3xl shrink-0">{p?.image ?? "🛒"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.weight}</div>
                      {item.customization?.message && <div className="text-[11px] text-primary mt-1">"{item.customization.message}" · {item.customization.eggless ? "Eggless" : "With egg"}</div>}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.productId, item.qty - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.productId, item.qty + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><Trash2 className="h-3 w-3" />Remove</button>
                      </div>
                    </div>
                    <div className="font-extrabold">{rupees(item.price * item.qty)}</div>
                  </div>
                );
              })}
            </div>
            <aside className="rounded-2xl border border-border bg-card p-5 h-fit sticky top-20">
              <h2 className="font-bold">Bill details</h2>
              <Row label="Subtotal" value={rupees(subtotal)} />
              <Row label="Delivery fee" value={rupees(deliveryFee)} />
              <Row label="Platform fee" value={rupees(platformFee)} />
              <hr className="my-3 border-border" />
              <Row label="Total" value={rupees(total)} bold />
              <Link to="/customer/checkout"><Button className="w-full mt-4 h-11 rounded-xl gradient-primary text-primary-foreground font-bold">Proceed to checkout</Button></Link>
            </aside>
          </div>
        )}
      </div>
    </DemoShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between text-sm mt-2 ${bold ? "font-extrabold text-base" : "text-muted-foreground"}`}><span>{label}</span><span className={bold ? "text-foreground" : ""}>{value}</span></div>;
}
