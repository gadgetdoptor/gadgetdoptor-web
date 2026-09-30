"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  const roots = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const childrenMap = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories.forEach((c) => {
      if (c.parentId) {
        if (!map.has(c.parentId)) map.set(c.parentId, []);
        map.get(c.parentId)!.push(c);
      }
    });
    return map;
  }, [categories]);

  const [activeId, setActiveId] = useState(roots[0]?.id);
  const activeCategory = roots.find((c) => c.id === activeId) ?? roots[0];
  const subcategories = activeCategory ? childrenMap.get(activeCategory.id) ?? [] : [];

  if (roots.length === 0) {
    return (
      <div className="text-center py-20 bg-card border border-border rounded-xl">
        <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-medium text-muted-foreground">No categories found.</h2>
      </div>
    );
  }

  return (
    <div className="flex border border-border rounded-xl overflow-hidden bg-card min-h-[70vh]">
      {/* Left rail: main categories */}
      <nav className="w-24 sm:w-32 md:w-52 shrink-0 border-r border-border bg-muted/30 overflow-y-auto max-h-[80vh]">
        {roots.map((category) => {
          const isActive = category.id === activeCategory?.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className={cn(
                "w-full flex flex-col md:flex-row items-center gap-1.5 md:gap-3 px-2 md:px-4 py-3 text-center md:text-left border-l-2 transition-colors",
                isActive
                  ? "bg-background border-orange-500 text-orange-600"
                  : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              <span className="relative h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-full overflow-hidden bg-muted border border-border">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover p-1"
                    sizes="40px"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center opacity-30">
                    <LayoutGrid className="w-4 h-4" />
                  </span>
                )}
              </span>
              <span className="text-[10px] md:text-sm font-medium leading-tight line-clamp-2">
                {category.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right pane: subcategories of active category */}
      <div className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base md:text-lg font-bold tracking-tight">
            {activeCategory?.name}
          </h2>
          {activeCategory && (
            <Link
              href={`/category/${activeCategory.slug}`}
              className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-0.5 shrink-0"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {subcategories.length === 0 ? (
          activeCategory && (
            <Link
              href={`/category/${activeCategory.slug}`}
              className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground hover:text-orange-600 transition-colors"
            >
              <LayoutGrid className="w-10 h-10 opacity-20" />
              <span className="text-sm font-medium">
                Browse all {activeCategory.name} products
              </span>
            </Link>
          )
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6">
            {subcategories.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/category/${activeCategory!.slug}/${subcat.slug}`}
                className="group flex flex-col items-center text-center gap-2"
              >
                <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-muted border border-border group-hover:border-orange-500 group-active:scale-95 transition-all duration-200">
                  {subcat.imageUrl ? (
                    <Image
                      src={subcat.imageUrl}
                      alt={subcat.name}
                      fill
                      className="object-cover p-2"
                      sizes="(min-width: 768px) 140px, 100px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 opacity-20">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] md:text-xs font-medium leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {subcat.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
