# HelloFresh Enterprise Design System Integration

## Overview

The HelloFresh Enterprise Design System tokens have been integrated into `app/globals.css`. All 140+ color tokens were extracted directly from Figma using the Variables API to ensure accuracy.

## Quick Reference - Most Common Tokens

| Category | Token | Hex | Use Case |
|----------|-------|-----|----------|
| **Primary Green** | `--hf-foreground-positive-positive-dark` | #067a46 | Primary actions, success text |
| **Primary Green Bg** | `--hf-background-light-positive-positive-mid` | #e4fabf | Success alerts, subtle backgrounds |
| **Error Red** | `--hf-foreground-negative-negative-dark` | #b30000 | Error text, destructive actions |
| **Error Bg** | `--hf-background-light-negative-negative-light` | #ffeae9 | Error alerts background |
| **Warning Orange** | `--hf-foreground-warning-warning-mid` | #ef670a | Warning text, caution indicators |
| **Warning Bg** | `--hf-background-warning-warning-light` | #ffecd3 | Warning alerts background |
| **Info Blue** | `--hf-foreground-information-information-dark` | #001db2 | Info text, links |
| **Info Bg** | `--hf-background-information-information-light` | #e9faff | Info alerts background |
| **Text Dark** | `--hf-foreground-dark-neutral-neutral-dark` | #242424 | Primary body text |
| **Text Light** | `--hf-foreground-light-neutral-neutral-light` | #ffffff | Text on dark backgrounds |
| **Border** | `--hf-stroke-neutral-neutral-mid` | #e4e4e4 | Default borders |
| **Background** | `--hf-background-light-neutral-neutral-mid` | #f8f8f8 | Page background |

## Token Structure

### HelloFresh Tokens (Prefixed with `--hf-`)

All HelloFresh design tokens are prefixed with `--hf-` to distinguish them from other design systems.

Complete token library with 140+ color tokens organized by category:

#### Background Tokens

