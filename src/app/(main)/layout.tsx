import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCategories, getSiteSettings } from "@/lib/data";
import { SettingsProvider } from "@/context/settings-context";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <SettingsProvider settings={settings}>
      <div className="relative flex min-h-screen flex-col">
        <Header categories={categories} />
        <main className="flex-1 pb-16 min-[1200px]:pb-0">{children}</main>
        <Footer settings={settings} />
        <BottomNav categories={categories} />
      </div>
    </SettingsProvider>
  );
}
