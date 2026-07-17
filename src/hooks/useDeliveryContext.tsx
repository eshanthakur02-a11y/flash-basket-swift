import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type DeliveryContext = {
  pincode: string | null;
  lat: number | null;
  lng: number | null;
  addressLabel: string | null;
};

/**
 * Best-effort delivery context for the current customer:
 * uses the default saved address (pincode) and optionally the browser's
 * geolocation for distance-based ranking.
 */
export function useDeliveryContext(): DeliveryContext & { ready: boolean } {
  const { user } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [coordsTried, setCoordsTried] = useState(false);

  const addr = useQuery({
    queryKey: ["default-address", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
  });

  const profile = useQuery({
    queryKey: ["profile-location", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("state, city, pincode")
        .eq("id", user!.id)
        .maybeSingle();
      return data ?? null;
    },
  });


  useEffect(() => {
    if (coordsTried) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setCoordsTried(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCoordsTried(true);
      },
      () => setCoordsTried(true),
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300_000 },
    );
  }, [coordsTried]);

  const pincode =
    (addr.data?.pincode as string | undefined) ??
    (profile.data?.pincode as string | undefined) ??
    null;
  const addressLabel = addr.data
    ? `${addr.data.line1}, ${addr.data.city}`
    : profile.data?.city && profile.data?.state
    ? `${profile.data.city}, ${profile.data.state}`
    : null;
  return {
    pincode,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    addressLabel,
    ready: !user || ((addr.isFetched || profile.isFetched) && coordsTried),
  };
}

