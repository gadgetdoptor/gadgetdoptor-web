import { getCategories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";

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
    <section className="py-8 md:py-14 lg:py-16 bg-background bg-grid relative overflow-hidden">
      <div className="bg-noise" />
      <div className="container">
        <FadeUp>
          <div className="space-y-4 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight capitalize leading-[0.9] gap-2 flex flex-row">
              Featured <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                Categories
              </span>
            </h2>
          </div>
        </FadeUp>

        <div className="flex flex-wrap justify-center gap-y-6 gap-x-4 sm:gap-x-6 mt-12">
          {featuredCategories.map((category, index) => {
            const imageUrl = category.imageUrl || "";

            return (
              <FadeUp key={category.id} delay={index * 0.1}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex flex-col items-center w-32 sm:w-36 md:w-40 transition-all duration-300"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted/40 flex flex-col shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
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
                    <h3 className="text-xs text-foreground group-hover:text-orange-600 transition-colors text-center px-2 pb-3">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
        <div className="flex justify-center mt-12">
          <Link
            href="/category"
            className="bg-gradient-to-r from-foreground to-muted-foreground text-background px-6 py-3 md:px-8 md:py-4 text-xs font-black hover:bg-none hover:bg-orange-600 hover:text-white transition-all duration-500 w-fit flex items-center gap-2 rounded-lg"
          >
            Explore all Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
