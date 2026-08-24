import logoAsset from "@/assets/apmart-logo.png.asset.json";

const MARK_SIZES = {
  xs: "h-7 w-7",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
} as const;

export function LogoMark({
  size = "md",
  className = "",
}: {
  size?: keyof typeof MARK_SIZES;
  className?: string;
}) {
  return (
    <img
      src={logoAsset.url}
      alt="AP Mart logo"
      width={96}
      height={96}
      className={`${MARK_SIZES[size]} shrink-0 rounded-xl object-contain shadow-glow ${className}`}
    />
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }[size];
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} />
      <div className="leading-none">
        <div className={`font-display font-bold ${t} text-foreground`}>
          AP <span className="text-primary">Mart</span>
        </div>
      </div>
    </div>
  );
}
