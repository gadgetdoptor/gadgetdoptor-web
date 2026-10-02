import { getCategories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";
import { ScrollRow } from "./scroll-row";

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

        <ScrollRow className="flex flex-nowrap overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar snap-x snap-mandatory gap-x-4 sm:gap-x-6 mt-6 md:mt-12 pt-1 pb-4 px-1 -mx-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:snap-none sm:gap-y-6 sm:pt-0 sm:pb-0 sm:px-0 sm:-mx-0">
          {featuredCategories.map((category, index) => {
            const imageUrl = category.imageUrl || "";

            return (
              <FadeUp key={category.id} delay={index * 0.1}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex flex-col items-center w-28 sm:w-36 md:w-40 shrink-0 snap-start transition-all duration-300"
                >
                  <div data-scroll-card className="relative w-full aspect-[9/10] rounded-2xl overflow-hidden bg-muted/40 border border-border flex flex-col shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-500">
                    <div className="relative flex-1 w-full">
                      <div className="absolute inset-4 sm:inset-5 flex items-center justify-center">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={category.name}
                            fill
                            className="object-contain scale-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                            sizes="(max-width: 640px) 40vw, 20vw"
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
              </FadeUp>
            );
          })}
        </ScrollRow>
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
