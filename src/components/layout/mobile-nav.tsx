"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";
import { Category } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useSiteSettings } from "@/context/settings-context";

interface MobileNavProps {
  categories: Category[];
}

export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();

  // Separate parent categories and subcategories
  const parentCategories = categories.filter((cat) => !cat.parentId);
  const getSubcategories = (parentId: string) =>
    categories.filter((cat) => cat.parentId === parentId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-foreground bg-muted/50 hover:bg-muted hover:text-orange-500"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 border-r-border">
        <SheetHeader className="h-12 px-4 py-0 border-b border-border flex-row items-center">
          <SheetTitle asChild>
            <NextImage
              src={settings.siteLogo}
              alt={settings.siteName}
              width={160}
              height={100}
              className="h-8 w-auto object-contain object-left mr-auto"
            />
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-6 py-4   text-sm font-bold capitalize  hover:bg-muted transition-colors border-b border-border/60"
            >
              Home
            </Link>

            <Accordion type="single" collapsible className="w-full">
              {/* All Products Accordion */}
              <AccordionItem
                value="all-products"
                className="border-b border-border/60"
              >
                <AccordionTrigger className="px-6 py-4 text-sm font-bold capitalize  hover:bg-muted hover:no-underline">
                  All Products
                </AccordionTrigger>
                <AccordionContent className="pb-0 bg-muted">
                  <div className="flex flex-col">
                    <Link
                      href="/product"
                      onClick={() => setOpen(false)}
                      className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors flex justify-between items-center"
                    >
                      View All Products
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                    <Separator className="opacity-50" />
                    <Link
                      href="/product?isTrending=true"
                      onClick={() => setOpen(false)}
                      className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors"
                    >
                      Trending Now
                    </Link>
                    <Link
                      href="/product?isBestSelling=true"
                      onClick={() => setOpen(false)}
                      className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors"
                    >
                      Best Sellers
                    </Link>
                    <Link
                      href="/product?isFeatured=true"
                      onClick={() => setOpen(false)}
                      className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors"
                    >
                      Featured Items
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Individual Category Accordions */}
              {parentCategories.map((category) => {
                const subcategories = getSubcategories(category.id);
                const hasSubcategories = subcategories.length > 0;

                return (
                  <AccordionItem
                    key={category.id}
                    value={category.id}
                    className="border-b border-border/60"
                  >
                    <AccordionTrigger className="px-6 py-4 text-sm font-bold capitalize  hover:bg-muted hover:no-underline">
                      {category.name}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 bg-muted">
                      <div className="flex flex-col">
                        <Link
                          href={`/product?category=${category.slug}`}
                          onClick={() => setOpen(false)}
                          className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors flex justify-between items-center"
                        >
                          View All {category.name}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                        {hasSubcategories && (
                          <>
                            <Separator className="opacity-50" />
                            {subcategories.map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/product?category=${subcat.slug}`}
                                onClick={() => setOpen(false)}
                                className="px-8 py-3 text-sm font-medium text-muted-foreground hover:text-orange-600 hover:bg-muted transition-colors"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-sm font-bold capitalize  hover:bg-muted transition-colors border-b border-border/60"
            >
              About Us
            </Link>

            <Link
              href="/track-order"
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-sm font-bold capitalize  hover:bg-muted transition-colors border-b border-border/60"
            >
              Track Order
            </Link>

            <Link
              href="/refund-policy"
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-sm font-bold capitalize  hover:bg-muted transition-colors border-b border-border/60"
            >
              Refund Policy
            </Link>
          </div>

          <div className="mt-8 px-6 pb-6">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Need Help?
              </p>
              <a
                href={`tel:${settings.contactPhone}`}
                className="block text-sm font-bold text-foreground mb-1 hover:text-orange-600 transition-colors"
              >
                {settings.contactPhone}
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="block text-sm font-bold text-foreground hover:text-orange-600 transition-colors"
              >
                {settings.contactEmail}
              </a>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
