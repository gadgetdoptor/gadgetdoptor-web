import { getCategories } from "@/lib/data";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
    title: "Categories - Gadget Doptor",
    description: "Browse products by category at Gadget Doptor Bangladesh.",
};

export default async function CategoriesPage() {
    // Fetch all categories
    const categories = await getCategories();

    // Sort into roots and children
    const roots = categories.filter(c => !c.parentId);
    const childrenMap = new Map<string, Category[]>();
    categories.forEach(c => {
        if (c.parentId) {
            if (!childrenMap.has(c.parentId)) {
                childrenMap.set(c.parentId, []);
            }
            childrenMap.get(c.parentId)!.push(c);
        }
    });

    return (
        <div className="bg-background min-h-screen">
            {/* --- PREMIUM HEADER --- */}
            <div className="bg-black text-white pt-4 pb-6 md:pt-6 md:pb-8 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb
                        items={[
                            { name: 'Home', href: '/' },
                            { name: 'Categories', href: '/category' }
                        ]}
                        className="text-white"
                    />
                    <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-xl sm:text-2xl min-[1200px]:text-3xl font-black font-headline tracking-tighter uppercase leading-none">
                                All Categories
                            </h1>
                            <div className="h-1 w-16 md:h-1.5 md:w-24 bg-orange-500"></div>
                            <h3 className="text-zinc-400 text-xs sm:text-sm font-medium">
                                Explore our complete range of product categories. Find exactly what you're looking for.
                            </h3>
                        </div>
                    </div>
                </div>
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container py-12">
                {roots.length === 0 ? (
                    <div className="text-center py-20 bg-card border border-border rounded-xl">
                        <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-medium text-muted-foreground">No categories found.</h2>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-muted-foreground mb-6">
                            Showing <span className="text-primary font-bold">{roots.length}</span> categories
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {roots.map(category => {
                                const children = childrenMap.get(category.id) || [];

                                return (
                                    <div key={category.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all duration-300">
                                        <Link
                                            href={`/category/${category.slug}`}
                                            className="group block relative aspect-[4/3] overflow-hidden bg-muted"
                                        >
                                            {category.imageUrl ? (
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    fill
                                                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(min-width: 1280px) 300px, 250px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                                    <LayoutGrid className="w-16 h-16" />
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                                <h2 className="text-white font-bold text-lg leading-tight">{category.name}</h2>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </Link>

                                        {children.length > 0 && (
                                            <ul className="space-y-2 p-4 flex-1">
                                                {children.slice(0, 5).map((child: Category) => (
                                                    <li key={child.id}>
                                                        <Link
                                                            href={`/category/${child.slug}`}
                                                            className="text-sm text-muted-foreground hover:text-orange-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                                {children.length > 5 && (
                                                    <li className="pt-1">
                                                        <Link
                                                            href={`/category/${category.slug}`}
                                                            className="text-xs font-bold text-orange-500 uppercase tracking-tighter hover:underline"
                                                        >
                                                            + View All Subcategories
                                                        </Link>
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
