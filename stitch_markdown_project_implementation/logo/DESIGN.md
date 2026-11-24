---
name: Executive Monochrome POS
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c7c6cb'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#919096'
  outline-variant: '#46464b'
  surface-tint: '#c5c6d1'
  primary: '#c5c6d1'
  on-primary: '#2e3038'
  primary-container: '#1e2028'
  on-primary-container: '#868791'
  inverse-primary: '#5c5e67'
  secondary: '#c4c6d3'
  on-secondary: '#2d303a'
  secondary-container: '#444651'
  on-secondary-container: '#b2b4c1'
  tertiary: '#bdc7d8'
  on-tertiary: '#27313e'
  tertiary-container: '#17212d'
  on-tertiary-container: '#7e8898'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e2ed'
  primary-fixed-dim: '#c5c6d1'
  on-primary-fixed: '#191b23'
  on-primary-fixed-variant: '#45464f'
  secondary-fixed: '#e0e2ef'
  secondary-fixed-dim: '#c4c6d3'
  on-secondary-fixed: '#181b25'
  on-secondary-fixed-variant: '#444651'
  tertiary-fixed: '#d9e3f4'
  tertiary-fixed-dim: '#bdc7d8'
  on-tertiary-fixed: '#121c28'
  on-tertiary-fixed-variant: '#3e4755'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-keypad:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an architectural, executive-tier visual framework tailored for high-volume, precision-critical retail and point-of-sale environments. The ethos rejects decorative artificial intelligence gradients, oversaturated neons, and superfluous ornamentation in favor of purposeful Swiss modernism, disciplined grid alignment, and tactile digital clarity.

The visual tone is restrained, authoritative, and industrial. By grounding the viewport in deep matte charcoal and layered obsidian planes, interactions recede or advance through deliberate luminance contrast rather than color saturation. Cashiers, inventory controllers, and floor managers interact with an interface that feels like a calibrated physical instrument: ultra-sharp legibility, instant visual hierarchy, and functional status signaling designed for continuous 12-hour operational focus without cognitive fatigue.

## Colors

The color palette is built on strict tonal discipline using a matte charcoal foundation (`#1E2028`) over a subterranean void base (`#090A0F`). Accent roles avoid synthetic saturation, using functional, desaturated earth-grade signals strictly reserved for operational telemetry.

- **Base Surfaces:**
  - Base Obsidian: `#090A0F` (Application canvas, lowest substrate)
  - Surface Level 1: `#111217` (Navigation rails, primary panel containers)
  - Surface Level 2: `#1E2028` (Cards, interactive registers, key metric wells)
  - Surface Level 3: `#2A2D37` (Hover states, nested table headers, splitters)

- **Borders & Dividers:**
  - Subtle Framing: `rgba(255, 255, 255, 0.08)` (Structural containment)
  - Interactive Outline: `rgba(255, 255, 255, 0.16)` (Inputs, active buttons, focused states)
  - Accent Hairline: `#4B5563` (Key boundary dividers)

- **Typography & Foreground:**
  - High Emphasis: `#FFFFFF` (Values, titles, active barcodes, pricing)
  - Medium Emphasis: `#E5E7EB` (Labels, column headings, body descriptions)
  - Low Emphasis: `#9CA3AF` (Secondary metadata, SKU subtitles, shortcuts)

- **Operational Indicators (Functional Only):**
  - Settlement / Active Success: `#2E5A44` (Muted olive-emerald, foreground `#A3E6BA`)
  - Hold / Attention Alert: `#6B4E23` (Warm muted amber, foreground `#FCD34D`)
  - Void / Discrepancy: `#66242B` (Clean industrial crimson, foreground `#FCA5A5`)

## Typography

Typography prioritizes rapid horizontal parsing, optical weight consistency, and numeric clarity under high-pressure register workflows. Manrope governs high-level status displays, pricing tallies, and register modals with geometric balance. Hanken Grotesk handles the heavy analytical payload: line items, sku codes, tax breakdowns, and peripheral metadata.

All numbers in cart listings, price tables, inventory counts, and currency readouts must enforce tabular figures (`font-variant-numeric: tabular-nums lining-nums`) to prevent optical wobble during rapid item scanning.

