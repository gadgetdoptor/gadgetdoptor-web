"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./mobile-nav";
import { Category } from "@/lib/types";

interface BottomNavProps {
  categories?: Category[];
}

export function BottomNav({ categories = [] }: BottomNavProps) {
  const pathname = usePathname();
  const { totalItems, setDrawerOpen } = useCart();
  const { user } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-1 flex-1 h-full text-[11px] font-medium transition-colors",
      active ? "text-orange-500" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <nav className="min-[1200px]:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-stretch">
        <Link href="/" className={itemClass(isActive("/"))}>
          <Home className="h-5 w-5" />
          Home
        </Link>

        <Link href="/category" className={itemClass(isActive("/category"))}>
          <LayoutGrid className="h-5 w-5" />
          Categories
        </Link>

        <Link
          href={user ? "/account" : "/login"}
          className={itemClass(isActive("/account") || isActive("/login"))}
        >
          <User className="h-5 w-5" />
          Account
        </Link>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={itemClass(false)}
        >
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-4 w-4 justify-center rounded-full p-0 text-[10px] flex items-center"
              >
                {totalItems}
              </Badge>
            )}
          </span>
          Cart
        </button>

        <div className={itemClass(false)}>
          <MobileNav categories={categories} variant="bottom-nav" />
          Menu
        </div>
      </div>
    </nav>
  );
}
