"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings-defaults";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);

export function SettingsProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
