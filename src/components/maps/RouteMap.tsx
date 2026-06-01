import { useEffect, useMemo, useRef } from "react";
import { LeafletMap, haversineKm } from "./LeafletMap";

export type MapPoint = { lat: number; lng: number; label?: string; color?: string };

/**
 * Renders 2+ points and a polyline connecting them in order.
 * Distance shown is the cumulative haversine distance.
 *
 * Mobile perf:
 *  - Memoize valid points by a coarse coordinate signature so tiny GPS jitter
 *    doesn't trigger marker/polyline reconciliation in react-leaflet.
 *  - Fit bounds only when the set of points changes shape (count or first/last
 *    coords), not on every position tick.
 *  - Stable React keys per marker so Leaflet reuses the same layer instance.
 */
export function RouteMap({
  points,
  height = "h-72",
  className,
}: {
  points: MapPoint[];
  height?: string;
  className?: string;
}) {
  // Round to ~11m precision (4 decimals). Anything finer is noise on a phone
  // and forces unnecessary marker redraws.
  const valid = useMemo(
    () =>
      points
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
        .map((p) => ({
          ...p,
          lat: Math.round(p.lat * 1e4) / 1e4,
          lng: Math.round(p.lng * 1e4) / 1e4,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      points
        .map((p) => `${p.label ?? ""}:${p.lat?.toFixed(4)},${p.lng?.toFixed(4)}`)
        .join("|"),
    ],
  );

  const center = useMemo<[number, number]>(() => {
    if (valid.length === 0) return [12.9716, 77.5946];
    const lat = valid.reduce((a, p) => a + p.lat, 0) / valid.length;
    const lng = valid.reduce((a, p) => a + p.lng, 0) / valid.length;
    return [lat, lng];
  }, [valid]);

  const distanceKm = useMemo(() => {
    let d = 0;
    for (let i = 1; i < valid.length; i++) {
      d += haversineKm(valid[i - 1].lat, valid[i - 1].lng, valid[i].lat, valid[i].lng);
    }
    return d;
  }, [valid]);

  // Signature used to decide when to re-fit bounds. Avoids re-fit on every
  // small GPS update; only re-fits when the route shape meaningfully changes.
  const shapeSig = useMemo(
    () =>
      valid.length +
      "|" +
      valid.map((p) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`).join("/"),
    [valid],
  );

  if (valid.length === 0) {
    return <div className={`${height} w-full rounded-2xl border border-dashed border-border grid place-items-center text-sm text-muted-foreground ${className ?? ""}`}>No coordinates available</div>;
  }

  const positions = valid.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div className={className}>
      <LeafletMap center={center} zoom={13} className={`${height} w-full rounded-2xl overflow-hidden border border-border`}>
        {(RL) => {
          const { CircleMarker, Polyline, Popup, useMap } = RL;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const lastSig = useRef<string | null>(null);
          const FitBounds = () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const map = useMap();
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
              if (lastSig.current === shapeSig) return;
              lastSig.current = shapeSig;
              if (valid.length > 1) {
                map.fitBounds(positions, { padding: [30, 30], animate: false });
              } else {
                map.setView(positions[0], map.getZoom(), { animate: false });
              }
            }, [map]);
            return null;
          };
          return (
            <>
              <FitBounds />
              {valid.length > 1 && (
                <Polyline
                  positions={positions}
                  pathOptions={{ color: "hsl(var(--primary))", weight: 4, opacity: 0.8, dashArray: "8 8" }}
                />
              )}
              {valid.map((p) => (
                <CircleMarker
                  key={`${p.label ?? "pt"}:${p.lat.toFixed(4)},${p.lng.toFixed(4)}`}
                  center={[p.lat, p.lng]}
                  radius={8}
                  pathOptions={{
                    color: p.color ?? "hsl(var(--primary))",
                    fillColor: p.color ?? "hsl(var(--primary))",
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  {p.label && <Popup>{p.label}</Popup>}
                </CircleMarker>
              ))}
            </>
          );
        }}
      </LeafletMap>
      {valid.length > 1 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Approx. distance: <span className="font-bold text-foreground">{distanceKm.toFixed(2)} km</span>
        </div>
      )}
    </div>
  );
}
