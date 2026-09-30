import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order Confirmed #${orderNumber} - Gadget Doptor`,
    description: "Thank you for your order.",
  };
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { orderNumber } = await params;

  return (
    <div className="container mx-auto pt-4 pb-20 px-4">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Order Confirmed", href: "#" },
          ]}
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight font-headline uppercase">
          Order Confirmed
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center">
        <Card className="max-w-lg w-full text-center p-6 border-border shadow-sm">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="mt-8 text-3xl font-bold font-headline uppercase tracking-tight">
              Order Confirmed!
            </CardTitle>
            <CardDescription className="mt-4 text-muted-foreground leading-relaxed">
              Your order has been placed successfully. We&apos;ll notify you
              once your package is on its way. Thank you for shopping with
              Gadget Doptor!
            </CardDescription>
            <div className="mt-6 p-4 bg-muted border border-border">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                Order Number
              </p>
              <p className="text-xl font-bold text-foreground font-mono tracking-wider">
                {orderNumber}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                asChild
                className="px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest"
              >
                <Link href="/account/orders">
                  <Package className="mr-2 h-4 w-4" />
                  View Order
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-8 py-6 border-border font-bold uppercase tracking-widest"
              >
                <Link href="/" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
