import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubcategories } from "@/hooks/useSubcategories";

/**
 * Read-only-for-shopkeepers subcategory picker: lists the active subcategories
 * of the chosen category. Shopkeepers can select but never create/edit them.
 */
export function SubcategorySelect({
  categoryId,
  value,
  onChange,
  required = false,
}: {
  categoryId: string | null | undefined;
  value: string | null;
  onChange: (id: string | null) => void;
  required?: boolean;
}) {
  const { data = [], isLoading } = useSubcategories(categoryId, true);

  return (
    <div>
      <Label className="text-xs font-bold">
        Subcategory {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value ?? "none"}
        onValueChange={(v) => onChange(v === "none" ? null : v)}
        disabled={!categoryId || isLoading}
      >
        <SelectTrigger className="mt-1 h-10 rounded-xl">
          <SelectValue
            placeholder={!categoryId ? "Select a category first" : "Select subcategory"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No subcategory</SelectItem>
          {data.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {!categoryId
          ? "Step 1: pick a category above."
          : data.length === 0
            ? "No subcategories yet — the admin team manages these."
            : "Customers filter your product using this subcategory."}
      </p>
    </div>
  );
}
