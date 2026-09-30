"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const pathname = usePathname();
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    let ticking = false;
    const updateOffset = () => {
      ticking = false;
      setStickyTop(header.getBoundingClientRect().bottom);
    };
    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateOffset);
      }
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(header);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/account",
      icon: ShoppingBag,
    },
    {
      name: "My Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      name: "Profile",
      href: "/account/profile",
      icon: User,
    },
  ];

  return (
    <div
      className="sticky z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background/95 backdrop-blur-sm overflow-x-auto no-scrollbar"
      style={{ top: stickyTop }}
    >
      <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
