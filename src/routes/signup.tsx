import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — FlashBasket" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Signup failed");
      return;
    }
    toast.success("Account created. Check your email to verify, then sign in.");
    navigate({ to: "/login" });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/login",
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6"><Logo /></Link>
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
          <h1 className="font-display text-3xl font-extrabold">Join FlashBasket</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your account to start ordering.</p>

          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-11 rounded-xl font-bold gap-2 mt-5">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.4 12 2.4 6.7 2.4 2.5 6.6 2.5 12s4.2 9.6 9.5 9.6c5.5 0 9.1-3.8 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Full name</Label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl mt-1" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl mt-1" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-bold">
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-5 text-center">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