## Layout & Spacing

The layout operates on a tight 4px baseline rhythm optimized for space efficiency and touch-target fidelity on terminal touchscreens. 

- **Structure:** Split terminal grid. The default POS configuration allocates a fixed-ratio 60/40 viewport split: 60% catalog/lookup matrix with dynamic columns, and 40% persistent itemized ledger and tender keypad.
- **Breakpoints:**
  - Desktop / Terminal Wide (>= 1280px): Persistent split pane, 16px gutter, 24px outer margins.
  - Tablet / Standard Terminal (768px - 1279px): Collapsible drawer for item audit ledger, 8px column gutters.
  - Handheld / Mobile Scanner (< 768px): Single column stacked layout, sticky action footer, 12px margins.
- **Density:** Compact layouts prioritize dense vertical information without compromising minimum 44px tap targets for touchscreen inputs.

## Elevation & Depth

This system intentionally eliminates blurred drop shadows, ambient glow halos, and multi-colored diffuse projections. Depth is communicated strictly through surface layering and razor-thin boundary planes.

- **Stacking Tiers:**
  - **Level 0 (Floor):** Canvas background (`#090A0F`), no borders.
  - **Level 1 (Structural Rail & Ledger Base):** Raised matte plane (`#111217`) defined by an absolute 1px border `rgba(255, 255, 255, 0.08)`.
  - **Level 2 (Active Cards & Input Wells):** Foreground surfaces (`#1E2028`) with an inner optical hairline border `rgba(255, 255, 255, 0.12)`.
  - **Level 3 (Modals, Overlays, and Flyouts):** High-contrast matte container (`#2A2D37`) framed with a crisp `#4B5563` border. Overlaid elements cast a crisp, non-diffuse 0 0 0 1px `rgba(255, 255, 255, 0.1)` edge and an opaque 80% black backdrop curtain to lock context.

## Shapes

The shape architecture is engineered for architectural discipline. Corner curvature is constrained to `roundedness: 1` (`0.25rem` / 4px base radius) across all standard interactive elements, including numeric buttons, inputs, item cards, and chips. 

Inner structural wells and table rows use zero curvature (`rounded-none`) to preserve strict grid borders and maximize row-to-row visual alignment. Modals and persistent slide-over drawers use a maximum of `0.5rem` (`rounded-lg`) to retain a sharp, engineered feel.

## Components

### Buttons
- **Primary / Tender Action:** Pure solid white fill (`#FFFFFF`), bold matte black text (`#090A0F`), 4px corner radius, zero shadow. Hover state scales down luminance to `#E5E7EB`.
- **Secondary / Action Keypad:** Base `#1E2028` fill, 1px border `rgba(255,255,255,0.12)`, text `#FFFFFF`. Hover elevates fill to `#2A2D37`.
- **Destructive / Void Button:** Base fill `rgba(102, 36, 43, 0.25)`, border `1px solid #66242B`, text `#FCA5A5`. Active press sets fill to `#66242B` and text to `#FFFFFF`.

### Inputs & Barcode Entry
- Rectangular 40px height containers, background `#111217`, border `1px solid rgba(255,255,255,0.14)`.
- Focus state switches border to pure `#FFFFFF` without ambient outer glow. Monospaced or tabular numerical typography for serial numbers, quantities, and price overrides.

### Item Ledger & Data Lists
- Alternating subtle line separation using `1px solid rgba(255, 255, 255, 0.06)`. No rounded corners on individual rows.
- Active or selected row triggers `#1E2028` background with an inset 2px left border accent in `#FFFFFF`.
- Prices and counts right-aligned; item title left-aligned with SKU rendered in `#9CA3AF` body-sm.

### Status Indicators & Chips
- Compact 20px height, 4px border radius, strict inline tabular layout.
- Filled with deep muted tones (`#2E5A44` for paid/settled, `#6B4E23` for suspended/parked, `#66242B` for refunded) accompanied by a 6px solid circular status dot and clean high-contrast textual labels.

### Numerical Keypad Matrix
- Monolithic grid buttons with zero separation gap between perimeter borders (joined hairline grid).
- High visual feedback: active down state shifts background instantly to `#2A2D37` with instantaneous release reset.