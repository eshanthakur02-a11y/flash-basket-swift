import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — FlashBasket" }, { name: "description", content: "Sign in or create your FlashBasket account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // login state
  const [li, setLi] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ name: "", email: "", password: "" });

  if (user) {
    navigate({ to: "/dashboard" });
  }

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(li.email, li.password);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(su.email, su.password, su.name);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 gradient-hero overflow-hidden">
        <div className="relative z-10 max-w-md text-foreground">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95]">
            Lightning-fast groceries, right at your door.
          </h1>
          <p className="mt-4 text-lg opacity-80">
            Join FlashBasket and get fresh essentials delivered in 10 minutes.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {["10 min", "Free above ₹199", "100% authentic"].map((t) => (
              <div key={t} className="rounded-2xl bg-card/70 backdrop-blur px-3 py-4 text-sm font-bold">
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-primary opacity-20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
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
                <TabsTrigger value="signup" className="rounded-lg">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <form onSubmit={onLogin} className="space-y-4">
                  <Field id="li-email" label="Email" type="email" value={li.email} onChange={(v) => setLi({ ...li, email: v })} />
                  <Field id="li-password" label="Password" type="password" value={li.password} onChange={(v) => setLi({ ...li, password: v })} />
                  <Button type="submit" disabled={loading} className="w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11">
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={onSignup} className="space-y-4">
                  <Field id="su-name" label="Full name" value={su.name} onChange={(v) => setSu({ ...su, name: v })} />
                  <Field id="su-email" label="Email" type="email" value={su.email} onChange={(v) => setSu({ ...su, email: v })} />
                  <Field id="su-password" label="Password (min 6)" type="password" value={su.password} onChange={(v) => setSu({ ...su, password: v })} />
                  <Button type="submit" disabled={loading} className="w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11">
                    {loading ? "Creating…" : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to FlashBasket's terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, type = "text", value, onChange }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
    </div>
  );
}
