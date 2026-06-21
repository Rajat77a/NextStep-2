# Navigation Model

The navigation is implemented in `src/components/shared/PortalNav.tsx` and is rendered by `<PortalLayout>` which wraps every protected route.

## Structure

```
<nav> (fixed top bar, z-50, h-16 / md:h-[72px])
  ├── Logo (Link to portalPrefix)
  ├── Desktop nav (hidden lg:flex)
  │     └── navItems.map → <Link> per item
  ├── Right side
  │     ├── Bell icon (notifications — placeholder)
  │     └── Profile dropdown
  │           ├── User name + email + role badge
  │           ├── Account Settings
  │           └── Sign Out
  └── Mobile menu toggle (lg:hidden)

<AnimatePresence>
  └── Mobile slide-in drawer (fixed inset-0, z-40, bg-charcoal)
        ├── navItems.map → <Link> per item (closes drawer on click)
        └── Sign Out button
```

## Nav Items Per Role

| Role | Items |
|---|---|
| `parent` | Dashboard, Upload Report, Clarity Check, Conversation, Teacher Questions, 30-Day Plan, Progress |
| `teacher` | Dashboard, My Classes, Class Patterns |
| `admin` | Dashboard, Classes, Students, Teachers, Subscription |

## Active State Logic

```ts
const isActive =
  location.pathname === item.path ||
  (item.path !== portalPrefix && location.pathname.startsWith(item.path));
```

- Exact match for the root portal path (e.g. `/parent`).
- Prefix match for all sub-routes (e.g. `/parent/upload` activates the "Upload Report" item).
- The `portalPrefix` exclusion prevents `/parent` from matching all parent sub-routes.

## Active Indicator

When `isActive` is true, a `motion.div` with `layoutId="activeNav"` renders inside the `<Link>` (which has `position: relative`). Framer Motion animates this shared element between links to create a sliding underline effect.

## Mobile Behaviour

- Toggle button shows `<Menu>` / `<X>` icon.
- Drawer slides in from the right (`x: '100%'` → `x: 0`).
- Tapping any nav item calls `setMobileOpen(false)` to dismiss the drawer.
- Backdrop: the drawer covers the full screen; no separate overlay needed.

## Profile Dropdown

- Clicking the avatar opens/closes the dropdown.
- A transparent full-screen `<div>` overlay (z-40) captures outside clicks and closes the dropdown.
- The dropdown (z-50) is positioned `absolute right-0 top-full` relative to the avatar button.
