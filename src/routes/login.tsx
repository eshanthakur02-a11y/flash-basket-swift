import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, Eye, EyeOff, Shield, ShoppingBag, Store, Zap } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { USERS } from "@/lib/demo/seed";
import type { Role } from "@/lib/demo/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FlashBasket Demo" }] }),
  component: LoginPage,
});

const ROLES: { key: Role; label: string; icon: any; color: string; route: string }[] = [
  { key: "customer", label: "Customer", icon: ShoppingBag, color: "bg-primary/15", route: "/customer/home" },
  { key: "shopkeeper", label: "Shopkeeper", icon: Store, color: "bg-accent/40", route: "/shopkeeper/dashboard" },
  { key: "delivery", label: "Delivery Partner", icon: Bike, color: "bg-warning/30", route: "/delivery/dashboard" },
  { key: "admin", label: "Admin", icon: Shield, color: "bg-secondary", route: "/admin/dashboard" },
];

function LoginPage() {
  const [role, setRole] = useState<Role>("customer");
  const [show, setShow] = useState(false);
  const { switchRole } = useDemo();
  const navigate = useNavigate();
  const meta = ROLES.find((r) => r.key === role)!;

  function demoLogin(r: Role) {
    const u = USERS.find((x) => x.role === r);
    switchRole(r, u?.id);
    const dest = ROLES.find((x) => x.key === r)!.route;
    toast.success(`Signed in as ${u?.name}`);
    navigate({ to: dest });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    demoLogin(role);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 gradient-hero overflow-hidden">
        <div className="relative z-10 max-w-md">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95]">
            One platform. Four experiences. Lightning-fast.
          </h1>
          <p className="mt-4 text-lg opacity-80">
            Sign in as a Customer, Shopkeeper, Delivery Partner or Admin and watch a real order flow end-to-end.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.key} className={cn("rounded-2xl p-4 bg-card/70 backdrop-blur border border-border")}>
                  <Icon className="h-5 w-5 mb-2 text-primary" />
                  <div className="text-sm font-bold">{r.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-primary opacity-20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex justify-center mb-6"><Logo /></Link>
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm font-bold">Welcome to FlashBasket</span>
            </div>

            <Tabs defaultValue="login" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg" asChild>
                  <Link to="/signup">Sign up</Link>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-5 space-y-4">
                <div>
                  <Label className="text-xs">Sign in as</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {ROLES.map((r) => {
                      const Icon = r.icon;
                      const active = r.key === role;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => setRole(r.key)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                            active ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={USERS.find((u) => u.role === role)?.email} className="h-11 rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="pw">Password</Label>
                    <div className="relative mt-1">
                      <Input id="pw" type={show ? "text" : "password"} defaultValue="demo1234" className="h-11 rounded-xl pr-10" />
                      <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Remember me</label>
                    <button type="button" className="text-primary font-semibold">Forgot password?</button>
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-bold">
                    Sign in as {meta.label}
                  </Button>
                </form>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-card px-2 text-muted-foreground">Try the demo</span></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Button key={r.key} type="button" variant="outline" className="rounded-xl h-11 justify-start gap-2 text-xs font-bold" onClick={() => demoLogin(r.key)}>
                        <Icon className="h-4 w-4 text-primary" /> Demo {r.label}
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Frontend demo · No real accounts created · Data lives in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
