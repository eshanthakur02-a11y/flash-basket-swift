import { useState } from "react";
import { LeafletMap } from "./LeafletMap";
import { Button } from "@/components/ui/button";
import { MapPin, Crosshair } from "lucide-react";
import { toast } from "sonner";

export type LatLng = { lat: number; lng: number };

/**
 * Interactive OpenStreetMap picker. Click or drag the marker to choose a point.
 * Includes a "use my location" button.
 */
export function LocationPicker({
  value,
  onChange,
  className,
  height = "h-72",
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
  className?: string;
  height?: string;
}) {
  const [center, setCenter] = useState<[number, number]>([
    value?.lat ?? 12.9716,
    value?.lng ?? 77.5946,
  ]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not available");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const v = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(v);
        setCenter([v.lat, v.lng]);
        toast.success("Location captured");
      },
      () => toast.error("Could not get location"),
    );
  };

  return (
    <div className={className}>
      <LeafletMap center={center} zoom={15} className={`${height} w-full rounded-2xl overflow-hidden border border-border`}>
        {(RL) => {
          const { Marker, useMapEvents } = RL;
          const Clicker = () => {
            useMapEvents({
              click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); },
            });
            return null;
          };
          return (
            <>
              <Clicker />
              {value && (
                <Marker
                  position={[value.lat, value.lng]}
                  draggable
                  eventHandlers={{
                    dragend: (e: any) => {
                      const ll = e.target.getLatLng();
                      onChange({ lat: ll.lat, lng: ll.lng });
                    },
                  }}
                />
              )}
            </>
          );
        }}
      </LeafletMap>
      <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 text-primary" />
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Click the map or use my location"}
        </div>
        <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={useMyLocation}>
          <Crosshair className="h-3.5 w-3.5 mr-1.5" /> Use my location
        </Button>
      </div>
    </div>
  );
}
