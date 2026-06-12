import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Zap, Phone as PhoneIcon, ArrowLeft } from "lucide-react";
import { z } from "zod";

async function redirectByRole(navigate: ReturnType<typeof useNavigate>, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("admin")) navigate({ to: "/admin/dashboard" });
  else if (roles.includes("shopkeeper")) navigate({ to: "/shopkeeper/dashboard" });
  else if (roles.includes("delivery")) navigate({ to: "/delivery/dashboard" });
  else if (roles.includes("support")) navigate({ to: "/support/dashboard" });
  else navigate({ to: "/customer/home" });
}

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — FlashBasket" }, { name: "description", content: "Sign in or create your FlashBasket account with mobile OTP." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [li, setLi] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (user) redirectByRole(navigate, user.id);
  }, [user, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(li.email, li.password);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Welcome back!");
      const { data } = await supabase.auth.getUser();
      if (data.user) await redirectByRole(navigate, data.user.id);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(su.email, su.password, su.name);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to confirm.");
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
            <Tabs defaultValue="phone" className="mt-4">
              <TabsList className="grid w-full grid-cols-3 rounded-xl">
                <TabsTrigger value="phone" className="rounded-lg">Phone OTP</TabsTrigger>
                <TabsTrigger value="login" className="rounded-lg">Email</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="phone" className="mt-4">
                <PhoneOtpForm onAuthed={(uid) => redirectByRole(navigate, uid)} />
              </TabsContent>

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

function Field({ id, label, type = "text", value, onChange, required = true }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
    </div>
  );
}

// ----- Phone OTP -----

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  countryCode: z.string().regex(/^\+\d{1,4}$/, "Use format +91"),
  phone: z.string().regex(/^\d{6,14}$/, "Digits only, 6–14 chars"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
});

type Step = "request" | "verify" | "complete";

function PhoneOtpForm({ onAuthed }: { onAuthed: (userId: string) => void }) {
  const [step, setStep] = useState<Step>("request");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [form, setForm] = useState({ fullName: "", countryCode: "+91", phone: "", email: "" });
  const [otp, setOtp] = useState("");
  const [profile, setProfile] = useState({ fullName: "", email: "", address: "" });
  const timerRef = useRef<number | null>(null);

  const e164 = `${form.countryCode}${form.phone}`;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    timerRef.current = t;
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [resendIn]);

  const sendOtp = async (resend = false) => {
    const parsed = requestSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: {
        shouldCreateUser: true,
        data: { full_name: form.fullName.trim(), phone: e164, ...(form.email ? { email: form.email.trim() } : {}) },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(resend ? "OTP resent" : "OTP sent to your phone");
    setStep("verify");
    setResendIn(30);
  };

  const verify = async () => {
    if (!/^\d{4,8}$/.test(otp)) { toast.error("Enter the OTP code"); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: "sms" });
    setBusy(false);
    if (error || !data.user) { toast.error(error?.message ?? "Verification failed"); return; }

    // Top up profile with name/email if provided at request step
    const updates: Record<string, string> = {};
    if (form.fullName) updates.full_name = form.fullName.trim();
    if (form.email) updates.email = form.email.trim();
    if (Object.keys(updates).length) {
      await supabase.from("profiles").update(updates).eq("id", data.user.id);
    }

    // Decide if profile is complete
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, email, address")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!prof?.full_name) {
      setProfile({
        fullName: prof?.full_name ?? form.fullName,
        email:    prof?.email ?? form.email,
        address:  prof?.address ?? "",
      });
      setStep("complete");
      return;
    }
    toast.success("Signed in");
    onAuthed(data.user.id);
  };

  const completeProfile = async () => {
    const name = profile.fullName.trim();
    if (name.length < 2) { toast.error("Enter your full name"); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }
    const updates: Record<string, string | null> = {
      full_name: name,
      email: profile.email.trim() || null,
      address: profile.address.trim() || null,
    };
    const { error } = await supabase.from("profiles").update(updates).eq("id", u.user.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    onAuthed(u.user.id);
  };

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <button type="button" className="text-xs text-muted-foreground inline-flex items-center gap-1" onClick={() => setStep("request")}>
          <ArrowLeft className="h-3 w-3" /> Change number
        </button>
        <div className="text-sm">We sent a code to <span className="font-bold">{e164}</span></div>
        <div className="space-y-1.5">
          <Label htmlFor="otp">OTP code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            className="h-12 rounded-xl text-center text-xl tracking-[0.5em] font-bold"
            placeholder="••••••"
          />
          <p className="text-[11px] text-muted-foreground">Code expires in 5 minutes.</p>
        </div>
        <Button onClick={verify} disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11">
          {busy ? "Verifying…" : "Verify OTP"}
        </Button>
        <Button variant="ghost" disabled={busy || resendIn > 0} onClick={() => sendOtp(true)} className="w-full h-9 text-sm">
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </Button>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Complete your profile to continue.</p>
        <Field id="cp-name" label="Full name" value={profile.fullName} onChange={(v) => setProfile({ ...profile, fullName: v })} />
        <Field id="cp-email" label="Email (optional)" type="email" required={false} value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
        <Field id="cp-addr" label="Address (optional)" required={false} value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} />
        <Button onClick={completeProfile} disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11">
          {busy ? "Saving…" : "Save & continue"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Field id="po-name" label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
      <div className="space-y-1.5">
        <Label htmlFor="po-phone">Mobile number</Label>
        <div className="flex gap-2">
          <Input
            id="po-cc"
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            className="h-11 rounded-xl w-20"
            placeholder="+91"
          />
          <Input
            id="po-phone"
            inputMode="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 14) })}
            className="h-11 rounded-xl flex-1"
            placeholder="9876543210"
          />
        </div>
      </div>
      <Field id="po-email" label="Email (optional)" type="email" required={false} value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      <Button onClick={() => sendOtp(false)} disabled={busy} className="w-full rounded-xl gradient-primary text-primary-foreground font-bold h-11">
        <PhoneIcon className="h-4 w-4 mr-2" />
        {busy ? "Sending…" : "Send OTP"}
      </Button>
      <p className="text-[11px] text-muted-foreground">New users are created as customers. Only an admin can grant other roles.</p>
    </div>
  );
}
