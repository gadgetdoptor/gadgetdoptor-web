"use client";

import { useState } from "react";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { lookupProductByBarcode } from "@/lib/actions";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ScanLine, Package } from "lucide-react";

export default function ScanPage() {
  const [scanning, setScanning] = useState(true);
  const [isLooking, setIsLooking] = useState(false);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [scannedValue, setScannedValue] = useState("");

  const handleScan = async (value: string) => {
    setScanning(false);
    setIsLooking(true);
    setScannedValue(value);
    try {
      const result = await lookupProductByBarcode(value);
      setProduct(result);
    } finally {
      setIsLooking(false);
    }
  };

  const reset = () => {
    setProduct(undefined);
    setScannedValue("");
    setScanning(true);
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ScanLine className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">Scan a product</h1>
      </div>

      {scanning && (
        <div className="space-y-4">
          <BarcodeScanner active={scanning} onScan={handleScan} />
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a product's barcode.
          </p>
        </div>
      )}

      {!scanning && isLooking && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Looking up barcode {scannedValue}...</p>
        </div>
      )}

      {!scanning && !isLooking && product === null && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No product found for barcode <span className="font-semibold">{scannedValue}</span>.
          </p>
          <Button onClick={reset}>Scan again</Button>
        </div>
      )}

      {!scanning && !isLooking && product && (
        <div className="space-y-4">
          <div className="flex gap-4 border border-border rounded-[12px] p-4">
            <div className="relative h-20 w-20 shrink-0 bg-muted rounded-[8px] overflow-hidden">
              {product.images?.[0] && (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/product/${product.slug}`} className="font-bold text-sm hover:underline line-clamp-2">
                {product.name}
              </Link>
              <p className="text-lg font-black text-primary mt-1">Tk {product.price}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <AddToCartButton product={product} quantity={1} variant="buyNow" />
            <AddToCartButton product={product} quantity={1} variant="cart" />
          </div>

          <Button variant="ghost" className="w-full" onClick={reset}>
            Scan another product
          </Button>
        </div>
      )}
    </div>
  );
}
