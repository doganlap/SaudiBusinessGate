import './globals.css'
import '../styles/rtl.css'
import type { Metadata, Viewport } from 'next'
import Providers from './providers'
import { AIChatbot } from '@/components/features/ai-chatbot'

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
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
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

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CSS Variable Fallbacks */
            :root {
              --color-brand-50: 240, 249, 255;
              --color-brand-500: 14, 165, 233;
              --color-brand-600: 2, 132, 199;
              --color-brand-900: 12, 74, 110;
              --color-neutral-50: 250, 250, 250;
              --color-neutral-100: 245, 245, 245;
              --color-neutral-900: 23, 23, 23;
              --font-inter: 'Inter', system-ui, sans-serif;
              --font-noto-arabic: 'Noto Sans Arabic', sans-serif;
              --transition-enterprise: all 0.3s ease;
            }
            body {
              font-family: var(--font-noto-arabic);
              transition: var(--transition-enterprise);
            }
            .font-arabic {
              font-family: var(--font-noto-arabic);
            }
          `
        }} />
      </head>
      <body
        className="font-arabic antialiased bg-neutral-50 text-neutral-900 selection:bg-brand-100 selection:text-brand-900"
        suppressHydrationWarning={true}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <AIChatbot />
        </Providers>
        
        {/* Performance and Analytics Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Theme detection and application
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
              
              // Automatic i18n configuration - Arabic (RTL) as default
              (function() {
                const defaultLang = 'ar';
                const defaultDir = 'rtl';
                
                // Set default immediately
                document.documentElement.lang = defaultLang;
                document.documentElement.dir = defaultDir;
                document.documentElement.classList.add('lang-ar', 'dir-rtl');
                document.body.classList.add('rtl');
                
                // Function to update direction based on language
                const updateDirection = () => {
                  const lang = document.documentElement.lang || defaultLang;
                  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
                  const direction = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
                  document.documentElement.setAttribute('dir', direction);
                  document.documentElement.classList.remove('dir-rtl', 'dir-ltr');
                  if (direction === 'rtl') {
                    document.documentElement.classList.add('dir-rtl');
                  } else {
                    document.documentElement.classList.add('dir-ltr');
                  }
                  document.body.classList.remove('rtl', 'ltr');
                  document.body.classList.add(direction);
                };
                
                // Initial update
                updateDirection();
                
                // Listen for language changes
                const observer = new MutationObserver(updateDirection);
                observer.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ['lang']
                });
                
                // Listen for localStorage changes
                window.addEventListener('storage', (e) => {
                  if (e.key === 'language' && e.newValue) {
                    document.documentElement.lang = e.newValue;
                    updateDirection();
                  }
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
