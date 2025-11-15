import { i18n } from '@lingui/core';
import { en, ar } from 'make-plural/plurals';
import { messages as enMessages } from '@/locales/en/messages';
import { messages as arMessages } from '@/locales/ar/messages';

i18n.loadLocaleData({
  en: { plurals: en },
  ar: { plurals: ar },
});

i18n.load({
  en: enMessages,
  ar: arMessages,
});

i18n.activate('en');

export { i18n };