import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, MapPin, User, LogOut, Shield, Clock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q } as any });
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 border border-border">
          <Clock className="h-4 w-4 text-primary" />
          <div className="text-xs leading-tight">
            <div className="font-bold">Delivery in 10 min</div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" /> Your location
            </div>
          </div>
        </div>

        <form onSubmit={onSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search "milk", "bread", "atta"...'
              className="pl-10 h-11 rounded-xl bg-secondary/60 border-border"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                  Account & Addresses
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <Shield className="h-4 w-4 mr-2" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold shadow-card">
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
            </Link>
          )}

          <Link to="/cart">
            <Button className="rounded-xl gradient-primary text-primary-foreground hover:opacity-95 relative">
              <ShoppingCart className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">My Cart</span>
              {totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-foreground text-background text-[10px] font-bold">
                  {totalQty}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
