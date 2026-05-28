import { createFileRoute, Link, useNavigate, useParams, notFound } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { findProduct, findStore } from "@/lib/demo/seed";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { rupees } from "@/lib/format";
import { Cake, ChevronLeft, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/customer/product/$id")({
  head: () => ({ meta: [{ title: "Product — FlashBasket" }] }),
  loader: ({ params }) => {
    const p = findProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  notFoundComponent: () => <div className="p-10 text-center">Product not found</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { id } = useParams({ from: "/customer/product/$id" });
  const product = findProduct(id)!;
  const store = findStore(product.storeId);
  const { addToCart } = useDemo();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [eggless, setEggless] = useState(true);
  const [message, setMessage] = useState("Happy Birthday Riya");
  const [candles, setCandles] = useState(true);
  const [knife, setKnife] = useState(true);
  const [instructions, setInstructions] = useState("Please pack carefully and include candles.");

  function add(go: boolean) {
    addToCart({
      productId: product.id,
      name: product.name,
      qty,
      price: product.price,
      weight: product.weight,
      customization: product.customizable ? { eggless, message, candles, knife, instructions } : undefined,
    });
    if (go) navigate({ to: "/customer/cart" });
  }

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-5xl mx-auto">
        <button onClick={() => history.back()} className="flex items-center gap-1 text-sm text-muted-foreground mb-4"><ChevronLeft className="h-4 w-4" />Back</button>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-gradient-to-br from-warning/40 to-primary/30 grid place-items-center text-9xl aspect-square">{product.image}</div>
          <div>
            <div className="text-xs font-bold text-muted-foreground">{store.name}</div>
            <h1 className="font-display text-3xl font-extrabold mt-1">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{product.rating}</span>
              <span className="text-muted-foreground">{product.weight}</span>
              <span className="text-success font-bold">In stock</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold">{rupees(product.price)}</span>
              <span className="text-sm text-muted-foreground">incl. taxes</span>
            </div>

            {product.customizable && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="font-bold flex items-center gap-2"><Cake className="h-4 w-4 text-primary" />Customize your cake</div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Eggless</Label>
                  <Switch checked={eggless} onCheckedChange={setEggless} />
                </div>
                <div>
                  <Label className="text-xs">Message on the cake</Label>
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 rounded-xl" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Add candles</Label>
                  <Switch checked={candles} onCheckedChange={setCandles} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Add knife</Label>
                  <Switch checked={knife} onCheckedChange={setKnife} />
                </div>
                <div>
                  <Label className="text-xs">Special instructions</Label>
                  <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm" />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border p-1">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button onClick={() => add(false)} variant="outline" className="rounded-xl h-11 flex-1">Add to cart</Button>
              <Button onClick={() => add(true)} className="rounded-xl h-11 flex-1 gradient-primary text-primary-foreground font-bold">Buy now</Button>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
