# RTL Testing Guide

This document provides instructions for testing RTL (Right-to-Left) support in the DoganHubStore application.

---

## Testing RTL in Arabic

### 1. Access Arabic Version

**Local Development**:
- Navigate to: `http://localhost:3050/ar`
- Or click language switcher and select "العربية"

**Staging**:
- Navigate to: `https://doganhub-staging.azurecontainerapps.io/ar`

**Production**:
- Navigate to: `https://doganhub.azurecontainerapps.io/ar`

---

## 2. Visual Checks

### Layout Direction
- [ ] Page layout flips to right-to-left
- [ ] `<html>` element has `dir="rtl"` attribute
- [ ] `<html>` element has `lang="ar"` attribute
- [ ] Body has `rtl` class applied

### Typography
- [ ] Headings align to the right
- [ ] Paragraphs align to the right
- [ ] Text flows from right to left

### Navigation
- [ ] Navigation menu items align right
- [ ] Dropdowns open from right
- [ ] Breadcrumbs flow right-to-left
- [ ] Pagination controls flip direction

### Forms
- [ ] Input fields align right
- [ ] Labels align right
- [ ] Placeholders align right
- [ ] Checkboxes/radio buttons on right side
- [ ] Error messages align right
- [ ] Submit buttons in correct position

### Icons
- [ ] Arrow icons flip horizontally (← becomes →)
- [ ] Chevron icons flip horizontally
- [ ] Directional icons flip correctly
- [ ] Non-directional icons don't flip (up/down arrows, etc.)

### Tables
- [ ] Table headers align right
- [ ] Table cells align right
- [ ] Table flows right-to-left

### Sidebars
- [ ] Left sidebars move to right
- [ ] Right sidebars move to left
- [ ] Sidebar borders on correct side

### Buttons
- [ ] Button groups flow right-to-left
- [ ] Icon buttons have correct spacing
- [ ] Button icons flip if directional

### Cards
- [ ] Card content aligns right
- [ ] Card headers align right
- [ ] Card actions align correctly

### Modals & Dialogs
- [ ] Modal content aligns right
- [ ] Close button on correct side
- [ ] Modal actions align correctly

---

## 3. Functional Testing

### Language Switching
1. Start on English page: `http://localhost:3050/en`
2. Click language switcher
3. Select "العربية"
4. Verify URL changes to `/ar`
5. Verify layout flips to RTL
6. Verify content translates to Arabic

### Form Submission
1. Navigate to registration form in Arabic
2. Fill out form fields
3. Verify input direction is RTL
4. Submit form
5. Verify validation messages in Arabic and RTL

### Data Display
1. Navigate to dashboard in Arabic
2. Verify numbers display correctly (e.g., 1,234.56)
3. Verify dates display in Arabic format
4. Verify currency displays correctly (SAR)
5. Verify mixed content (Arabic text + numbers) displays properly

### Navigation Flow
1. Navigate through multiple pages in Arabic
2. Use breadcrumbs to navigate back
3. Use sidebar navigation
4. Verify all navigation works correctly in RTL

---

## 4. Browser Testing

Test in multiple browsers:

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest, macOS only)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet (Android)

---

## 5. Responsive Testing

Test RTL at different viewport sizes:

### Desktop
- [ ] 1920x1080 (Full HD)
- [ ] 1366x768 (Laptop)
- [ ] 1280x720 (HD)

### Tablet
- [ ] 768x1024 (iPad portrait)
- [ ] 1024x768 (iPad landscape)

### Mobile
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12)
- [ ] 412x915 (Android)

---

## 6. Component Testing

### Test Individual Components

Create a test page: `app/[lng]/test-rtl/page.tsx`

```typescript
import RTLExample from '@/components/examples/RTLExample';

export default function TestRTLPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl mb-8">RTL Component Testing</h1>
      <RTLExample />
    </div>
  );
}
```

Navigate to: `http://localhost:3050/ar/test-rtl`

Verify all components in RTLExample render correctly.

---

## 7. Developer Tools Inspection

### Chrome DevTools

1. Open DevTools (F12)
2. Navigate to Elements tab
3. Inspect `<html>` element
4. Verify attributes:
   ```html
   <html dir="rtl" lang="ar">
   ```
5. Inspect body element
6. Verify classes include `rtl`
7. Check computed styles for RTL-specific CSS

### Check CSS

1. In DevTools, go to Elements → Styles
2. Verify RTL styles are applied:
   - `direction: rtl`
   - `text-align: right`
   - Margin/padding use logical properties
3. Check for CSS variables if used

---

## 8. Accessibility Testing

### Screen Reader Testing

Test with screen readers in RTL mode:

**NVDA (Windows)**:
1. Start NVDA
2. Navigate to Arabic page
3. Verify content reads right-to-left
4. Verify language detection works

