import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { promptAndRegister, logoutOneSignal } from "@/integrations/onesignal";
import { toast } from "sonner";

/**
 * - Registers the signed-in user with OneSignal (asks for push permission)
 * - Subscribes to Realtime on the `notifications` table for in-app toasts
 */
export function useNotifications() {
  const { user } = useAuth();
  const registered = useRef<string | null>(null);

  // OneSignal register on login
  useEffect(() => {
    if (!user) {
      if (registered.current) {
        logoutOneSignal();
        registered.current = null;
      }
      return;
    }
    if (registered.current === user.id) return;
    registered.current = user.id;
    // Delay slightly so login UI settles
    const t = setTimeout(() => { promptAndRegister(user.id); }, 1500);
    return () => clearTimeout(t);
  }, [user]);

  // Realtime in-app notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n: any = payload.new;
          toast(n.title, { description: n.body ?? undefined });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);
}
