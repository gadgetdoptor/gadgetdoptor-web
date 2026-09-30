"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Brand } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type BrandFiltersProps = {
  brands: Brand[];
};

export function BrandFilters({ brands = [] }: BrandFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get selected filters from URL
  const selectedBrands =
    searchParams.get("brands")?.split(",").filter(Boolean) || [];

  const updateFilters = (id: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    let brds = selectedBrands;
    if (checked) {
      brds = [...brds, id];
    } else {
      brds = brds.filter((b) => b !== id);
    }

    if (brds.length > 0) {
      params.set("brands", brds.join(","));
    } else {
      params.delete("brands");
    }

    // Reset to page 1 when filters change
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Select Brands
        </h3>
        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border">
          {brands.map((brand) => {
            const isChecked = selectedBrands.includes(brand.id);

            return (
              <div
                key={brand.id}
                className="flex items-center group cursor-pointer"
              >
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    updateFilters(brand.id, checked as boolean)
                  }
                  className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground border-input"
                />
                <Label
                  htmlFor={`brand-${brand.id}`}
                  className={cn(
                    "ml-3 text-sm cursor-pointer transition-colors",
                    isChecked
                      ? "font-bold text-foreground"
                      : "text-muted-foreground group-hover:text-foreground font-medium",
                  )}
                >
                  {brand.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
      {brands.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No brands available for this selection.
        </p>
      )}
    </div>
  );
}
