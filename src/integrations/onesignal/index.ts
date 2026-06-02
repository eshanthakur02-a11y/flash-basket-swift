// OneSignal Web SDK loader + helpers.
// We load the v16 SDK on demand, init it, and expose helpers to register
// the current user's player_id with Supabase so the DB trigger can push to them.
import { supabase } from "@/integrations/supabase/client";

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "0179c4bc-1662-45b2-8be2-0826d8f3dc2b";

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

let initPromise: Promise<void> | null = null;

function injectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-onesignal-sdk]')) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    s.async = true;
    s.defer = true;
    s.setAttribute("data-onesignal-sdk", "true");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load OneSignal SDK"));
    document.head.appendChild(s);
  });
}

export async function initOneSignal(): Promise<void> {
  if (typeof window === "undefined") return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    await injectScript();

    await new Promise<void>((resolve) => {
      window.OneSignalDeferred!.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: APP_ID,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: { enable: false },
            serviceWorkerParam: { scope: "/" },
            serviceWorkerPath: "OneSignalSDKWorker.js",
            serviceWorkerUpdaterPath: "OneSignalSDKUpdaterWorker.js",
          });
        } catch (e) {
          console.warn("[OneSignal] init error", e);
        }
        resolve();
      });
    });
  })();

  return initPromise;
}

export async function promptAndRegister(userId: string): Promise<string | null> {
  try {
    await initOneSignal();
    const OneSignal = window.OneSignal;
    if (!OneSignal) return null;

    // Link external user id
    try { await OneSignal.login(userId); } catch {}

    // Ask for permission if not granted
    const perm = OneSignal.Notifications?.permission;
    if (!perm) {
      try { await OneSignal.Notifications.requestPermission(); } catch {}
    }

    // Resolve subscription id (player id in v16 is subscription.id)
    let playerId: string | null = OneSignal.User?.PushSubscription?.id ?? null;

    if (!playerId) {
      // Wait briefly for subscription to be registered
      playerId = await new Promise<string | null>((resolve) => {
        const t = setTimeout(() => resolve(null), 4000);
        try {
          OneSignal.User.PushSubscription.addEventListener("change", (ev: any) => {
            if (ev?.current?.id) { clearTimeout(t); resolve(ev.current.id); }
          });
        } catch { clearTimeout(t); resolve(null); }
      });
    }

    if (playerId) {
      await supabase.from("onesignal_subscriptions").upsert(
        {
          user_id: userId,
          player_id: playerId,
          platform: "web",
          user_agent: navigator.userAgent,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "user_id,player_id" }
      );
    }
    return playerId;
  } catch (e) {
    console.warn("[OneSignal] register error", e);
    return null;
  }
}

export async function logoutOneSignal() {
  try {
    await initOneSignal();
    window.OneSignal?.logout?.();
  } catch {}
}
