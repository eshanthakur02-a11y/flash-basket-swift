import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck, ArrowLeft, Shield, Store, Bike, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/staff-login")({
  head: () => ({ meta: [{ title: "Management Portal — FlashBasket" }] }),
  component: StaffLoginPage,
});

const STAFF_ROLES = ["admin", "shopkeeper", "delivery", "support"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

const DASHBOARD: Record<StaffRole, string> = {
  admin: "/admin/dashboard",
  shopkeeper: "/shopkeeper/dashboard",
  delivery: "/delivery/dashboard",
  support: "/support/dashboard",
};

function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setSubmitting(false);
      toast.error(error.message || "Sign-in failed");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let roles: string[] = [];
    if (user) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      roles = (data ?? []).map((r: any) => r.role);
    }

    const staffRole = STAFF_ROLES.find((r) => roles.includes(r));
    if (!staffRole) {
      setSubmitting(false);
      await supabase.auth.signOut();
      toast.error("This account does not have staff access");
      return;
    }

    toast.success(`Welcome, ${staffRole}`);
    navigate({ to: DASHBOARD[staffRole] as any });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to customer app
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold">Management Portal</h1>
              <p className="text-xs text-slate-400">Staff access only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                required
                placeholder="Staff email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type={show ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-base shadow-md"
            >
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>) : "Login to Portal"}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Authorized roles</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Admin", icon: Shield },
                { label: "Shopkeeper", icon: Store },
                { label: "Delivery", icon: Bike },
                { label: "Support", icon: Headphones },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                  <Icon className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            Customer? <Link to="/login" className="text-emerald-400 font-semibold hover:underline">Use the main app</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
