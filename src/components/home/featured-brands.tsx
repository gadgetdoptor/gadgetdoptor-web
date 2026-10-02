import { getBrands } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";
import { ScrollRow } from "./scroll-row";

export async function FeaturedBrands() {
    const allBrands = await getBrands();
    const brands = allBrands.slice(0, 8); // Showing a few more for the grid

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="py-8 md:py-14 lg:py-16 bg-background relative overflow-hidden">
            <div className="bg-noise" />
            <div className="container">
                <FadeUp>
                    <div className="flex flex-row items-end justify-between gap-4 mb-8 md:mb-12">
                        <div className="space-y-2">

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-headline tracking-tight capitalize leading-none">
                                Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">Brands</span>
                            </h2>
                        </div>
                        <Link href="/brand" className="text-xs md:text-sm font-bold border border-border rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                            See All
                        </Link>
                    </div>
                </FadeUp>

                <ScrollRow className="flex flex-nowrap overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar snap-x snap-mandatory gap-4 sm:gap-6 pb-4 px-1 -mx-1 sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:overflow-visible sm:snap-none sm:pb-0 sm:px-0 sm:-mx-0">
                    {brands.map((brand, index) => (
                        <FadeUp key={brand.id} delay={index * 0.05} distance={20}>
                            <Link href={`/brand/${brand.slug}`} className="group flex flex-col items-start gap-2 w-24 sm:w-full sm:max-w-[7.5rem] shrink-0 snap-start transition-all duration-300">
                                <div data-scroll-card className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/40 border border-border flex items-center justify-center group-hover:bg-card group-hover:shadow-2xl group-hover:border-border transition-all duration-500">
                                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-md overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                        {brand.imageUrl ? (
                                            <Image
                                                src={brand.imageUrl}
                                                alt={brand.name}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 640px) 110px, 90px"
                                            />
                                        ) : (
                                            <Tag className="w-14 h-14 md:w-20 md:h-20 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                </div>
                                <span className="text-center w-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 px-1">
                                    {brand.name}
                                </span>
                            </Link>
                        </FadeUp>
                    ))}
                </ScrollRow>
            </div>
        </section>
    );
}