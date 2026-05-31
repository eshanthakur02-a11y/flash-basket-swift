import { useMemo } from "react";
import { LeafletMap, haversineKm } from "./LeafletMap";

export type MapPoint = { lat: number; lng: number; label?: string; color?: string };

/**
 * Renders 2+ points and a polyline connecting them in order.
 * Distance shown is the cumulative haversine distance.
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
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
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

  if (valid.length === 0) {
    return <div className={`${height} w-full rounded-2xl border border-dashed border-border grid place-items-center text-sm text-muted-foreground ${className ?? ""}`}>No coordinates available</div>;
  }

  return (
    <div className={className}>
      <LeafletMap center={center} zoom={13} className={`${height} w-full rounded-2xl overflow-hidden border border-border`}>
        {(RL) => {
          const { Marker, Polyline, Popup, useMap } = RL;
          const FitBounds = () => {
            const map = useMap();
            if (valid.length > 1) {
              const bounds = valid.map((p) => [p.lat, p.lng]) as [number, number][];
              map.fitBounds(bounds, { padding: [30, 30] });
            }
            return null;
          };
          return (
            <>
              <FitBounds />
              {valid.length > 1 && (
                <Polyline
                  positions={valid.map((p) => [p.lat, p.lng])}
                  pathOptions={{ color: "hsl(var(--primary))", weight: 4, opacity: 0.8, dashArray: "8 8" }}
                />
              )}
              {valid.map((p, i) => (
                <Marker key={i} position={[p.lat, p.lng]}>
                  {p.label && <Popup>{p.label}</Popup>}
                </Marker>
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
