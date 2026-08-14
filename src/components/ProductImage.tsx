import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Product image with a reserved, fixed-size box so the card never shifts:
 * shows a shimmer placeholder while loading and a neutral emoji fallback when
 * the URL is missing or fails to load (no broken-image icon).
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  fallbackClassName,
  fit = "cover",
  eager = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  fit?: "cover" | "contain";
  eager?: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  // Reset when the card is recycled for a different product.
  useEffect(() => {
    setStatus(src ? "loading" : "error");
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {status !== "error" && src && (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "h-full w-full transition-opacity duration-200",
            fit === "cover" ? "object-cover" : "object-contain",
            status === "loaded" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
      {status === "loading" && <div className="absolute inset-0 shimmer" aria-hidden />}
      {status === "error" && (
        <div
          className={cn(
            "absolute inset-0 grid place-items-center text-3xl text-muted-foreground select-none",
            fallbackClassName,
          )}
          aria-hidden
        >
          🛒
        </div>
      )}
    </div>
  );
}
