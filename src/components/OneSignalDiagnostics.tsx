import { useEffect, useState } from "react";
import { initOneSignal } from "@/integrations/onesignal";

type Reg = { scope: string; scriptURL: string; state: string };
type Diag = {
  origin: string;
  appId: string;
  swSupported: boolean;
  swRegistrations: Reg[];
  oneSignalSWFound: boolean;
  oneSignalSWReachable: boolean | null;
  oneSignalSWStatus: number | null;
  initOk: boolean;
  pushEnabled: boolean;
  permission: string;
  externalId: string | null;
  subscriptionId: string | null;
  subscriptionToken: string | null;
  error?: string;
};

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "0179c4bc-1662-45b2-8be2-0826d8f3dc2b";

export function OneSignalDiagnostics() {
  const [d, setD] = useState<Diag | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (m: string) => {
    console.log("[OneSignal Diag]", m);
    setLog((l) => [...l.slice(-30), `${new Date().toLocaleTimeString()}  ${m}`]);
  };

  async function readRegistrations(): Promise<Reg[]> {
    if (!("serviceWorker" in navigator)) return [];
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.map((r) => {
      const sw = r.active || r.installing || r.waiting;
      return {
        scope: r.scope,
        scriptURL: sw?.scriptURL ?? "(none)",
        state: sw?.state ?? "unknown",
      };
    });
  }

  async function refresh() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    let initOk = false;
    let error: string | undefined;
    try {
      addLog("calling initOneSignal()");
      await initOneSignal();
      initOk = true;
      addLog("initOneSignal() resolved");
    } catch (e: any) {
      error = String(e?.message ?? e);
      addLog("initOneSignal() error: " + error);
    }

    const OS: any = (window as any).OneSignal;
    const swSupported = "serviceWorker" in navigator;
    const swRegistrations = await readRegistrations();
    const oneSignalSWFound = swRegistrations.some((r) =>
      r.scriptURL.includes("OneSignalSDKWorker") || r.scriptURL.includes("OneSignalSDK.sw"),
    );

    // Probe worker file reachability
    let oneSignalSWReachable: boolean | null = null;
    let oneSignalSWStatus: number | null = null;
    try {
      const res = await fetch("/OneSignalSDKWorker.js", { cache: "no-store" });
      oneSignalSWStatus = res.status;
      oneSignalSWReachable = res.ok;
      addLog(`/OneSignalSDKWorker.js -> HTTP ${res.status}`);
    } catch (e: any) {
      oneSignalSWReachable = false;
      addLog("worker fetch failed: " + String(e?.message ?? e));
    }

    const diag: Diag = {
      origin,
      appId: APP_ID,
      swSupported,
      swRegistrations,
      oneSignalSWFound,
      oneSignalSWReachable,
      oneSignalSWStatus,
      initOk,
      pushEnabled: !!OS?.User?.PushSubscription?.optedIn,
      permission: typeof Notification !== "undefined" ? Notification.permission : "unknown",
      externalId: OS?.User?.externalId ?? null,
      subscriptionId: OS?.User?.PushSubscription?.id ?? null,
      subscriptionToken: OS?.User?.PushSubscription?.token ?? null,
      error,
    };
    addLog(`SW regs=${swRegistrations.length} oneSignal=${oneSignalSWFound} perm=${diag.permission} subId=${diag.subscriptionId ?? "—"}`);
    console.log("[OneSignal Diag] full state", diag);
    setD(diag);
  }

  useEffect(() => {
    refresh();
    // listen for subscription changes once
    let off: any;
    (async () => {
      try {
        await initOneSignal();
        const OS: any = (window as any).OneSignal;
        OS?.User?.PushSubscription?.addEventListener?.("change", (ev: any) => {
          addLog("PushSubscription change: " + JSON.stringify(ev?.current ?? ev));
          refresh();
        });
        off = () => {};
      } catch {}
    })();
    return () => { try { off?.(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestPerm() {
    setBusy(true);
    try {
      addLog("requestPermission() …");
      const OS: any = (window as any).OneSignal;
      const result = await OS?.Notifications?.requestPermission();
      addLog("requestPermission result: " + String(result));
      try {
        await OS?.User?.PushSubscription?.optIn?.();
        addLog("PushSubscription.optIn() called");
      } catch (e: any) {
        addLog("optIn error: " + String(e?.message ?? e));
      }
      // Give the SDK time to register the SW + create the subscription
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e: any) {
      addLog("requestPerm error: " + String(e?.message ?? e));
    }
    setBusy(false);
    refresh();
  }

  async function unregisterAll() {
    setBusy(true);
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        const ok = await r.unregister();
        addLog(`unregister ${r.scope} -> ${ok}`);
      }
    } catch (e: any) {
      addLog("unregister error: " + String(e?.message ?? e));
    }
    setBusy(false);
    refresh();
  }

  const Row = ({ k, v, ok }: { k: string; v: React.ReactNode; ok?: boolean }) => (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-mono text-right break-all ${ok === true ? "text-primary" : ok === false ? "text-destructive" : ""}`}>{v}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">OneSignal Diagnostics</h2>
          <div className="flex gap-2 flex-wrap">
            <button onClick={refresh} className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold">Refresh</button>
            <button onClick={unregisterAll} disabled={busy} className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold">Unregister SWs</button>
            <button onClick={requestPerm} disabled={busy} className="rounded-lg gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold">
              {busy ? "…" : "Enable push"}
            </button>
          </div>
        </div>
        {!d ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div>
            <Row k="Origin" v={d.origin} />
            <Row k="App ID" v={d.appId} />
            <Row k="init() OK" v={d.initOk ? "Yes" : "No"} ok={d.initOk} />
            <Row k="SW API supported" v={d.swSupported ? "Yes" : "No"} ok={d.swSupported} />
            <Row k="/OneSignalSDKWorker.js" v={d.oneSignalSWStatus != null ? `HTTP ${d.oneSignalSWStatus}` : "—"} ok={d.oneSignalSWReachable ?? undefined} />
            <Row k="OneSignal SW registered" v={d.oneSignalSWFound ? "Yes" : "No"} ok={d.oneSignalSWFound} />
            <Row k="Total SW registrations" v={d.swRegistrations.length} />
            <Row k="Permission" v={d.permission} ok={d.permission === "granted"} />
            <Row k="Push Enabled" v={d.pushEnabled ? "Yes" : "No"} ok={d.pushEnabled} />
            <Row k="External ID" v={d.externalId ?? "—"} />
            <Row k="Subscription ID" v={d.subscriptionId ?? "—"} ok={!!d.subscriptionId} />
            <Row k="Push Token" v={d.subscriptionToken ? d.subscriptionToken.slice(0, 40) + "…" : "—"} />
            {d.error && <p className="mt-2 text-xs text-destructive">init error: {d.error}</p>}
          </div>
        )}
      </div>

      {d && d.swRegistrations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-sm font-bold mb-2">Service Worker Registrations</h3>
          <div className="space-y-2 text-xs font-mono">
            {d.swRegistrations.map((r, i) => (
              <div key={i} className="rounded-lg bg-muted/40 p-2">
                <div><span className="text-muted-foreground">scope:</span> {r.scope}</div>
                <div><span className="text-muted-foreground">script:</span> {r.scriptURL}</div>
                <div><span className="text-muted-foreground">state:</span> {r.state}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-sm font-bold mb-2">Live Log</h3>
        <pre className="text-xs font-mono whitespace-pre-wrap max-h-64 overflow-auto text-muted-foreground">
{log.join("\n") || "(empty)"}
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Same entries are also logged to the browser console (prefixed <code>[OneSignal Diag]</code>).
          Note: OneSignal v16 registers the service worker lazily — it only appears after the user accepts the browser permission prompt via "Enable push".
        </p>
      </div>
    </div>
  );
}
