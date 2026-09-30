import { getSiteSettings } from "@/lib/data";
import { SettingsProvider } from "@/context/settings-context";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <SettingsProvider settings={settings}>
      {children}
    </SettingsProvider>
  );
}
