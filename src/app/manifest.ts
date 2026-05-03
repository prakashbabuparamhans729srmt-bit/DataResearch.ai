import { MetadataRoute } from 'next';

/**
 * @fileOverview Generates the Web App Manifest for PWA installation.
 * This ensures the app can be installed on Mobile, Tablets, and Laptops with high-tech branding.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Research.AI | A to Z Intelligence',
    short_name: 'Research.AI',
    description: 'Professional A to Z student data research and analytics platform powered by AI.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#070707',
    theme_color: '#07F1D6',
    categories: ['education', 'productivity', 'research'],
    icons: [
      {
        src: 'https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=192&h=192&auto=format&fit=crop',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?q=80&w=512&h=512&auto=format&fit=crop',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