**JAWS (Windows)**:
1. Start JAWS
2. Navigate to Arabic page
3. Verify RTL navigation

**VoiceOver (macOS/iOS)**:
1. Enable VoiceOver
2. Navigate to Arabic page
3. Verify RTL support

### Keyboard Navigation

1. Use Tab key to navigate
2. Verify focus order is right-to-left
3. Verify focus indicators visible
4. Test all interactive elements

---

## 9. Performance Testing

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit on Arabic page: `http://localhost:3050/ar`
4. Verify scores:
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

### Bundle Size

Check if RTL support increases bundle size:

```bash
npm run build
```

Compare bundle sizes:
- English pages
- Arabic pages

Verify minimal impact (<5% increase).

---

## 10. Edge Cases

### Mixed Content

Test pages with mixed content:

- [ ] Arabic text + English text
- [ ] Arabic text + numbers
- [ ] Arabic text + URLs
- [ ] Arabic text + email addresses
- [ ] Arabic text + code blocks

**Expected behavior**:
- Arabic text flows RTL
- English text embeds LTR within RTL context
- Numbers display LTR
- URLs/emails display LTR
- Code blocks stay LTR

### Dynamic Content

1. Load page with dynamic content (API calls)
2. Verify loaded content respects RTL
3. Test loading states in RTL
4. Test error states in RTL

### User-Generated Content

1. Test content with user input
2. Verify user-submitted Arabic text displays correctly
3. Test comments in RTL
4. Test rich text editor in RTL

---

## 11. Automated Testing

### Create RTL Tests

`tests/rtl.test.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('RTL Support', () => {
  test('should render Arabic page in RTL', async ({ page }) => {
    await page.goto('http://localhost:3050/ar');
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('should flip layout direction', async ({ page }) => {
    await page.goto('http://localhost:3050/ar');
    
    const body = page.locator('body');
    await expect(body).toHaveClass(/rtl/);
  });

  test('should format numbers in Arabic locale', async ({ page }) => {
    await page.goto('http://localhost:3050/ar');
    
    // Check if numbers are formatted with Arabic separators
    const price = page.locator('[data-testid="price"]');
    await expect(price).toContainText('١٬٢٣٤٫٥٦'); // or Western numerals based on config
  });
});
```

Run tests:
```bash
npx playwright test tests/rtl.test.ts
```

---

## 12. Common Issues & Fixes

### Issue: Layout doesn't flip

**Check**:
1. Verify `dir="rtl"` on `<html>` element
2. Verify `rtl.css` is imported
3. Check for conflicting CSS

**Fix**:
```typescript
// Ensure RTLProvider wraps app
<RTLProvider>
  <App />
</RTLProvider>
```

### Issue: Icons don't flip

**Check**:
1. Verify icon has `icon-flip-rtl` class or uses CSS transform

**Fix**:
```typescript
const { tw } = useRTL();
<Icon className={tw.iconFlip} />
```

### Issue: Numbers display incorrectly

**Check**:
1. Verify using `formatters.number()` from useRTL

**Fix**:
```typescript
const { formatters } = useRTL();
<span>{formatters.number(1234.56)}</span>
```

### Issue: Form inputs don't align right

**Check**:
1. Verify `dir` attribute on input
2. Verify CSS includes RTL input styles

**Fix**:
```typescript
const { direction } = useRTL();
<input dir={direction} />
```

---

## 13. Testing Checklist

### Before Release
- [ ] All pages tested in Arabic
- [ ] All forms tested in RTL
- [ ] All components tested with RTL utilities
- [ ] Browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing complete (iOS, Android)
- [ ] Accessibility testing complete (screen readers, keyboard)
- [ ] Performance testing complete (Lighthouse score 90+)
- [ ] Automated tests passing
- [ ] No console errors in RTL mode
- [ ] No visual bugs or layout breaks
- [ ] Mixed content displays correctly
- [ ] User feedback collected and addressed

### Post-Release Monitoring
- [ ] Monitor error rates for `/ar` routes
- [ ] Track user engagement on Arabic pages
- [ ] Collect user feedback on RTL experience
- [ ] Monitor performance metrics
- [ ] Check for browser-specific issues

---

## 14. Resources

### Testing Tools
- **Chrome DevTools**: Browser inspection and debugging
- **Lighthouse**: Performance and accessibility audits
- **Playwright**: Automated browser testing
- **BrowserStack**: Cross-browser testing
- **Screen Readers**: NVDA, JAWS, VoiceOver

### Documentation
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [MDN RTL Guidelines](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Handling_different_text_directions)
- [W3C i18n](https://www.w3.org/International/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

---

**Last Updated**: November 12, 2025
**Document Version**: 1.0
