import './globals.css'
import '../styles/rtl.css'
import type { Metadata } from 'next'
import Providers from './providers'
import { LanguageProvider } from '@/components/i18n/LanguageProvider'

export const metadata: Metadata = {
  title: {
    default: 'Saudi Store - منصة الأعمال المتكاملة',
    template: '%s | Saudi Store'
  },
  description: 'منصة الأعمال المتكاملة للشركات - إدارة المالية، المبيعات، الموارد البشرية والمزيد',
  keywords: ['أعمال', 'إدارة', 'مالية', 'مبيعات', 'موارد بشرية', 'business', 'management'],
  authors: [{ name: 'Saudi Store Team' }],
  creator: 'Saudi Store',
  publisher: 'Saudi Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'),
  themeColor: '#0ea5e9',
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    title: 'Saudi Store - منصة الأعمال المتكاملة',
    description: 'منصة الأعمال المتكاملة للشركات',
    siteName: 'Saudi Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saudi Store - منصة الأعمال المتكاملة',
    description: 'منصة الأعمال المتكاملة للشركات',
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body
        className="font-sans antialiased bg-neutral-50 text-neutral-900 selection:bg-brand-100 selection:text-brand-900"
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <Providers>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </Providers>
        </LanguageProvider>
        
        {/* Performance and Analytics Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Preload critical resources
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  // Preload fonts
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'font';
                  link.type = 'font/woff2';
                  link.crossOrigin = 'anonymous';
                  link.href = 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.woff2';
                  document.head.appendChild(link);
                });
              }
              
              // Theme detection and application
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
              
              // Language direction detection
              (function() {
                const lang = document.documentElement.lang;
                const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
                if (rtlLanguages.includes(lang)) {
                  document.documentElement.setAttribute('dir', 'rtl');
                } else {
                  document.documentElement.setAttribute('dir', 'ltr');
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
