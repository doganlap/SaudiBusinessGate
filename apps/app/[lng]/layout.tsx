import { ReactNode } from 'react'
import { LanguageProvider } from '@/components/i18n/LanguageProvider'
import { RTLProvider } from '@/lib/i18n/rtl-provider'
import { Language, languages, defaultLanguage } from '@/lib/i18n'
import { getDirection } from '@/lib/i18n/rtl-config'

interface LayoutProps {
  children: ReactNode
  params: Promise<{
    lng: string
  }>
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lng } = await params;
  // Ensure valid language
  const validLang = languages.includes(lng as Language) 
    ? (lng as Language) 
    : defaultLanguage
  
  const direction = getDirection(validLang);
  
  return (
    <html lang={validLang} dir={direction}>
      <head>
        <meta name="language" content={validLang} />
        <meta name="direction" content={direction} />
      </head>
      <body className={direction}>
        <RTLProvider>
          <LanguageProvider initialLanguage={validLang}>
            {children}
          </LanguageProvider>
        </RTLProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return languages.map(lng => ({ lng }))
}
