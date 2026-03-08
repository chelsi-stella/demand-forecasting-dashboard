# Demand Forecasting Dashboard - Project Instructions

## Design System Requirements

### ⚠️ MANDATORY: Always Use HelloFresh Enterprise Design System

**This project MUST use the HelloFresh Enterprise Design System for all UI components, design tokens, and styling.**

- **Primary Design System Source**: [HelloFresh Enterprise Design System - Figma](https://www.figma.com/design/bBJVhJdmpM5E1YczJ8R4Vv/Enterprise-Design-System---Components)
- **Design Tokens Documentation**: See `DESIGN_TOKENS.md` in this directory
- **Token Definitions**: All HelloFresh design tokens are defined in `app/globals.css` with `--hf-` prefix

### Design Token Usage Rules

1. **ALWAYS** reference HelloFresh design tokens when creating or modifying UI components
2. **ALWAYS** check the Figma design system for component patterns before implementing new features
3. **ALWAYS** use Code Connect to link Figma components to React components when possible
4. **NEVER** use arbitrary colors, spacing, or sizing values - always use design tokens
5. **NEVER** create custom component variants that deviate from the design system

### Available Design Tokens

**Complete Token Library:** 140+ tokens prefixed with `--hf-` covering all HelloFresh brand colors.

#### Core Categories
1. **Background Tokens**: Light/dark variations for positive, negative, neutral, information, warning, reward
2. **Foreground Tokens**: Text and icon colors for all semantic categories
3. **Stroke Tokens**: Border colors matching the semantic system
4. **Complimentary Colors**: Brown, mint, pink variations for brand accent colors

#### Quick Reference - Most Used Tokens

**Primary/Positive (Green):**
- Foreground: `--hf-foreground-positive-positive-dark` (#067a46)
- Background Light: `--hf-background-light-positive-positive-mid` (#e4fabf)
- Stroke: `--hf-stroke-positive-positive-mid` (#067a46)

**Error/Negative (Red):**
- Foreground: `--hf-foreground-negative-negative-dark` (#b30000)
- Background Light: `--hf-background-light-negative-negative-light` (#ffeae9)
- Stroke: `--hf-stroke-negative-negative-mid` (#b30000)

**Warning (Orange/Peach):**
- Foreground: `--hf-foreground-warning-warning-mid` (#ef670a)
- Background Light: `--hf-background-warning-warning-light` (#ffecd3)
- Stroke: `--hf-stroke-warning-warning-mid` (#ef670a)

**Information (Blue):**
- Foreground: `--hf-foreground-information-information-dark` (#001db2)
- Background Light: `--hf-background-information-information-light` (#e9faff)
- Stroke: `--hf-stroke-information-information-dark` (#001db2)

**Neutral:**
- Text Dark: `--hf-foreground-dark-neutral-neutral-dark` (#242424)
- Text Light: `--hf-foreground-light-neutral-neutral-light` (#ffffff)
- Background Light: `--hf-background-light-neutral-neutral-mid` (#f8f8f8)
- Border: `--hf-stroke-neutral-neutral-mid` (#e4e4e4)

**See `DESIGN_TOKENS.md` for complete 140+ token reference.**

#### Layout
- **Border Radius**: `--hf-radius` (4px)
- **Standard borders**: `#E5E7EB` (color-border-default)
- **Subtle borders**: `#F3F4F6` (color-border-subtle)

#### Typography

**Font Families:**
- Headlines: Agrandir Digital (Medium 500)
- Body: Source Sans Pro (Regular 400, SemiBold 600, Bold 700)

**Desktop Headlines:** 56px (Grandiose), 48px (H1), 32px (H2), 24px (H3), 20px (H4), 16px (H5)
**Mobile Headlines:** 48px (Grandiose), 32px (H1), 24px (H2), 20px (H3), 16px (H4)
**Body Sizes:** 24px (XL), 20px (L), 16px (M), 14px (S), 12px (XS)
**Weights:** 400 (regular), 500 (medium - headlines only), 600 (semibold), 700 (bold)
**Letter Spacing:** 0 (all typography)

#### Spacing
- **Standard padding**: 24px (spacing-6)
- **Medium padding**: 12px (spacing-3)
- **Component padding**: 8px 12px (py-2 px-3)
- **Vertical spacing**: 12px (py-3), 16px (py-4)

### Component Development Guidelines

#### When Creating New Components:

1. **Search Figma First**: Check if the component exists in the HelloFresh Enterprise Design System
2. **Use get_design_context**: Fetch the Figma component design using the Figma MCP tool
3. **Adapt, Don't Copy**: The Figma output is React+Tailwind reference code - adapt it to match this project's patterns
4. **Map with Code Connect**: Use Code Connect to link Figma components to codebase components
5. **Document Tokens**: Add inline comments with token names for values that should eventually use the token library

#### Example Pattern:

```tsx
<div
  className="rounded-lg border"
  style={{
    /* token: color-border-default */
    borderColor: '#E5E7EB',
    /* token: border-radius-md */
    borderRadius: '6px',
    /* token: spacing-4 */
    padding: '16px',
  }}
>
  {/* Component content */}
</div>
```

#### When Modifying Existing Components:

1. **Verify tokens**: Check that existing components use HelloFresh tokens
2. **Update deviations**: Replace any arbitrary values with design tokens
3. **Maintain consistency**: Ensure the component matches Figma patterns
4. **Add TODO comments**: If the token library isn't available yet, add comments for future migration

### Code Connect Integration

This project uses Figma Code Connect to map design components to React components:

- **Current mappings**: 40 components mapped (25 buttons, 9 inputs, 6 cards)
- **When to map**: Whenever implementing a component that exists in Figma
- **How to map**: Use `get_code_connect_suggestions` followed by `send_code_connect_mappings`

### Figma Resources

#### Main Design System Files:
- **Components Library**: https://www.figma.com/design/bBJVhJdmpM5E1YczJ8R4Vv/Enterprise-Design-System---Components
  - Contains all HelloFresh component variants
  - Tables: `node-id=34329-57344`
  - Buttons, inputs, cards, and more

#### When User Shares a Figma URL:
1. **Extract fileKey and nodeId** from the URL
2. **Call get_design_context** with the extracted values
3. **Adapt the output** to match this project's structure and conventions
4. **Use existing components** from `components/ui/` when possible instead of creating new ones

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + HelloFresh design tokens
- **Components**: shadcn/ui (customized with HelloFresh tokens)
- **Icons**: lucide-react
- **UI Primitives**: Radix UI
- **Variants**: class-variance-authority (cva)

### Key Project Files

- `DESIGN_TOKENS.md` - Complete design token documentation
- `app/globals.css` - All HelloFresh design tokens defined here
- `components/ui/` - shadcn/ui components customized with HelloFresh styling
- `components/forecast/` - Domain-specific forecast dashboard components
- `lib/forecast-data.ts` - Type definitions and mock data

### Alert Component Guidelines

Alerts and status indicators must follow the HelloFresh design system specifications:

**Alert Structure**:
- Container: 12px padding, 6px border-radius, semantic background colors
- Icon: 16x16px, positioned at top with 2px margin-top
- Title: 14px semibold, semantic text color
- Badges: 12px text, 4px border-radius, font-semibold for impact, font-medium for metadata
- Description: 13px regular, subtle text color (#6B7280)
- Action links: 13px semibold, semantic color matching alert type

**Severity Colors** (from Figma Alert Component):
- **Blocking/Error**: Light pink (#ffeae9 bg, #b30000 text/icon/border)
- **Warning**: Light peach (#ffecd3 bg, #ef670a text/icon/border)
- **Info**: Light blue (#e9faff bg, #001db2 text/icon/border)
- **Success**: Light green (#f6fde9 bg, #067a46 border) OR HelloFresh positive tokens

**Section Headers**:
- 12px uppercase text with 0.05em letter-spacing
- Icon: 16x16px (h-4 w-4)
- Semantic color matching severity
- Font-semibold weight

See `DESIGN_TOKENS.md` for complete alert component patterns with code examples.

### Typography Guidelines

Always use HelloFresh typography tokens for consistent text styling:

**Headlines (Agrandir Digital, Medium 500):**
- Use for page titles, section headers, card titles
- Desktop: 56px → 48px → 32px → 24px → 20px → 16px
- Mobile: 48px → 32px → 24px → 20px → 16px
- Always use medium weight (500), never bold

**Body Text (Source Sans Pro):**
- **16px (Medium)**: Default body text, form inputs, button text
- **14px (Small)**: Secondary info, captions, small buttons, badges
- **12px (Extra Small)**: Fine print, timestamps, helper text
- **20px (Large)**: Emphasized content, lead paragraphs
- **24px (Extra Large)**: Large emphasized content, marketing copy

**Weight Selection:**
- **Regular (400)**: Standard body text, paragraphs, descriptions
- **SemiBold (600)**: Labels, button text, emphasized information
- **Bold (700)**: Strong emphasis, important callouts, badges

**Example Pattern:**
```tsx
// Card title - use headline
<h3 style={{
  fontFamily: 'var(--hf-font-headline)',
  fontSize: 'var(--hf-headline-desktop-h3-size)',
  lineHeight: 'var(--hf-headline-desktop-h3-line)',
  fontWeight: 'var(--hf-font-weight-medium)',
}}>
  Section Title
</h3>

// Body content - use body medium regular
<p style={{
  fontFamily: 'var(--hf-font-body)',
  fontSize: 'var(--hf-body-medium-size)',
  lineHeight: 'var(--hf-body-medium-line)',
  fontWeight: 'var(--hf-font-weight-regular)',
}}>
  Description text
</p>

// Label - use body small semibold
<label style={{
  fontFamily: 'var(--hf-font-body)',
  fontSize: 'var(--hf-body-small-size)',
  lineHeight: 'var(--hf-body-small-line)',
  fontWeight: 'var(--hf-font-weight-semibold)',
}}>
  Form Label
</label>
```

**See `DESIGN_TOKENS.md` for complete typography token reference with all sizes, line heights, and responsive patterns.**

### Filter Pill Button Guidelines

Multi-select toggle pill buttons for status filtering must follow these specifications:

**Structure**:
- Pill container: 4px 12px padding, 16px border-radius (pill shape)
- Status dot: 8px circle, colored when active, gray when inactive
- Count badge: 11px text, 4px border-radius, semibold font
- Text: 13px medium weight

**Interaction**:
- Multi-select: Multiple pills can be active simultaneously
- "All" deselects other filters and shows all rows
- Auto-fallback to "All" when all individual filters are deselected
- Count badges show current data, not hardcoded values

**Active Colors**:
- **All/Primary**: Green border (#067a46), light green bg (#e4fabf)
- **Valid**: Success green (#10B981 border, #D1FAE5 bg)
- **Warning**: Amber (#F59E0B border, #FEF3C7 bg)
- **Error**: Red (#DC2626 border, #FEE2E2 bg)

**Inactive State**:
- Border: #E5E7EB (neutral)
- Background: #FFFFFF (white)
- Dot: #9CA3AF (gray)
- Badge: #F3F4F6 bg, #6B7280 text

**Footer Text** (when filters active):
- 12px text, #9CA3AF color (color-text-tertiary)
- Format: "Showing X of Y rows · filtered by: Valid, Warning"

See `DESIGN_TOKENS.md` for complete pill button patterns with code examples.

### Common Pitfalls to Avoid

❌ **DON'T**: Use arbitrary hex colors like `#FF0000` or `bg-red-500`
✅ **DO**: Use design tokens or mapped Tailwind classes

❌ **DON'T**: Create components without checking Figma first
✅ **DO**: Search the HelloFresh design system and adapt existing patterns

❌ **DON'T**: Use random spacing values like `p-7` or `gap-5`
✅ **DO**: Use standard spacing tokens (8px, 12px, 16px, 24px, 32px)

❌ **DON'T**: Implement designs from scratch without reference
✅ **DO**: Use get_design_context to fetch Figma designs and adapt them

❌ **DON'T**: Mix different alert styling patterns
✅ **DO**: Follow the standardized alert component structure from DESIGN_TOKENS.md

### Workflow for Design Changes

1. **User provides Figma URL** → Extract fileKey and nodeId
2. **Fetch design** → Use `get_design_context` Figma MCP tool
3. **Review existing code** → Check if similar components exist
4. **Adapt design** → Modify existing components or create new ones using design tokens
5. **Test tokens** → Verify all colors, spacing, and typography match the design system
6. **Map to Figma** → Use Code Connect to link component back to Figma

### Design System Philosophy

This project follows the HelloFresh Enterprise Design System to ensure:
- **Consistency** across all HelloFresh products
- **Accessibility** through tested, compliant components
- **Maintainability** by using centralized design tokens
- **Designer-Developer collaboration** through Code Connect integration

---

**Remember**: Every design decision should reference the HelloFresh Enterprise Design System. When in doubt, check Figma or ask the user before implementing custom solutions.
