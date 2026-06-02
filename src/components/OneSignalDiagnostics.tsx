import { useEffect, useState } from "react";
import { initOneSignal } from "@/integrations/onesignal";

type Diag = {
  swRegistered: boolean;
  swScope: string | null;
  pushEnabled: boolean;
  permission: string;
  externalId: string | null;
  subscriptionId: string | null;
  error?: string;
};

export function OneSignalDiagnostics() {
  const [d, setD] = useState<Diag | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      await initOneSignal();
      const OS: any = (window as any).OneSignal;
      let swRegistered = false;
      let swScope: string | null = null;
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration("/");
        if (reg) { swRegistered = true; swScope = reg.scope; }
      }
      setD({
        swRegistered,
        swScope,
        pushEnabled: !!OS?.User?.PushSubscription?.optedIn,
        permission: typeof Notification !== "undefined" ? Notification.permission : "unknown",
        externalId: OS?.User?.externalId ?? null,
        subscriptionId: OS?.User?.PushSubscription?.id ?? null,
      });
    } catch (e: any) {
      setD({ swRegistered: false, swScope: null, pushEnabled: false, permission: "error", externalId: null, subscriptionId: null, error: String(e?.message ?? e) });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function requestPerm() {
    setBusy(true);
    try {
      const OS: any = (window as any).OneSignal;
      await OS?.Notifications?.requestPermission();
      await OS?.User?.PushSubscription?.optIn?.();
    } catch (e) { console.warn(e); }
    setBusy(false);
    refresh();
  }

  const Row = ({ k, v, ok }: { k: string; v: React.ReactNode; ok?: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-border text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-mono ${ok === true ? "text-primary" : ok === false ? "text-destructive" : ""}`}>{v}</span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-bold">OneSignal Diagnostics</h2>
        <div className="flex gap-2">
          <button onClick={refresh} className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold">Refresh</button>
          <button onClick={requestPerm} disabled={busy} className="rounded-lg gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
            {busy ? "…" : "Enable push"}
          </button>
        </div>
      </div>
      {!d ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div>
          <Row k="Service Worker Registered" v={d.swRegistered ? "Yes" : "No"} ok={d.swRegistered} />
          <Row k="SW Scope" v={d.swScope ?? "—"} />
          <Row k="Push Enabled" v={d.pushEnabled ? "Yes" : "No"} ok={d.pushEnabled} />
          <Row k="Permission" v={d.permission} ok={d.permission === "granted"} />
          <Row k="OneSignal External ID" v={d.externalId ?? "—"} />
          <Row k="Subscription ID" v={d.subscriptionId ?? "—"} ok={!!d.subscriptionId} />
          {d.error && <p className="mt-2 text-xs text-destructive">{d.error}</p>}
        </div>
      )}
    </div>
  );
}
