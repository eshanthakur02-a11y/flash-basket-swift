import { useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSubcategories } from "@/hooks/useSubcategories";
import { cn } from "@/lib/utils";

/**
 * Multi-select subcategory picker, dependent on the chosen main category.
 * Shopkeepers can pick one or many subcategories but never create/edit them.
 * Selections are cleared automatically when the main category changes.
 */
export function SubcategorySelect({
  categoryId,
  value,
  onChange,
  required = false,
}: {
  categoryId: string | null | undefined;
  value: string[];
  onChange: (ids: string[]) => void;
  required?: boolean;
}) {
  const { data = [], isLoading } = useSubcategories(categoryId, true);

  // A subcategory always belongs to one category: drop stale picks on change.
  useEffect(() => {
    if (value.length === 0) return;
    if (!categoryId) { onChange([]); return; }
    if (isLoading || data.length === 0) return;
    const valid = value.filter((id) => data.some((s) => s.id === id));
    if (valid.length !== value.length) onChange(valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, data, isLoading]);

  const selected = data.filter((s) => value.includes(s.id));
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div>
      <Label className="text-xs font-bold">
        Subcategory {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild disabled={!categoryId || isLoading || data.length === 0}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "mt-1 h-auto min-h-10 w-full justify-between rounded-xl px-3 py-2 text-left font-normal",
              (!categoryId || data.length === 0) && "opacity-60",
            )}
          >
            <span className="flex flex-wrap gap-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">
                  {!categoryId ? "Select a category first" : "Select subcategories"}
                </span>
              ) : (
                selected.map((s) => (
                  <Badge key={s.id} variant="secondary" className="rounded-full">
                    {s.name}
                  </Badge>
                ))
              )}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(22rem,90vw)] p-1">
          <div className="max-h-64 overflow-y-auto">
            {data.map((s) => {
              const on = value.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent/40"
                >
                  <Checkbox checked={on} className="pointer-events-none" />
                  <span className="flex-1 truncate">{s.name}</span>
                  {on && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {!categoryId
          ? "Step 1: pick a category above."
          : data.length === 0
            ? "No subcategories yet — the admin team manages these."
            : "Pick one or more subcategories customers can filter by."}
      </p>
    </div>
  );
}
