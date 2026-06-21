# Design Principles

## Visual Language

NextStep·AI uses a warm, calm palette to reduce the anxiety parents may feel when reviewing a report card.

## Colour Tokens

Defined in `tailwind.config.js` and used via utility classes throughout the app.

| Token | Hex | Usage |
|---|---|---|
| `coral` | `#E8613A` | Primary action colour — CTAs, active nav, red flag |
| `coral-dark` | `#C94E2A` | Hover state for coral |
| `sage` | `#5A8A6A` | Green flag / positive indicators |
| `amber` | `#D4A017` | Yellow flag / caution indicators |
| `charcoal` | `#2C2C2C` | Headings and primary text |
| `medium-gray` | `#6B6B6B` | Secondary text and labels |
| `light-gray` | `#E0E0E0` | Borders and dividers |
| `cream` | `#F9F6F2` | Page background |
| `card-surface-alt` | `#F3F0EC` | Alternate card background |

## Typography

Two font families loaded via Google Fonts:

| Role | Family | Usage |
|---|---|---|
| `font-display` | Playfair Display | H1, H2, section headings |
| `font-body` | Inter | Body text, labels, buttons |

## Spacing

Uses Tailwind's default 4px spacing scale. Key values used consistently:

- `px-5 md:px-12` — page horizontal padding
- `py-6 md:py-8` — page vertical padding
- `gap-6` — grid gaps between cards
- `rounded-2xl` — card border radius
- `rounded-[10px]` — form input border radius

## Shadows

| Token | Usage |
|---|---|
| `shadow-card` | Standard card shadow |
| `shadow-card-hover` | Elevated shadow on hover |
| `shadow-modal` | Dropdown / profile menu shadow |
| `shadow-subtle` | Lightweight shadow for inner cards |

## Motion

All page entrances use:

```tsx
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
```

Staggered list items delay by `i * 0.06` seconds.

Active nav underline uses `layoutId="activeNav"` for a shared layout animation.

## Flag Colour Coding

| Flag | Colour | Meaning |
|---|---|---|
| `green` | Sage | On track — no action needed |
| `yellow` | Amber | Watch — minor concern, monitor at home |
| `red` | Coral | Address — needs active parent and teacher attention |

## Writing Tone

Copy throughout the app is:
- **Warm** — never clinical or alarming
- **Actionable** — every screen tells the parent what to do next
- **Honest** — AI outputs include a disclaimer: *"use as conversation guidance, not as a diagnosis or prediction"*
