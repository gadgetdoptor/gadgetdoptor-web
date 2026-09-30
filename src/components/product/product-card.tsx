"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";

type ProductCardProps = {
  product: Product;
  isFeatured?: boolean;
  priority?: boolean;
};

export function ProductCard({
  product,
  isFeatured = false,
  priority = false,
}: ProductCardProps) {
  const hasDiscount = !!(product.discount && product.discount > 0);
  const showStrikethrough = !!(
    product.originalPrice && product.originalPrice > product.price
  );

  const { addItem, setDrawerOpen } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
    setDrawerOpen(true);
  };

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden transition-all duration-300 group shadow-sm bg-card hover:-translate-y-1 border border-border rounded-xl p-0 gap-0">
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col relative"
      >
        <div className="relative overflow-hidden aspect-square bg-muted/30 border-b border-border">
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 z-10 bg-orange-600 text-white font-bold text-[10px] uppercase tracking-widest px-2 py-1 border-none">
              -{product.discount}% OFF
            </Badge>
          )}

          {product.images && product.images.length > 0 && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
              <ShoppingCart className="w-12 h-12 opacity-10" />
            </div>
          )}
        </div>

        <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 flex-1">
          <div className="space-y-0.5 md:space-y-1 flex-1">
            <h3 className="font-semibold leading-tight text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-orange-600 transition-colors capitalize tracking-normal">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1 md:mt-2">
            <p className="text-sm sm:text-base md:text-lg font-black text-foreground">
              ৳{product.price.toLocaleString()}
            </p>
            {showStrikethrough && (
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through decoration-muted-foreground/50 font-medium">
                ৳{product.originalPrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-3 pb-3 md:px-4 md:pb-4">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-foreground to-muted-foreground text-background border-0  capitalize  hover:bg-none hover:bg-orange-600 hover:text-white transition-all h-9"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 && <ShoppingCart className="w-3.5 h-3.5" />}
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
}
