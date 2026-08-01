import { useRef, useState } from "react";
import { Upload, Star, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 6;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Multi-image uploader (1-6 images).
 * `value` is an ordered list of URLs; index 0 is the cover.
 * Backed by the `products` Supabase Storage bucket.
 */
export function MultiImageInput({
  value,
  onChange,
  label = "Product images",
  required = true,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  async function uploadOne(file: File): Promise<string | null> {
    if (!ACCEPTED.includes(file.type)) {
      toast.error(`${file.name}: only JPG, JPEG, PNG or WEBP allowed`);
      return null;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: exceeds 10 MB limit`);
      return null;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("products")
      .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (upErr) {
      toast.error(upErr.message);
      return null;
    }
    const { data: signed, error: sErr } = await supabase.storage
      .from("products")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (sErr || !signed) {
      toast.error(sErr?.message ?? "Could not sign URL");
      return null;
    }
    return signed.signedUrl;
  }

  async function handleFiles(files: FileList) {
    const remaining = MAX_IMAGES - value.length;
    if (files.length > remaining) {
      toast.error("You can upload a maximum of 6 images for one product.");
    }
    const slice = Array.from(files).slice(0, remaining);
    if (slice.length === 0) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of slice) {
        const u = await uploadOne(f);
        if (u) urls.push(u);
      }
      if (urls.length) {
        onChange([...value, ...urls]);
        toast.success(`Uploaded ${urls.length} image${urls.length > 1 ? "s" : ""}`);
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function setCover(i: number) {
    if (i === 0) return;
    const next = [...value];
    const [pick] = next.splice(i, 1);
    next.unshift(pick);
    onChange(next);
  }
  function onDragStart(i: number) { setDragIdx(i); }
  function onDrop(i: number) {
    if (dragIdx === null || dragIdx === i) return setDragIdx(null);
    const next = [...value];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onChange(next);
    setDragIdx(null);
  }

  const canAddMore = value.length < MAX_IMAGES;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold">
          {label} {required && <span className="text-destructive">*</span>}
          <span className="ml-2 font-normal text-muted-foreground">
            {value.length}/{MAX_IMAGES}
          </span>
        </label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy || !canAddMore}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <>
          {/* Cover */}
          <div className="rounded-xl border border-border p-2 bg-secondary/30">
            <div className="text-[11px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" /> Cover image
            </div>
            <div className="relative rounded-lg overflow-hidden w-full max-w-[220px] aspect-square bg-card">
              <img loading="lazy" decoding="async" src={value[0]} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(0)}
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/80 grid place-items-center text-destructive hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove cover"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Gallery */}
          {value.length > 1 && (
            <div>
              <div className="text-[11px] font-bold text-muted-foreground mb-1">Gallery (drag to reorder)</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {value.slice(1).map((url, i) => {
                  const idx = i + 1;
                  return (
                    <div
                      key={url + idx}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(idx)}
                      className={cn(
                        "relative shrink-0 w-24 aspect-square rounded-lg overflow-hidden border border-border bg-card group",
                        dragIdx === idx && "opacity-50",
                      )}
                    >
                      <img loading="lazy" decoding="async" src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 top-0 flex justify-between p-1">
                        <span className="h-5 w-5 rounded bg-background/80 grid place-items-center cursor-grab">
                          <GripVertical className="h-3 w-3" />
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="h-5 w-5 rounded bg-background/80 grid place-items-center text-destructive"
                          aria-label="Remove image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCover(idx)}
                        className="absolute inset-x-0 bottom-0 text-[10px] font-bold py-1 bg-background/85 hover:bg-primary hover:text-primary-foreground flex items-center justify-center gap-1"
                      >
                        <Star className="h-3 w-3" /> Set as cover
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {required && value.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Upload 1–6 images (JPG, PNG or WEBP, up to 10 MB each). The first image becomes the cover.
        </p>
      )}
    </div>
  );
}
