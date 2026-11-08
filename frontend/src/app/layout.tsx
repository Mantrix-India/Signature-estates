import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from 'react-hot-toast';
import { AmbientBackground } from '@/components/layout/ambient-background';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Signature Estates OS — Operating System for Real Estate Agencies',
  description:
    'Manage properties, builders, clients, leads, site visits, documents, invoices and analytics from a single premium operating system.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ee' },
    { media: '(prefers-color-scheme: dark)', color: '#131a1d' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="relative min-h-screen bg-background text-foreground antialiased">
        <AmbientBackground />
        <div className="relative z-10 min-h-screen">
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: '10px',
                    fontSize: '14px',
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}