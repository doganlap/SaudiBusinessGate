# 🎨 Theme System Quick Reference

## 🚀 Quick Start

### Import Theme Hook

```typescript
import { useTheme } from '@/lib/theme/ThemeContext';
```

### Basic Usage

```typescript
const { theme, mode, isDark, toggleMode } = useTheme();
```

## 📋 Available Hooks

### `useTheme()`

```typescript
const {
  theme,           // Current theme config
  mode,            // 'light' | 'dark' | 'auto'
  glassIntensity,  // 'subtle' | 'medium' | 'strong'
  setMode,         // Change theme mode
  setGlassIntensity, // Change glass intensity
  toggleMode,      // Toggle light/dark
  isDark,          // boolean
  isLight,         // boolean
} = useTheme();
```

### `useGlassmorphism(intensity?)`

```typescript
const glass = useGlassmorphism('medium');
// Returns: { className, style, intensity }

<div className={glass.className} style={glass.style}>
  Glass card content
</div>
```

## 🎨 Theme Colors

### Accessing Colors

```typescript
const { theme } = useTheme();

// Use in styles
<div style={{
  background: theme.colors.background,
  color: theme.colors.text.primary
}} />

// Available colors:
theme.colors.primary      // #10b981
theme.colors.secondary    // #06b6d4
theme.colors.accent       // #8b5cf6
theme.colors.success      // #10b981
theme.colors.warning      // #f59e0b
theme.colors.error        // #ef4444
theme.colors.background   // Dynamic
theme.colors.surface      // Dynamic
theme.colors.text.primary // Dynamic
theme.colors.text.secondary // Dynamic
```

## 🔲 Glassmorphism

### Tailwind Classes

```typescript
// Medium intensity (default)
className="backdrop-blur-xl border rounded-xl"

// With colors
className="backdrop-blur-xl border border-white/20
  bg-white/15 dark:bg-neutral-900/50 rounded-xl
  shadow-2xl ring-1 ring-white/20"
```

### CSS-in-JS

```typescript
import { generateGlassmorphismStyles } from '@/lib/theme/theme-config';

const styles = generateGlassmorphismStyles('medium', theme);
// Returns object with background, backdropFilter, border, etc.
```

## 🎛️ Theme Control

### Switch Modes

```typescript
const { setMode, toggleMode } = useTheme();

// Set specific mode
setMode('light');   // Light mode
setMode('dark');    // Dark mode
setMode('auto');    // Follow system

// Or toggle
toggleMode();  // Switch between light/dark
```

### Change Glass Intensity

```typescript
const { setGlassIntensity } = useTheme();

setGlassIntensity('subtle');   // Minimal glass
setGlassIntensity('medium');   // Balanced (default)
setGlassIntensity('strong');   // Maximum glass
```

## 🧩 Component Examples

### Glass Card

```typescript
import { useGlassmorphism } from '@/lib/theme/ThemeContext';

export function GlassCard({ children }) {
  const glass = useGlassmorphism('medium');

  return (
    <div className={glass.className} style={glass.style}>
      {children}
    </div>
  );
}
```

### Theme-Aware Button

```typescript
import { useTheme } from '@/lib/theme/ThemeContext';

export function ThemedButton() {
  const { theme, isDark } = useTheme();

  return (
    <button style={{
      background: theme.colors.primary,
      color: '#fff',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    }}>
      Click me
    </button>
  );
}
```

### Theme Toggle Button

```typescript
import { useTheme } from '@/lib/theme/ThemeContext';
import { SunMedium, MoonStar } from 'lucide-react';

export function ThemeToggle() {
  const { toggleMode, isDark } = useTheme();

  return (
    <button onClick={toggleMode}>
      {isDark ? <SunMedium /> : <MoonStar />}
    </button>
  );
}
```

## 📐 Spacing & Borders

### Spacing

```typescript
theme.spacing.xs  // 0.25rem
theme.spacing.sm  // 0.5rem
theme.spacing.md  // 1rem (default)
theme.spacing.lg  // 1.5rem
theme.spacing.xl  // 2rem
```

### Border Radius

```typescript
theme.borderRadius.sm    // 0.375rem
theme.borderRadius.md    // 0.5rem
theme.borderRadius.lg    // 0.75rem
theme.borderRadius.xl    // 1rem (default)
theme.borderRadius.full  // 9999px
```

### Transitions

```typescript
theme.transitions.fast    // 150ms
theme.transitions.normal  // 200ms (default)
theme.transitions.slow    // 300ms
```

## 🎨 Glassmorphism Presets

### Light Mode

**Subtle**

```css
background: rgba(255, 255, 255, 0.7)
blur: 12px
border: rgba(255, 255, 255, 0.3)
shadow: 0 4px 16px rgba(0, 0, 0, 0.08)
```

**Medium** (Default)

```css
background: linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))
blur: 24px
border: rgba(255, 255, 255, 0.25)
shadow: 0 8px 32px rgba(0, 0, 0, 0.12)
```

**Strong**

```css
background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))
blur: 40px
border: rgba(255, 255, 255, 0.3)
shadow: 0 12px 48px rgba(0, 0, 0, 0.15)
```

### Dark Mode

**Subtle**

```css
background: rgba(23, 23, 23, 0.6)
blur: 12px
border: rgba(255, 255, 255, 0.1)
shadow: 0 4px 16px rgba(0, 0, 0, 0.4)
```

**Medium** (Default)

```css
background: linear-gradient(rgba(38, 38, 38, 0.5), rgba(23, 23, 23, 0.4))
blur: 24px
border: rgba(255, 255, 255, 0.15)
shadow: 0 8px 32px rgba(0, 0, 0, 0.5)
```

**Strong**

```css
background: linear-gradient(rgba(55, 65, 81, 0.5), rgba(31, 41, 55, 0.3))
blur: 40px
border: rgba(255, 255, 255, 0.2)
shadow: 0 12px 48px rgba(0, 0, 0, 0.6)
```

## 🔧 CSS Variables

The theme system injects these CSS variables:

```css
--color-primary
--color-secondary
--color-accent
--color-background
--color-surface
--color-text-primary
--color-text-secondary
--color-border
```

### Using CSS Variables

```css
.my-component {
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
```

## 💾 Persistence

Theme preferences are automatically saved to localStorage:

- `theme-mode`: 'light' | 'dark' | 'auto'
- `glass-intensity`: 'subtle' | 'medium' | 'strong'

No manual storage management needed!

## 🎯 Common Patterns

### Glass Container

```tsx
<div className="backdrop-blur-xl border border-white/20
  bg-white/15 dark:bg-neutral-900/50 rounded-2xl
  shadow-2xl ring-1 ring-white/20 p-6">
  Content
</div>
```

### Hover Effect

```tsx
<div className="hover:bg-white/20 dark:hover:bg-white/10
  transition-all duration-200">
  Hoverable content
</div>
```

### Active State

```tsx
<div className={`
  ${isActive
    ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
    : 'hover:bg-white/10'
  }
`}>
  Active indicator
</div>
```

---

**Quick, easy, powerful!** 🚀
