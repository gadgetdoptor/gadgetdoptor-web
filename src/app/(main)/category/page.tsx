import { getCategories } from "@/lib/data";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { CategoryBrowser } from "@/components/category/category-browser";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Categories - Gadget Doptor",
    description: "Browse products by category at Gadget Doptor Bangladesh.",
};

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="bg-background min-h-screen">
            {/* --- HEADER --- */}
            <div className="bg-card">
                <div className="container py-4">
                    <Breadcrumb
                        items={[
                            { name: 'Home', href: '/' },
                            { name: 'Categories', href: '/category' }
                        ]}
                    />
                </div>
            </div>

            <div className="container py-4 md:py-8">
                <CategoryBrowser categories={categories} />
            </div>
        </div>
    );
}
