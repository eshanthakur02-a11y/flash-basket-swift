import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail, Shield, Store, Bike, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FlashBasket" }] }),
  component: LoginPage,
});

type RoleKey = "admin" | "shopkeeper" | "delivery" | "customer";

const ROLES: Array<{
  key: RoleKey;
  title: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  dashboard: string;
}> = [
  { key: "admin", title: "Admin", subtitle: "Platform Administrator", icon: Shield, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", dashboard: "/admin/dashboard" },
  { key: "shopkeeper", title: "Shopkeeper", subtitle: "Manage your Shop", icon: Store, iconBg: "bg-blue-100", iconColor: "text-blue-600", dashboard: "/shopkeeper/dashboard" },
  { key: "delivery", title: "Delivery", subtitle: "Deliver Orders", icon: Bike, iconBg: "bg-orange-100", iconColor: "text-orange-600", dashboard: "/delivery/dashboard" },
  { key: "customer", title: "Customer", subtitle: "Browse & Order Products", icon: User, iconBg: "bg-violet-100", iconColor: "text-violet-600", dashboard: "/customer/dashboard" },
];

const DEMO_CREDS: Record<RoleKey, { email: string; password: string }> = {
  admin: { email: "admin@example.com", password: "password123" },
  shopkeeper: { email: "shop@example.com", password: "password123" },
  delivery: { email: "delivery@example.com", password: "password123" },
  customer: { email: "customer@example.com", password: "password123" },
};

function LoginPage() {
  const [role, setRole] = useState<RoleKey | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("flashbasket.auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) setEmail(parsed.email);
        if (parsed?.role) setRole(parsed.role);
      }
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role to continue");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setSubmitting(false);
      toast.error(error.message || "Sign-in failed");
      return;
    }
    try {
      if (remember) localStorage.setItem("flashbasket.auth", JSON.stringify({ email, role }));
      else localStorage.removeItem("flashbasket.auth");
    } catch {}
    toast.success(`Welcome back, ${role}`);
    const target = ROLES.find((r) => r.key === role)!.dashboard;
    navigate({ to: target });
  }

  async function handleGoogle() {
    if (!role) {
      toast.error("Please select a role first");
      return;
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/login",
    });
    if (result.error) return toast.error(result.error.message || "Google sign-in failed");
    if (result.redirected) return;
  }

  async function handleForgot() {
    const target = email || window.prompt("Enter your email to receive a reset link") || "";
    if (!target) return;
    const { error } = await supabase.auth.resetPasswordForEmail(target, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent — check your inbox");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-start md:items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-md bg-card md:rounded-3xl md:border md:border-border md:shadow-xl overflow-hidden">
        {/* Hero illustration */}
        <div className="relative h-44 md:h-52 overflow-hidden" style={{ background: "linear-gradient(135deg, #0e3b2a 0%, #134e35 60%, #1a6b48 100%)" }}>
          {/* Skyline silhouette */}
          <div className="absolute inset-x-0 bottom-0 h-20 opacity-30" style={{
            background: "repeating-linear-gradient(90deg, transparent 0 24px, rgba(255,255,255,0.08) 24px 56px)",
          }} />
          <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* clouds */}
            <g fill="rgba(255,255,255,0.12)">
              <ellipse cx="60" cy="40" rx="22" ry="6" />
              <ellipse cx="320" cy="32" rx="28" ry="7" />
              <ellipse cx="350" cy="60" rx="18" ry="5" />
            </g>
            {/* shop with green/white awning */}
            <g transform="translate(40,90)">
              <rect x="0" y="40" width="80" height="60" fill="#f5f5f0" rx="3" />
              <rect x="0" y="30" width="80" height="14" fill="#16a34a" />
              <g fill="#f5f5f0">
                <rect x="0" y="30" width="10" height="14" />
                <rect x="20" y="30" width="10" height="14" />
                <rect x="40" y="30" width="10" height="14" />
                <rect x="60" y="30" width="10" height="14" />
              </g>
              <rect x="10" y="55" width="40" height="6" fill="#cbd5d1" />
              <rect x="10" y="68" width="50" height="4" fill="#cbd5d1" />
              <rect x="10" y="78" width="35" height="4" fill="#cbd5d1" />
              <rect x="55" y="55" width="20" height="45" fill="#1f2937" />
            </g>
            {/* phone center */}
            <g transform="translate(160,30)">
              <rect x="0" y="0" width="78" height="140" rx="14" fill="#ffffff" stroke="#0e3b2a" strokeWidth="2" />
              <rect x="6" y="14" width="66" height="118" rx="6" fill="#f8fafc" />
              <path d="M20 110 Q 38 60 60 30" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
              <circle cx="60" cy="30" r="6" fill="#16a34a" />
              <circle cx="60" cy="30" r="2" fill="#fff" />
            </g>
            {/* package + scooter */}
            <g transform="translate(255,110)">
              <rect x="0" y="20" width="34" height="30" fill="#d8a564" rx="2" />
              <rect x="0" y="30" width="34" height="3" fill="#a07842" />
              <rect x="15" y="20" width="4" height="30" fill="#a07842" />
            </g>
            <g transform="translate(290,80)">
              <circle cx="20" cy="62" r="10" fill="#1f2937" />
              <circle cx="20" cy="62" r="4" fill="#9ca3af" />
              <circle cx="62" cy="62" r="10" fill="#1f2937" />
              <circle cx="62" cy="62" r="4" fill="#9ca3af" />
              <path d="M10 55 Q 25 30 55 35 L 70 55 Z" fill="#16a34a" />
              <rect x="30" y="20" width="22" height="20" rx="3" fill="#16a34a" />
              <circle cx="41" cy="20" r="8" fill="#0e3b2a" />
              <circle cx="41" cy="20" r="5" fill="#16a34a" />
            </g>
          </svg>
        </div>

        <div className="p-6 md:p-8 -mt-3 bg-card rounded-t-3xl relative">
          <div className="text-center">
            <h1 className="font-display text-2xl font-extrabold text-foreground">Welcome Back!</h1>
            <p className="mt-1 text-sm text-muted-foreground">Login to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={show ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pl-10 pr-10"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgot}
                className="text-xs font-bold text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base shadow-md"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or login as</span></div>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <motion.button
                  type="button"
                  key={r.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRole(r.key);
                    const creds = DEMO_CREDS[r.key];
                    setEmail(creds.email);
                    setPassword(creds.password);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2.5 text-center transition-all",
                    active
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
                  )}
                >
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl", r.iconBg)}>
                    <Icon className={cn("h-5 w-5", r.iconColor)} />
                  </span>
                  <span className={cn("text-[11px] font-extrabold leading-tight", active ? "text-primary" : "text-foreground")}>
                    {r.title}
                  </span>
                  <span className="text-[9px] leading-tight text-muted-foreground line-clamp-2">
                    {r.subtitle}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className="mt-4 w-full h-11 rounded-xl font-bold gap-2"
          >
            <GoogleIcon /> Continue with Google
          </Button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo creds hint */}
          <details className="mt-4 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <summary className="cursor-pointer font-bold">Demo credentials</summary>
            <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono">
              <span>admin@example.com</span><span>password123</span>
              <span>shop@example.com</span><span>password123</span>
              <span>delivery@example.com</span><span>password123</span>
              <span>customer@example.com</span><span>password123</span>
            </div>
          </details>
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
