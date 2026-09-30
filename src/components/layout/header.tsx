"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useState, Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart/cart-icon";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/context/cart-context";
import { SearchInput } from "./search-input";
import { Search, User, Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useSiteSettings } from "@/context/settings-context";
import { ThemeToggle } from "@/components/theme-toggle";

import { Category } from "@/lib/types";
import { TopBar } from "./top-bar";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

const SearchBarFallback = () => <Skeleton className="h-10 w-full bg-muted" />;
const DesktopSearchBarFallback = () => (
  <Skeleton className="h-10 w-full min-w-[350px] bg-muted" />
);

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { isDrawerOpen, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const settings = useSiteSettings();
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const pathname = usePathname();

  // Instant scroll resetting on page change
  useEffect(() => {
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;

    // Temporarily turn off smooth scroll
    html.style.scrollBehavior = "auto";

    // Instantly jump to top
    window.scrollTo(0, 0);
    setIsVisible(true);

    // Restore user's global smooth scroll preference
    const timeout = setTimeout(() => {
      html.style.scrollBehavior = originalScrollBehavior || "";
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at top
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (
        currentScrollY > lastScrollY &&
        !isMobileSearchOpen &&
        !isDrawerOpen
      ) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileSearchOpen, isDrawerOpen]);

  return (
    <header
      className={cn(
        "sticky z-50 w-full flex flex-col backdrop-blur-md bg-background/70 border-b border-border/50 shadow-sm transition-all duration-300",
        isVisible ? "top-0" : "top-0 lg:-top-9",
      )}
    >
      {/* Top Bar Wrapper */}
      <div className="hidden sm:block h-9 border-b border-border/50">
        <TopBar />
      </div>

      {/* Main Header */}
      <div className="w-full text-foreground">
        <div className="container flex h-16 items-center">
          {/* Mobile Header */}
          <div className="flex w-full items-center justify-between min-[1200px]:hidden h-full py-4">
            {/* Left side: Menu + Logo */}
            <div className="flex items-center gap-2">
              <MobileNav categories={categories} />
              <Link href="/" className="inline-block">
                <NextImage
                  src={settings.siteLogo}
                  alt={settings.siteName}
                  width={160}
                  height={120}

                  priority
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Right side: Search, Cart, Profile */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted/50 text-foreground hover:bg-muted hover:text-orange-500"
                onClick={() => setMobileSearchOpen((p) => !p)}
              >
                <Search
                  className={cn(
                    "h-5 w-5",
                    isMobileSearchOpen && "text-orange-500",
                  )}
                />
                <span className="sr-only">Toggle Search</span>
              </Button>
              <ThemeToggle className="bg-muted/50 text-foreground hover:bg-muted hover:text-orange-500" />
              <Button
                variant="ghost"
                size="icon"
                className="bg-muted/50 text-foreground hover:bg-muted hover:text-orange-500"
                asChild
              >
                <Link
                  href={user ? "/account" : "/login"}
                  aria-label="Login or view account"
                >
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <CartIcon
                onClick={() => setDrawerOpen(true)}
                className="text-foreground bg-muted/50 hover:bg-muted hover:text-orange-500"
              />
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden min-[1200px]:flex w-full items-center justify-between h-full">
            <Link
              href="/"
              className="inline-block hover:opacity-90 transition-opacity mr-12"
            >
              <NextImage
                src={settings.siteLogo}
                alt={settings.siteName}
                width={200}
                height={200}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>

            <div className="flex-1 max-w-2xl mx-12">
              <Suspense fallback={<DesktopSearchBarFallback />}>
                <SearchInput />
              </Suspense>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="h-9 bg-muted/50 text-foreground hover:bg-muted hover:text-orange-500 shadow-sm" />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-muted/50 text-foreground hover:bg-muted hover:text-orange-500 shadow-sm"
                asChild
              >
                <Link
                  href={user ? "/account" : "/login"}
                  aria-label="Login or view account"
                >
                  <User className="h-5 w-5" />
                </Link>
              </Button>

              <CartIcon
                onClick={() => setDrawerOpen(true)}
                className="text-foreground bg-muted/50 hover:bg-muted hover:text-orange-500 shadow-sm transition-colors h-9 px-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <MainNav categories={categories} />

      {/* Mobile Search */}
      {isMobileSearchOpen && (
        <div className="min-[1200px]:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container py-3">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchInput />
            </Suspense>
          </div>
        </div>
      )}

      <CartSheet open={isDrawerOpen} onOpenChange={setDrawerOpen} />
    </header>
  );
}
