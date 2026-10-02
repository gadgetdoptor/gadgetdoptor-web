import { getProducts } from "@/lib/data";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";

export async function BestSelling() {
  const { products: bestSellingProducts } = await getProducts({
    isBestSelling: true,
    limit: 10,
  });

  if (bestSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 md:pt-14 lg:pt-8 pb-8 md:pb-14 lg:pb-16 bg-background">
      <div className="container">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          autoplay={{ delay: 3500 }}
          className="w-full"
        >
          <div className="flex flex-row items-end justify-between gap-6 mb-8 md:mb-12">
            <div className="space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight capitalize leading-none">
                Best{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                  Selling
                </span>
              </h2>
            </div>
            <Link
              href="/product"
              className="text-xs md:text-sm font-bold border border-border rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors shrink-0"
            >
              See All
            </Link>
          </div>
          <div className="relative">
            <CarouselContent className="py-2">
              {bestSellingProducts.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[48%] sm:basis-[30%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="flex left-0 -translate-x-1/2 h-9 w-9 md:h-10 md:w-10 backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 disabled:hidden transition-colors" />
            <CarouselNext className="flex right-0 translate-x-1/2 h-9 w-9 md:h-10 md:w-10 backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 disabled:hidden transition-colors" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
