import type { SiteSettings } from '@/lib/types';

// Fallback values used until an admin overrides them from /admin/settings.
// Kept dependency-free (no db import) so it's safe to use from client components too.
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Gadget Doptor',
  siteTagline: 'Quality products, trusted service.',
  siteLogo: '/gadgetdoptor-logo.webp',
  favicon: '/favicon.ico',
  contactPhone: '01746887593',
  contactWhatsapp: '01746887593',
  contactEmail: 'gadgetdoptor@gmail.com',
  contactAddress: 'Balarcira, Sundorgonj, Gaibandha',
  socialFacebook: 'https://facebook.com/gadgetdoptorx',
  socialInstagram: 'https://instagram.com/gadgetdoptorx',
  socialYoutube: 'https://youtube.com/@gadgetdoptorx',
  socialTiktok: '',
  seoMetaTitle: 'Gadget Doptor | Trustest Online Shop in Bangladesh',
  seoMetaDescription: 'The most trusted online shop in Bangladesh for authentic gadgets and accessories. Your one-stop shop for everything cool.',
  seoKeywords: 'online shop, bangladesh, gadgets, accessories, Gadget Doptor, authentic products',
};

export const SETTING_KEY_MAP: Record<keyof SiteSettings, string> = {
  siteName: 'site_name',
  siteTagline: 'site_tagline',
  siteLogo: 'site_logo',
  favicon: 'favicon',
  contactPhone: 'contact_phone',
  contactWhatsapp: 'contact_whatsapp',
  contactEmail: 'contact_email',
  contactAddress: 'contact_address',
  socialFacebook: 'social_facebook',
  socialInstagram: 'social_instagram',
  socialYoutube: 'social_youtube',
  socialTiktok: 'social_tiktok',
  seoMetaTitle: 'seo_meta_title',
  seoMetaDescription: 'seo_meta_description',
  seoKeywords: 'seo_keywords',
};
