import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/support/profile")({
  head: () => ({ meta: [{ title: "Support Profile — FlashBasket" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase as any).from("support_agents").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }: any) => setName(data?.display_name ?? ""));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await (supabase as any).from("support_agents").upsert({
      user_id: user.id, display_name: name, is_active: true,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="font-display text-2xl font-extrabold">Profile</h1>
      <div className="space-y-1.5">
        <Label>Display name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button onClick={save} disabled={busy} className="gradient-primary text-primary-foreground">Save</Button>
    </div>
  );
}
