import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
    </SettingsProvider>
  );
}
