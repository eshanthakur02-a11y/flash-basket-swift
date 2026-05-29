import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FlashBasket" }] }),
  component: LoginPage,
});

async function redirectByRole(navigate: ReturnType<typeof useNavigate>, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("admin")) navigate({ to: "/admin/dashboard" });
  else if (roles.includes("shopkeeper")) navigate({ to: "/shopkeeper/dashboard" });
  else if (roles.includes("delivery")) navigate({ to: "/delivery/dashboard" });
  else navigate({ to: "/customer/home" });
}

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign-in failed");
      return;
    }
    toast.success("Welcome back");
    const { data } = await supabase.auth.getUser();
    if (data.user) await redirectByRole(navigate, data.user.id);
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/login",
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await redirectByRole(navigate, data.user.id);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 gradient-hero overflow-hidden">
        <div className="relative z-10 max-w-md">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95]">
            Groceries at lightning speed.
          </h1>
          <p className="mt-4 text-lg opacity-80">
            Sign in to place orders, track deliveries, and manage your shop or fleet.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 h-80 w-80 rounded-full bg-primary opacity-20 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex justify-center mb-6"><Logo /></Link>
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary fill-primary" />
              <span className="text-sm font-bold">Welcome to FlashBasket</span>
            </div>

            <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-11 rounded-xl font-bold gap-2">
              <GoogleIcon /> Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl mt-1" />
              </div>
              <div>
                <Label htmlFor="pw">Password</Label>
                <div className="relative mt-1">
                  <Input id="pw" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl pr-10" />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-bold">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              New to FlashBasket? <Link to="/signup" className="text-primary font-semibold">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.5 6.6 2.5 12s4.2 9.6 9.5 9.6c5.5 0 9.1-3.8 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
