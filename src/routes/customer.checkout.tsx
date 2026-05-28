import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DemoShell } from "@/components/demo/DemoShell";
import { CUSTOMER_NAV } from "@/lib/demo/nav";
import { useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rupees } from "@/lib/format";
import { Banknote, CreditCard, MapPin, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";
import { COUPONS, PRODUCTS, findUser } from "@/lib/demo/seed";
import { toast } from "sonner";
import type { Order } from "@/lib/demo/types";

export const Route = createFileRoute("/customer/checkout")({
  head: () => ({ meta: [{ title: "Checkout — FlashBasket" }] }),
  component: CheckoutPage,
});

const METHODS: { id: Order["payment"]; label: string; icon: any }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

function CheckoutPage() {
  const { state, placeOrder } = useDemo();
  const navigate = useNavigate();
  const user = findUser(state.currentUserId);
  const [address, setAddress] = useState(user?.address ?? "House 28, Lake View Apartments, Saket, New Delhi");
  const [payment, setPayment] = useState<Order["payment"]>("upi");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | undefined>();

  const subtotal = state.cart.reduce((a, b) => a + b.price * b.qty, 0);
  const deliveryFee = coupon && coupon.code === "FREEDEL" ? 0 : 49;
  const platformFee = 9;
  const discount = coupon?.discount ?? 0;
  const total = subtotal + deliveryFee + platformFee - discount;
  const storeId = state.cart[0] ? (PRODUCTS.find(p => p.id === state.cart[0].productId)?.storeId ?? "store1") : "store1";

  function applyCoupon() {
    const c = COUPONS.find(x => x.code.toLowerCase() === code.toLowerCase());
    if (!c) { toast.error("Invalid coupon"); return; }
    if (c.minOrder && subtotal < c.minOrder) { toast.error(`Min order ₹${c.minOrder} required`); return; }
    let d = 0;
    if (c.type === "flat") d = c.value;
    else if (c.type === "percent") d = Math.round((subtotal * c.value) / 100);
    setCoupon({ code: c.code, discount: d });
    toast.success(`Coupon ${c.code} applied`);
  }

  function place() {
    if (state.cart.length === 0) return;
    const o = placeOrder({ items: state.cart, storeId, payment, address, coupon, deliveryFee });
    navigate({ to: "/customer/orders/$id", params: { id: o.id } });
  }

  if (state.cart.length === 0) {
    return (
      <DemoShell role="customer" nav={CUSTOMER_NAV}>
        <div className="p-10 text-center">Your cart is empty.</div>
      </DemoShell>
    );
  }

  return (
    <DemoShell role="customer" nav={CUSTOMER_NAV}>
      <div className="px-4 py-5 max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-extrabold">Checkout</h1>
        <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-primary" /><h2 className="font-bold">Delivery address</h2></div>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold mb-3">Apply coupon</h2>
              <div className="flex gap-2">
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="h-10 rounded-xl" />
                <Button onClick={applyCoupon} variant="outline" className="rounded-xl">Apply</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {COUPONS.map(c => (
                  <button key={c.code} onClick={() => setCode(c.code)} className="text-[11px] rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-bold">{c.code} · {c.desc}</button>
                ))}
              </div>
              {coupon && <div className="mt-2 text-xs text-success font-bold">{coupon.code} applied · saved {rupees(discount)}</div>}
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold mb-3">Payment method</h2>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map(m => {
                  const Icon = m.icon;
                  const active = payment === m.id;
                  return (
                    <button key={m.id} onClick={() => setPayment(m.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}>
                      <Icon className="h-4 w-4" />{m.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">Demo payment — no real charges. Selecting UPI/Card/Wallet will mark the order as paid instantly.</p>
            </section>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 h-fit sticky top-20">
            <h2 className="font-bold">Order summary</h2>
            <div className="text-xs text-muted-foreground mt-1">{state.cart.length} item{state.cart.length > 1 ? "s" : ""}</div>
            <div className="mt-3 space-y-1.5 text-sm">
              {state.cart.map(i => <div key={i.productId} className="flex justify-between"><span className="truncate pr-2">{i.qty}× {i.name}</span><span>{rupees(i.price * i.qty)}</span></div>)}
            </div>
            <hr className="my-3 border-border" />
            <Row label="Subtotal" value={rupees(subtotal)} />
            <Row label="Delivery" value={rupees(deliveryFee)} />
            <Row label="Platform fee" value={rupees(platformFee)} />
            {discount > 0 && <Row label="Discount" value={`- ${rupees(discount)}`} />}
            <Row label="Total payable" value={rupees(total)} bold />
            <Button onClick={place} className="w-full mt-4 h-11 rounded-xl gradient-primary text-primary-foreground font-bold">Place order · {rupees(total)}</Button>
          </aside>
        </div>
      </div>
    </DemoShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between text-sm mt-1.5 ${bold ? "font-extrabold text-base mt-3" : "text-muted-foreground"}`}><span>{label}</span><span className={bold ? "text-foreground" : ""}>{value}</span></div>;
}
