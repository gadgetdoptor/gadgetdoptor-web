import { getCategories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export async function FeaturedCategories() {
  let categories = await getCategories({ isFeatured: true });

  if (categories.length === 0) {
    categories = await getCategories({ topLevelOnly: true });
  }

  const featuredCategories = categories.slice(0, 8);

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 md:pt-14 lg:pt-8 pb-8 md:pb-14 lg:pb-16 bg-background bg-grid relative overflow-hidden">
      <div className="bg-noise" />
      <div className="container">
        <FadeUp>
          <div className="space-y-4 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight capitalize leading-tight gap-2 flex flex-row pb-1">
              Featured <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                Categories
              </span>
            </h2>
          </div>
        </FadeUp>

        <FadeUp>
          <Carousel
            opts={{ align: "start" }}
            className="w-full mt-6 md:mt-12"
          >
            <div className="relative">
              <CarouselContent className="py-2">
                {featuredCategories.map((category) => {
                  const imageUrl = category.imageUrl || "";

                  return (
                    <CarouselItem
                      key={category.id}
                      className="basis-[clamp(100px,22vw,176px)]"
                    >
                      <Link
                        href={`/category/${category.slug}`}
                        className="group flex flex-col items-center w-full transition-all duration-300"
                      >
                        <div className="relative w-full aspect-[9/10] rounded-2xl overflow-hidden bg-muted/40 border border-border flex flex-col shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-500">
                          <div className="relative flex-1 w-full">
                            <div className="absolute inset-4 sm:inset-5 flex items-center justify-center">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={category.name}
                                  fill
                                  className="object-contain scale-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                                  sizes="22vw"
                                />
                              ) : (
                                <ShoppingBag
                                  className="w-10 h-10 text-muted-foreground/50"
                                  strokeWidth={1}
                                />
                              )}
                            </div>
                          </div>

                          {/* Typography inside the card */}
                          <div className="h-9 flex items-start justify-center px-2 pb-5">
                            <h3 className="text-xs leading-4 text-foreground group-hover:text-orange-600 transition-colors text-center line-clamp-2">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="flex left-0 -translate-x-1/2 h-9 w-9 md:h-10 md:w-10 backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 disabled:hidden transition-colors" />
              <CarouselNext className="flex right-0 translate-x-1/2 h-9 w-9 md:h-10 md:w-10 backdrop-blur-md bg-background/70 border border-border/50 shadow-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 disabled:hidden transition-colors" />
            </div>
          </Carousel>
        </FadeUp>
        <div className="flex justify-center mt-4 md:mt-8 lg:mt-12">
          <Link
            href="/category"
            className="group relative isolate overflow-hidden bg-gradient-to-r from-foreground to-muted-foreground text-background px-6 py-3 md:px-8 md:py-4 text-xs font-black hover:text-white transition-colors duration-500 w-fit flex items-center gap-2 rounded-lg"
          >
            <span className="absolute inset-0 -z-10 bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            Explore all Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
