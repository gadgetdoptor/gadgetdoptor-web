import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/cart-context';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  metadataBase: new URL('https://gadgetdoptor.vercel.app'),
  title: {
    default: 'Gadget Doptor | Trustest Online Shop in Bangladesh',
    template: '%s | Gadget Doptor',
  },
  description: 'The most trusted online shop in Bangladesh for authentic gadgets and accessories. Your one-stop shop for everything cool.',
  keywords: ['online shop', 'bangladesh', 'gadgets', 'accessories', 'Gadget Doptor', 'authentic products'],
  authors: [{ name: 'Gadget Doptor' }],
  creator: 'Gadget Doptor',
  publisher: 'Gadget Doptor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gadgetdoptor.vercel.app',
    siteName: 'Gadget Doptor',
    title: 'Gadget Doptor | Trustest Online Shop in Bangladesh',
    description: 'The most trusted online shop in Bangladesh for authentic gadgets and accessories.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gadget Doptor - Your Trusted Online Shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadget Doptor | Trustest Online Shop in Bangladesh',
    description: 'The most trusted online shop in Bangladesh for authentic gadgets and accessories.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { AuthProvider } from '@/context/auth-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
      >
        <NextTopLoader showSpinner={false} color="#FF6B35" />
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
