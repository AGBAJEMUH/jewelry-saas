import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Lumière AI — Jewelry Marketing Platform',
  description: 'AI-powered social media campaign generator for jewelry brands. Upload your products, get optimized captions, hashtags, and promotional images in seconds.',
  openGraph: {
    title: 'Lumière AI — Jewelry Marketing Platform',
    description: 'Generate premium jewelry marketing campaigns with AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
