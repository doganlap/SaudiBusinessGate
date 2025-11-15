import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en', 'ar'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['app', 'components', 'lib', 'pages'],
      exclude: ['**/node_modules/**', '**/.*'],
    },
  ],
  format: 'po',
  formatOptions: {
    origins: false,
  },
};

export default config;
