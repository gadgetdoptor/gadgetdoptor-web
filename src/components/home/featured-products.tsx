import { getProducts } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";

export async function FeaturedProducts() {
  const { products: featuredProducts } = await getProducts({
    isFeatured: true,
    limit: 10,
  });

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-14 lg:py-16 bg-muted/30">
      <div className="container">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
            <div className="space-y-4 text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight capitalize leading-none">
                Featured{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                  Products
                </span>
              </h2>
            </div>
            <div className="flex gap-2 md:gap-3 hidden md:flex">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 border-border hover:bg-foreground hover:text-background transition-all" />
              <CarouselNext className="static translate-y-0 h-10 w-10 md:h-12 md:w-12 border-border hover:bg-foreground hover:text-background transition-all" />
            </div>
          </div>
          <CarouselContent className="py-2">
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-[48%] sm:basis-[30%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
