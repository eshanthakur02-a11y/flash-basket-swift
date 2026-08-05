import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-side Super Admin helpers.
 *
 * Every function here re-validates the caller's role against the database
 * (never against client-supplied data), so the hidden Super Admin surface
 * cannot be reached by simply knowing the route path.
 */
async function assertSuperAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error) throw new Error("Role validation failed");
  if (!data) throw new Error("Forbidden");
}

/**
 * Reports WHICH integration credentials are configured — never their values.
 * Showing a live key in a UI would be the single largest breach surface, so
 * only presence + last-four-style masking is returned.
 */
export const getIntegrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context as any);

    const present = (name: string) => {
      const v = process.env[name];
      return { name, configured: !!v && v.length > 0 };
    };

    return {
      payments: [present("RAZORPAY_KEY_ID"), present("RAZORPAY_KEY_SECRET"), present("RAZORPAY_WEBHOOK_SECRET")],
      maps: [present("GOOGLE_MAPS_API_KEY"), present("GOOGLE_MAPS_BROWSER_KEY")],
      messaging: [
        present("ONESIGNAL_APP_ID"),
        present("ONESIGNAL_REST_API_KEY"),
        present("WHATSAPP_API_TOKEN"),
        present("SMS_API_KEY"),
        present("RESEND_API_KEY"),
      ],
      ai: [present("LOVABLE_API_KEY")],
      bootstrap: [present("SUPER_ADMIN_EMAIL"), present("SUPER_ADMIN_PASSWORD")],
    };
  });

/**
 * Creates the single platform Super Admin account from server-side
 * environment variables (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD).
 *
 * Idempotent and self-locking: once ANY super_admin exists it refuses to run,
 * so the endpoint cannot be used to mint extra owners later.
 */
export async function bootstrapSuperAdminImpl() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    return { ok: false as const, reason: "SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not configured" };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing, error: existingErr } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .limit(1);
  if (existingErr) return { ok: false as const, reason: "Role lookup failed" };
  if ((existing ?? []).length > 0) {
    return { ok: true as const, created: false, reason: "Super Admin already provisioned" };
  }

  // Find or create the auth user for the configured address.
  let userId: string | null = null;
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Platform Owner" },
  });
  if (created?.user) {
    userId = created.user.id;
  } else if (createErr) {
    // Already registered — look the account up instead of failing.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const found = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false as const, reason: createErr.message };
    userId = found.id;
  }
  if (!userId) return { ok: false as const, reason: "Could not resolve account" };

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: userId, role: "super_admin" as any });
  if (roleErr && !roleErr.message.includes("duplicate")) {
    return { ok: false as const, reason: roleErr.message };
  }

  await supabaseAdmin.from("profiles").update({ is_active: true, status: "active" }).eq("id", userId);

  return { ok: true as const, created: true };
}
