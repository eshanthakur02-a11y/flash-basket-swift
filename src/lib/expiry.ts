export type ExpiryStatus =
  | "none"
  | "fresh"
  | "expiring_month"
  | "expiring_week"
  | "expiring_today"
  | "expired";

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function expiryStatus(expiry: string | null | undefined): {
  status: ExpiryStatus;
  days: number | null;
  label: string;
  color: string; // tailwind classes for badge
  emoji: string;
} {
  const days = daysUntil(expiry);
  if (days === null) {
    return { status: "none", days: null, label: "", color: "", emoji: "" };
  }
  if (days < 0) {
    return { status: "expired", days, label: "Expired", color: "bg-red-100 text-red-700 border-red-300", emoji: "🔴" };
  }
  if (days === 0) {
    return { status: "expiring_today", days, label: "Expires today", color: "bg-red-100 text-red-700 border-red-300", emoji: "🔴" };
  }
  if (days <= 7) {
    return { status: "expiring_week", days, label: `Expires in ${days} day${days > 1 ? "s" : ""}`, color: "bg-orange-100 text-orange-700 border-orange-300", emoji: "🟠" };
  }
  if (days <= 30) {
    return { status: "expiring_month", days, label: `Expires in ${days} days`, color: "bg-yellow-100 text-yellow-800 border-yellow-300", emoji: "🟡" };
  }
  return { status: "fresh", days, label: `Expires in ${days} days`, color: "bg-green-100 text-green-700 border-green-300", emoji: "🟢" };
}

export function shelfLifeDays(mfg: string | null | undefined, exp: string | null | undefined): number | null {
  if (!mfg || !exp) return null;
  const m = new Date(mfg);
  const e = new Date(exp);
  if (isNaN(m.getTime()) || isNaN(e.getTime())) return null;
  return Math.round((e.getTime() - m.getTime()) / 86400000);
}
