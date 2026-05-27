import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, ShoppingBag, Store, Upload } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { USERS } from "@/lib/demo/seed";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — FlashBasket Demo" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [tab, setTab] = useState("customer");
  const { switchRole } = useDemo();
  const navigate = useNavigate();

  function fakeSignup(role: "customer" | "shopkeeper" | "delivery") {
    const u = USERS.find((x) => x.role === role);
    switchRole(role, u?.id);
    toast.success("Account created (demo). Signed in!");
    navigate({ to: role === "customer" ? "/customer/home" : role === "shopkeeper" ? "/shopkeeper/dashboard" : "/delivery/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-xl">
        <Link to="/" className="flex justify-center mb-6"><Logo /></Link>
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
          <h1 className="font-display text-3xl font-extrabold">Join FlashBasket</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a demo account — no real data stored.</p>

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid grid-cols-3 rounded-xl w-full">
              <TabsTrigger value="customer" className="rounded-lg gap-1"><ShoppingBag className="h-4 w-4" />Customer</TabsTrigger>
              <TabsTrigger value="shopkeeper" className="rounded-lg gap-1"><Store className="h-4 w-4" />Shopkeeper</TabsTrigger>
              <TabsTrigger value="delivery" className="rounded-lg gap-1"><Bike className="h-4 w-4" />Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="mt-5">
              <form onSubmit={(e) => { e.preventDefault(); fakeSignup("customer"); }} className="grid sm:grid-cols-2 gap-3">
                <Field label="Full name" placeholder="Aarav Sharma" />
                <Field label="Mobile" placeholder="+91 98765 43210" />
                <Field label="Email" type="email" placeholder="you@email.com" />
                <Field label="Password" type="password" />
                <Field label="Confirm Password" type="password" />
                <Field label="Primary delivery address" placeholder="Saket, New Delhi" className="sm:col-span-2" />
                <Button type="submit" className="sm:col-span-2 h-11 rounded-xl gradient-primary text-primary-foreground font-bold">Create customer account</Button>
              </form>
            </TabsContent>

            <TabsContent value="shopkeeper" className="mt-5">
              <form onSubmit={(e) => { e.preventDefault(); fakeSignup("shopkeeper"); }} className="grid sm:grid-cols-2 gap-3">
                <Field label="Owner name" />
                <Field label="Store name" placeholder="Sweet Crumbs Bakery" />
                <Field label="Store category" placeholder="Cakes and Bakery" />
                <Field label="Email" type="email" />
                <Field label="Mobile" />
                <Field label="City / service area" />
                <Field label="Store address" className="sm:col-span-2" />
                <Field label="Password" type="password" />
                <Field label="Confirm Password" type="password" />
                <FileUpload label="Business licence" />
                <FileUpload label="Food licence" />
                <label className="sm:col-span-2 text-xs flex items-center gap-2"><input type="checkbox" defaultChecked /> I accept the seller terms</label>
                <Button type="submit" className="sm:col-span-2 h-11 rounded-xl gradient-primary text-primary-foreground font-bold">Create shopkeeper account</Button>
              </form>
            </TabsContent>

            <TabsContent value="delivery" className="mt-5">
              <form onSubmit={(e) => { e.preventDefault(); fakeSignup("delivery"); }} className="grid sm:grid-cols-2 gap-3">
                <Field label="Full name" />
                <Field label="Mobile" />
                <Field label="Email" type="email" />
                <Field label="Vehicle type" placeholder="Bike / Scooter" />
                <Field label="Vehicle number" placeholder="DL 03 AB 4321" />
                <Field label="Preferred service area" placeholder="South Delhi" />
                <Field label="Password" type="password" />
                <Field label="Confirm Password" type="password" />
                <FileUpload label="Driving licence" />
                <FileUpload label="Identity proof" />
                <label className="sm:col-span-2 text-xs flex items-center gap-2"><input type="checkbox" defaultChecked /> I accept the delivery partner terms</label>
                <Button type="submit" className="sm:col-span-2 h-11 rounded-xl gradient-primary text-primary-foreground font-bold">Create delivery account</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, className }: { label: string; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <Input type={type} placeholder={placeholder} required className="h-11 rounded-xl mt-1" />
    </div>
  );
}
function FileUpload({ label }: { label: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <button type="button" className="mt-1 w-full h-11 rounded-xl border border-dashed border-border bg-secondary/30 text-muted-foreground text-xs flex items-center justify-center gap-2 hover:bg-secondary/60">
        <Upload className="h-4 w-4" /> Upload document
      </button>
    </div>
  );
}
