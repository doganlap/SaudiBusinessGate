/**
 * Example Component Demonstrating RTL Usage
 * This component shows how to use the RTL utilities throughout the application
 */

'use client';

import { useRTL } from '@/lib/i18n/rtl-provider';
import { formatNumber, formatCurrency, formatDate } from '@/lib/i18n/rtl-config';

export default function ExampleComponent() {
  // Get RTL utilities from context
  const { 
    language, 
    direction, 
    isRTL, 
    setLanguage, 
    tw, 
    rtlStyle,
    formatters 
  } = useRTL();

  return (
    <div className={`container ${direction}`}>
      {/* Header with Tailwind RTL utilities */}
      <header className={`${tw.ms('4')} ${tw.pe('4')} ${tw.textStart}`}>
        <h1 className={tw.textStart}>
          {isRTL ? 'مرحباً بك' : 'Welcome'}
        </h1>
        
        {/* Language switcher */}
        <div className={`flex gap-2`}>
          <button 
            onClick={() => setLanguage('en')}
            className={tw.ms('2')}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('ar')}
            className={tw.me('2')}
          >
            العربية
          </button>
        </div>
      </header>

      {/* Content with CSS-in-JS RTL utilities */}
      <main 
        style={{
          ...rtlStyle.container,
          textAlign: rtlStyle.textAlign('start').textAlign as any,
          ...rtlStyle.marginStart('10px'),
          padding: '20px',
        }}
      >
        {/* Card with RTL support */}
        <div 
          className="card"
          style={{
            ...rtlStyle.borderStart('4px solid blue'),
            ...rtlStyle.paddingStart('16px'),
            borderRadius: '8px',
          }}
        >
          <h2 className={tw.textStart}>
            {isRTL ? 'معلومات العميل' : 'Customer Information'}
          </h2>
          
          {/* Form with RTL support */}
          <form className="space-y-4">
            <div className={tw.textStart}>
              <label className="block">
                {isRTL ? 'الاسم' : 'Name'}
              </label>
              <input 
                type="text" 
                className={`w-full ${tw.textStart} ${tw.ps('3')}`}
                dir={direction}
              />
            </div>

            <div className={tw.textStart}>
              <label className="block">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input 
                type="email" 
                className={`w-full ${tw.textStart} ${tw.ps('3')}`}
                dir="ltr" // Email always LTR
              />
            </div>
          </form>

          {/* Data display with formatting */}
          <div className={`mt-4 space-y-2`}>
            <p className={tw.textStart}>
              {isRTL ? 'السعر: ' : 'Price: '}
              {formatters.currency(12500)}
            </p>
            
            <p className={tw.textStart}>
              {isRTL ? 'الكمية: ' : 'Quantity: '}
              {formatters.number(1234567)}
            </p>
            
            <p className={tw.textStart}>
              {isRTL ? 'التاريخ: ' : 'Date: '}
              {formatters.date(new Date())}
            </p>
          </div>

          {/* Button group with RTL-aware spacing */}
          <div className={`flex justify-end gap-2 mt-4`}>
            <button className={tw.me('2')}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button className={tw.ms('2')}>
              {isRTL ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>

        {/* List with RTL support */}
        <ul className={`mt-6 ${tw.textStart}`}>
          <li className={tw.ps('4')}>{isRTL ? 'العنصر الأول' : 'First item'}</li>
          <li className={tw.ps('4')}>{isRTL ? 'العنصر الثاني' : 'Second item'}</li>
          <li className={tw.ps('4')}>{isRTL ? 'العنصر الثالث' : 'Third item'}</li>
        </ul>

        {/* Navigation with directional icons */}
        <nav className={`flex flex-row justify-between mt-6`}>
          <button className={`flex items-center`}>
            <span>←</span>
            <span className={tw.ms('2')}>
              {isRTL ? 'السابق' : 'Previous'}
            </span>
          </button>
          
          <button className={`flex items-center`}>
            <span className={tw.me('2')}>
              {isRTL ? 'التالي' : 'Next'}
            </span>
            <span>→</span>
          </button>
        </nav>

        {/* Table with RTL support */}
        <table className={`w-full mt-6`}>
          <thead>
            <tr className={tw.textStart}>
              <th className={tw.ps('2')}>{isRTL ? 'المنتج' : 'Product'}</th>
              <th className={tw.ps('2')}>{isRTL ? 'السعر' : 'Price'}</th>
              <th className={tw.ps('2')}>{isRTL ? 'الكمية' : 'Quantity'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className={tw.textStart}>
              <td className={tw.ps('2')}>{isRTL ? 'منتج أ' : 'Product A'}</td>
              <td className={tw.ps('2')}>{formatters.currency(500)}</td>
              <td className={tw.ps('2')}>{formatters.number(10)}</td>
            </tr>
          </tbody>
        </table>
      </main>

      {/* Sidebar with RTL positioning */}
      <aside 
        className="sidebar"
        style={{
          ...rtlStyle.end(0),
          ...rtlStyle.borderStart('1px solid #ccc'),
          ...rtlStyle.paddingStart('16px'),
        }}
      >
        <h3 className={tw.textStart}>
          {isRTL ? 'الشريط الجانبي' : 'Sidebar'}
        </h3>
      </aside>
    </div>
  );
}
