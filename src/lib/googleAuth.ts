import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

/**
 * Environment-agnostic Google sign-in.
 *
 * On Lovable-hosted builds the managed auth broker handles OAuth. When the
 * project runs against your own Supabase project (self-hosted or deployed
 * outside Lovable), the broker is not available, so we transparently fall
 * back to Supabase's native OAuth flow. Configure the Google provider in
 * your own Supabase project for the fallback path to work.
 */
export async function signInWithGoogle(redirectPath = "/login"): Promise<{
  error: Error | null;
  redirected?: boolean;
}> {
  const redirect = window.location.origin + redirectPath;

  try {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirect,
    });
    if (!result.error) {
      return { error: null, redirected: result.redirected };
    }
    // Broker unavailable (external hosting) — fall through to native OAuth.
  } catch {
    // Broker unreachable (external hosting) — fall through to native OAuth.
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirect },
  });
  return { error, redirected: true };
}
