import { Zap } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" }[size];
  const t = { sm: "text-lg", md: "text-xl", lg: "text-3xl" }[size];
  return (
    <div className="flex items-center gap-2">
      <div className={`${s} grid place-items-center rounded-xl gradient-primary shadow-glow`}>
        <Zap className="h-1/2 w-1/2 fill-primary-foreground text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className={`font-display font-bold ${t} text-foreground`}>
          AP <span className="text-primary">Mart</span>
        </div>
      </div>
    </div>
  );
}
