import { HeroSliderForm } from "@/components/admin/hero-slider-form";
import { createHeroSlider } from "@/lib/actions";

export default function NewHeroSliderPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-bold tracking-tight">New hero slider</h1>
            <HeroSliderForm onSubmit={createHeroSlider} />
        </div>
    );
}
