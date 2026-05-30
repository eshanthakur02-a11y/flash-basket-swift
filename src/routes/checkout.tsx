import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { MapPin, Plus, Wallet, CreditCard, Tag, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rupees } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — FlashBasket" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const addresses = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () =>
      user ? (await supabase.from("addresses").select("*").eq("user_id", user.id)).data ?? [] : [],
    enabled: !!user,
  });

  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "",
    type: "home" as "home" | "work" | "other",
  });
  const [coupon, setCoupon] = useState("");
  const [instruction, setInstruction] = useState("");
  const [method, setMethod] = useState<"cod" | "razorpay">("cod");
  const [placing, setPlacing] = useState(false);

  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/products" className="mt-4 inline-block text-primary font-bold">Shop now →</Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 199 ? 0 : 25;
  const handling = 5;
  const total = subtotal + deliveryFee + handling;

  // pick default
  if (!selectedAddr && (addresses.data?.length ?? 0) > 0) {
    const def = addresses.data!.find((a) => a.is_default) ?? addresses.data![0];
    setSelectedAddr(def.id);
  }

  const saveNewAddress = async () => {
    if (!newAddr.line1 || !newAddr.city || !newAddr.pincode || !newAddr.phone || !newAddr.name) {
      toast.error("Please fill name, phone, line 1, city and pincode");
      return;
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...newAddr, user_id: user.id })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setSelectedAddr(data.id);
    setShowNew(false);
    addresses.refetch();
    toast.success("Address saved");
  };

  const place = async () => {
    const addr =
      selectedAddr && addresses.data?.find((a) => a.id === selectedAddr);
    if (!addr) return toast.error("Please add a delivery address");

    // place_order RPC needs lat/lng for nearest-shop routing.
    // Default to Bengaluru center if the saved address has none.
    const addressWithCoords: any = {
      ...addr,
      lat: (addr as any).lat ?? 12.95,
      lng: (addr as any).lng ?? 77.64,
    };

    setPlacing(true);
    const { data, error } = await supabase.rpc("place_order", {
      _address: addressWithCoords,
      _payment_method: method,
      _coupon_code: coupon || undefined,
      _delivery_instruction: instruction || undefined,
    });

    setPlacing(false);
    if (error) return toast.error(error.message);

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    toast.success("Order placed!");
    clear();
    navigate({ to: "/orders/$id", params: { id: data as string } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 grid md:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        {/* Address */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Delivery address
          </h2>
          <div className="mt-3 space-y-2">
            {addresses.data?.map((a) => (
              <label
                key={a.id}
                className={`flex items-start gap-3 rounded-2xl border-2 p-3 cursor-pointer ${selectedAddr === a.id ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <input
                  type="radio"
                  name="addr"
                  className="mt-1"
                  checked={selectedAddr === a.id}
                  onChange={() => setSelectedAddr(a.id)}
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {a.name} <span className="ml-2 text-xs rounded-full bg-secondary px-2 py-0.5">{a.type}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {a.line1}, {a.line2 ? `${a.line2}, ` : ""}{a.city}, {a.state} - {a.pincode}
                  </div>
                  <div className="text-xs text-muted-foreground">📞 {a.phone}</div>
                </div>
              </label>
            ))}
            {!showNew ? (
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 w-full text-sm hover:border-primary"
              >
                <Plus className="h-4 w-4" /> Add a new address
              </button>
            ) : (
              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <FormInput id="n" label="Full name" v={newAddr.name} set={(v) => setNewAddr({ ...newAddr, name: v })} />
                  <FormInput id="p" label="Phone" v={newAddr.phone} set={(v) => setNewAddr({ ...newAddr, phone: v })} />
                </div>
                <FormInput id="l1" label="House / flat / building" v={newAddr.line1} set={(v) => setNewAddr({ ...newAddr, line1: v })} />
                <FormInput id="l2" label="Area / street (optional)" v={newAddr.line2} set={(v) => setNewAddr({ ...newAddr, line2: v })} />
                <FormInput id="lm" label="Landmark (optional)" v={newAddr.landmark} set={(v) => setNewAddr({ ...newAddr, landmark: v })} />
                <div className="grid sm:grid-cols-3 gap-3">
                  <FormInput id="c" label="City" v={newAddr.city} set={(v) => setNewAddr({ ...newAddr, city: v })} />
                  <FormInput id="s" label="State" v={newAddr.state} set={(v) => setNewAddr({ ...newAddr, state: v })} />
                  <FormInput id="pn" label="Pincode" v={newAddr.pincode} set={(v) => setNewAddr({ ...newAddr, pincode: v })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveNewAddress} className="rounded-xl gradient-primary text-primary-foreground">Save address</Button>
                  <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Instruction */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Delivery instructions</h2>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., leave at the door, call on arrival…"
            className="mt-3 rounded-xl"
          />
        </section>

        {/* Payment */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-xl font-bold">Payment method</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer ${method === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <div className="font-bold">Cash on Delivery</div>
                <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
              </div>
            </label>
            <label className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer ${method === "razorpay" ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="radio" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} />
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <div className="font-bold">Online (Razorpay)</div>
                <div className="text-xs text-muted-foreground">UPI / Card / Netbanking (test mode)</div>
              </div>
            </label>
          </div>
          {method === "razorpay" && (
            <div className="mt-3 rounded-xl bg-warning/15 border border-warning/40 p-3 text-xs">
              Razorpay test integration: order will be marked as <strong>pending payment</strong>. Add your Razorpay
              keys in project secrets to enable real payments.
            </div>
          )}
        </section>
      </div>

      {/* Summary */}
      <aside className="md:sticky md:top-24 self-start space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" /> Apply coupon
          </h3>
          <div className="flex gap-2">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="FLASH50" className="rounded-xl uppercase" />
            <Button variant="outline" className="rounded-xl" onClick={() => toast.info("Coupon will be applied at checkout")}>Apply</Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Try FLASH50, SAVE10, or WELCOME</div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-bold mb-3">Bill summary</h3>
          <Row label={`Item total (${items.length})`} value={rupees(subtotal)} />
          <Row label="Delivery" value={deliveryFee === 0 ? "FREE" : rupees(deliveryFee)} />
          <Row label="Handling" value={rupees(handling)} />
          <div className="my-3 h-px bg-border" />
          <Row label="To pay" value={rupees(total)} bold />
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              disabled={placing || !selectedAddr}
              onClick={place}
              className="mt-5 w-full h-12 rounded-xl gradient-primary text-primary-foreground font-bold shadow-glow"
            >
              <Zap className="h-4 w-4 mr-2 fill-current" /> {placing ? "Placing…" : `Place order • ${rupees(total)}`}
            </Button>
          </motion.div>
        </div>
      </aside>
    </div>
  );
}

function FormInput({ id, label, v, set }: { id: string; label: string; v: string; set: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} value={v} onChange={(e) => set(e.target.value)} className="h-10 rounded-xl" />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1 text-sm ${bold ? "text-base font-bold" : ""}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
