import { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/data'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await getSiteSettings();
    return {
        name: settings.siteName,
        short_name: settings.siteName,
        description: settings.seoMetaDescription || `Your one-stop destination for the latest trends and high-quality products.`,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: settings.siteLogo,
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
