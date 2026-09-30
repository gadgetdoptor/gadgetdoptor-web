"use client";

import React from "react";
import type { Product } from "@/lib/types";
import { QuantitySelector } from "./quantity-selector";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Headset, Phone } from "lucide-react";
import Link from "next/link";
import { FaFly, FaWhatsapp } from "react-icons/fa";
import { ProductShare } from "./product-share";
import { useSiteSettings } from "@/context/settings-context";

export function ProductPurchaseCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = React.useState(1);
  const settings = useSiteSettings();
  const whatsappLink = `https://wa.me/88${settings.contactWhatsapp.replace(/\D/g, "")}`;

  return (
    <div className="space-y-4">
      <QuantitySelector
        quantity={quantity}
        setQuantity={setQuantity}
        stock={product.stock}
      />
      <div className="flex items-center gap-3">
        <AddToCartButton
          product={product}
          quantity={quantity}
          variant="buyNow"
        />
        <AddToCartButton product={product} quantity={quantity} variant="cart" />
      </div>
      <Separator />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          For any query
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <Button variant="outline" asChild className="">
            <Link href={`tel:${settings.contactPhone}`}>
              <Phone className="mr-0 sm:mr-2 h-4 w-4" />
              <p className="hidden sm:block">Call Now</p>
            </Link>
          </Button>
          <Button variant="outline" asChild className="">
            <Link href={whatsappLink} target="_blank">
              <FaWhatsapp className="mr-0 sm:mr-2 h-5 w-5" />
              <p className="hidden sm:block">WhatsApp</p>
            </Link>
          </Button>

          {/* contact page */}
          <Button variant="outline" asChild className="">
            <Link href="/contact">
              {/* contact related icon */}
              <Headset className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="opacity-50" />
      {/* */}
      <ProductShare productName={product.name} />
    </div>
  );
}
