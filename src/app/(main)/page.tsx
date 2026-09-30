import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewTrends } from "@/components/home/new-trends";
import { BestSelling } from "@/components/home/best-selling";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturedBrands } from "@/components/home/featured-brands";
import { getHeroSliders, getSiteSettings } from "@/lib/data";
import { FadeUp } from "@/components/animations/fade-up";

export const revalidate = 3600;

export default async function HomePage() {
  const [
    activeSliders,
    promoTop,
    promoBottom,
    settings,
  ] = await Promise.all([
    getHeroSliders({ isActive: true, type: 'carousel' }),
    getHeroSliders({ isActive: true, type: 'promo-top', limit: 1 }),
    getHeroSliders({ isActive: true, type: 'promo-bottom', limit: 1 }),
    getSiteSettings(),
  ]);

  return (
    <div className="relative">
      <h1 className="sr-only">{settings.siteName} - Best Online Shopping in Bangladesh</h1>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10 blur-3xl opacity-50 pointer-events-none" />
      <FadeUp duration={0.8}>
        <HeroSection
          sliders={activeSliders}
          promoTop={promoTop[0]}
          promoBottom={promoBottom[0]}
        />
      </FadeUp>

      <FadeUp delay={0.2}>
        <FeaturedCategories />
      </FadeUp>

      <FadeUp>
        <NewTrends />
      </FadeUp>

      <FadeUp>
        <BestSelling />
      </FadeUp>

      <FadeUp>
        <FeaturedProducts />
      </FadeUp>

      <FadeUp>
        <FeaturedBrands />
      </FadeUp>
    </div>
  );
}
