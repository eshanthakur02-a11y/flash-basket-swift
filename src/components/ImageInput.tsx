import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Bucket = "products" | "categories" | "offers" | "shop-collections";

/**
 * Combined image input: paste a URL OR upload a file.
 * Either source produces a usable URL that is written back via `onChange`.
 * Validation note: caller must require a non-empty value before saving.
 */
export function ImageInput({
  value,
  onChange,
  bucket,
  label = "Image",
  required = true,
}: {
  value: string;
  onChange: (url: string) => void;
  bucket: Bucket;
  label?: string;
  required?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be ≤5 MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      // Private bucket → use long-lived signed URL (≈50 years)
      const { data: signed, error: sErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
      if (sErr || !signed) throw sErr ?? new Error("Could not sign URL");
      onChange(signed.signedUrl);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or upload below"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          <Upload className="h-4 w-4 mr-1" />
          {busy ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      {value && (
        <div className="rounded-xl overflow-hidden border border-border w-full max-w-xs">
          <img loading="lazy" decoding="async" src={value} alt="" className="w-full h-32 object-cover" />
        </div>
      )}
      {required && !value && (
        <p className="text-[11px] text-muted-foreground">
          Paste a URL or upload a file — one is required.
        </p>
      )}
    </div>
  );
}
