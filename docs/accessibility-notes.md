# Accessibility Notes

NextStep·AI targets WCAG 2.1 AA compliance. This document records current accessibility decisions and known gaps.

## Keyboard Navigation

| Component | Keyboard support |
|---|---|
| Nav links (`<Link>`) | Fully keyboard navigable (native `<a>`) |
| Buttons | `Enter` / `Space` activate |
| File drop zone | `role="button"`, `tabIndex={0}`, `onKeyDown` handles `Enter` and `Space` to trigger file input click |
| Profile dropdown | Opens on `Enter`/`Space` on avatar button; overlay closes on `Escape` (via click-outside div) |
| Mobile drawer | Toggle button keyboard accessible; links inside are standard `<Link>` |
| Form inputs | All labelled with `<label>` elements |

## ARIA

| Element | ARIA attribute |
|---|---|
| File drop zone | `role="button"` |
| Loading spinner | Should have `aria-label="Loading"` — **gap, planned** |
| Error messages | Should have `role="alert"` — **gap, planned** |
| Nav active item | No explicit `aria-current="page"` — **gap, planned** |

## Colour Contrast

| Pair | Contrast ratio | WCAG AA (4.5:1) |
|---|---|---|
| Charcoal (`#2C2C2C`) on Cream (`#F9F6F2`) | ~12:1 | ✅ Pass |
| Coral (`#E8613A`) on White | ~3.8:1 | ⚠️ Fail for small text |
| Medium Gray (`#6B6B6B`) on Cream | ~5.4:1 | ✅ Pass |
| White on Coral (buttons) | ~3.8:1 | ⚠️ Fail for small text |

**Note:** Coral-on-white contrast is below AA for small body text. Button text is `font-semibold` which partially compensates. A darker coral (`#C94E2A`) should be considered for text uses.

## Focus Styles

Tailwind's default focus ring (`focus:ring`) is not applied globally. Focus styles rely on browser defaults. This is a **known gap** — custom focus styles will be added in v1.2.0.

## Screen Reader Testing

Tested with:
- macOS VoiceOver + Safari
- Windows NVDA + Chrome (planned)

## Motion

Users with `prefers-reduced-motion` enabled: Framer Motion respects this via the `useReducedMotion()` hook. This is **not yet implemented** — planned for v1.2.0.
