import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Phone, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

/** Normalises an Indian mobile number to E.164, which Supabase phone auth requires. */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return digits.length >= 10 ? `+${digits}` : null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return null;
}

export function PhoneOtpForm({
  remember = true,
  onSuccess,
}: {
  remember?: boolean;
  onSuccess: () => void | Promise<void>;
}) {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send() {
    const e164 = toE164(phone);
    if (!e164) return toast.error("Enter a valid 10-digit mobile number");
    setBusy(true);
    const { error } = await sendPhoneOtp(e164);
    setBusy(false);
    if (error) {
      const msg = error.message || "Could not send the code";
      toast.error(
        /provider|disabled|unsupported|not enabled/i.test(msg)
          ? "SMS login isn't active yet — the SMS provider still needs to be configured."
          : msg,
      );
      return;
    }
    setSent(true);
    setCooldown(30);
    toast.success(`Code sent to ${e164}`);
  }

  async function verify() {
    const e164 = toE164(phone);
    if (!e164) return toast.error("Enter a valid mobile number");
    if (code.length < 6) return toast.error("Enter the 6-digit code");
    setBusy(true);
    const { error } = await verifyPhoneOtp(e164, code, remember);
    setBusy(false);
    if (error) return toast.error(error.message || "Invalid or expired code");
    toast.success("Signed in");
    await onSuccess();
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sent}
          className="h-12 rounded-xl pl-10"
        />
      </div>

      {sent && (
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="h-12 rounded-xl pl-10 tracking-[0.4em] font-semibold"
          />
        </div>
      )}

      {!sent ? (
        <Button
          type="button"
          onClick={send}
          disabled={busy}
          className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base shadow-md"
        >
          {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>) : "Send code"}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={verify}
            disabled={busy}
            className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base shadow-md"
          >
            {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…</>) : "Verify & continue"}
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => { setSent(false); setCode(""); }}
              className="text-muted-foreground hover:text-foreground"
            >
              Change number
            </button>
            <button
              type="button"
              onClick={send}
              disabled={cooldown > 0 || busy}
              className="font-bold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
