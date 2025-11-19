# 🎨 Glassmorphism - Quick Reference

## Import

```typescript
import { 
  GlassBackground, 
  GlassContainer, 
  GlassInput, 
  GlassButton 
} from '@/components/ui/glass-container';
```

## Basic Template

```typescript
<GlassBackground dir="rtl"> {/* or "ltr" */}
  <div className="w-full max-w-md">
    <GlassContainer padding="lg">
      {/* Your content */}
    </GlassContainer>
  </div>
</GlassBackground>
```

## Components

### GlassBackground
```typescript
<GlassBackground dir="rtl" className="optional-class">
  {children}
</GlassBackground>
```

### GlassContainer
```typescript
<GlassContainer padding="sm|md|lg">
  {children}
</GlassContainer>
```

### GlassInput
```typescript
<GlassInput
  type="text"
  icon={<Icon />}
  iconPosition="left|right"
  isArabic={true|false}
  placeholder="..."
/>
```

### GlassButton
```typescript
<GlassButton variant="primary|secondary|success">
  Button Text
</GlassButton>
```

## Examples

### Simple Form
```typescript
<GlassBackground>
  <GlassContainer>
    <GlassInput icon={<Mail />} placeholder="Email" />
    <GlassButton variant="primary">Submit</GlassButton>
  </GlassContainer>
</GlassBackground>
```

### With Arabic/RTL
```typescript
<GlassBackground dir="rtl">
  <GlassInput 
    icon={<Mail />} 
    iconPosition="right"
    isArabic={true}
    placeholder="البريد"
  />
</GlassBackground>
```

## Text Colors
- `text-white` - Main text
- `text-white/90` - Secondary text
- `text-white/80` - Tertiary text

## See Full Guide
📖 `GLASSMORPHISM_USAGE_GUIDE.md` for complete documentation

