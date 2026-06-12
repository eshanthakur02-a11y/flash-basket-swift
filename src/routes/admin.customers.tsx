import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Store as StoreIcon, Truck, User as UserIcon, LifeBuoy, X } from "lucide-react";
import { toast } from "sonner";
import { RoleShell } from "@/components/RoleShell";
import { ADMIN_NAV } from "./admin.dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/customers")({
  component: () => (
    <RoleShell role="admin" nav={ADMIN_NAV} requireRoles={["admin"]}>
      <CustomersPage />
    </RoleShell>
  ),
});

type AppRole = "admin" | "customer" | "shopkeeper" | "delivery";
const ROLES: AppRole[] = ["admin", "shopkeeper", "delivery", "customer"];
const ICONS: Record<AppRole, any> = { admin: Shield, shopkeeper: StoreIcon, delivery: Truck, customer: UserIcon };

function CustomersPage() {
  const qc = useQueryClient();
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return data ?? [];
    },
  });

  const assign = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase.rpc("admin_assign_role", { _user_id: user_id, _role: role });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role added"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: AppRole }) => {
      const { error } = await supabase.rpc("admin_remove_role", { _user_id: user_id, _role: role });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role removed"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Users & roles</h1>
        <p className="text-muted-foreground mt-1">Assign admin, shopkeeper, delivery or customer roles.</p>
      </div>

      {users.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Roles</th>
                  <th className="p-3">Add role</th>
                </tr>
              </thead>
              <tbody>
                {(users.data ?? []).map((u: any) => (
                  <tr key={u.id} className="border-t border-border align-top">
                    <td className="p-3 font-medium">{u.full_name || "—"}<div className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 8)}</div></td>
                    <td className="p-3 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(u.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                        {(u.roles ?? []).map((r: AppRole) => {
                          const Icon = ICONS[r];
                          return (
                            <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-semibold">
                              <Icon className="h-3 w-3" />{r}
                              <button onClick={() => remove.mutate({ user_id: u.id, role: r })} className="ml-1 hover:bg-primary/20 rounded-full">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.filter((r) => !(u.roles ?? []).includes(r)).map((r) => (
                          <Button key={r} size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => assign.mutate({ user_id: u.id, role: r })}>
                            + {r}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {(users.data ?? []).map((u: any) => (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div>
                  <div className="font-bold">{u.full_name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{u.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{u.phone || "No phone"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Current roles</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(u.roles ?? []).length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                    {(u.roles ?? []).map((r: AppRole) => {
                      const Icon = ICONS[r];
                      return (
                        <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-xs font-semibold">
                          <Icon className="h-3 w-3" />{r}
                          <button onClick={() => remove.mutate({ user_id: u.id, role: r })} className="ml-1 hover:bg-primary/20 rounded-full">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                {ROLES.filter((r) => !(u.roles ?? []).includes(r)).length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Add role</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ROLES.filter((r) => !(u.roles ?? []).includes(r)).map((r) => (
                        <Button key={r} size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => assign.mutate({ user_id: u.id, role: r })}>
                          + {r}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
