import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

/**
 * @fileOverview Root Layout with PWA metadata for installation.
 * Ensures the app looks and feels like a native application on all platforms.
 */
export const metadata: Metadata = {
  title: 'DataResearch.ai | Advanced Student Analytics',
  description: 'Professional A to Z student data research and analytics platform powered by AI.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Research.AI',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'Research.AI',
  authors: [{ name: 'A to Z Intelligence' }],
  keywords: ['Student Analytics', 'Education AI', 'Research', 'PWA', 'National Objectives'],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export const viewport: Viewport = {
  themeColor: '#07F1D6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=192&h=192&auto=format&fit=crop" />
        <meta name="theme-color" content="#07F1D6" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=32&h=32&auto=format&fit=crop" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=16&h=16&auto=format&fit=crop" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 overscroll-none">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
