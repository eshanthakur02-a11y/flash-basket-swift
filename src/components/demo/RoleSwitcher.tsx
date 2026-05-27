import { useDemo } from "@/lib/demo/store";
import { findUser, USERS } from "@/lib/demo/seed";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bike, Shield, ShoppingBag, Store, ChevronDown, RotateCcw, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Role } from "@/lib/demo/types";

const ROLE_META: Record<Role, { label: string; icon: any; route: string }> = {
  customer: { label: "Customer", icon: ShoppingBag, route: "/customer/home" },
  shopkeeper: { label: "Shopkeeper", icon: Store, route: "/shopkeeper/dashboard" },
  delivery: { label: "Delivery Partner", icon: Bike, route: "/delivery/dashboard" },
  admin: { label: "Admin", icon: Shield, route: "/admin/dashboard" },
};

export function RoleSwitcher() {
  const { state, switchRole, resetScenario, logout } = useDemo();
  const navigate = useNavigate();
  const user = findUser(state.currentUserId);
  const current = state.role ?? "customer";
  const Icon = ROLE_META[current].icon;

  function go(r: Role) {
    const u = USERS.find((x) => x.role === r);
    switchRole(r, u?.id);
    navigate({ to: ROLE_META[r].route });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full h-9 gap-2 border-primary/40 bg-primary/10 hover:bg-primary/15">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-bold">Demo · {ROLE_META[current].label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs">
          Demo Mode {user && <span className="text-muted-foreground">· {user.name}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(ROLE_META) as Role[]).map((r) => {
          const M = ROLE_META[r];
          const RoleIcon = M.icon;
          return (
            <DropdownMenuItem key={r} onClick={() => go(r)} className="gap-2">
              <RoleIcon className="h-4 w-4" /> View as {M.label}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetScenario} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Reset Demo Scenario
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" /> Exit demo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
