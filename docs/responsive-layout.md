# Responsive Layout

NextStep·AI is designed mobile-first using Tailwind's responsive prefix system.

## Breakpoints

Tailwind default breakpoints used in the project:

| Prefix | Min width | Usage |
|---|---|---|
| *(default)* | 0px | Mobile — base styles |
| `sm:` | 640px | Small tablet tweaks (limited use) |
| `md:` | 768px | Tablet — increased padding, larger text |
| `lg:` | 1024px | Desktop — desktop nav visible, multi-column layouts |
| `xl:` | 1280px | Wide desktop — max-width containers |

## Page Container

```html
<div class="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
```

- Mobile: 20px horizontal padding, 24px vertical padding
- Desktop: 48px horizontal padding, 32px vertical padding

## Nav

| Breakpoint | Nav behaviour |
|---|---|
| < 1024px (`lg`) | Hamburger menu; desktop nav hidden (`hidden lg:flex`) |
| ≥ 1024px (`lg`) | Desktop nav visible; hamburger hidden (`lg:hidden`) |

Nav height: `h-16` (64px) on mobile, `md:h-[72px]` (72px) on tablet+.

Page content has `pt-16 md:pt-[72px]` padding-top to clear the fixed nav.

## Dashboard Grid

```html
<div class="grid lg:grid-cols-[2fr_1fr] gap-6">
```

- Mobile + tablet: single column
- Desktop (≥1024px): two columns, left 2× wider than right

## Quick Actions Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
```

- Mobile: single column
- Small tablet+: two columns

## Upload Form

Single column throughout (`max-w-2xl mx-auto`). No breakpoint changes needed — form is naturally readable at all widths.

## Clarity Check Subject Cards

Single column list. Cards are full-width at all breakpoints for readability.

## Mobile-Specific Decisions

- Font sizes use `text-2xl md:text-4xl` for headings — smaller on mobile to prevent overflow.
- Buttons are always full-width (`w-full`) on the upload and confirm steps.
- The mobile drawer uses `fixed inset-0` to cover the full viewport.
