import { getBrands } from "@/lib/data";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Brands - Gadget Doptor",
    description: "Browse all brands available at Gadget Doptor.",
};

export default async function BrandsPage() {
    const brands = await getBrands();

    return (
        <div className="bg-background min-h-screen">
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-black text-white pt-4 pb-6 md:pt-6 md:pb-8 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb
                        items={[
                            { name: 'Home', href: '/' },
                            { name: 'Brand', href: '/brand' }
                        ]}
                        className="text-white"
                    />
                    <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-xl sm:text-2xl min-[1200px]:text-3xl font-black font-headline tracking-tighter uppercase leading-none">
                                Shop by Brand
                            </h1>
                            <div className="h-1 w-16 md:h-1.5 md:w-24 bg-orange-500"></div>
                            <h3 className="text-zinc-400 text-xs sm:text-sm font-medium">
                                Browse products from your favorite brands. Trusted names, guaranteed quality.
                            </h3>
                        </div>
                    </div>
                </div>
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container py-12">
                {brands.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-border rounded-xl">
                        <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-medium text-muted-foreground">No brands found.</h2>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-muted-foreground mb-6">
                            Showing <span className="text-primary font-bold">{brands.length}</span> brands
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {brands.map(brand => (
                                <Link href={`/brand/${brand.slug}`} key={brand.id} className="group">
                                    <div className="flex flex-col items-center justify-center gap-3 p-4 h-full bg-card border border-border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-500/50">
                                        <div className="relative h-20 w-20 flex items-center justify-center">
                                            {brand.imageUrl ? (
                                                <Image
                                                    src={brand.imageUrl}
                                                    alt={brand.name}
                                                    fill
                                                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                                                    sizes="(min-width: 1280px) 120px, 100px"
                                                />
                                            ) : (
                                                <Tag className="w-10 h-10 text-muted-foreground opacity-40" />
                                            )}
                                        </div>
                                        <span className="text-center text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors line-clamp-1">
                                            {brand.name}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