**Complimentary Colors:**
- Brown: `--hf-background-complimentary-brown-{dark|mid|light}` (#75451a, #f2db9c, #f5e4b5)
- Mint: `--hf-background-complimentary-mint-{dark|mid|light}` (#09766a, #a5eed4, #cbf5e6)
- Pink: `--hf-background-complimentary-pink-{dark|mid|light}` (#841484, #f4b1d2, #efd1e0)

**Dark Shades:**
- Positive: `--hf-background-dark-positive-positive-{darker|dark|mid|light}` (#035624, #056835, #067a46, #00a846)
- Negative: `--hf-background-dark-negative-negative-{dark|mid|light}` (#7c0000, #970000, #b30000)
- Neutral: `--hf-background-dark-neutral-neutral-{darker|dark|mid|light}` (#242424, #4b4b4b, #676767, #bbb)

**Light Shades:**
- Positive: `--hf-background-light-positive-positive-{darker|dark|mid|light}` (#96dc14, #d2f895, #e4fabf, #f6fde9)
- Negative: `--hf-background-light-negative-negative-{dark|mid|light}` (#fcad9a, #ffccca, #ffeae9)
- Neutral: `--hf-background-light-neutral-neutral-{darker|dark|mid}` (#e4e4e4, #eee, #f8f8f8)

**Status Colors:**
- Information: `--hf-background-information-information-{dark|mid|light}` (#92eaff, #d3f6ff, #e9faff)
- Warning: `--hf-background-warning-warning-{dark|mid|light}` (#ffbf74, #ffdbac, #ffecd3)
- Reward: `--hf-background-reward-reward-{dark|mid|light}` (#fff583, #fffab2, #fffcd3)

#### Foreground Tokens

**Complimentary Colors:**
- Brown: `--hf-foreground-complimentary-brown-{dark|mid|light}` (#5d3714, #bc8b42, #f2db9c)
- Mint: `--hf-foreground-complimentary-mint-{dark|mid|light}` (#09766a, #0ec87b, #a5eed4)
- Pink: `--hf-foreground-complimentary-pink-{dark|mid|light}` (#691069, #c6278c, #f4b1d2)

**Neutral Shades:**
- Dark: `--hf-foreground-dark-neutral-neutral-{dark|mid|light|lighter}` (#242424, #4b4b4b, #676767, #bbb)
- Light: `--hf-foreground-light-neutral-neutral-{dark|mid|light}` (#eee, #f8f8f8, #ffffff)

**Status Colors:**
- Positive: `--hf-foreground-positive-positive-{dark|light}` (#067a46, #d2f895)
- Negative: `--hf-foreground-negative-negative-{dark|mid|light}` (#b30000, #db1d1d, #fcad9a)
- Information: `--hf-foreground-information-information-{dark|mid|light}` (#001db2, #002aff, #92eaff)
- Warning: `--hf-foreground-warning-warning-{dark|mid|light}` (#ce4500, #ef670a, #ffbf74)
- Reward: `--hf-foreground-reward-reward-{dark|mid|light}` (#c6ae00, #e2c700, #fff583)

#### Stroke (Border) Tokens

**Complimentary Colors:**
- Brown: `--hf-stroke-complimentary-brown-{dark|mid|light}` (#5d3714, #bc8b42, #f2db9c)
- Mint: `--hf-stroke-complimentary-mint-{dark|mid|light}` (#006060, #0ec87b, #a5eed4)
- Pink: `--hf-stroke-complimentary-pink-{dark|mid|light}` (#691069, #c6278c, #f4b1d2)

**Neutral:**
- `--hf-stroke-neutral-neutral-{darker|dark|mid|light}` (#4b4b4b, #bbb, #e4e4e4, #eee)

**Status Colors:**
- Positive: `--hf-stroke-positive-positive-{dark|mid|light|lighter}` (#056835, #067a46, #00a846, #d2f895)
- Negative: `--hf-stroke-negative-negative-{dark|mid|light}` (#970000, #b30000, #db1d1d)
- Information: `--hf-stroke-information-information-{dark|mid|light}` (#001db2, #002aff, #92eaff)
- Warning: `--hf-stroke-warning-warning-{dark|mid|light}` (#ce4500, #ef670a, #ffbf74)
- Reward: `--hf-stroke-reward-reward-{dark|mid|light}` (#c6ae00, #e2c700, #fff583)

#### Status/Alert Colors (from Figma Alert Component)

- **Error/Blocking (Negative)**:
  - Background: `#ffeae9` (background/light-negative/negative-light)
  - Text/Icon/Border: `#b30000` (stroke/negative/negative-mid)
  - Dark Background: `#7C0000` (for badges on dark backgrounds)

- **Warning**:
  - Background: `#ffecd3` (background/warning/warning-light)
  - Text/Icon/Border: `#ef670a` (stroke/warning/warning-mid)

- **Informational**:
  - Background: `#e9faff` (background/information/information-light)
  - Text/Icon/Border: `#001db2` (stroke/information/information-dark)

- **Success (Positive)**:
  - Background: `#f6fde9` (background/light-positive/positive-light)
  - Border: `#067a46` (stroke/positive/positive-mid)
  - Or use existing HelloFresh tokens:
    - Background: `--hf-background-light-positive-positive-mid` (#e4fabf)
    - Text: `--hf-foreground-positive-positive-dark` (#067a46)
    - Border: `--hf-stroke-positive-positive-lighter` (#d2f895)

#### Other
- `--hf-radius`: 4px (Standard border radius)

## Typography Tokens

### Font Families

HelloFresh uses two primary typefaces:

- **Headlines**: `--hf-font-headline` → Agrandir Digital (Medium weight, 500)
- **Body Text**: `--hf-font-body` → Source Sans Pro (Regular 400, SemiBold 600, Bold 700)

**⚠️ Font Loading Status:**

✅ **Source Sans Pro** - Loaded via Google Fonts using `Source_Sans_3` (Source Sans 3 is the updated version of Source Sans Pro)
- Weights: 400 (Regular), 600 (SemiBold), 700 (Bold)
- Configured in `app/layout.tsx`

⚠️ **Agrandir Digital** - Not yet loaded
- This is a custom/commercial font that requires font files
- Currently using Source Sans Pro as fallback for headlines
- To add: Place font files in `/public/fonts/` and configure in `app/layout.tsx`

**Current Implementation:**
```tsx
// app/layout.tsx
import { Source_Sans_3 } from 'next/font/google'

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--hf-font-body',
  display: 'swap',
})
```

**Font Fallback Chain:**
- Headlines: `'Agrandir Digital', 'Source Sans Pro', system-ui, -apple-system, sans-serif`
- Body: `'Source Sans Pro', system-ui, -apple-system, sans-serif`

### Font Weights

- `--hf-font-weight-regular`: 400
- `--hf-font-weight-medium`: 500 (Headlines only)
- `--hf-font-weight-semibold`: 600
- `--hf-font-weight-bold`: 700

### Desktop Headlines (Agrandir Digital, Medium 500)

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `--hf-headline-desktop-grandiose` | 56px | 72px | Hero headlines, primary landing sections |
| `--hf-headline-desktop-h1` | 48px | 60px | Page titles, major section headers |
| `--hf-headline-desktop-h2` | 32px | 40px | Section headings, card headers |
| `--hf-headline-desktop-h3` | 24px | 32px | Subsection titles, component headers |
| `--hf-headline-desktop-h4` | 20px | 28px | Small section headers, card titles |
| `--hf-headline-desktop-h5` | 16px | 20px | Minor headings, list headers |

**Usage Example:**
```tsx
<h1 style={{
  fontFamily: 'var(--hf-font-headline)',
  fontSize: 'var(--hf-headline-desktop-h1-size)',
  lineHeight: 'var(--hf-headline-desktop-h1-line)',
  fontWeight: 'var(--hf-font-weight-medium)',
}}>
  Page Title
</h1>
```

### Mobile & Tablet Headlines (Agrandir Digital, Medium 500)

| Token | Size | Line Height | Difference from Desktop |
|-------|------|-------------|-------------------------|
| `--hf-headline-mobile-grandiose` | 48px | 60px | -8px (from 56px) |
| `--hf-headline-mobile-h1` | 32px | 40px | -16px (from 48px) |
| `--hf-headline-mobile-h2` | 24px | 32px | -8px (from 32px) |
| `--hf-headline-mobile-h3` | 20px | 28px | -4px (from 24px) |
| `--hf-headline-mobile-h4` | 16px | 20px | -4px (from 20px) |

**Responsive Usage:**
```tsx
<h1 className="text-[var(--hf-headline-mobile-h1-size)] md:text-[var(--hf-headline-desktop-h1-size)]"
    style={{
      fontFamily: 'var(--hf-font-headline)',
      fontWeight: 'var(--hf-font-weight-medium)',
    }}>
  Responsive Title
</h1>
```

### Body Typography (Source Sans Pro)

All body text uses Source Sans Pro with three weight variations:

#### Extra Large (24px / 32px)
- **Regular** (400): Long-form content, descriptions
- **SemiBold** (600): Emphasized body text, subheadings
- **Bold** (700): Strong emphasis, important callouts

```tsx
// Tokens
--hf-body-extra-large-size: 24px
--hf-body-extra-large-line: 32px
```

#### Large (20px / 28px)
- **Regular** (400): Standard body text, paragraphs
- **SemiBold** (600): Highlighted information, labels
- **Bold** (700): Strong emphasis within content

```tsx
// Tokens
--hf-body-large-size: 20px
--hf-body-large-line: 28px
```

#### Medium (16px / 24px) - **Most Common**
- **Regular** (400): Default body text, descriptions
- **SemiBold** (600): Labels, button text, form labels
- **Bold** (700): Important information, emphasized text

```tsx
// Tokens
--hf-body-medium-size: 16px
--hf-body-medium-line: 24px
```

#### Small (14px / 20px)
- **Regular** (400): Secondary information, captions
- **SemiBold** (600): Small buttons, tags, chips
- **Bold** (700): Small emphasized text, badges

```tsx
// Tokens
--hf-body-small-size: 14px
--hf-body-small-line: 20px
```

#### Extra Small (12px / 16px)
- **Regular** (400): Fine print, timestamps, metadata
- **SemiBold** (600): Small labels, helper text
- **Bold** (700): Small emphasized labels

```tsx
// Tokens
--hf-body-extra-small-size: 12px
--hf-body-extra-small-line: 16px
```

### Typography Usage Examples

**Combining Typography with Color Tokens:**
```tsx
// Page heading with brand colors
<h1 style={{
  fontFamily: 'var(--hf-font-headline)',
  fontSize: 'var(--hf-headline-desktop-h1-size)',
  lineHeight: 'var(--hf-headline-desktop-h1-line)',
  fontWeight: 'var(--hf-font-weight-medium)',
  color: 'var(--hf-foreground-dark-neutral-neutral-dark)', // #242424
}}>
  Welcome to HelloFresh
</h1>

// Body paragraph
<p style={{
  fontFamily: 'var(--hf-font-body)',
  fontSize: 'var(--hf-body-medium-size)',
  lineHeight: 'var(--hf-body-medium-line)',
  fontWeight: 'var(--hf-font-weight-regular)',
  color: 'var(--hf-foreground-dark-neutral-neutral-dark)',
}}>
  Your description text here.
</p>

// Emphasized label
<span style={{
  fontFamily: 'var(--hf-font-body)',
  fontSize: 'var(--hf-body-small-size)',
  lineHeight: 'var(--hf-body-small-line)',
  fontWeight: 'var(--hf-font-weight-semibold)',
  color: 'var(--hf-foreground-positive-positive-dark)', // #067a46
}}>
  Success Label
</span>

// Badge text
<span style={{
  fontFamily: 'var(--hf-font-body)',
  fontSize: 'var(--hf-body-extra-small-size)',
  lineHeight: 'var(--hf-body-extra-small-line)',
  fontWeight: 'var(--hf-font-weight-bold)',
}}>
  NEW
</span>
```

### Typography Scale Quick Reference

| Size | Desktop Use | Mobile Use | Weight Options |
|------|-------------|------------|----------------|
| 56px | Grandiose headline | - | Medium (500) |
| 48px | H1 | Grandiose | Medium (500) |
| 32px | H2 | H1 | Medium (500) |
| 24px | H3, Body XL | H2, Body XL | Medium (500), Regular/Semi/Bold (400/600/700) |
| 20px | H4, Body L | H3, Body L | Medium (500), Regular/Semi/Bold (400/600/700) |
| 16px | H5, Body M | H4, Body M | Medium (500), Regular/Semi/Bold (400/600/700) |
| 14px | Body S | Body S | Regular/Semi/Bold (400/600/700) |
| 12px | Body XS | Body XS | Regular/Semi/Bold (400/600/700) |

### Letter Spacing

All HelloFresh typography uses **0 letter spacing** by default:
```css
--hf-letter-spacing: 0;
letter-spacing: var(--hf-letter-spacing);
```

## Mapped to Shadcn/UI

The HelloFresh tokens are mapped to your existing shadcn/ui theme variables:

### Light Mode
- `--primary`: Uses HelloFresh positive green (#067a46)
- `--accent`: Uses HelloFresh accent green (#d2f895)
- `--destructive`: Uses HelloFresh error red (#b30000)
- `--radius`: Uses HelloFresh radius (4px)
- `--foreground`: Uses HelloFresh dark neutral (#242424)

### Dark Mode
- `--background`: Uses HelloFresh dark neutral darker (#242424)
- `--primary`: Uses HelloFresh positive mid (#067a46)
- `--destructive`: Uses HelloFresh negative mid (#970000)
- All text colors use HelloFresh white (#ffffff)

## Usage

### Using HelloFresh Tokens Directly

```tsx
// Semantic color usage with CSS variables
<div className="bg-[var(--hf-background-light-positive-positive-mid)]">
  <p className="text-[var(--hf-foreground-positive-positive-dark)]">
    Success message with green background
  </p>
</div>

// Status-based styling
<div
  style={{
    backgroundColor: 'var(--hf-background-warning-warning-light)',
    borderColor: 'var(--hf-stroke-warning-warning-mid)',
    color: 'var(--hf-foreground-warning-warning-mid)',
  }}
>
  Warning alert
</div>
```

### Using Mapped Shadcn/UI Tokens

```tsx
// Use existing shadcn/ui utility classes - they now use HelloFresh colors
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<div className="bg-accent text-accent-foreground">Accent Section</div>
```

### Token Selection Guide

**When to use Light vs Dark variants:**
- **Light backgrounds** (`background-light-*`): Use for surfaces, cards, alerts, badges
- **Dark backgrounds** (`background-dark-*`): Use for buttons, active states, headers
- **Light foreground** (`foreground-light-*`): Text on dark backgrounds
- **Dark foreground** (`foreground-dark-*`): Text on light backgrounds

**Intensity levels (darker → dark → mid → light):**
- **Darker/Dark**: Primary actions, high emphasis elements
- **Mid**: Standard interactive elements, borders
- **Light**: Subtle backgrounds, hover states, disabled states

**Example - Button states:**
```tsx
// Primary button
<button style={{
  backgroundColor: 'var(--hf-background-dark-positive-positive-mid)', // #067a46
  color: 'var(--hf-foreground-light-neutral-neutral-light)', // #ffffff
}}>
  Click me
</button>

// Hover state
<button style={{
  backgroundColor: 'var(--hf-background-dark-positive-positive-dark)', // #056835
}}>
  Click me
</button>

// Disabled state
<button style={{
  backgroundColor: 'var(--hf-background-light-positive-positive-mid)', // #e4fabf
  color: 'var(--hf-foreground-positive-positive-dark)', // #067a46
}}>
  Disabled
</button>
```

**Example - Status indicators:**
```tsx
// Error state
<div style={{
  backgroundColor: 'var(--hf-background-light-negative-negative-light)', // #ffeae9
  borderColor: 'var(--hf-stroke-negative-negative-mid)', // #b30000
  color: 'var(--hf-foreground-negative-negative-dark)', // #b30000
}}>
  Error message
</div>

// Warning state
<div style={{
  backgroundColor: 'var(--hf-background-warning-warning-light)', // #ffecd3
  borderColor: 'var(--hf-stroke-warning-warning-mid)', // #ef670a
  color: 'var(--hf-foreground-warning-warning-mid)', // #ef670a
}}>
  Warning message
</div>

// Info state
<div style={{
  backgroundColor: 'var(--hf-background-information-information-light)', // #e9faff
  borderColor: 'var(--hf-stroke-information-information-dark)', // #001db2
  color: 'var(--hf-foreground-information-information-dark)', // #001db2
}}>
  Info message
</div>
```

### Alert Component Pattern

Alerts follow the HelloFresh design system with these specifications:

#### Alert Container
```tsx
<div
  className="flex items-start gap-3 rounded-lg border"
  style={{
    padding: '12px',              // token: spacing-3
    backgroundColor: '#FEE2E2',   // token: color-status-error-subtle
    borderColor: '#FCA5A5',       // token: color-status-error-border
    borderRadius: '6px',          // token: border-radius-md
  }}
>
```

#### Alert Icon
```tsx
<AlertCircle
  className="shrink-0"
  style={{
    width: '16px',
    height: '16px',
    marginTop: '2px',
    color: '#DC2626',             // token: color-status-error-icon
  }}
/>
```

#### Alert Title
```tsx
<span
  className="font-semibold"
  style={{
    fontSize: '14px',             // token: font-size-body-md
    color: '#B30000',             // token: color-status-error-text
  }}
>
  Alert Title
</span>
```

#### Alert Badges
```tsx
// Week badge (neutral)
<Badge
  variant="outline"
  className="font-medium"
  style={{
    fontSize: '12px',             // token: font-size-label-sm
    borderRadius: '4px',          // token: border-radius-sm
    padding: '2px 8px',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    color: '#374151',
  }}
>
  HFW12
</Badge>

// Impact badge (contextual)
<Badge
  variant="outline"
  className="font-semibold"
  style={{
    fontSize: '12px',
    borderRadius: '4px',
    padding: '2px 8px',
    backgroundColor: '#FEE2E2',   // Matches alert background
    borderColor: '#FCA5A5',       // Matches alert border
    color: '#B30000',             // Matches alert text
  }}
>
  1,800 boxes at risk
</Badge>
```

#### Alert Description
```tsx
<p
  className="mt-1"
  style={{
    fontSize: '13px',             // token: font-size-body-sm
    color: '#6B7280',             // token: color-text-subtle
  }}
>
  Alert description text
</p>
```

#### Alert Action Link
```tsx
<Button
  variant="link"
  size="sm"
  className="h-auto p-0 mt-1 font-semibold"
  style={{
    fontSize: '13px',             // token: font-size-body-sm
    color: '#B30000',             // token: color-status-error-text
  }}
>
  Investigate <ChevronRight className="h-3 w-3 ml-0.5" />
</Button>
```

## Code Connect

25 button-desktop component variants have been mapped to your `components/ui/button.tsx` file using Figma Code Connect. Designers working in Figma will now see your React Button component linked to the design.

## Source Files

- Design tokens exported from Figma: `/Users/chelsi.teo/Desktop/design-tokens.tokens.json`
- Integration script: `scripts/integrate-figma-tokens.mjs`
- Updated CSS: `app/globals.css`

### Filter Pill Buttons

Status filter pills use semantic feedback colors with consistent structure:

#### Pill Structure
```tsx
<button
  className="inline-flex items-center gap-2 font-medium transition-all"
  style={{
    padding: '4px 12px',           // token: spacing-1 spacing-3
    borderRadius: '16px',          // token: border-radius-pill
    fontSize: '13px',              // token: font-size-body-sm
    border: '1px solid',
  }}
>
  {/* Status dot - 8px circle */}
  <span
    className="inline-block rounded-full"
    style={{ width: '8px', height: '8px' }}
  />

  {/* Label text */}
  All

  {/* Count badge */}
  <span
    className="inline-flex items-center justify-center font-semibold"
    style={{
      padding: '2px 6px',          // token: spacing-1
      borderRadius: '4px',         // token: border-radius-sm
      fontSize: '11px',            // token: font-size-label-xs
    }}
  >
    24
  </span>
</button>
```

#### Active States

**All (Primary):**
- Border: `#067a46` (color-interactive-primary)
- Background: `#e4fabf` (color-surface-primary-subtle)
- Text: `#067a46` (color-interactive-primary)
- Badge: `#067a46` background, white text

**Valid (Success):**
- Border: `#10B981` (color-feedback-success-border)
- Background: `#D1FAE5` (color-feedback-success-subtle)
- Text: `#065F46` (color-feedback-success)
- Badge: `#10B981` background, white text

**Warning:**
- Border: `#F59E0B` (color-feedback-warning-border)
- Background: `#FEF3C7` (color-feedback-warning-subtle)
- Text: `#92400E` (color-feedback-warning)
- Badge: `#F59E0B` background, white text

**Error:**
- Border: `#DC2626` (color-feedback-error-border)
- Background: `#FEE2E2` (color-feedback-error-subtle)
- Text: `#B30000` (color-feedback-error)
- Badge: `#DC2626` background, white text

#### Inactive State
- Border: `#E5E7EB` (color-border-default)
- Background: `#FFFFFF` (color-surface-default)
- Text: `#111827` (color-text-default)
- Dot: `#9CA3AF` (neutral gray)
- Badge: `#F3F4F6` background (color-surface-subtle), `#6B7280` text (color-text-secondary)

## Benefits

1. **Design-Code Consistency**: Colors match exactly between Figma and code
2. **Maintainability**: Update tokens in one place, changes propagate everywhere
3. **Code Connect**: Designers can see the actual component implementation
4. **Type Safety**: Use CSS variables with autocomplete in modern editors
5. **Theme Support**: Both light and dark modes use HelloFresh tokens

## Next Steps

1. Review the color mappings and adjust if needed
2. Consider fetching more comprehensive token data from Figma if needed
3. Add more component variants to Code Connect mappings
4. Document component usage patterns for your team
